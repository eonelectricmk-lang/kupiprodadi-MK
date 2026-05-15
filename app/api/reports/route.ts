import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { product_id, reporter_id, reason } = await request.json();

    if (!product_id) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }

    const product = db.prepare('SELECT id, title, seller_id FROM products WHERE id = ?').get(product_id) as any;
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let reporter_name = '';
    let reporter_email = '';

    if (reporter_id) {
      const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(reporter_id) as any;
      if (user) {
        reporter_name = user.name || '';
        reporter_email = user.email || '';
      }
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || '';

    db.prepare(`
      INSERT INTO reports (product_id, reporter_id, reporter_name, reporter_email, reason, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(product_id, reporter_id || null, reporter_name, reporter_email, reason || '', ip);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
