/**
 * DELETE /api/cart/clear
 */
import { NextRequest, NextResponse } from 'next/server';

const clearStore = new Set<string>();

export async function DELETE(req: NextRequest) {
  const uid = req.cookies.get('token')?.value || 'anonymous';
  clearStore.add(uid); // علامت‌گذاری برای پاک شدن
  return NextResponse.json({ message: 'سبد خرید خالی شد' });
}
