import React, { useState, useEffect, useContext } from "react";
import { Box, Menu, MenuItem, Badge, IconButton, Typography, Divider, Button, Link } from "@mui/material";
import { SignalRContext } from "../hooks/signalRConnection";
import { Notifications, Padding, CheckCircle, Warning, Error, Flag, NotificationsNone } from "@mui/icons-material";
import { NotificationType } from "../hooks/NotificationContext";
import { useNotifications } from "../hooks/NotificationContext";
import { useNavigate } from "react-router-dom";
import NotificationResponse from "../types/responses/NotificationResponse";
import api from "../app/api";
import { useAuth } from "../hooks/AuthProvider";
import Roles from "../types/Roles";
import { NavigateFunction } from "react-router-dom";

export const getNotificationIcon = (notificationType: NotificationType) => {
  switch (notificationType) {
    case NotificationType.GoalCreated:
      return <CheckCircle color="success" />;
    case NotificationType.GoalUpdated:
      return <Notifications color="primary" />;
    case NotificationType.FeedbackUnsent:
      return <Warning color="warning" />;
    case NotificationType.GoalUnsent:
      return <Error color="error" />;
    case NotificationType.NewSuccession:
      return <Flag color="secondary" />;
    case NotificationType.ReviewUnset:
    case NotificationType.General:
    default:
      return <Notifications color="disabled" />;
  }
};

interface NotificationMenuProps {
  notificationList: NotificationResponse[];
}

export const handleNavigate = (
  referencedItem: string | undefined,
  notificationType: NotificationType,
  currentRole: string | undefined,
  navigate: NavigateFunction
) => {
  console.log(`${currentRole}  ${notificationType}`);

  switch (notificationType) {
    case NotificationType.GoalCreated:
    case NotificationType.GoalUpdated:
    case NotificationType.GoalUnsent:
      if (currentRole === Roles.Zamestnanec) {
        navigate("/employeeGoals");
      } else if (currentRole === Roles.Veduci) {
        navigate("/manageGoals");
      }
      break;
    case NotificationType.ReviewUnset:
      navigate("/manageReviews");
      break;
    case NotificationType.FeedbackUnsent:
      navigate("/manageFeedback");
      break;
    case NotificationType.NewSuccession:
      navigate("/manageSuccesion");
      break;
    case NotificationType.General:
    default:
      break;
  }
};

const NotificationMenu: React.FC<NotificationMenuProps> = ({ notificationList }) => {
  const [anchorElNotification, setAnchorElNotification] = useState<null | HTMLElement>(null);
  const nav = useNavigate();
  const { userProfile,refresh } = useAuth();
  const { connection } = useContext(SignalRContext);
  const { notifications, addNotification, setNotifications,ignoreNotification } = useNotifications(); 
  const handleClickNotification = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotification(event.currentTarget);
  };

  const handleCloseNotification = () => {
    setAnchorElNotification(null);
  };

  useEffect(() => {
    if (!userProfile || !connection) return;

    connection.on("ReceiveNotification", (notification: NotificationResponse) => {
      console.log("🔔 New notification received:", notification);
      addNotification(notification);
    });

    return () => {
      connection.off("ReceiveNotification");
    };
  }, [connection, setNotifications]);

  return (
    <Box sx={{ flexGrow: 0, }} paddingRight={5}>
      <IconButton color="inherit" onClick={handleClickNotification}>
        <Badge badgeContent={notifications.length} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Menu
        id="notification-menu"
        anchorEl={anchorElNotification}
        open={Boolean(anchorElNotification)}
        onClose={handleCloseNotification}
        sx={{
          "& .MuiPaper-root": {
            display: "flex",
            flexDirection: "column",
            maxHeight: 500,
            width: 450,
          },
        }}
      >
        <Box
          sx={{
            maxHeight: 500,
            overflowY: "auto",
          }}
        >
        </Box>
        {notifications.length > 0 ? (
  notifications.map((notification, index) => {
    const createdDate = new Date(notification.createdAt);
    const formattedDate = createdDate.toLocaleDateString("sk-SK");
    const formattedTime = createdDate.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" });

    return (
      <Box key={index} sx={{ minWidth: 400, paddingLeft: 1 }}>
        <Box display="flex" alignItems="center">
          {getNotificationIcon(notification.notificationType)}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 1 }}>
            {notification.title || "Notification"}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, wordWrap: 'break-word' }}>
          {notification.message}
        </Typography>

        {/* Date & Time on the left, Buttons on the right */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* Display Date and Time */}
          <Typography variant="body2" fontWeight="bold" color="text.secondary">
            {formattedDate} - {formattedTime}
          </Typography>

          {/* Buttons */}
          <Box display="flex">
            <Button
              size="small"
              onClick={() => {
                ignoreNotification(notification.id);
                handleNavigate(notification.referencedItem, notification.notificationType, userProfile?.role, nav);
              }}
            >
              Detail
            </Button>
            <Button size="small" onClick={() => ignoreNotification(notification.id)}>Ignorovať</Button>
          </Box>
        </Box>

        {index < notifications.length - 1 && <Divider sx={{ mt: 1, mb: 1 }} />}
      </Box>
    );
  })
  ) : (
    <MenuItem onClick={handleCloseNotification} sx={{ padding: 1 }}>Žiadne nové notifikácie</MenuItem>
  )}
        
        <Box
          sx={{
            borderTop: "1px solid #ddd",
            textAlign: "center",
            padding: "8px",
            position: "sticky",
            bottom: 0,
            backgroundColor: "white",
          }}
        >
          <MenuItem onClick={() => nav('/notifications')}
            sx={{
              textAlign:"center",
              justifyContent:"center",
              width:"100%"
            }}
          >
            Zobraziť všetky notifikácie
          </MenuItem>
        </Box>
        
      </Menu>
    </Box>
  );
};

export default NotificationMenu;
