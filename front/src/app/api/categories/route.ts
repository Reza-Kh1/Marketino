/**
 * GET /api/categories - لیست دسته‌بندی‌ها
 */
import { NextResponse } from 'next/server';
import { mockCategories } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({ categories: mockCategories });
}
