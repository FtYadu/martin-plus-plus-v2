import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as tasksController from '../controllers/tasks';

const router = Router();

router.use(authenticate);

router.get('/', tasksController.getTasks);
router.post('/', tasksController.createTask);
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

export default router;