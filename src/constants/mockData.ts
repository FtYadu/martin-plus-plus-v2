import type {
  Email,
  CalendarEvent,
  Task,
  AssistantAction,
  ChatMessage,
  QuickReply,
} from '@/types';

export const mockInbox: Email[] = [
  {
    id: 'email-1',
    threadId: 'thread-1',
    subject: 'ADIPEC Conference - Agenda',
    sender: 'Sarah Johnson',
    senderEmail: 'sarah.j@adipec.com',
    body: 'Hi team, attached is the final agenda for ADIPEC 2025...',
    preview: 'Hi team, attached is the final agenda for ADIPEC 2025. Please review and confirm your attendance.',
    category: 'important',
    receivedAt: '2 hours ago',
    isRead: false,
    hasAttachments: true,
  },
  {
    id: 'email-2',
    threadId: 'thread-2',
    subject: 'Billing Issue - Account $2.45',
    sender: 'Finance Team',
    senderEmail: 'finance@company.com',
    body: 'Your recent payment of $2.45 requires attention...',
    preview: 'Your recent payment of $2.45 requires attention. Please update your payment method.',
    category: 'actionable',
    receivedAt: '5 hours ago',
    isRead: false,
    hasAttachments: false,
  },
  {
    id: 'email-3',
    threadId: 'thread-3',
    subject: 'Weekly Newsletter - Tech Updates',
    sender: 'TechCrunch',
    senderEmail: 'newsletter@techcrunch.com',
    body: 'This week in tech: AI breakthroughs, new gadgets...',
    preview: 'This week in tech: AI breakthroughs, new gadgets, and startup funding rounds.',
    category: 'fyi',
    receivedAt: '1 day ago',
    isRead: true,
    hasAttachments: false,
  },
];

export const mockEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Team Standup',
    description: '19 SAAT 2I3TT - Attention omis',
    start: '9:00 AM',
    end: '9:30 AM',
    location: 'Conference Room A',
    attendees: ['John Doe', 'Jane Smith', 'Mike Wilson'],
    status: 'confirmed',
    isAllDay: false,
  },
  {
    id: 'event-2',
    title: 'Team Standup',
    description: 'Yond asend tiie giayour allis ombid se lspol.',
    start: '2:00 PM',
    end: '3:00 PM',
    attendees: ['Sarah Johnson', 'Tom Brown'],
    status: 'confirmed',
    isAllDay: false,
  },
  {
    id: 'event-3',
    title: 'Team Sync',
    description: '18 slraate@ng.com',
    start: '10:00 AM',
    end: '10:30 AM',
    attendees: ['Alex Chen', 'Maria Garcia'],
    status: 'tentative',
    isAllDay: false,
  },
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Prepare Q4 Report',
    description: '36 alroneit',
    status: 'in_progress',
    priority: 'high',
    progress: 65,
    dueAt: 'Due: due 27',
    source: 'Email from CEO',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
  },
  {
    id: 'task-2',
    title: 'Review Design Mockups',
    description: 'Borrow Design Mockups 70',
    status: 'pending',
    priority: 'medium',
    progress: 0,
    source: 'Slack message',
    createdAt: '2025-01-18T09:00:00Z',
    updatedAt: '2025-01-18T09:00:00Z',
  },
  {
    id: 'task-3',
    title: 'Update Documentation',
    description: 'Technical documentation needs updating',
    status: 'completed',
    priority: 'low',
    progress: 100,
    dueAt: 'Jan 15',
    source: 'Assistant suggestion',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-14T16:00:00Z',
  },
];

export const mockAssistantFeed: AssistantAction[] = [
  {
    id: 'action-1',
    label: 'Drafted reply to Sarah about ADIPEC agenda',
    actionType: 'email_draft',
    confidence: 0.92,
    timeLabel: '2 minutes ago',
    executedAt: '2025-01-20T15:28:00Z',
  },
  {
    id: 'action-2',
    label: 'Rescheduled conflicting meetings for tomorrow',
    actionType: 'calendar_update',
    confidence: 0.88,
    timeLabel: '1 hour ago',
    executedAt: '2025-01-20T14:30:00Z',
  },
  {
    id: 'action-3',
    label: 'Created task from email: Review Q4 metrics',
    actionType: 'task_creation',
    confidence: 0.95,
    timeLabel: '3 hours ago',
    executedAt: '2025-01-20T12:30:00Z',
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: 'Good morning! I\'ve triaged your inbox. You have 3 important emails requiring attention.',
    timestamp: '2025-01-20T09:00:00Z',
  },
  {
    id: 'msg-2',
    role: 'user',
    content: 'Summarize the ADIPEC email',
    timestamp: '2025-01-20T09:01:00Z',
  },
  {
    id: 'msg-3',
    role: 'assistant',
    content: 'The ADIPEC Conference email from Sarah Johnson contains the final agenda for ADIPEC 2025. She\'s requesting team review and attendance confirmation. Would you like me to draft a response?',
    timestamp: '2025-01-20T09:01:30Z',
  },
];

export const mockQuickReplies: QuickReply[] = [
  { id: 'qr-1', text: 'Draft a reply', action: 'draft_reply' },
  { id: 'qr-2', text: 'Schedule meeting', action: 'schedule_meeting' },
  { id: 'qr-3', text: 'Create task', action: 'create_task' },
  { id: 'qr-4', text: 'Summarize inbox', action: 'summarize_inbox' },
];