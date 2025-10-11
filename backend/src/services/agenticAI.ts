import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { query } from '../config/database';
import logger from '../config/logger';

// Initialize AI services
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

export type AgentRole = 'orchestrator' | 'email_analyzer' | 'task_manager' | 'calendar_coordinator' | 'user_interface' | 'memory_manager';

export interface AgentMessage {
    role: AgentRole;
    content: string;
    metadata?: any;
}

export interface AgenticAction {
    agent: AgentRole;
    action: string;
    payload: any;
    confidence: number;
    requires_approval: boolean;
}

export class MartinAgenticAI {
    private conversationHistory: AgentMessage[] = [];
    private activeAgents: Set<AgentRole> = new Set(['orchestrator']);

    /**
     * Main orchestration method - coordinates all agents
     */
    async processUserRequest(userMessage: string, userId: string, context?: any): Promise<AgenticAction[]> {
        try {
            // Add user message to conversation
            this.conversationHistory.push({
                role: 'user_interface',
                content: userMessage,
                metadata: { userId, context }
            });

            // Get orchestrator's decision
            const orchestratorResponse = await this.orchestratorAgent(userMessage, context);

            // Execute actions based on orchestration
            const actions = await this.executeOrchestratedActions(orchestratorResponse, userId);

            return actions;
        } catch (error) {
            logger.error('Agentic AI orchestration error:', error);
            return [];
        }
    }

