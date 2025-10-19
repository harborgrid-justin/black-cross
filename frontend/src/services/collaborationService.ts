import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse, FilterOptions } from '@/types';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  type: 'investigation' | 'project' | 'team';
  members: WorkspaceMember[];
  status: 'active' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  userId: string;
  userName: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  createdByName?: string;
  dueDate?: string;
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  authorName?: string;
  createdAt: string;
  updatedAt?: string;
  mentions: string[];
}

export interface WikiPage {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  slug: string;
  parentId?: string;
  version: number;
  tags: string[];
  createdBy: string;
  createdByName?: string;
  lastEditedBy: string;
  lastEditedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WikiPageVersion {
  id: string;
  pageId: string;
  version: number;
  content: string;
  editedBy: string;
  editedByName?: string;
  changeDescription?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  workspaceId: string;
  channelId?: string;
  content: string;
  author: string;
  authorName?: string;
  type: 'text' | 'file' | 'system';
  attachments?: Attachment[];
  mentions: string[];
  replyTo?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatChannel {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  members: string[];
  createdBy: string;
  createdAt: string;
}

export interface ActivityFeed {
  id: string;
  workspaceId?: string;
  type: 'task' | 'comment' | 'wiki' | 'chat' | 'member' | 'workspace';
  action: string;
  actor: string;
  actorName?: string;
  resource?: string;
  resourceType?: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'assignment' | 'comment' | 'task-update' | 'workspace-invite';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export const collaborationService = {
  // Workspaces
  async getWorkspaces(filters?: FilterOptions): Promise<PaginatedResponse<Workspace>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<Workspace>>(
      `/collaboration/workspaces?${params.toString()}`
    );
  },

  async getWorkspace(id: string): Promise<ApiResponse<Workspace>> {
    return apiClient.get<ApiResponse<Workspace>>(`/collaboration/workspaces/${id}`);
  },

  async createWorkspace(data: Partial<Workspace>): Promise<ApiResponse<Workspace>> {
    return apiClient.post<ApiResponse<Workspace>>('/collaboration/workspaces', data);
  },

  async updateWorkspace(id: string, data: Partial<Workspace>): Promise<ApiResponse<Workspace>> {
    return apiClient.put<ApiResponse<Workspace>>(`/collaboration/workspaces/${id}`, data);
  },

  async deleteWorkspace(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/collaboration/workspaces/${id}`);
  },

  async addMember(workspaceId: string, userId: string, role: string): Promise<ApiResponse<Workspace>> {
    return apiClient.post<ApiResponse<Workspace>>(
      `/collaboration/workspaces/${workspaceId}/members`,
      { userId, role }
    );
  },

  async removeMember(workspaceId: string, userId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/collaboration/workspaces/${workspaceId}/members/${userId}`
    );
  },

  async updateMemberRole(workspaceId: string, userId: string, role: string): Promise<ApiResponse<Workspace>> {
    return apiClient.put<ApiResponse<Workspace>>(
      `/collaboration/workspaces/${workspaceId}/members/${userId}`,
      { role }
    );
  },

  // Tasks
  async getTasks(workspaceId: string, filters?: FilterOptions): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<Task>>(
      `/collaboration/workspaces/${workspaceId}/tasks?${params.toString()}`
    );
  },

  async getTask(workspaceId: string, taskId: string): Promise<ApiResponse<Task>> {
    return apiClient.get<ApiResponse<Task>>(
      `/collaboration/workspaces/${workspaceId}/tasks/${taskId}`
    );
  },

  async createTask(workspaceId: string, data: Partial<Task>): Promise<ApiResponse<Task>> {
    return apiClient.post<ApiResponse<Task>>(
      `/collaboration/workspaces/${workspaceId}/tasks`,
      data
    );
  },

  async updateTask(workspaceId: string, taskId: string, data: Partial<Task>): Promise<ApiResponse<Task>> {
    return apiClient.put<ApiResponse<Task>>(
      `/collaboration/workspaces/${workspaceId}/tasks/${taskId}`,
      data
    );
  },

