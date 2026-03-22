import { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import api from "@/api/axios";
import { getErrorMessage } from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  message: string;
  type: string; // "GENERAL" | "INVITE"
  actionTaken: string; // "NONE" | "ACCEPTED" | "REJECTED"
  read: boolean;
  createdAt: string;
  posting?: { id: string; title: string; type: string } | null;
}

const NotificationDropdown = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications/mine");
      setNotifications(data.notifications || []);
    } catch {
      /* fail silently */
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
  }, [isAuthenticated]);

  const markAllRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(
        unread.map((n) => api.put(`/notifications/${n.id}/read`)),
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      /* fail silently */
    }
  };

  const handleAccept = async (notifId: string) => {
    setActionLoading(notifId);
    try {
      await api.put(`/notifications/${notifId}/accept`);
      toast.success("Invitation accepted! You are now applied.");
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notifId ? { ...n, actionTaken: "ACCEPTED", read: true } : n,
        ),
      );
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to accept invitation."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (notifId: string) => {
    setActionLoading(notifId);
    try {
      await api.put(`/notifications/${notifId}/reject`);
      toast.info("Invitation declined.");
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notifId ? { ...n, actionTaken: "REJECTED", read: true } : n,
        ),
      );
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to decline invitation."));
    } finally {
      setActionLoading(null);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center animate-fade-in">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold font-heading text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              No notifications
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b border-border last:border-0 text-sm ${!n.read ? "bg-accent/20" : ""}`}
              >
                <p
                  className={`${!n.read ? "font-medium" : "text-muted-foreground"}`}
                >
                  {n.message}
                </p>

                {/* Show posting info if available */}
                {n.posting && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {n.posting.title}
                  </p>
                )}

                {/* INVITE notification — show Accept / Reject buttons */}
                {n.type === "INVITE" && n.actionTaken === "NONE" && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() => handleAccept(n.id)}
                      disabled={actionLoading === n.id}
                    >
                      <Check className="h-3 w-3" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-xs"
                      onClick={() => handleReject(n.id)}
                      disabled={actionLoading === n.id}
                    >
                      <X className="h-3 w-3" /> Decline
                    </Button>
                  </div>
                )}

                {/* Show status badge for acted-upon invites */}
                {n.type === "INVITE" && n.actionTaken === "ACCEPTED" && (
                  <Badge
                    variant="secondary"
                    className="mt-2 text-xs bg-green-100 text-green-700 border-green-200"
                  >
                    ✓ Accepted
                  </Badge>
                )}
                {n.type === "INVITE" && n.actionTaken === "REJECTED" && (
                  <Badge
                    variant="secondary"
                    className="mt-2 text-xs bg-red-50 text-red-500 border-red-200"
                  >
                    ✗ Declined
                  </Badge>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
