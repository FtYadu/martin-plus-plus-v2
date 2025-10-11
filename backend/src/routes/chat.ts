import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as chatController from '../controllers/chat';

const router = Router();

router.use(authenticate);

router.post('/message', chatController.sendMessage);
router.post('/stream', chatController.streamMessage);
router.get('/history', chatController.getHistory);

export default router;