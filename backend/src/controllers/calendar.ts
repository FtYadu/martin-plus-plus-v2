import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { query } from '../config/database';
import { getUserEvents, createEvent as createCalendarEvent, updateEvent as updateCalendarEvent, deleteEvent as deleteCalendarEvent, suggestSlots as suggestCalendarSlots, syncEventsToDatabase } from '../services/calendar';
import logger from '../config/logger';

export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { start, end, sync } = req.query;

    let events;

    // If sync parameter is provided, refresh from Google Calendar
    if (sync === 'true') {
      logger.info(`Syncing calendar events for user ${userId}`);
      await syncEventsToDatabase(userId);
    }

    // Fetch from Google Calendar API directly or from database
    if (!start && !end) {
      // Get recent events from Google Calendar
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      events = await getUserEvents(userId, {
        timeMin: now.toISOString(),
        timeMax: nextMonth.toISOString(),
        maxResults: 50,
      });
    } else {
      // Get events from database
      const result = await query(
        `SELECT * FROM events
         WHERE user_id = $1
         AND start_time >= $2
         AND end_time <= $3
         ORDER BY start_time ASC`,
        [userId, start, end]
      );
      events = result.rows;
    }

    res.json({
      success: true,
      data: events,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        count: Array.isArray(events) ? events.length : 0,
      },
    });
  } catch (error) {
    logger.error('Get events error:', error);
    throw new AppError(500, 'GET_EVENTS_FAILED', 'Failed to get events');
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, startTime, endTime, location, attendees, isAllDay } = req.body;

    // Create event in Google Calendar first
    const calendarEvent = await createCalendarEvent(userId, {
      title,
      description,
      startTime,
      endTime,
      location,
      attendees,
      isAllDay,
    });

    // Store in local database
    const result = await query(
      `INSERT INTO events (user_id, google_event_id, title, description, start_time, end_time, location, attendees, status, is_all_day, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [
        userId,
        calendarEvent.id,
        title,
        description,
        startTime,
        endTime,
        location,
        JSON.stringify(attendees || []),
        calendarEvent.status,
        isAllDay || false,
      ]
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
    logger.error('Create event error:', error);
    throw new AppError(500, 'CREATE_EVENT_FAILED', 'Failed to create event');
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updates = req.body;

    const setClauses = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 3}`)
      .join(', ');

    const values = [id, userId, ...Object.values(updates)];

    const result = await query(
      `UPDATE events SET ${setClauses}, updated_at = NOW() 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }

    res.json({
      success: true,
      data: result.rows[0],
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Update event error:', error);
    throw new AppError(500, 'UPDATE_EVENT_FAILED', 'Failed to update event');
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await query(
      'DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }

    res.json({
      success: true,
      data: {
        message: 'Event deleted successfully',
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Delete event error:', error);
    throw new AppError(500, 'DELETE_EVENT_FAILED', 'Failed to delete event');
  }
};

export const suggestSlots = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { duration = 60 } = req.body;

    // Get available time slots based on calendar availability
    const slots = await suggestCalendarSlots(userId, parseInt(duration));

    res.json({
      success: true,
      data: {
        slots,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        count: slots.length,
      },
    });
  } catch (error) {
    logger.error('Suggest slots error:', error);
    throw new AppError(500, 'SUGGEST_SLOTS_FAILED', 'Failed to suggest slots');
  }
};
