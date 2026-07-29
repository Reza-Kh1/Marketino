/**
 * API Cart - سبد خرید (in‑memory demo)
 * GET    /api/cart           → دریافت سبد
 * POST   /api/cart           → افزودن / بروزرسانی
 * DELETE /api/cart          → حذف کالا  (بدنه: { productId })
 * DELETE /api/cart/clear    → خالی کردن سبد
 */
import { NextRequest, NextResponse } from 'next/server';
import { mockProducts } from '@/lib/mock-data';

const cartStore = new Map<string, { productId: string; quantity: number }[]>();

function userId(req: NextRequest) {
  return req.cookies.get('token')?.value || 'anonymous';
}

function getCart(req: NextRequest) {
  const uid = userId(req);
  if (!cartStore.has(uid)) cartStore.set(uid, []);
  return cartStore.get(uid)!;
}

/* ---------- GET ---------- */
export async function GET(req: NextRequest) {
  const cart = getCart(req);
  const items = cart.map(ci => {
    const p = mockProducts.find(x => x.id === ci.productId);
    return { ...ci, product: p || null };
  });
  const total = items.reduce((s, i) => s + ((i.product?.discountPrice ?? i.product?.price ?? 0) * i.quantity), 0);
  return NextResponse.json({ items, total, count: cart.reduce((s, i) => s + i.quantity, 0) });
}

/* ---------- POST (add / update) ---------- */
export async function POST(req: NextRequest) {
  const { productId, quantity } = await req.json();
  if (!productId || !quantity) {
    return NextResponse.json({ message: 'اطلاعات ناقص' }, { status: 400 });
  }
  const cart = getCart(req);
  const idx = cart.findIndex(i => i.productId === productId);
  if (idx > -1) cart[idx].quantity = quantity;
  else cart.push({ productId, quantity });
  return NextResponse.json({ message: 'به سبد اضافه شد' });
}

/* ---------- DELETE ---------- */
export async function DELETE(req: NextRequest) {
  const { productId } = await req.json();
  const cart = getCart(req);
  const idx = cart.findIndex(i => i.productId === productId);
  if (idx > -1) cart.splice(idx, 1);
  return NextResponse.json({ message: 'از سبد حذف شد' });
}
