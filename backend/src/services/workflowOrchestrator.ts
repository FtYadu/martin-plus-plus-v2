import { query } from '../config/database';
import { getUserEmails, getGmailClient } from './gmail';
import { triageEmail, generateTasksFromEmail, draftEmailReply } from './ai';
import { memoryService } from './pinecone';
import { getUserEvents, suggestSlots } from './calendar';
import logger from '../config/logger';

export interface WorkflowContext {
    userId: string;
    trigger: 'email_received' | 'manual_request' | 'scheduled' | 'calendar_event';
    data: any;
    correlationId?: string;
}

export interface WorkflowResult {
    actions: WorkflowAction[];
    confidence: number;
    executionTime: number;
    errors?: string[];
}

export interface WorkflowAction {
    type: 'email_triage' | 'task_creation' | 'calendar_suggestion' | 'memory_storage' | 'response_draft';
    payload: any;
    confidence: number;
    priority: 'high' | 'medium' | 'low';
    requiresApproval: boolean;
}

export class WorkflowOrchestrator {
    /**
     * Main orchestration entry point - analyzes context and executes appropriate workflows
     */
    async processWorkflow(context: WorkflowContext): Promise<WorkflowResult> {
        const startTime = Date.now();
        const actions: WorkflowAction[] = [];
        const errors: string[] = [];

        try {
            logger.info(`Processing workflow: ${context.trigger}`, { correlationId: context.correlationId });

            switch (context.trigger) {
                case 'email_received':
                    const emailActions = await this.handleEmailWorkflow(context);
                    actions.push(...emailActions);
                    break;

                case 'calendar_event':
                    const calendarActions = await this.handleCalendarWorkflow(context);
                    actions.push(...calendarActions);
                    break;

                case 'manual_request':
                    const manualActions = await this.handleManualWorkflow(context);
                    actions.push(...manualActions);
                    break;

                case 'scheduled':
                    const scheduledActions = await this.handleScheduledWorkflow(context);
                    actions.push(...scheduledActions);
                    break;

                default:
                    logger.warn(`Unknown workflow trigger: ${context.trigger}`);
            }

            // Store workflow results in memory for learning
            await this.storeWorkflowResults(context, actions);

        } catch (error: any) {
            logger.error('Workflow orchestration error:', error);
            errors.push(error.message);
        }

        const executionTime = Date.now() - startTime;
        const confidence = this.calculateWorkflowConfidence(actions, errors);

        return {
            actions,
            confidence,
            executionTime,
            errors: errors.length > 0 ? errors : undefined,
        };
    }

    /**
     * Handle email-based workflows - triage, task extraction, response drafting
     */
    private async handleEmailWorkflow(context: WorkflowContext): Promise<WorkflowAction[]> {
        const actions: WorkflowAction[] = [];
        const { userId, data: emailData } = context;

        try {
            // 1. AI Triage - categorize the email
            const triageResult = await triageEmail({
                subject: emailData.subject,
                sender: emailData.sender,
                body: emailData.body,
            });

            actions.push({
                type: 'email_triage',
                payload: {
                    emailId: emailData.id,
                    category: triageResult.category,
                    summary: triageResult.summary,
                },
                confidence: triageResult.confidence,
                priority: 'high',
                requiresApproval: false,
            });

            // 2. Task Extraction - find actionable items
            const tasks = await generateTasksFromEmail({
                subject: emailData.subject,
                sender: emailData.sender,
                body: emailData.body,
                category: triageResult.category,
            });

            for (const task of tasks) {
                actions.push({
                    type: 'task_creation',
                    payload: {
                        title: task.title,
                        description: task.description,
                        priority: task.priority,
                        deadline: task.deadline,
                        source: emailData.subject,
                    },
                    confidence: 0.8,
                    priority: task.priority === 'high' ? 'high' : 'medium',
                    requiresApproval: true,
                });
            }

            // 3. Smart Reply Drafting (for high-priority actionable emails)
            if (triageResult.category === 'ACTIONABLE' && triageResult.priority === 'high') {
                const draft = await draftEmailReply({
                    subject: emailData.subject,
                    sender: emailData.sender,
                    body: emailData.body,
                    category: triageResult.category,
                }, 'professional');

                actions.push({
                    type: 'response_draft',
                    payload: {
                        emailId: emailData.id,
                        draft,
                        persona: 'professional',
                    },
                    confidence: 0.9,
                    priority: 'medium',
                    requiresApproval: true,
                });
            }

            // 4. Memory Storage - store for semantic search and learning
            await memoryService.storeMemory(userId, `Email: ${emailData.subject} - ${triageResult.summary}`, {
                type: 'email',
                context: {
                    emailId: emailData.id,
                    category: triageResult.category,
                    sender: emailData.sender,
                    receivedAt: emailData.receivedAt,
                },
            });

            // Update email in database with triage results
            await query(
                'UPDATE emails SET category = $1, preview = $2 WHERE id = $3 AND user_id = $4',
                [triageResult.category.toLowerCase(), triageResult.summary, emailData.id, userId]
            );

            // Create tasks in database
            for (const task of tasks) {
                await query(
                    'INSERT INTO tasks (user_id, title, description, status, priority, source, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
                    [userId, task.title, task.description || '', 'pending', task.priority || 'medium', emailData.subject]
                );
            }

        } catch (error: any) {
            logger.error('Email workflow error:', error);
            actions.push({
                type: 'email_triage',
                payload: { emailId: emailData.id, error: error.message },
                confidence: 0.1,
                priority: 'low',
                requiresApproval: false,
            });
        }

        return actions;
    }

