import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { getNotificationsService, markAllNotificationsAsReadService } from "../services/notificationServices";
import { getSingleUserService } from "../services/userServices";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeProvider";
import Avatar from "../components/Avatar";

export default function Notifications() {
  const { userData } = useAuth();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [senderDetails, setSenderDetails] = useState({});

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotificationsService();
      console.log("Notifications data:", response.data);
      setNotifications(response.data);
      
      // Fetch sender details for each notification
      const senderPromises = response.data.map(async (notification) => {
        if (notification.sender?._id) {
          try {
            const userResponse = await getSingleUserService(notification.sender._id, userData.user.token);
            return [notification.sender._id, userResponse.data];
          } catch (error) {
            console.error("Error fetching sender details:", error);
            return [notification.sender._id, null];
          }
        }
        return [notification.sender?._id, null];
      });

      const senderResults = await Promise.all(senderPromises);
      const senderMap = Object.fromEntries(senderResults.filter(([_, data]) => data !== null));
      console.log("Sender details map:", senderMap);
      setSenderDetails(senderMap);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const response = await markAllNotificationsAsReadService();
      
      if (response.status === 200) {
        setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
        toast.success("All notifications marked as read");
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    } finally {
      setLoading(false);
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "follow":
        return "started following you";
      case "unfollow":
        return "unfollowed you";
      default:
        return "interacted with your content";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className={`px-4 py-2 ${
              theme === "dark"
                ? "bg-japnicaDark hover:bg-japnica"
                : "bg-japnica hover:bg-japnicaDark"
            } text-white rounded transition-colors`}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className={`text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"} py-8`}>
          No notifications yet
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const sender = senderDetails[notification.sender?._id] || {};
            console.log("Current notification sender:", sender);
            
            return (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border ${
                  notification.read 
                    ? theme === "dark" 
                      ? "bg-mineShaftLight border-mineShaft" 
                      : "bg-white border-gray-200"
                    : theme === "dark"
                      ? "bg-mineShaft border-blue-500/20"
                      : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <Link to={`/${notification.sender?._id}`}>
                    <Avatar
                      profileUrl={sender.profileImg}
                      className="w-10 h-10 rounded-full"
                      alt={`${sender.firstName || 'User'}'s profile`}
                    />
                  </Link>
                  <div className="flex-1">
                    <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>
                      <Link
                        to={`/${notification.sender?._id}`}
                        className="font-semibold hover:underline"
                      >
                        {sender.firstName && sender.lastName 
                          ? `${sender.firstName} ${sender.lastName}`
                          : sender.username || 'Unknown User'}
                      </Link>{" "}
                      {getNotificationMessage(notification)}
                      {notification.type === "comment" && (
                        <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                          : "{notification.comment}"
                        </span>
                      )}
                    </p>
                    <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} mt-1`}>
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    {notification.post && (
                      <Link
                        to={`/post/${notification.post._id}`}
                        className={`text-sm ${
                          theme === "dark"
                            ? "text-japnicaDark hover:text-japnica"
                            : "text-japnica hover:text-japnicaDark"
                        } hover:underline mt-2 block`}
                      >
                        View post
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 