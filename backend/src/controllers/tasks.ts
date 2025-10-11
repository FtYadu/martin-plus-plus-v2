import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { query } from '../config/database';
import logger from '../config/logger';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;

    let sql = 'SELECT * FROM tasks WHERE user_id = $1';
    const params: any[] = [userId];

    if (status && status !== 'all') {
      sql += ' AND status = $2';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        count: result.rows.length,
      },
    });
  } catch (error) {
    logger.error('Get tasks error:', error);
    throw new AppError(500, 'GET_TASKS_FAILED', 'Failed to get tasks');
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, status, priority, due_at, source } = req.body;

    const result = await query(
      `INSERT INTO tasks (user_id, title, description, status, priority, progress, due_at, source, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 0, $6, $7, NOW(), NOW())
       RETURNING *`,
      [userId, title, description, status || 'pending', priority || 'medium', due_at, source]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  } catch (error) {
    logger.error('Create task error:', error);
    throw new AppError(500, 'CREATE_TASK_FAILED', 'Failed to create task');
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updates = req.body;

    const setClauses = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const values = [...Object.values(updates), id, userId];

    const result = await query(
      `UPDATE tasks SET ${setClauses}, updated_at = NOW()
       WHERE id = $${values.length - 1} AND user_id = $${values.length}`,
      values
    );

    // For SQLite, we need to fetch the updated record
    const selectResult = await query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (selectResult.rows.length === 0) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
    }

    res.json({
      success: true,
      data: selectResult.rows[0],
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Update task error:', error);
    throw new AppError(500, 'UPDATE_TASK_FAILED', 'Failed to update task');
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
    }

    res.json({
      success: true,
      data: {
        message: 'Task deleted successfully',
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Delete task error:', error);
    throw new AppError(500, 'DELETE_TASK_FAILED', 'Failed to delete task');
  }
};
