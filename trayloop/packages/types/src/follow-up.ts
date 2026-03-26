export type FollowUpType = 'feedback_request' | 'review_request' | 'check_in' | 'upsell' | 'custom';
export type FollowUpStatus = 'scheduled' | 'sent' | 'completed' | 'cancelled';

export interface FollowUp {
  id: string;
  orgId: string;
  customerId: string;
  orderId: string | null;
  type: FollowUpType;
  status: FollowUpStatus;
  scheduledAt: Date;
  completedAt: Date | null;
  message: string | null;
  createdAt: Date;
}
