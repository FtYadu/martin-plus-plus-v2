# Martin++ Plugin SDK

## Overview

The Martin++ Plugin SDK allows developers to extend the assistant's capabilities with custom integrations and workflows.

## Plugin Architecture

```typescript
// Plugin Interface
interface Plugin {
  // Metadata
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string;
  
  // Lifecycle
  initialize: (config: PluginConfig) => Promise<void>;
  execute: (action: PluginAction) => Promise<PluginResult>;
  cleanup: () => Promise<void>;
  
  // Capabilities
  capabilities: PluginCapability[];
  permissions: PluginPermission[];
}

interface PluginConfig {
  apiKey?: string;
  baseUrl?: string;
  settings: Record<string, any>;
}

interface PluginAction {
  type: string;
  payload: Record<string, any>;
  context: ActionContext;
}

interface PluginResult {
  success: boolean;
  data?: any;
  error?: string;
}

type PluginCapability = 
  | 'read_inbox'
  | 'write_inbox'
  | 'read_calendar'
  | 'write_calendar'
  | 'read_tasks'
  | 'write_tasks'
  | 'ui_component';

type PluginPermission =
  | 'network'
  | 'storage'
  | 'notifications';
```

## Creating a Plugin

### 1. Basic Plugin Structure

```typescript
// plugins/my-plugin/index.ts
import { Plugin, PluginConfig, PluginAction, PluginResult } from '@martin-plus-plus/plugin-sdk';

export class MyPlugin implements Plugin {
  id = 'my-plugin';
  name = 'My Plugin';
  version = '1.0.0';
  description = 'A sample plugin';
  author = 'Your Name';
  
  capabilities = ['read_tasks', 'write_tasks'];
  permissions = ['network'];
  
  private config?: PluginConfig;
  
  async initialize(config: PluginConfig): Promise<void> {
    this.config = config;
    // Initialize your plugin
    console.log('Plugin initialized');
  }
  
  async execute(action: PluginAction): Promise<PluginResult> {
    switch (action.type) {
      case 'sync_tasks':
        return await this.syncTasks(action.payload);
      default:
        return {
          success: false,
          error: `Unknown action: ${action.type}`
        };
    }
  }
  
  async cleanup(): Promise<void> {
    // Cleanup resources
    console.log('Plugin cleaned up');
  }
  
  private async syncTasks(payload: any): Promise<PluginResult> {
    // Your implementation
    return { success: true, data: {} };
  }
}

export default new MyPlugin();
```

### 2. Plugin SDK API

```typescript
// @martin-plus-plus/plugin-sdk
export class PluginSDK {
  // Data Access
  async getInbox(filters?: InboxFilters): Promise<Email[]>
  async getTasks(filters?: TaskFilters): Promise<Task[]>
  async getCalendar(range: DateRange): Promise<Event[]>
  
  // Data Modification
  async createTask(task: TaskInput): Promise<Task>
  async updateTask(id: string, updates: Partial<Task>): Promise<Task>
  async deleteTask(id: string): Promise<void>
  
  async createEvent(event: EventInput): Promise<Event>
  async updateEvent(id: string, updates: Partial<Event>): Promise<Event>
  async deleteEvent(id: string): Promise<void>
  
  async sendEmail(draft: EmailDraft): Promise<void>
  
  // UI
  async showNotification(message: string, options?: NotificationOptions): Promise<void>
  async showToast(message: string, type?: 'success' | 'error' | 'info'): Promise<void>
  async openModal(component: React.Component): Promise<any>
  
  // Storage
  async getStorage(key: string): Promise<any>
  async setStorage(key: string, value: any): Promise<void>
  async removeStorage(key: string): Promise<void>
  
  // Network
  async fetch(url: string, options?: RequestInit): Promise<Response>
  
  // Assistant
  async askAssistant(prompt: string): Promise<string>
}
```

## Example Plugins

### Notion Plugin

```typescript
// plugins/notion/index.ts
import { Plugin, PluginSDK } from '@martin-plus-plus/plugin-sdk';
import { Client } from '@notionhq/client';

export class NotionPlugin implements Plugin {
  id = 'notion';
  name = 'Notion Integration';
  version = '1.0.0';
  description = 'Sync tasks and docs with Notion';
  author = 'Martin++ Team';
  
  capabilities = ['read_tasks', 'write_tasks'];
  permissions = ['network', 'storage'];
  
  private notion?: Client;
  private sdk?: PluginSDK;
  
  async initialize(config: PluginConfig): Promise<void> {
    this.notion = new Client({ auth: config.apiKey });
    this.sdk = new PluginSDK();
  }
  
  async execute(action: PluginAction): Promise<PluginResult> {
    switch (action.type) {
      case 'sync_to_notion':
        return await this.syncToNotion();
      case 'import_from_notion':
        return await this.importFromNotion();
      default:
        return { success: false, error: 'Unknown action' };
    }
  }
  
  private async syncToNotion(): Promise<PluginResult> {
    try {
      const tasks = await this.sdk!.getTasks({ status: 'pending' });
      
      for (const task of tasks) {
        await this.notion!.pages.create({
          parent: { database_id: process.env.NOTION_DATABASE_ID! },
          properties: {
            Name: { title: [{ text: { content: task.title } }] },
            Status: { select: { name: task.status } },
            Priority: { select: { name: task.priority } },
          },
        });
      }
      
      await this.sdk!.showNotification(`Synced ${tasks.length} tasks to Notion`);
      return { success: true, data: { count: tasks.length } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  private async importFromNotion(): Promise<PluginResult> {
    // Implementation
    return { success: true };
  }
  
  async cleanup(): Promise<void> {
    this.notion = undefined;
  }
}

export default new NotionPlugin();
```

