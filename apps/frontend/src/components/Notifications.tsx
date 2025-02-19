"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import io, { Socket } from 'socket.io-client';
import { Bell, BellOff } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Notification = {
  id: number;
  message: string;
  timestamp?: string;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuthStore((state) => state);

  const socket: Socket = io(process.env.NEXT_PUBLIC_SERVER_URL, { 
    query: { userId: currentUser?.id } 
  });

  useEffect(() => {
    socket.on('notification', (data: Notification) => {
      setNotifications((prev) => [{
        ...data,
        timestamp: new Date().toISOString()
      }, ...prev]);
    });

    return () => {
      socket.off('notification');
    };
  }, [socket]);

  const markAsRead = async (notificationId: number) => {
    socket.emit('markAsRead', { notificationId });
    setNotifications((prev) => prev.filter(n => n.id !== notificationId));
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
        >
          {notifications.length > 0 ? (
            <>
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                {notifications.length}
              </span>
            </>
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setNotifications([])}
            >
              Clear all
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <BellOff className="h-8 w-8 mb-2" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="grid gap-1 p-1">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={cn(
                    "w-full text-left px-4 py-3 space-y-1",
                    "hover:bg-muted/50 rounded-lg transition-colors",
                    "focus:outline-none focus:bg-muted"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <p className="text-sm font-medium leading-none">
                    {notification.message}
                  </p>
                  {notification.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}