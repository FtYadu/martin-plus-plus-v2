import OpenAI from 'openai';
import { query as dbQuery } from '../config/database';
import logger from '../config/logger';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Email triage
export const triageEmail = async (emailData: any) => {
    try {
        const prompt = `
You are an AI assistant helping to triage emails. Analyze this email and classify it:

Email Subject: ${emailData.subject}
Email From: ${emailData.sender}
Email Body: ${emailData.body}

Classify this email into one of these categories:
- IMPORTANT: Urgent matters requiring immediate attention
- ACTIONABLE: Tasks or requests that need action
- FYI: Informational emails that don't require action

Also provide:
1. A brief summary (2-3 sentences)
2. Action items if any (extract specific tasks, requests, or commitments)
3. Suggested response priority (high/medium/low)
4. Suggested response time if applicable

Format your response as JSON:
{
  "category": "IMPORTANT|ACTIONABLE|FYI",
  "summary": "brief summary here",
  "actionItems": ["task 1", "task 2"],
  "priority": "high|medium|low",
  "responseTime": "ASAP|Today|This Week|When Possible|Never",
  "confidence": 0.95
}
`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 500,
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error('No response from OpenAI');
        }

        const result = JSON.parse(response);
        return result;
    } catch (error) {
        logger.error('Email triage AI error:', error);

        // Return fallback classification
        return {
            category: 'ACTIONABLE',
            summary: 'This email may require attention. Please review manually.',
            actionItems: [],
            priority: 'medium',
            responseTime: 'This Week',
            confidence: 0.5,
        };
    }
};

// Draft email reply
export const draftEmailReply = async (emailData: any, persona = 'professional') => {
    try {
        const prompt = `
You are writing a reply to this email. Use the "${persona}" tone.

Original Email:
Subject: ${emailData.subject}
From: ${emailData.sender}
Body: ${emailData.body}

Context: This email was classified as ${emailData.category}. It may require: ${emailData.actionItems?.join(', ') || 'no specific actions'}.

Please draft a professional, concise reply that:
1. Acknowledges the email appropriately
2. Addresses the main points or requests
3. Maintains appropriate tone and professionalism
4. Takes action on any commitments

Keep the reply under 200 words. Focus on being helpful and decisive.

Draft the response:
`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 300,
        });

        const response = completion.choices[0]?.message?.content;
        return response || 'Thank you for your email. I will review this and respond shortly.';
    } catch (error) {
        logger.error('Email draft AI error:', error);
        return 'Thank you for your email. I will review this and respond shortly.';
    }
};

// Generate tasks from email or calendar events
export const generateTasksFromEmail = async (emailData: any) => {
    try {
        const prompt = `
Analyze this email and extract any tasks, commitments, or follow-ups needed:

Email Subject: ${emailData.subject}
Email From: ${emailData.sender}
Email Body: ${emailData.body}
Email Category: ${emailData.category || 'unknown'}

Extract all specific tasks, deadlines, commitments, or follow-up actions.
For each task, determine:
- Title: Concise task description
- Priority: high/medium/low
- Deadline: Specific date/time if mentioned, otherwise suggest reasonable deadline
- Description: More details about the task

Format as JSON array:
[
  {
    "title": "Task title",
    "description": "Detailed description",
    "priority": "high|medium|low",
    "deadline": "YYYY-MM-DD HH:MM" or null
  }
]

If no specific tasks found, return empty array.
`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 400,
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) return [];

        const tasks = JSON.parse(response);
        return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
        logger.error('Task generation AI error:', error);
        return [];
    }
};

// Chat assistant responses
export const generateChatResponse = async (message: string, context: any[] = []) => {
    try {
        const contextString = context.map(msg =>
            `${msg.role}: ${msg.content}`
        ).join('\n');

        const prompt = `
You are Martin++, an intelligent personal assistant. Be helpful, concise, and proactive.

Previous conversation:
${contextString}

User: ${message}

Respond naturally and helpfully. If the user asks about tasks, emails, calendar, or needs assistance, provide specific help. If they mention needing to schedule something, create meetings, send emails, etc., you can help with that.

Keep responses practical and actionable.
`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 300,
        });

        const response = completion.choices[0]?.message?.content;
        return response || 'I understand. How can I help you today?';
    } catch (error) {
        logger.error('Chat AI error:', error);
        return 'I\'m having trouble understanding that right now. Could you try asking differently?';
    }
};

// Streaming chat response
export const generateStreamingChatResponse = async (
    message: string,
    context: any[] = [],
    previousResponse?: string,
    onChunk?: (chunk: string) => void
) => {
    try {
        const messages: any[] = [];

        // Add context
        context.forEach(msg => {
            messages.push({
                role: msg.role,
                content: msg.content
            });
        });

        // Add previous response if exists
        if (previousResponse) {
            messages.push({
                role: 'assistant',
                content: previousResponse
            });
        }

        // Add current message
        messages.push({
            role: 'user',
            content: message
        });

        const stream = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages,
            temperature: 0.7,
            max_tokens: 1000,
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content && onChunk) {
                onChunk(content);
            }
        }
    } catch (error) {
        logger.error('Streaming chat AI error:', error);
        if (onChunk) {
            onChunk('I\'m having trouble understanding that right now. Could you try asking differently?');
        }
    }
};

// Search semantic memory
export const searchMemory = async (searchQuery: string, userId: string) => {
    try {
        // Get relevant memories from database
        const memoriesResult = await dbQuery(
            'SELECT * FROM memories WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
            [userId]
        );
        const memories = memoriesResult;

        // For now, return simple semantic search
        // In a real implementation, use vector embeddings with Pinecone
        const relevantMemories = memories.rows.filter((memory: any) =>
            memory.content && memory.content.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return relevantMemories.slice(0, 5);
    } catch (error) {
        logger.error('Memory search error:', error);
        return [];
    }
};

// Analyze calendar and suggest optimal times
export const suggestOptimalTimes = async (duration: number, preferences: any = {}) => {
    try {
        const prompt = `
A user wants to schedule a ${duration}-minute meeting.
Consider these preferences: ${JSON.stringify(preferences)}

Current typical work hours: 9 AM - 5 PM (GMT)
Working days: Monday-Friday

Suggest 5 optimal time slots for the current week.
Consider:
1. Standard work hours
2. Start/end of week preferences
3. Common meeting patterns
4. Time zone convenience

Format as JSON array:
[
  {"start": "2025-01-15T10:00:00Z", "end": "2025-01-15T11:00:00Z", "reason": "Early morning slot"},
  ...
]
`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 400,
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) return [];

        const suggestions = JSON.parse(response);
        return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
        logger.error('Time suggestion AI error:', error);
        return [];
    }
};

// Action confidence scoring
export const scoreActionConfidence = async (action: any) => {
    try {
        const prompt = `
Analyze this proposed action and provide confidence scoring:

Action: ${JSON.stringify(action)}

Rate on a scale of 0-1 how confident you are that:
1. This action is appropriate for the situation
2. This action will achieve the desired outcome
3. This action is ethical and safe

Format as JSON:
{
  "appropriateness": 0.95,
  "effectiveness": 0.87,
  "ethics": 0.98,
  "overall": 0.90
}
`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 150,
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
            return { overall: 0.5 };
        }

        const scores = JSON.parse(response);
        return scores;
    } catch (error) {
        logger.error('Confidence scoring AI error:', error);
        return { overall: 0.5 };
    }
};

