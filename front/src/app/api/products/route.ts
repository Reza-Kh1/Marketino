/**
 * GET /api/products - لیست محصولات (با فیلتر/مرتب‌سازی)
 * GET /api/products/[id] - جزییات یک محصول
 */
import { NextRequest, NextResponse } from 'next/server';
import { mockProducts } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const q = searchParams.get('q')?.toLowerCase() || '';
  const sort = searchParams.get('sort') || '';
  const minP = Number(searchParams.get('minPrice')) || 0;
  const maxP = Number(searchParams.get('maxPrice')) || Infinity;
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 12;

  let items = [...mockProducts];

  if (category) items = items.filter(p => p.category === category);
  if (tag) items = items.filter(p => p.tags.includes(decodeURIComponent(tag)));
  if (q) {
    items = items.filter(p =>
      p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }
  items = items.filter(p => {
    const price = p.discountPrice ?? p.price;
    return price >= minP && price <= maxP;
  });

  const total = items.length;
  const totalPages = Math.ceil(total / limit);

  if (sort === 'cheapest') items.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
  else if (sort === 'expensive') items.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
  else if (sort === 'newest') items.sort(() => Math.random() - 0.5);
  else if (sort === 'rating') items.sort((a, b) => b.rating - a.rating);

  const start = (page - 1) * limit;
  const paginated = items.slice(start, start + limit);

  return NextResponse.json({ products: paginated, total, page, totalPages });
}