  async deleteTask(workspaceId: string, taskId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/collaboration/workspaces/${workspaceId}/tasks/${taskId}`
    );
  },

  async addComment(workspaceId: string, taskId: string, content: string): Promise<ApiResponse<Comment>> {
    return apiClient.post<ApiResponse<Comment>>(
      `/collaboration/workspaces/${workspaceId}/tasks/${taskId}/comments`,
      { content }
    );
  },

  async uploadAttachment(workspaceId: string, taskId: string, file: File): Promise<ApiResponse<Attachment>> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ApiResponse<Attachment>>(
      `/collaboration/workspaces/${workspaceId}/tasks/${taskId}/attachments`,
      formData
    );
  },

  // Wiki
  async getWikiPages(workspaceId: string): Promise<ApiResponse<WikiPage[]>> {
    return apiClient.get<ApiResponse<WikiPage[]>>(
      `/collaboration/workspaces/${workspaceId}/wiki`
    );
  },

  async getWikiPage(workspaceId: string, pageId: string): Promise<ApiResponse<WikiPage>> {
    return apiClient.get<ApiResponse<WikiPage>>(
      `/collaboration/workspaces/${workspaceId}/wiki/${pageId}`
    );
  },

  async createWikiPage(workspaceId: string, data: Partial<WikiPage>): Promise<ApiResponse<WikiPage>> {
    return apiClient.post<ApiResponse<WikiPage>>(
      `/collaboration/workspaces/${workspaceId}/wiki`,
      data
    );
  },

  async updateWikiPage(workspaceId: string, pageId: string, data: Partial<WikiPage>): Promise<ApiResponse<WikiPage>> {
    return apiClient.put<ApiResponse<WikiPage>>(
      `/collaboration/workspaces/${workspaceId}/wiki/${pageId}`,
      data
    );
  },

  async deleteWikiPage(workspaceId: string, pageId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/collaboration/workspaces/${workspaceId}/wiki/${pageId}`
    );
  },

  async getWikiHistory(workspaceId: string, pageId: string): Promise<ApiResponse<WikiPageVersion[]>> {
    return apiClient.get<ApiResponse<WikiPageVersion[]>>(
      `/collaboration/workspaces/${workspaceId}/wiki/${pageId}/history`
    );
  },

  // Chat
  async getChannels(workspaceId: string): Promise<ApiResponse<ChatChannel[]>> {
    return apiClient.get<ApiResponse<ChatChannel[]>>(
      `/collaboration/workspaces/${workspaceId}/channels`
    );
  },

  async createChannel(workspaceId: string, data: Partial<ChatChannel>): Promise<ApiResponse<ChatChannel>> {
    return apiClient.post<ApiResponse<ChatChannel>>(
      `/collaboration/workspaces/${workspaceId}/channels`,
      data
    );
  },

  async getMessages(workspaceId: string, channelId: string, limit?: number): Promise<ApiResponse<ChatMessage[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return apiClient.get<ApiResponse<ChatMessage[]>>(
      `/collaboration/workspaces/${workspaceId}/channels/${channelId}/messages${params}`
    );
  },

  async sendMessage(workspaceId: string, channelId: string, content: string): Promise<ApiResponse<ChatMessage>> {
    return apiClient.post<ApiResponse<ChatMessage>>(
      `/collaboration/workspaces/${workspaceId}/channels/${channelId}/messages`,
      { content }
    );
  },

  // Activity Feed
  async getActivityFeed(workspaceId?: string, limit?: number): Promise<ApiResponse<ActivityFeed[]>> {
    const params = new URLSearchParams();
    if (workspaceId) params.append('workspaceId', workspaceId);
    if (limit) params.append('limit', String(limit));
    return apiClient.get<ApiResponse<ActivityFeed[]>>(
      `/collaboration/activity?${params.toString()}`
    );
  },

  // Notifications
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return apiClient.get<ApiResponse<Notification[]>>('/collaboration/notifications');
  },

  async markNotificationRead(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.put<ApiResponse<void>>(
      `/collaboration/notifications/${notificationId}/read`
    );
  },

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    return apiClient.put<ApiResponse<void>>('/collaboration/notifications/read-all');
  },
};
