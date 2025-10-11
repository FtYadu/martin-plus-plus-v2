import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import logger from '../config/logger';

let pinecone: Pinecone | null = null;

try {
    if (process.env.PINECONE_API_KEY) {
        pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
    } else {
        logger.warn('Pinecone API key not configured - memory service will be disabled');
    }
} catch (error) {
    logger.error('Failed to initialize Pinecone:', error);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const INDEX_NAME = process.env.PINECONE_INDEX || 'martin-memory';

export class MemoryService {
    private index: any;

    constructor() {
        this.initializeIndex();
    }

    private async initializeIndex() {
        try {
            if (!pinecone) {
                logger.warn('Pinecone not initialized, skipping index setup');
                return;
            }
            
            // Check if index exists, create if not
            const indexList = await pinecone.listIndexes();
            const indexExists = indexList.indexes?.some(index => index.name === INDEX_NAME);

            if (!indexExists) {
                logger.info(`Creating Pinecone index: ${INDEX_NAME}`);
                await pinecone.createIndex({
                    name: INDEX_NAME,
                    dimension: 1536, // OpenAI embedding dimension
                    metric: 'cosine',
                    spec: {
                        serverless: {
                            cloud: 'aws',
                            region: 'us-east-1'
                        }
                    }
                });
            }

            this.index = pinecone.index(INDEX_NAME);
            logger.info(`Pinecone index ready: ${INDEX_NAME}`);
        } catch (error) {
            logger.error('Pinecone initialization error:', error);
            // Don't fail the entire service if Pinecone is not available
        }
    }

    /**
     * Generate embeddings for text content
     */
    private async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await openai.embeddings.create({
                model: 'text-embedding-ada-002',
                input: text,
            });

            return response.data[0].embedding;
        } catch (error) {
            logger.error('Embedding generation error:', error);
            throw error;
        }
    }

    /**
     * Store memory with semantic embedding
     */
    async storeMemory(userId: string, content: string, metadata: any = {}): Promise<string> {
        try {
            if (!this.index) {
                logger.warn('Pinecone index not available, skipping memory storage');
                return '';
            }

            const embedding = await this.generateEmbedding(content);
            const memoryId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const vector = {
                id: memoryId,
                values: embedding,
                metadata: {
                    userId,
                    content,
                    timestamp: new Date().toISOString(),
                    type: metadata.type || 'general',
                    context: JSON.stringify(metadata.context || {}),
                    ...metadata
                }
            };

            await this.index.upsert([vector]);
            logger.info(`Stored memory: ${memoryId}`);

            return memoryId;
        } catch (error) {
            logger.error('Memory storage error:', error);
            return '';
        }
    }

    /**
     * Search memories semantically
     */
    async searchMemories(userId: string, query: string, topK: number = 5): Promise<any[]> {
        try {
            if (!this.index) {
                logger.warn('Pinecone index not available, returning empty results');
                return [];
            }

            const embedding = await this.generateEmbedding(query);

            const response = await this.index.query({
                vector: embedding,
                topK,
                filter: { userId },
                includeMetadata: true,
                includeValues: false,
            });

            return response.matches.map((match: any) => ({
                id: match.id,
                content: match.metadata?.content,
                score: match.score,
                metadata: match.metadata,
            }));
        } catch (error) {
            logger.error('Memory search error:', error);
            return [];
        }
    }

    /**
     * Find similar content for context
     */
    async findSimilarContent(userId: string, content: string, contextType: string = 'general'): Promise<any[]> {
        try {
            if (!this.index) return [];

            const embedding = await this.generateEmbedding(content);

            const response = await this.index.query({
                vector: embedding,
                topK: 3,
                filter: {
                    userId,
                    type: contextType
                },
                includeMetadata: true,
            });

            return response.matches.map((match: any) => ({
                content: match.metadata.content,
                context: JSON.parse(match.metadata.context || '{}'),
                score: match.score,
            }));
        } catch (error) {
            logger.error('Similar content search error:', error);
            return [];
        }
    }

    /**
     * Update memory content
     */
    async updateMemory(memoryId: string, newContent: string, newMetadata: any = {}): Promise<boolean> {
        try {
            if (!this.index) return false;

            const embedding = await this.generateEmbedding(newContent);
            const metadata = {
                ...newMetadata,
                updatedAt: new Date().toISOString(),
            };

            await this.index.update({
                id: memoryId,
                values: embedding,
                setMetadata: metadata,
            });

            return true;
        } catch (error) {
            logger.error('Memory update error:', error);
            return false;
        }
    }

    /**
     * Delete memory
     */
    async deleteMemory(memoryId: string): Promise<boolean> {
        try {
            if (!this.index) return false;

            await this.index.deleteOne(memoryId);
            return true;
        } catch (error) {
            logger.error('Memory deletion error:', error);
            return false;
        }
    }

    /**
     * Get memory statistics
     */
    async getStats(userId: string): Promise<any> {
        try {
            if (!this.index) return { totalMemories: 0 };

            // In Pinecone, we can't easily get counts, but we can query with a broad search
            const response = await this.index.query({
                vector: new Array(1536).fill(0.1), // Neutral vector for broad search
                topK: 10000,
                filter: { userId },
                includeMetadata: false,
            });

            const totalMemories = response.matches?.length || 0;

            return {
                totalMemories,
                lastUpdate: new Date().toISOString(),
            };
        } catch (error) {
            logger.error('Memory stats error:', error);
            return { totalMemories: 0, error: true };
        }
    }
}

// Test Pinecone connection
export const testPineconeConnection = async (): Promise<boolean> => {
    try {
        if (!process.env.PINECONE_API_KEY || !pinecone) {
            logger.warn('Pinecone API key not configured');
            return false;
        }

        // Try to list indexes to test connection
        await pinecone.listIndexes();
        logger.info('Pinecone connection test successful');
        return true;
    } catch (error) {
        logger.error('Pinecone connection test failed:', error);
        return false;
    }
};

// Export singleton instance
export const memoryService = new MemoryService();
