import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import axios from "axios";
import { toast } from "react-toastify";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();
  const token = userData?.user?.token;

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
    try {
      const { data, status } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notifications`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (status === 200) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when the component mounts
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Render a single notification
  const renderNotification = (notification) => {
    switch (notification.type) {
      case "like":
        return (
          <div key={notification._id} className="notification-item">
            <p>
              <strong>{notification.sender.username}</strong> liked your post.
            </p>
            <small>{new Date(notification.createdAt).toLocaleString()}</small>
          </div>
        );
      case "follow":
        return (
          <div key={notification._id} className="notification-item">
            <p>
              <strong>{notification.sender.username}</strong> started following
              you.
            </p>
            <small>{new Date(notification.createdAt).toLocaleString()}</small>
          </div>
        );
      case "comment":
        return (
          <div key={notification._id} className="notification-item">
            <p>
              <strong>{notification.sender.username}</strong> commented on your
              post: <em>{notification.comment}</em>
            </p>
            <small>{new Date(notification.createdAt).toLocaleString()}</small>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="notification-page">
      <h1>Notifications</h1>
      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length > 0 ? (
        notifications.map((notification) => renderNotification(notification))
      ) : (
        <p>No new notifications.</p>
      )}
    </div>
  );
};

export default NotificationPage;
