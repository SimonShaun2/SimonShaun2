export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  currency?: string;
  imageUrl?: string;
}
