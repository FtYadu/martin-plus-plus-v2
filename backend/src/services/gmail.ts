import { google } from 'googleapis';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import logger from '../config/logger';

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
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
        throw new Error('User Gmail access not configured');
    }

    const tokens = result.rows[0].oauth_tokens;
    oauth2Client.setCredentials(tokens);

    return oauth2Client;
};

export const getGmailClient = async (userId: string) => {
    const oauth2Client = await getOAuth2Client(userId);
    return google.gmail({ version: 'v1', auth: oauth2Client });
};

export const getUserEmails = async (userId: string, options: { maxResults?: number; q?: string; labelIds?: string[] } = {}) => {
    try {
        const gmail = await getGmailClient(userId);

        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: options.maxResults || 50,
            q: options.q,
            labelIds: options.labelIds || ['INBOX'],
        });

        if (!response.data.messages) {
            return [];
        }

        // Fetch full message details for each message
        const emails = await Promise.all(
            response.data.messages.map(async (message) => {
                const messageResponse = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id!,
                    format: 'full',
                });

                return parseEmailMessage(messageResponse.data);
            })
        );

        return emails;
    } catch (error) {
        logger.error('Error fetching Gmail messages:', error);
        throw new Error('Failed to fetch emails from Gmail');
    }
};

export const getEmailById = async (userId: string, messageId: string) => {
    try {
        const gmail = await getGmailClient(userId);

        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full',
        });

        return parseEmailMessage(response.data);
    } catch (error) {
        logger.error('Error fetching Gmail message by ID:', error);
        throw new Error('Failed to fetch email');
    }
};

const parseEmailMessage = (message: any) => {
    const headers = message.payload?.headers || [];
    const getHeader = (name: string) => headers.find((h: any) => h.name === name)?.value || '';

    let body = '';
    if (message.payload?.body?.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString();
    } else if (message.payload?.parts) {
        // Handle multipart messages
        const textPart = message.payload.parts.find((part: any) =>
            part.mimeType === 'text/plain' && part.body?.data
        );
        if (textPart) {
            body = Buffer.from(textPart.body.data, 'base64').toString();
        }
    }

    const snippet = getHeader('Subject') ?
        `${getHeader('Subject')} - ${body.substring(0, 100)}...` :
        body.substring(0, 150);

    return {
        id: message.id,
        threadId: message.threadId,
        labelIds: message.labelIds || [],
        snippet,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To'),
        sender: getHeader('From'),
        senderEmail: getHeader('From').match(/<([^>]+)>/)?.[1] || getHeader('From'),
        body,
        receivedAt: new Date(parseInt(message.internalDate)),
        isRead: message.labelIds?.includes('UNREAD') ? false : true,
        hasAttachments: message.payload?.parts?.some((part: any) =>
            part.mimeType && !part.mimeType.startsWith('text/')
        ) || false,
    };
};

export const updateEmailLabels = async (userId: string, messageId: string, addLabelIds?: string[], removeLabelIds?: string[]) => {
    try {
        const gmail = await getGmailClient(userId);

        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                addLabelIds,
                removeLabelIds,
            },
        });
    } catch (error) {
        logger.error('Error updating email labels:', error);
        throw new Error('Failed to update email');
    }
};

export const sendEmail = async (userId: string, to: string, subject: string, body: string) => {
    try {
        const gmail = await getGmailClient(userId);

        const email = [
            'Content-Type: text/plain; charset=utf-8',
            'MIME-Version: 1.0',
            `To: ${to}`,
            `Subject: ${subject}`,
            '',
            body,
        ].join('\n');

        const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedEmail,
            },
        });

        return response.data;
    } catch (error) {
        logger.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

export const getOAuth2Url = () => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
    });
};

export const setUserOAuthTokens = async (userId: string, code: string) => {
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Store tokens in database
        await query(
            'UPDATE users SET oauth_tokens = $1 WHERE id = $2',
            [tokens, userId]
        );

        return tokens;
    } catch (error) {
        logger.error('Error setting OAuth tokens:', error);
        throw new Error('Failed to authenticate with Gmail');
    }
};
