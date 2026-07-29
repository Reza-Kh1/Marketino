/**
 * GET /api/products/[id] - جزییات یک محصول
 */
import { NextResponse } from 'next/server';
import { mockProducts } from '@/lib/mock-data';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = mockProducts.find(p => p.id === id);
  if (!product) return NextResponse.json({ message: 'محصول یافت نشد' }, { status: 404 });

  const related = mockProducts.filter(p => p.category === product.category && p.id !== id).slice(0, 4);
  return NextResponse.json({ product, related });
}
