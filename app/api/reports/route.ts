import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { product_id, reporter_id, reason } = await request.json();

    if (!product_id) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }

    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    db.prepare(`
      INSERT INTO reports (product_id, reporter_id, reason)
      VALUES (?, ?, ?)
    `).run(product_id, reporter_id || null, reason || '');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
