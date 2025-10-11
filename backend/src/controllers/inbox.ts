import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { query } from '../config/database';
import { getUserEmails, getEmailById, updateEmailLabels } from '../services/gmail';
import { triageEmail, draftEmailReply, generateTasksFromEmail } from '../services/ai';
import { workflowOrchestrator } from '../services/workflowOrchestrator';
import logger from '../config/logger';

export const getInbox = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category, limit = 20 } = req.query;

    // Fetch emails from Gmail API
    const maxResults = Math.min(parseInt(limit as string) || 20, 50);
    const gmailOptions: any = { maxResults };

    if (category && category !== 'all') {
      // Map category to Gmail query
      switch (category) {
        case 'important':
          gmailOptions.labelIds = ['IMPORTANT', 'INBOX'];
          break;
        case 'actionable':
          gmailOptions.q = 'is:actionable';
          break;
        case 'fyi':
          gmailOptions.q = 'label:fyi';
          break;
        default:
          gmailOptions.labelIds = ['INBOX'];
      }
    } else {
      gmailOptions.labelIds = ['INBOX'];
    }

    const emails = await getUserEmails(userId, gmailOptions);

    // Store emails in local database for faster access
    await storeEmailsInDatabase(userId, emails);

    res.json({
      success: true,
      data: emails,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        count: emails.length,
      },
    });
  } catch (error) {
    logger.error('Get inbox error:', error);
    throw new AppError(500, 'GET_INBOX_FAILED', 'Failed to get inbox');
  }
};

const storeEmailsInDatabase = async (userId: string, emails: any[]) => {
  for (const email of emails) {
    try {
      // Check if email already exists
      const existing = await query(
        'SELECT id FROM emails WHERE id = $1 AND user_id = $2',
        [email.id, userId]
      );

      if (existing.rows.length === 0) {
        // Insert new email
        await query(
          `INSERT INTO emails (id, user_id, thread_id, subject, sender, sender_email, body, preview, received_at, is_read, has_attachments, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
          [
            email.id,
            userId,
            email.threadId,
            email.subject,
            email.sender,
            email.senderEmail,
            email.body,
            email.snippet,
            email.receivedAt,
            email.isRead,
            email.hasAttachments,
          ]
        );
      }
    } catch (dbError) {
      // Don't fail the entire operation if storing one email fails
      logger.warn('Failed to store email in database:', dbError);
    }
  }
};

export const triageInbox = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get untriaged emails (no category or new emails)
    const untriagedEmails = await query(
      'SELECT * FROM emails WHERE user_id = $1 AND (category IS NULL OR category = \"\") ORDER BY received_at DESC LIMIT 50',
      [userId]
    );

    let triaged = 0;

    // AI triage each email
    for (const email of untriagedEmails.rows) {
      try {
        const triageResult = await triageEmail({
          subject: email.subject,
          sender: email.sender,
          body: email.body
        });

        // Update email with triage results
        await query(
          'UPDATE emails SET category = $1, preview = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4',
          [triageResult.category, triageResult.summary, email.id, userId]
        );

        // Auto-generate tasks if the email has action items
        if (triageResult.actionItems && triageResult.actionItems.length > 0) {
          const tasks = await generateTasksFromEmail({
            subject: email.subject,
            sender: email.sender,
            body: email.body,
            category: triageResult.category
          });

          // Create tasks from AI suggestions
          for (const taskData of tasks) {
            await query(
              'INSERT INTO tasks (user_id, title, description, status, priority, due_at, source, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())',
              [
                userId,
                taskData.title,
                taskData.description,
                'pending',
                taskData.priority || 'medium',
                taskData.deadline,
                email.subject
              ]
            );
          }
        }

        triaged++;
      } catch (triageError) {
        logger.warn('Failed to triage email:', triageError);
      }
    }

    res.json({
      success: true,
      data: {
        triaged,
        processed: untriagedEmails.rows.length,
        message: `AI triaged ${triaged} out of ${untriagedEmails.rows.length} emails`,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  } catch (error) {
    logger.error('Triage inbox error:', error);
    throw new AppError(500, 'TRIAGE_FAILED', 'Failed to triage inbox');
  }
};

export const draftReply = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { emailId, persona = 'professional' } = req.body;

    // Get the email details
    const emailResult = await query(
      'SELECT * FROM emails WHERE id = $1 AND user_id = $2',
      [emailId, userId]
    );

    if (emailResult.rows.length === 0) {
      throw new AppError(404, 'EMAIL_NOT_FOUND', 'Email not found');
    }

    const email = emailResult.rows[0];

    // Use AI to draft a reply
    const draft = await draftEmailReply({
      subject: email.subject,
      sender: email.sender,
      body: email.body,
      category: email.category
    }, persona);

    // Calculate confidence (could be expanded with AI scoring)
    const confidence = 0.85; // Placeholder for now

    // Store the draft for reference
    await query(
      'INSERT INTO drafts (email_id, content, confidence, persona, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [emailId, draft, confidence, persona]
    );

    res.json({
      success: true,
      data: {
        draft,
        confidence,
        persona,
        emailId,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  } catch (error) {
    logger.error('Draft reply error:', error);
    throw new AppError(500, 'DRAFT_FAILED', 'Failed to draft reply');
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    const result = await query(
      'UPDATE emails SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, id, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'EMAIL_NOT_FOUND', 'Email not found');
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
    logger.error('Update status error:', error);
    throw new AppError(500, 'UPDATE_FAILED', 'Failed to update status');
  }
};
