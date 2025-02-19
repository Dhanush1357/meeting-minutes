import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Server } from 'socket.io';

@Injectable()
export class NotificationsService {
  private socketServer: Server;

  constructor(private prisma: PrismaService) {}

  setSocketServer(server: Server) {
    this.socketServer = server;
  }

  async sendNotification(
    users: number[],
    message: string,
    projectId: number,
    type: string,
  ) {
    if (!this.socketServer) {
      return;
  }

    const notification = await this.prisma.notification.create({
      data: { projectId: projectId, message, type },
    });

    const userNotifications = users.map((userId) => ({
      userId: userId,
      notificationId: notification.id,
    }));

    await this.prisma.userNotification.createMany({ data: userNotifications });

    users.forEach((userId) => {
      this.socketServer
        .to(userId.toString())
        .emit('notification', { message, projectId, type });
    });

    return notification;
  }

  async markAsRead(userId: number, notificationId: number) {
    return this.prisma.userNotification.updateMany({
      where: { userId: userId, notificationId: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async removeProjectNotifications(projectId: number) {
    await this.prisma.notification.deleteMany({
      where: { projectId: projectId },
    });
  }
}
