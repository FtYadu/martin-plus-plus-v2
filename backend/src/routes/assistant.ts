import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as assistantController from '../controllers/assistant';

const router = Router();

router.use(authenticate);

router.get('/actions', assistantController.getActions);
router.post('/execute', assistantController.executeAction);
router.post('/memory/search', assistantController.searchMemory);

export default router;