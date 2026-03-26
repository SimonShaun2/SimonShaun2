import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['customer', 'merchant', 'admin']);
export const memberRoleEnum = pgEnum('member_role', ['owner', 'admin', 'manager', 'staff']);
export const memberStatusEnum = pgEnum('member_status', ['invited', 'active', 'suspended', 'removed']);
export const orderStatusEnum = pgEnum('order_status', ['draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['card', 'ach', 'cash', 'check', 'other']);
export const depositStatusEnum = pgEnum('deposit_status', ['pending', 'collected', 'applied', 'refunded']);
export const notificationTypeEnum = pgEnum('notification_type', ['email', 'in_app', 'push', 'sms']);
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'read', 'failed']);
export const catalogItemTypeEnum = pgEnum('catalog_item_type', ['service', 'physical_good', 'digital_good', 'bundle']);
export const packagePricingEnum = pgEnum('package_pricing', ['per_head', 'flat']);
export const recurrenceIntervalEnum = pgEnum('recurrence_interval', ['weekly', 'biweekly', 'monthly', 'quarterly']);
export const auditActionEnum = pgEnum('audit_action', ['create', 'update', 'delete', 'login', 'logout', 'status_change']);
