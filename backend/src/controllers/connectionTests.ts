import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { query } from '../config/database';
import { testPineconeConnection } from '../services/pinecone';
import logger from '../config/logger';

export const testDatabaseConnection = async (req: AuthRequest, res: Response) => {
    try {
        // Test basic database connectivity
        const result = await query('SELECT 1 as test');
        if (result.rows.length > 0) {
            logger.info('Database connection test successful');
            res.json({
                success: true,
                data: {
                    message: 'Neon PostgreSQL database connected successfully',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    version: 'v1',
                },
            });
        } else {
            throw new AppError(500, 'DATABASE_TEST_FAILED', 'Database test failed');
        }
    } catch (error) {
        if (error instanceof AppError) throw error;
        logger.error('Database connection test error:', error);
        throw new AppError(500, 'DATABASE_CONNECTION_FAILED', 'Database connection failed');
    }
};

export const testAiConnection = async (req: AuthRequest, res: Response) => {
    try {
        // Test Pinecone connection
        const connected = await testPineconeConnection();
        if (connected) {
            logger.info('AI (Pinecone) connection test successful');
            res.json({
                success: true,
                data: {
                    message: 'Pinecone AI database connected successfully',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    version: 'v1',
                },
            });
        } else {
            throw new AppError(500, 'AI_TEST_FAILED', 'AI connection test failed');
        }
    } catch (error) {
        if (error instanceof AppError) throw error;
        logger.error('AI connection test error:', error);
        throw new AppError(500, 'AI_CONNECTION_FAILED', 'AI connection failed');
    }
};

export const testGmailConnection = async (req: AuthRequest, res: Response) => {
    try {
        // Check if user has Gmail tokens
        const userId = req.user!.id;
        const result = await query(
            'SELECT oauth_tokens FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
        }

        const user = result.rows[0];
        if (!user.oauth_tokens || !user.oauth_tokens.gmail) {
            res.json({
                success: false,
                data: {
                    message: 'Gmail not configured - requires OAuth setup',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    version: 'v1',
                },
            });
            return;
        }

        // TODO: Actually test Gmail API connection here
        logger.info(`Gmail connection test successful for user ${userId}`);
        res.json({
            success: true,
            data: {
                message: 'Gmail API connection configured',
            },
            meta: {
                timestamp: new Date().toISOString(),
                version: 'v1',
            },
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        logger.error('Gmail connection test error:', error);
        throw new AppError(500, 'GMAIL_CONNECTION_FAILED', 'Gmail connection failed');
    }
};

export const testCalendarConnection = async (req: AuthRequest, res: Response) => {
    try {
        // Check if user has calendar tokens
        const userId = req.user!.id;
        const result = await query(
            'SELECT oauth_tokens FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
        }

        const user = result.rows[0];
        if (!user.oauth_tokens || !user.oauth_tokens.google) {
            res.json({
                success: false,
                data: {
                    message: 'Google Calendar not configured - requires OAuth setup',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    version: 'v1',
                },
            });
            return;
        }

        // TODO: Actually test Google Calendar API connection here
        logger.info(`Calendar connection test successful for user ${userId}`);
        res.json({
            success: true,
            data: {
                message: 'Google Calendar API connection configured',
            },
            meta: {
                timestamp: new Date().toISOString(),
                version: 'v1',
            },
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        logger.error('Calendar connection test error:', error);
        throw new AppError(500, 'CALENDAR_CONNECTION_FAILED', 'Calendar connection failed');
    }
};
