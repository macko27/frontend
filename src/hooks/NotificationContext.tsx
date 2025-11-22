import React, { createContext, useContext, useState, ReactNode } from "react";
import NotificationResponse from "../types/responses/NotificationResponse";
import api from "../app/api";
export enum NotificationType {
  General,
  GoalCreated,
  GoalUpdated,
  FeedbackUnsent,
  ReviewUnset,
  GoalUnsent,
  NewSuccession,
}

interface NotificationContextType {
  notifications: NotificationResponse[];
  addNotification: (notification: NotificationResponse) => void;
  setNotifications: (notifications: NotificationResponse[]) => void;
  ignoreNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotificationList] = useState<NotificationResponse[]>([]);

  const addNotification = (notification: any) => {
    setNotificationList((prevNotifications) => 
      [notification, ...prevNotifications].slice(0, 10)
    );
  };

  const setNotifications: React.Dispatch<React.SetStateAction<NotificationResponse[]>> = (newNotifications) => {
  setNotificationList((prev) => {
    const updatedNotifications =
      typeof newNotifications === "function" ? newNotifications(prev) : newNotifications;
    return updatedNotifications.slice(0, 10);
  });
};

const ignoreNotification = async (notificationId: string) => {
  try {
    await api.put(`Notification/MarkAsRead/${notificationId}`);
    setNotificationList((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== notificationId)
    );
  } catch (error) {
    console.error("Failed to ignore notification:", error);
  }
};

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, setNotifications, ignoreNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
