"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import io, { Socket } from "socket.io-client";
import { Bell, BellOff, Check, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

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
    query: { userId: currentUser?.id },
  });

  useEffect(() => {
    socket.on("notification", (data: Notification) => {
      setNotifications((prev) => [
        {
          ...data,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    return () => {
      socket.off("notification");
    };
  }, [socket]);

  const markAsRead = async (notificationId: number) => {
    socket.emit("markAsRead", { notificationId });
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
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
    return "Just now";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-muted/50 transition-colors"
              >
                {notifications.length > 0 ? (
                  <>
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse">
                      {notifications.length}
                    </span>
                  </>
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent className="mt-2 bg-slate-100 p-2">
            {notifications.length > 0
              ? `${notifications.length} unread notifications`
              : "No notifications"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-80 p-0 sm:w-96" align="end">
        <Card className="border-0 rounded-lg shadow-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h4 className="font-semibold text-lg">Notifications</h4>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotifications([])}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            )}
          </div>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <BellOff className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm font-medium">No new notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll notify you when something arrives
                  </p>
                </div>
              ) : (
                <div className="grid gap-0.5 p-1">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="group relative">
                      <button
                        className={cn(
                          "w-full text-left px-4 py-3 space-y-1",
                          "hover:bg-muted/50 rounded-lg transition-all duration-200",
                          "focus:outline-none focus:ring-2 focus:ring-primary/20",
                          "group-hover:pr-12"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <p className="text-sm font-medium leading-snug">
                          {notification.message}
                        </p>
                        {notification.timestamp && (
                          <p className="text-xs text-muted-foreground flex items-center">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        )}
                      </button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
