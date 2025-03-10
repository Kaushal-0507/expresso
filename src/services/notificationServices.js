import api from "../utils/axios";

export const getNotificationsService = async () => {
  try {
    const response = await api.get("/api/notifications");
    return response;
  } catch (error) {
    console.error("Get notifications error:", error);
    throw error;
  }
};

export const markNotificationAsReadService = async (notificationId) => {
  try {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response;
  } catch (error) {
    console.error("Mark notification as read error:", error);
    throw error;
  }
};

export const markAllNotificationsAsReadService = async () => {
  try {
    const response = await api.put("/api/notifications/read-all");
    return response;
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    throw error;
  }
}; 