    /**
     * Handle calendar-based workflows - meeting preparation, conflict resolution
     */
    private async handleCalendarWorkflow(context: WorkflowContext): Promise<WorkflowAction[]> {
        const actions: WorkflowAction[] = [];
        const { userId, data: calendarData } = context;

        try {
            // 1. Analyze meeting context and participants
            const similarMeetings = await memoryService.searchMemories(userId, `meeting ${calendarData.title}`, 3);

            // 2. Suggest optimal meeting times if requested
            if (calendarData.suggestTimes) {
                const suggestions = await suggestSlots(userId, 60, calendarData.preferences || {});

                actions.push({
                    type: 'calendar_suggestion',
                    payload: {
                        eventId: calendarData.id,
                        suggestions,
                        context: 'Meeting time optimization',
                    },
                    confidence: 0.85,
                    priority: 'medium',
                    requiresApproval: false,
                });
            }

            // 3. Store meeting context in memory
            await memoryService.storeMemory(userId, `Meeting: ${calendarData.title} with ${calendarData.attendees?.join(', ')}`, {
                type: 'meeting',
                context: {
                    eventId: calendarData.id,
                    attendees: calendarData.attendees,
                    startTime: calendarData.start,
                    location: calendarData.location,
                },
            });

        } catch (error: any) {
            logger.error('Calendar workflow error:', error);
        }

        return actions;
    }

    /**
     * Handle manual user requests - text analysis and action generation
     */
    private async handleManualWorkflow(context: WorkflowContext): Promise<WorkflowAction[]> {
        const actions: WorkflowAction[] = [];
        const { userId, data: requestData } = context;

        try {
            // Search relevant past context
            const relevantMemories = await memoryService.searchMemories(userId, requestData.query, 5);

            // Generate contextual response
            const response = await this.generateContextualResponse(requestData.query, relevantMemories);

            actions.push({
                type: 'response_draft',
                payload: {
                    query: requestData.query,
                    response,
                    contextMemories: relevantMemories.length,
                },
                confidence: 0.75,
                priority: 'medium',
                requiresApproval: false,
            });

            // Store user interaction for learning
            await memoryService.storeMemory(userId, `User asked: ${requestData.query}`, {
                type: 'interaction',
                context: {
                    response,
                    memoryCount: relevantMemories.length,
                },
            });

        } catch (error: any) {
            logger.error('Manual workflow error:', error);
        }

        return actions;
    }

    /**
     * Handle scheduled maintenance workflows - cleanup, analytics, optimizations
     */
    private async handleScheduledWorkflow(context: WorkflowContext): Promise<WorkflowAction[]> {
        const actions: WorkflowAction[] = [];
        const { userId } = context;

        try {
            // 1. Cleanup old emails/tasks
            const cleanupResult = await query(
                'DELETE FROM emails WHERE user_id = $1 AND created_at < NOW() - INTERVAL \'30 days\'',
                [userId]
            );

            // 2. Generate productivity insights
            const insights = await this.generateProductivityInsights(userId);

            // 3. Optimize task scheduling
            const taskOptimizations = await this.optimizeTaskScheduling(userId);

            actions.push({
                type: 'task_creation',
                payload: {
                    title: 'Scheduled Maintenance',
                    description: `Cleaned up ${cleanupResult.rowCount} old items. Generated ${insights.length} insights.`,
                    insights,
                    optimizations: taskOptimizations,
                },
                confidence: 0.95,
                priority: 'low',
                requiresApproval: false,
            });

        } catch (error: any) {
            logger.error('Scheduled workflow error:', error);
        }

        return actions;
    }

