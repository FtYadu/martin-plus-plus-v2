import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as calendarController from '../controllers/calendar';

const router = Router();

router.use(authenticate);

router.get('/events', calendarController.getEvents);
router.post('/events', calendarController.createEvent);
router.put('/events/:id', calendarController.updateEvent);
router.delete('/events/:id', calendarController.deleteEvent);
router.post('/suggest-slots', calendarController.suggestSlots);

export default router;