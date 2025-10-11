import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as inboxController from '../controllers/inbox';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', inboxController.getInbox);
router.post('/triage', inboxController.triageInbox);
router.post('/draft-reply', inboxController.draftReply);
router.put('/:id/status', inboxController.updateStatus);

export default router;