    /**
     * Store workflow results for learning and optimization
     */
    private async storeWorkflowResults(context: WorkflowContext, actions: WorkflowAction[]): Promise<void> {
        try {
            await memoryService.storeMemory(context.userId,
                `Workflow executed: ${context.trigger} with ${actions.length} actions`,
                {
                    type: 'workflow_execution',
                    context: {
                        trigger: context.trigger,
                        actionCount: actions.length,
                        totalConfidence: actions.reduce((sum, action) => sum + action.confidence, 0) / actions.length,
                    },
                }
            );
        } catch (error) {
            logger.error('Workflow result storage error:', error);
        }
    }

    /**
     * Calculate overall workflow confidence
     */
    private calculateWorkflowConfidence(actions: WorkflowAction[], errors: string[]): number {
        if (actions.length === 0) return 0;

        const actionConfidence = actions.reduce((sum, action) => sum + action.confidence, 0) / actions.length;
        const errorPenalty = errors.length * 0.1;
        const finalConfidence = Math.max(0, Math.min(1, actionConfidence - errorPenalty));

        return finalConfidence;
    }

    /**
     * Generate contextual responses using memory and AI
     */
    private async generateContextualResponse(query: string, memories: any[]): Promise<string> {
        const contextString = memories.map(m => m.content).join('\n');

        // This would use OpenAI to generate a contextual response
        // For now, return a simple response
        return `Based on your past interactions, here's what I can help with regarding "${query}". You have ${memories.length} relevant past interactions.`;
    }

    /**
     * Generate productivity insights from user data
     */
    private async generateProductivityInsights(userId: string): Promise<any[]> {
        try {
            const tasksResult = await query(
                'SELECT status, priority, created_at FROM tasks WHERE user_id = $1 AND created_at > NOW() - INTERVAL \'7 days\'',
                [userId]
            );

            const completedTasks = tasksResult.rows.filter((task: any) => task.status === 'completed').length;
            const totalTasks = tasksResult.rows.length;

            return [{
                type: 'task_completion_rate',
                value: totalTasks > 0 ? completedTasks / totalTasks : 0,
                insight: `Task completion rate last 7 days: ${Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}%`,
            }];
        } catch (error) {
            logger.error('Insight generation error:', error);
            return [];
        }
    }

    /**
     * Optimize task scheduling based on patterns
     */
    private async optimizeTaskScheduling(userId: string): Promise<any[]> {
        try {
            // Simple optimization - identify overdue high-priority tasks
            const overdueResult = await query(
                'SELECT id, title FROM tasks WHERE user_id = $1 AND status = $2 AND priority = $3 AND due_at < NOW()',
                [userId, 'pending', 'high']
            );

            return overdueResult.rows.map((task: any) => ({
                taskId: task.id,
                optimization: 'overdue_high_priority_task',
                suggestion: `Consider prioritizing task: ${task.title}`,
            }));
        } catch (error) {
            logger.error('Task optimization error:', error);
            return [];
        }
    }

    /**
     * Execute workflow actions based on approval status
     */
    async executeActions(userId: string, actions: WorkflowAction[], approvedOnly: boolean = true): Promise<void> {
        for (const action of actions) {
            if (approvedOnly && action.requiresApproval) {
                continue; // Skip actions requiring approval
            }

            try {
                await this.executeWorkflowAction(userId, action);
                logger.info(`Executed action: ${action.type}`, { confidence: action.confidence });
            } catch (error) {
                logger.error(`Action execution failed: ${action.type}`, error);
            }
        }
    }

    /**
     * Execute individual workflow actions
     */
    private async executeWorkflowAction(userId: string, action: WorkflowAction): Promise<void> {
        switch (action.type) {
            case 'email_triage':
                // Already executed during workflow
                break;

            case 'task_creation':
                await query(
                    'INSERT INTO tasks (user_id, title, description, status, priority, source, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
                    [userId, action.payload.title, action.payload.description || '', 'pending', action.payload.priority || 'medium', action.payload.source || 'workflow']
                );
                break;

            case 'calendar_suggestion':
                // Store suggestions for user review
                await query(
                    'INSERT INTO task_actions (user_id, action_type, payload, confidence, created_at) VALUES ($1, $2, $3, $4, NOW())',
                    [userId, action.type, JSON.stringify(action.payload), action.confidence]
                );
                break;

            case 'memory_storage':
                await memoryService.storeMemory(userId, action.payload.content, action.payload.metadata);
                break;

            default:
                logger.warn(`Unknown action type: ${action.type}`);
        }
    }
}

// Export singleton instance
export const workflowOrchestrator = new WorkflowOrchestrator();
