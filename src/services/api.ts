import type { Email, CalendarEvent, Task, ChatMessage, AssistantAction } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
const API_TIMEOUT = 30000;

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    version: string;
  };
};

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private token: string | null = null;

  constructor(baseUrl: string, timeout: number) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async refreshToken() {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'DELETE',
    });
  }

  async authenticateWithGmail(authPayload: {
    accessToken: string;
    provider: string;
    profile: any;
  }) {
    return this.request<{ token: string; user: any }>('/auth/gmail', {
      method: 'POST',
      body: JSON.stringify(authPayload),
    });
  }

  // Inbox
  async getInbox(params?: { category?: string; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<Email[]>(`/inbox${query ? `?${query}` : ''}`);
  }

  async triageInbox() {
    return this.request<{ triaged: number }>('/inbox/triage', {
      method: 'POST',
    });
  }

  async draftReply(emailId: string, persona: string) {
    return this.request<{ draft: string; confidence: number }>('/inbox/draft-reply', {
      method: 'POST',
      body: JSON.stringify({ emailId, persona }),
    });
  }

  async updateEmailStatus(emailId: string, status: string) {
    return this.request(`/inbox/${emailId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Calendar
  async getEvents(params: { start: string; end: string }) {
    const query = new URLSearchParams(params).toString();
    return this.request<CalendarEvent[]>(`/calendar/events?${query}`);
  }

  async createEvent(event: Partial<CalendarEvent>) {
    return this.request<CalendarEvent>('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>) {
    return this.request<CalendarEvent>(`/calendar/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteEvent(eventId: string) {
    return this.request(`/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  async suggestSlots(params: { duration: number; attendees: string[] }) {
    return this.request<{ slots: string[] }>('/calendar/suggest-slots', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Tasks
  async getTasks(params?: { status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<Task[]>(`/tasks${query ? `?${query}` : ''}`);
  }

  async createTask(task: Partial<Task>) {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(taskId: string, updates: Partial<Task>) {
    return this.request<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId: string) {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Chat
  async sendMessage(message: string, isVoice: boolean = false) {
    return this.request<ChatMessage>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, isVoice }),
    });
  }

  async getChatHistory(limit: number = 50) {
    return this.request<ChatMessage[]>(`/chat/history?limit=${limit}`);
  }

  // Assistant
  async getActions() {
    return this.request<AssistantAction[]>('/assistant/actions');
  }

  async executeAction(actionType: string, payload: any) {
    return this.request<{ result: any }>('/assistant/execute', {
      method: 'POST',
      body: JSON.stringify({ actionType, payload }),
    });
  }

  async searchMemory(query: string) {
    return this.request<{ results: any[] }>('/assistant/memory/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // Connection Tests
  async testDatabaseConnection() {
    return this.request<{ message: string }>('/test-connection/database');
  }

  async testAiConnection() {
    return this.request<{ message: string }>('/test-connection/ai');
  }

  async testGmailConnection() {
    return this.request<{ message: string }>('/test-connection/gmail');
  }

  async testCalendarConnection() {
    return this.request<{ message: string }>('/test-connection/calendar');
  }
}

export const apiClient = new ApiClient(API_BASE_URL, API_TIMEOUT);
