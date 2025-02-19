import { 
  SubscribeMessage, 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { Injectable, OnModuleInit } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private users = new Map<string, string>();

  constructor(private notificationsService: NotificationsService) {}

  onModuleInit() {
    this.notificationsService.setSocketServer(this.server);
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      if (!Array.from(client.rooms).includes(userId)) {
        client.join(userId);
      }
      this.users.set(client.id, userId);
    }

    this.notificationsService.setSocketServer(this.server);
  }

  async handleDisconnect(client: Socket) {
    this.users.delete(client.id);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, { notificationId }: { notificationId: number }) {
    const userId = this.users.get(client.id);
    if (userId) {
      await this.notificationsService.markAsRead(Number(userId), notificationId);
    }
  }
}