    /**
     * Main orchestrator - decides which agents to activate and coordinate
     */
    private async orchestratorAgent(userMessage: string, context?: any): Promise<{
        activatedAgents: AgentRole[];
        primaryAgent: AgentRole;
        actions: string[];
        priority: 'low' | 'medium' | 'high';
    }> {
        const prompt = `
You are the Martin++ AI Orchestrator. Analyze this user request and coordinate appropriate agents.

User Message: "${userMessage}"
Context: ${JSON.stringify(context || {})}

Available Agents:
- email_analyzer: Handles email-related tasks (triage, reply, categorization)
- task_manager: Manages tasks, todos, and productivity items
- calendar_coordinator: Handles scheduling, calendar events, time management
- memory_manager: Deals with user history, preferences, and knowledge
- user_interface: Handles general chat and conversation

Analyze the request and respond with JSON:
{
  "activatedAgents": ["agent1", "agent2"],
  "primaryAgent": "most_relevant_agent",
  "actions": ["specific_action1", "specific_action2"],
  "priority": "low|medium|high",
  "reasoning": "brief explanation"
}
`;

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 400,
            });

            const response = completion.choices[0]?.message?.content;
            if (!response) throw new Error('No orchestrator response');

            const result = JSON.parse(response);

            this.conversationHistory.push({
                role: 'orchestrator',
                content: `Activated agents: ${result.activatedAgents.join(', ')} for action: ${result.actions.join(', ')}`,
                metadata: result
            });

            return result;
        } catch (error) {
            // Fallback to basic classification
            return {
                activatedAgents: ['user_interface'],
                primaryAgent: 'user_interface',
                actions: ['respond_to_user'],
                priority: 'medium',
            };
        }
    }

    /**
     * Execute orchestrated actions using appropriate agents
     */
    private async executeOrchestratedActions(
        orchestration: any,
        userId: string
    ): Promise<AgenticAction[]> {
        const actions: AgenticAction[] = [];

        for (const agent of orchestration.activatedAgents) {
            try {
                const agentActions = await this.activateAgent(agent, orchestration.actions, userId);
                actions.push(...agentActions);
            } catch (error) {
                logger.warn(`Agent ${agent} failed:`, error);
            }
        }

        return actions;
    }

    /**
     * Activate and execute specific agent functions
     */
    private async activateAgent(agent: AgentRole, actions: string[], userId: string): Promise<AgenticAction[]> {
        switch (agent) {
            case 'email_analyzer':
                return await this.emailAnalyzerAgent(actions, userId);
            case 'task_manager':
                return await this.taskManagerAgent(actions, userId);
            case 'calendar_coordinator':
                return await this.calendarCoordinatorAgent(actions, userId);
            case 'memory_manager':
                return await this.memoryManagerAgent(actions, userId);
            case 'user_interface':
                return await this.userInterfaceAgent(actions, userId);
            default:
                return [];
        }
    }

    /**
     * Email Analysis Agent - handles email intelligence
     */
    private async emailAnalyzerAgent(actions: string[], userId: string): Promise<AgenticAction[]> {
        const results: AgenticAction[] = [];

        if (actions.includes('triage_emails')) {
            // Get untriaged emails
            const emails = await query('SELECT * FROM emails WHERE user_id = $1 AND category IS NULL', [userId]);

            for (const email of emails.rows) {
                results.push({
                    agent: 'email_analyzer',
                    action: 'triage_email',
                    payload: { emailId: email.id, subject: email.subject, body: email.body },
                    confidence: 0.95,
                    requires_approval: false,
                });
            }
        }

        this.conversationHistory.push({
            role: 'email_analyzer',
            content: `Analyzed ${results.length} emails for triaging`,
        });

        return results;
    }

    /**
     * Task Management Agent - handles productivity and organization
     */
    private async taskManagerAgent(actions: string[], userId: string): Promise<AgenticAction[]> {
        const results: AgenticAction[] = [];

        if (actions.includes('create_task')) {
            results.push({
                agent: 'task_manager',
                action: 'create_new_task',
                payload: { title: 'Task from agentic AI', priority: 'medium' },
                confidence: 0.85,
                requires_approval: true,
            });
        }

        this.conversationHistory.push({
            role: 'task_manager',
            content: `Generated ${results.length} task actions`,
        });

        return results;
    }

    /**
     * Calendar Coordination Agent - handles scheduling
     */
    private async calendarCoordinatorAgent(actions: string[], userId: string): Promise<AgenticAction[]> {
        const results: AgenticAction[] = [];

        if (actions.includes('schedule_meeting')) {
            // Intelligent time slot suggestion would go here
            results.push({
                agent: 'calendar_coordinator',
                action: 'suggest_time_slots',
                payload: { duration: 60, preferences: {} },
                confidence: 0.90,
                requires_approval: false,
            });
        }

        this.conversationHistory.push({
            role: 'calendar_coordinator',
            content: `Coordinated ${results.length} calendar actions`,
        });

        return results;
    }

    /**
     * Memory Management Agent - handles user history and preferences
     */
    private async memoryManagerAgent(actions: string[], userId: string): Promise<AgenticAction[]> {
        const results: AgenticAction[] = [];

        // Search user conversation history for context
        if (actions.includes('recall_context')) {
            const memories = await query(
                'SELECT content FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
                [userId]
            );

            results.push({
                agent: 'memory_manager',
                action: 'provide_context',
                payload: { memories: memories.rows },
                confidence: 0.95,
                requires_approval: false,
            });
        }

        return results;
    }

    /**
     * User Interface Agent - handles conversation and responses
     */
    private async userInterfaceAgent(actions: string[], userId: string): Promise<AgenticAction[]> {
        if (!actions.includes('respond_to_user')) return [];

        // Use both OpenAI and Gemini for ensemble response
        const openaiResponse = await this.generateWithOpenAI(actions.join(' '), userId);
        const geminiResponse = await this.generateWithGemini(actions.join(' '), userId);

        // Choose best response (simple ensemble - take longer/more detailed one)
        const finalResponse = openaiResponse.length > geminiResponse.length ? openaiResponse : geminiResponse;

        this.conversationHistory.push({
            role: 'user_interface',
            content: `Generated response using AI ensemble`,
        });

        return [{
            agent: 'user_interface',
            action: 'display_response',
            payload: { message: finalResponse },
            confidence: 0.92,
            requires_approval: false,
        }];
    }

    /**
     * Generate response using OpenAI GPT-4
     */
    private async generateWithOpenAI(prompt: string, userId: string): Promise<string> {
        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 300,
            });

            return completion.choices[0]?.message?.content || 'I understand. How can I help?';
        } catch (error) {
            logger.error('OpenAI generation error:', error);
            return 'OpenAI response unavailable at this time.';
        }
    }

    /**
     * Generate response using Google Gemini
     */
    private async generateWithGemini(prompt: string, userId: string): Promise<string> {
        try {
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            return response.text() || 'I understand. How can I help?';
        } catch (error) {
            logger.error('Gemini generation error:', error);
            return 'Gemini response unavailable at this time.';
        }
    }

    /**
     * Get agent status and conversation history
     */
    getAgentStatus() {
        return {
            activeAgents: Array.from(this.activeAgents),
            conversationLength: this.conversationHistory.length,
            recentMessages: this.conversationHistory.slice(-3),
        };
    }

    /**
     * Reset agent state (useful for new conversations)
     */
    resetConversation() {
        this.conversationHistory = [];
        this.activeAgents = new Set(['orchestrator']);
    }
}

// Export singleton instance
export const agenticAI = new MartinAgenticAI();
