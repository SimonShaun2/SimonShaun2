export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';

export interface OrderItem {
  id: string;
  catalogItemId: string;
  packageId: string | null;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orgId: string;
  customerId: string;
  locationId: string | null;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  scheduledAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type RecurrenceInterval = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

export interface RecurringOrder {
  id: string;
  orgId: string;
  customerId: string;
  locationId: string | null;
  packageId: string;
  interval: RecurrenceInterval;
  startDate: Date;
  endDate: Date | null;
  nextOccurrence: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  orgId: string;
  customerId: string;
  items: { catalogItemId: string; quantity: number }[];
}
