export type CatalogItemType = 'service' | 'physical_good' | 'digital_good' | 'bundle';

export interface CatalogItem {
  id: string;
  orgId: string;
  name: string;
  description: string;
  type: CatalogItemType;
  price: number;
  currency: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServicePackage {
  id: string;
  orgId: string;
  name: string;
  description: string;
  catalogItemIds: string[];
  price: number;
  currency: string;
  recurrenceInterval: 'one_time' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCatalogItemInput {
  name: string;
  description?: string;
  type?: CatalogItemType;
  price: number;
  currency?: string;
  imageUrl?: string;
}