### GitHub Plugin

```typescript
// plugins/github/index.ts
import { Plugin, PluginSDK } from '@martin-plus-plus/plugin-sdk';
import { Octokit } from '@octokit/rest';

export class GitHubPlugin implements Plugin {
  id = 'github';
  name = 'GitHub Integration';
  version = '1.0.0';
  description = 'Track issues and PRs';
  author = 'Martin++ Team';
  
  capabilities = ['read_tasks', 'write_tasks'];
  permissions = ['network'];
  
  private octokit?: Octokit;
  private sdk?: PluginSDK;
  
  async initialize(config: PluginConfig): Promise<void> {
    this.octokit = new Octokit({ auth: config.apiKey });
    this.sdk = new PluginSDK();
  }
  
  async execute(action: PluginAction): Promise<PluginResult> {
    switch (action.type) {
      case 'sync_issues':
        return await this.syncIssues(action.payload);
      case 'create_issue':
        return await this.createIssue(action.payload);
      default:
        return { success: false, error: 'Unknown action' };
    }
  }
  
  private async syncIssues(payload: { owner: string; repo: string }): Promise<PluginResult> {
    try {
      const { data: issues } = await this.octokit!.issues.listForRepo({
        owner: payload.owner,
        repo: payload.repo,
        state: 'open',
      });
      
      for (const issue of issues) {
        await this.sdk!.createTask({
          title: issue.title,
          description: issue.body || '',
          status: 'pending',
          priority: issue.labels.some(l => l.name === 'priority') ? 'high' : 'medium',
          source: `GitHub: ${payload.owner}/${payload.repo}#${issue.number}`,
        });
      }
      
      return { success: true, data: { count: issues.length } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  private async createIssue(payload: any): Promise<PluginResult> {
    // Implementation
    return { success: true };
  }
  
  async cleanup(): Promise<void> {
    this.octokit = undefined;
  }
}

export default new GitHubPlugin();
```

### Slack Plugin

```typescript
// plugins/slack/index.ts
import { Plugin, PluginSDK } from '@martin-plus-plus/plugin-sdk';
import { WebClient } from '@slack/web-api';

export class SlackPlugin implements Plugin {
  id = 'slack';
  name = 'Slack Integration';
  version = '1.0.0';
  description = 'Sync messages and channels';
  author = 'Martin++ Team';
  
  capabilities = ['read_inbox'];
  permissions = ['network', 'notifications'];
  
  private slack?: WebClient;
  private sdk?: PluginSDK;
  
  async initialize(config: PluginConfig): Promise<void> {
    this.slack = new WebClient(config.apiKey);
    this.sdk = new PluginSDK();
  }
  
  async execute(action: PluginAction): Promise<PluginResult> {
    switch (action.type) {
      case 'get_unread':
        return await this.getUnreadMessages();
      case 'send_message':
        return await this.sendMessage(action.payload);
      default:
        return { success: false, error: 'Unknown action' };
    }
  }
  
  private async getUnreadMessages(): Promise<PluginResult> {
    try {
      const result = await this.slack!.conversations.list();
      const unreadCount = result.channels?.filter(c => c.unread_count_display > 0).length || 0;
      
      await this.sdk!.showNotification(`You have ${unreadCount} unread Slack channels`);
      return { success: true, data: { count: unreadCount } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  private async sendMessage(payload: { channel: string; text: string }): Promise<PluginResult> {
    try {
      await this.slack!.chat.postMessage({
        channel: payload.channel,
        text: payload.text,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async cleanup(): Promise<void> {
    this.slack = undefined;
  }
}

export default new SlackPlugin();
```

## Plugin Configuration UI

```typescript
// Plugin settings screen
import { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export function PluginSettings({ plugin }: { plugin: Plugin }) {
  const [apiKey, setApiKey] = useState('');
  
  const handleSave = async () => {
    await plugin.initialize({ apiKey, settings: {} });
  };
  
  return (
    <View>
      <Text>Configure {plugin.name}</Text>
      <TextInput
        placeholder="API Key"
        value={apiKey}
        onChangeText={setApiKey}
        secureTextEntry
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
}
```

## Plugin Registry

```typescript
// src/services/pluginRegistry.ts
import type { Plugin } from '@martin-plus-plus/plugin-sdk';

class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  
  register(plugin: Plugin): void {
    this.plugins.set(plugin.id, plugin);
  }
  
  get(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }
  
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }
  
  async executeAction(pluginId: string, action: PluginAction): Promise<PluginResult> {
    const plugin = this.get(pluginId);
    if (!plugin) {
      return { success: false, error: 'Plugin not found' };
    }
    return await plugin.execute(action);
  }
}

export const pluginRegistry = new PluginRegistry();
```

## Publishing Plugins

### Plugin Manifest

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "A sample plugin",
  "author": "Your Name",
  "license": "MIT",
  "repository": "https://github.com/username/my-plugin",
  "keywords": ["martin", "plugin", "productivity"],
  "capabilities": ["read_tasks", "write_tasks"],
  "permissions": ["network"],
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

### Publishing Steps

1. Build your plugin: `npm run build`
2. Test locally: `npm test`
3. Publish to npm: `npm publish`
4. Submit to Martin++ Plugin Store

## Best Practices

1. **Error Handling**: Always wrap async operations in try-catch
2. **Permissions**: Request only necessary permissions
3. **Performance**: Avoid blocking operations
4. **Security**: Never expose API keys in code
5. **Testing**: Write unit tests for all actions
6. **Documentation**: Provide clear README and examples

## Next Steps

- Implement plugin sandbox for security
- Create plugin marketplace UI
- Add plugin analytics
- Support plugin updates