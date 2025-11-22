import React, { useState, useEffect } from "react";
import { Box, Typography, Divider, IconButton, TextField } from "@mui/material";
import { Delete } from "@mui/icons-material";
import api from "../../app/api";
import NotificationResponse from "../../types/responses/NotificationResponse";
import { NotificationType } from "../../hooks/NotificationContext";
import { getNotificationIcon, handleNavigate } from "../../components/NotificationMenu";
import Layout from "../../components/Layout";
import { useProfile } from "../../hooks/ProfileProvider";
import { useAuth } from "../../hooks/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/NotificationContext";

const groupByDate = (notifications: NotificationResponse[]) => {
  return notifications.reduce((acc: Record<string, NotificationResponse[]>, notification) => {
    const date = new Date(notification.createdAt).toLocaleDateString("sk-SK", { weekday: "long", day: "2-digit", month: "2-digit", year: "2-digit" });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(notification);
    return acc;
  }, {});
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const { ignoreNotification } = useNotifications();
  const [filterDate, setFilterDate] = useState<string>("");
  const userProfile = useAuth();
  const nav = useNavigate();
  
  useEffect(() => {
    const fetchNotifications = async () => {
      await api.get<NotificationResponse[]>("Notification/AllNotifications")
        .then((response) => {
          setNotifications(response.data);
        })
        .catch((error) => {
          console.error("Failed to fetch notifications:", error);
        });
    };
    fetchNotifications();
  }, []);

  const deleteNotification = async (id: string) => {  
      await api.delete(`Notification/Delete/${id}`)
      .then((res) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        
    })
      .catch((error) => {
        console.error("Failed to delete notification:", error);}
    );
  };

  const filteredNotifications = filterDate
    ? notifications.filter((notification) => {
        const notificationDate = new Date(notification.createdAt).toISOString().split("T")[0];
        return notificationDate === filterDate;
      })
    : notifications;

  const groupedNotifications = groupByDate(filteredNotifications);

  return (
    <Layout>
    <Box display="flex">
      {/* Notifications List */}
      <Box flex={1} padding={3}>
        {/* Header with Date Filter */}
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
          <Typography variant="h5" fontWeight="bold">Všetky notifikácie</Typography>
          
          {/* Date Filter */}
          <TextField
            type="date"
            label="Filtrovať podľa dátumu"
            variant="outlined"
            size="medium"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            sx={{ maxWidth: 450 }}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {Object.entries(groupedNotifications).map(([date, notifications]) => (
          <Box key={date} marginBottom={3}>
            <Typography variant="subtitle1" color="textSecondary">{date}</Typography>
            <Divider sx={{ marginBottom: 1 }} />

            {notifications.map((notification) => (
              <Box key={notification.id} display="flex" alignItems="center" justifyContent="space-between" padding={2} sx={{ borderBottom: "1px solid #ddd" }}>
                
                {/* Clickable Title with Icon */}
                <Box display="flex" alignItems="center" sx={{ cursor: "pointer" }} onClick={() => handleNavigate(notification.referencedItem, notification.notificationType, userProfile?.userProfile?.role, nav)}>
                  {getNotificationIcon(notification.notificationType)}
                  <Typography variant="subtitle1" fontWeight="bold" marginLeft={1}>
                    {notification.title}
                  </Typography>
                </Box>

                {/* Message */}
                <Typography variant="body2" color="textSecondary" sx={{ flex: 1, marginLeft: 2 }}>
                  {notification.message}
                </Typography>

                {/* Delete Button */}
                <IconButton onClick={() => 
                    {
                    deleteNotification(notification.id);
                    ignoreNotification(notification.id)
                }}>
                  <Delete color="error" />
                </IconButton>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
    </Layout>
  );
};

export default NotificationsPage;
