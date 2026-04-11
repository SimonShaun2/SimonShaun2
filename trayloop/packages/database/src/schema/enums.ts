import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['customer', 'merchant', 'admin']);
export const memberRoleEnum = pgEnum('member_role', ['owner', 'admin', 'manager', 'staff']);
export const memberStatusEnum = pgEnum('member_status', ['invited', 'active', 'suspended', 'removed']);
export const organizationPlanEnum = pgEnum('organization_plan', ['starter', 'pro', 'growth']);
export const orderStatusEnum = pgEnum('order_status', ['submitted', 'awaiting_deposit', 'confirmed', 'completed', 'cancelled']);
export const serviceModeEnum = pgEnum('service_mode', ['delivery', 'pickup', 'full_service', 'on_site', 'food_truck']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['trialing', 'active', 'past_due', 'canceled', 'unpaid']);
export const billingCycleEnum = pgEnum('billing_cycle', ['monthly', 'annual']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['card', 'ach', 'cash', 'check', 'other']);
export const depositStatusEnum = pgEnum('deposit_status', ['pending', 'paid', 'refunded']);
export const notificationTypeEnum = pgEnum('notification_type', ['email', 'in_app', 'push', 'sms']);
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'read', 'failed']);
export const catalogItemTypeEnum = pgEnum('catalog_item_type', ['service', 'physical_good', 'digital_good', 'bundle']);
export const packagePricingEnum = pgEnum('package_pricing', ['per_head', 'flat']);
export const recurrenceIntervalEnum = pgEnum('recurrence_interval', ['weekly', 'biweekly', 'monthly', 'quarterly']);
export const followUpStatusEnum = pgEnum('follow_up_status', ['pending', 'completed']);
export const auditActionEnum = pgEnum('audit_action', ['create', 'update', 'delete', 'login', 'logout', 'status_change']);
export const aiCampaignSegmentEnum = pgEnum('ai_campaign_segment', ['frequent', 'at_risk', 'dormant']);
export const aiCampaignChannelEnum = pgEnum('ai_campaign_channel', ['email', 'sms_copy']);
export const aiCampaignStatusEnum = pgEnum('ai_campaign_status', ['draft', 'sent', 'copied']);
export const aiCampaignRecipientStatusEnum = pgEnum('ai_campaign_recipient_status', ['pending', 'sent', 'copied', 'failed']);
export const organizationFeatureKeyEnum = pgEnum('organization_feature_key', [
  'storefront.basic',
  'orders.basic_intake',
  'orders.future_schedule_basic',
  'orders.recurring_schedule',
  'orders.discount_rules',
  'deposits.enabled',
  'reporting.basic',
  'reporting.advanced',
  'customers.basic_insights',
  'customers.segmentation',
  'templates.events',
  'reorder.basic',
  'upsells.basic',
  'upsells.ai',
  'campaigns.ai_email',
  'campaigns.ai_sms',
  'campaigns.reactivation',
  'ai.lead_scoring',
  'analytics.advanced',
  'analytics.at_risk_customers',
  'analytics.customer_ltv',
  'growth.corporate_insights',
  'growth_advisor',
]);
