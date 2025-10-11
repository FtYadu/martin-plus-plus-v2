import { google } from 'googleapis';
import { AuthRequest } from '../middleware/auth';
import { query, getClient } from '../config/database';
import logger from '../config/logger';

const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
];

const getOAuth2Client = async (userId: string) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    // Get user's OAuth tokens from database
    const result = await query(
        'SELECT oauth_tokens FROM users WHERE id = $1',
        [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].oauth_tokens) {
        throw new Error('User Calendar access not configured');
    }

    const tokens = result.rows[0].oauth_tokens;
    oauth2Client.setCredentials(tokens);

    return oauth2Client;
};

export const getCalendarClient = async (userId: string) => {
    const oauth2Client = await getOAuth2Client(userId);
    return google.calendar({ version: 'v3', auth: oauth2Client });
};

export const getUserEvents = async (userId: string, options: { timeMin?: string; timeMax?: string; maxResults?: number; q?: string } = {}) => {
    try {
        const calendar = await getCalendarClient(userId);

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: options.timeMin || new Date().toISOString(),
            timeMax: options.timeMax,
            maxResults: options.maxResults || 50,
            q: options.q,
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.data.items || [];
    } catch (error) {
        logger.error('Error fetching Calendar events:', error);
        throw new Error('Failed to fetch events from Calendar');
    }
};

export const createEvent = async (userId: string, eventData: any) => {
    try {
        const calendar = await getCalendarClient(userId);

        const event = {
            summary: eventData.title,
            description: eventData.description,
            start: {
                dateTime: eventData.startTime,
                timeZone: 'UTC',
            },
            end: {
                dateTime: eventData.endTime,
                timeZone: 'UTC',
            },
            location: eventData.location,
            attendees: eventData.attendees?.map((email: string) => ({ email })),
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });

        return response.data;
    } catch (error) {
        logger.error('Error creating Calendar event:', error);
        throw new Error('Failed to create event');
    }
};

export const updateEvent = async (userId: string, eventId: string, eventData: any) => {
    try {
        const calendar = await getCalendarClient(userId);

        const event = {
            summary: eventData.title,
            description: eventData.description,
            start: eventData.isAllDay ? {
                date: eventData.startTime.split('T')[0],
            } : {
                dateTime: eventData.startTime,
                timeZone: 'UTC',
            },
            end: eventData.isAllDay ? {
                date: eventData.endTime.split('T')[0],
            } : {
                dateTime: eventData.endTime,
                timeZone: 'UTC',
            },
            location: eventData.location,
            attendees: eventData.attendees?.map((email: string) => ({ email })),
        };

        const response = await calendar.events.update({
            calendarId: 'primary',
            eventId: eventId,
            requestBody: event,
        });

        return response.data;
    } catch (error) {
        logger.error('Error updating Calendar event:', error);
        throw new Error('Failed to update event');
    }
};

export const deleteEvent = async (userId: string, eventId: string) => {
    try {
        const calendar = await getCalendarClient(userId);

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });

        return true;
    } catch (error) {
        logger.error('Error deleting Calendar event:', error);
        throw new Error('Failed to delete event');
    }
};

export const suggestSlots = async (userId: string, duration: number, preferences?: any) => {
    try {
        const calendar = await getCalendarClient(userId);

        // Get busy times for next 7 days
        const timeMin = new Date();
        const timeMax = new Date();
        timeMax.setDate(timeMax.getDate() + 7);

        const freeBusyResponse = await calendar.freebusy.query({
            requestBody: {
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                items: [{ id: 'primary' }],
            },
        });

        const busySlots = freeBusyResponse.data.calendars?.primary?.busy || [];
        const freeSlots = findFreeTimeSlots(busySlots, duration, timeMin, timeMax);

        return freeSlots.slice(0, 5); // Return top 5 suggestions
    } catch (error) {
        logger.error('Error getting free slots:', error);
        throw new Error('Failed to get available time slots');
    }
};

const findFreeTimeSlots = (busySlots: any[], durationMinutes: number, startTime: Date, endTime: Date) => {
    const FREE_SLOTS: any[] = [];
    const WORKING_HOURS_START = 9; // 9 AM
    const WORKING_HOURS_END = 17; // 5 PM
    const durationMs = durationMinutes * 60 * 1000;

    let currentTime = new Date(startTime);
    currentTime.setHours(WORKING_HOURS_START, 0, 0, 0);

    while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + durationMs);

        // Check if slot is within working hours
        if (currentTime.getHours() >= WORKING_HOURS_START &&
            slotEnd.getHours() <= WORKING_HOURS_END &&
            slotEnd.getDay() === currentTime.getDay()) {

            // Check if slot conflicts with busy time
            const isBusy = busySlots.some(busy => {
                const busyStart = new Date(busy.start);
                const busyEnd = new Date(busy.end);
                return (currentTime < busyEnd && slotEnd > busyStart);
            });

            if (!isBusy) {
                FREE_SLOTS.push({
                    start: currentTime.toISOString(),
                    end: slotEnd.toISOString(),
                });
            }
        }

        // Move to next potential slot (30-minute intervals)
        currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);

        // Skip to next day if we've passed working hours
        if (currentTime.getHours() >= WORKING_HOURS_END) {
            currentTime.setDate(currentTime.getDate() + 1);
            currentTime.setHours(WORKING_HOURS_START, 0, 0, 0);
        }
    }

    return FREE_SLOTS;
};

export const syncEventsToDatabase = async (userId: string) => {
    try {
        const events = await getUserEvents(userId);

        // Clear existing events for user
        query('DELETE FROM events WHERE user_id = $1', [userId]);

        // Insert new events
        for (const event of events) {
            query(
                `INSERT INTO events (user_id, google_event_id, title, description, start_time, end_time, location, attendees, status, is_all_day, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
                [
                    userId,
                    event.id,
                    event.summary,
                    event.description,
                    event.start?.dateTime || event.start?.date,
                    event.end?.dateTime || event.end?.date,
                    event.location,
                    JSON.stringify(event.attendees || []),
                    event.status,
                    !event.start?.dateTime, // is all day if no time specified
                ]
            );
        }

        logger.info(`Synced ${events.length} calendar events for user ${userId}`);
    } catch (error) {
        logger.error('Error syncing calendar events:', error);
        throw new Error('Failed to sync calendar events');
    }
};
