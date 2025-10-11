import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as connectionTestController from '../controllers/connectionTests';

const router = Router();

// All connection tests require authentication
router.use(authenticate);

// Test database connection
router.get('/database', connectionTestController.testDatabaseConnection);

// Test AI (Pinecone) connection
router.get('/ai', connectionTestController.testAiConnection);

// Test Gmail connection
router.get('/gmail', connectionTestController.testGmailConnection);

// Test Calendar connection
router.get('/calendar', connectionTestController.testCalendarConnection);

export default router;
