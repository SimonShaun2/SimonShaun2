import { db } from '@trayloop/database';
import { products } from '@trayloop/database';
import { generateId } from '@trayloop/utils';
import { NotFoundError } from '../../lib/errors.js';
import type { CreateProductInput } from './products.schema.js';
import { eq } from 'drizzle-orm';

export async function listProducts() {
  return db.select().from(products).where(eq(products.isActive, true));
}

export async function getProduct(id: string) {
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) throw new NotFoundError('Product');
  return product;
}

export async function createProduct(merchantId: string, input: CreateProductInput) {
  const id = generateId();
  const [product] = await db.insert(products).values({ id, merchantId, ...input }).returning();
  return product;
}
