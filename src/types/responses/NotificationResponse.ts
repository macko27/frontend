import { NotificationType } from "../../hooks/NotificationContext";

type NotificationResponse = {
    id: string;
    message: string;
    title: string;
    referencedItem: string;
    notificationType: NotificationType;
    createdAt: string; 
    isRead: boolean;
}

export default NotificationResponse