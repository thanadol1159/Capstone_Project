export interface Notification {
  id: number;
  notifications_type: string;
  create_at: string;
  message: string;
  user: number;
  isRead: boolean;
}
