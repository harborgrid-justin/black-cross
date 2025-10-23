/**
 * Notification System - WebSocket Server
 * Real-time notification delivery via WebSocket
 */

import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { notificationService } from './service';
import type { Notification } from './types';

/**
 * WebSocket server for real-time notifications
 */
export class NotificationWebSocketServer {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, Set<string>> = new Map();

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/ws/notifications',
    });

    this.setupEventHandlers();
    console.log('✅ Notification WebSocket server initialized');
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle authentication
      socket.on('authenticate', (data: { userId: string; token?: string }) => {
        // In production, verify JWT token here
        const { userId } = data;

        // Store socket for this user
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socket.id);

        socket.data.userId = userId;
        socket.join(`user:${userId}`);

        socket.emit('authenticated', { success: true });
        console.log(`User ${userId} authenticated on socket ${socket.id}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const userId = socket.data.userId;
        if (userId) {
          const userSocketSet = this.userSockets.get(userId);
          if (userSocketSet) {
            userSocketSet.delete(socket.id);
            if (userSocketSet.size === 0) {
              this.userSockets.delete(userId);
            }
          }
        }
        console.log(`Client disconnected: ${socket.id}`);
      });

      // Handle marking notification as read
      socket.on('mark_read', async (notificationId: string) => {
        try {
          const userId = socket.data.userId;
          if (userId) {
            await notificationService.markAsRead(notificationId, userId);
            socket.emit('mark_read_success', { notificationId });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to mark as read' });
        }
      });
    });

    // Listen to notification service events
    notificationService.on('notification:created', (notification: Notification) => {
      this.sendToUser(notification.user_id, 'notification', notification);
    });

    notificationService.on('notification:websocket', (notification: Notification) => {
      this.sendToUser(notification.user_id, 'notification', notification);
    });

    notificationService.on('notification:read', (notification: Notification) => {
      this.sendToUser(notification.user_id, 'notification_read', notification);
    });

    notificationService.on('notifications:bulk_read', (data: { userId: string; count: number }) => {
      this.sendToUser(data.userId, 'bulk_read', data);
    });
  }

  /**
   * Send message to specific user
   */
  private sendToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event: string, data: any): void {
    if (!this.io) return;

    this.io.emit(event, data);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }
}

// Export singleton instance
export const notificationWebSocket = new NotificationWebSocketServer();
