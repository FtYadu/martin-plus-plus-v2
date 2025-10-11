import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { query } from '../config/database';
import { generateChatResponse, generateStreamingChatResponse } from '../services/ai';
import logger from '../config/logger';

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { message, isVoice = false } = req.body;

    // Store user message first
    await query(
      `INSERT INTO chat_messages (user_id, role, content, is_voice, created_at)
       VALUES ($1, 'user', $2, $3, NOW())`,
      [userId, message, isVoice]
    );

    // Get recent conversation context (last 10 messages for AI context)
    const contextResult = await query(
      `SELECT role, content FROM chat_messages
       WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );

    // Reverse to get chronological order
    const context = contextResult.rows.reverse();

    // Generate AI response using the conversation context
    const aiResponse = await generateChatResponse(message, context);

    // Store AI response
    await query(
      `INSERT INTO chat_messages (user_id, role, content, is_voice, created_at)
       VALUES ($1, 'assistant', $2, 0, NOW())`,
      [userId, aiResponse]
    );

    // Get the AI message record
    const selectResult = await query(
      `SELECT * FROM chat_messages
       WHERE user_id = $1 AND role = 'assistant'
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    res.json({
      success: true,
      data: selectResult.rows[0],
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  } catch (error) {
    logger.error('Send message error:', error);
    throw new AppError(500, 'SEND_MESSAGE_FAILED', 'Failed to send message');
  }
};

export const streamMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { message, previousResponse } = req.body;

    // Get recent conversation context
    const contextResult = await query(
      `SELECT role, content FROM chat_messages
       WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );

    const context = contextResult.rows.reverse();

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    // Generate streaming response
    let fullResponse = '';
    
    await generateStreamingChatResponse(
      message,
      context,
      previousResponse,
      (chunk: string) => {
        fullResponse += chunk;
        res.write(chunk);
      }
    );

    // Store user message
    await query(
      `INSERT INTO chat_messages (user_id, role, content, is_voice, created_at)
       VALUES ($1, 'user', $2, false, NOW())`,
      [userId, message]
    );

    // Store AI response
    await query(
      `INSERT INTO chat_messages (user_id, role, content, is_voice, created_at)
       VALUES ($1, 'assistant', $2, false, NOW())`,
      [userId, fullResponse]
    );

    res.end();
  } catch (error) {
    logger.error('Stream message error:', error);
    res.write('Error generating response');
    res.end();
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { limit = 50 } = req.query;

    const result = await query(
      `SELECT * FROM chat_messages
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json({
      success: true,
      data: result.rows.reverse(),
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        count: result.rows.length,
      },
    });
  } catch (error) {
    logger.error('Get history error:', error);
    throw new AppError(500, 'GET_HISTORY_FAILED', 'Failed to get history');
  }
};

