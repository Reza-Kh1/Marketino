/**
 * GET /api/orders  - لیست سفارشات
 * POST /api/orders - ثبت سفارش جدید
 */
import { NextRequest, NextResponse } from 'next/server';

const ordersStore = new Map<string, any[]>();

export async function GET(req: NextRequest) {
  const uid = req.cookies.get('token')?.value || 'anonymous';
  const orders = ordersStore.get(uid) || [];
  return NextResponse.json({ orders: orders.reverse() });
}

export async function POST(req: NextRequest) {
  const uid = req.cookies.get('token')?.value || 'anonymous';
  const body = await req.json();
  const { items, shippingAddress } = body;

  if (!items?.length) return NextResponse.json({ message: 'سبد خالی است' }, { status: 400 });

  const order = {
    id: 'ORD-' + Date.now(),
    userId: uid,
    items,
    total: items.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
    status: 'pending',
    createdAt: new Date().toISOString(),
    shippingAddress: shippingAddress || 'آدرس تست - تهران',
  };

  if (!ordersStore.has(uid)) ordersStore.set(uid, []);
  ordersStore.get(uid)!.push(order);

  return NextResponse.json({ order, message: 'سفارش با موفقیت ثبت شد' });
}
