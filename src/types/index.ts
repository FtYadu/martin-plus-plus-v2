// Email types
export type InboxCategory = 'important' | 'actionable' | 'fyi';

export type Email = {
  id: string;
  threadId: string;
  subject: string;
  sender: string;
  senderEmail: string;
  body: string;
  preview: string;
  category: InboxCategory;
  receivedAt: string;
  isRead: boolean;
  hasAttachments: boolean;
};

export type EmailDraft = {
  id: string;
  emailId: string;
  content: string;
  confidence: number;
  persona: string;
  createdAt: string;
};

// Calendar types
export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees: string[];
  status: 'confirmed' | 'tentative' | 'cancelled';
  isAllDay: boolean;
};

// Task types
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  dueAt?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
};

// Assistant types
export type AssistantAction = {
  id: string;
  label: string;
  actionType: string;
  confidence: number;
  timeLabel: string;
  executedAt: string;
};

// Chat types
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isVoice?: boolean;
};

export type QuickReply = {
  id: string;
  text: string;
  action?: string;
};