import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { SYSTEM_EMAIL } from '@/lib/crm';

export async function GET(request: NextRequest) {
  const db = getDb();
  const status = request.nextUrl.searchParams.get('status') || '';

  if (status === 'published') {
    const drafts = db.prepare(`
      SELECT d.*,
        COALESCE(p.status, (
          SELECT p2.status FROM products p2
          JOIN users u ON u.id = p2.seller_id
          WHERE u.email = 'kupiprodadi@system.mk'
          AND LOWER(TRIM(p2.title)) = LOWER(TRIM(d.title))
          LIMIT 1
        )) as product_status,
        COALESCE(p.id, (
          SELECT p2.id FROM products p2
          JOIN users u ON u.id = p2.seller_id
          WHERE u.email = 'kupiprodadi@system.mk'
          AND LOWER(TRIM(p2.title)) = LOWER(TRIM(d.title))
          LIMIT 1
        )) as product_id
      FROM crm_drafts d
      LEFT JOIN products p ON p.id = d.product_id
      WHERE d.status = 'published'
      ORDER BY d.created_at DESC
    `).all();
    return NextResponse.json({ drafts });
  }

  const sql = status
    ? 'SELECT * FROM crm_drafts WHERE status = ? ORDER BY created_at DESC'
    : 'SELECT * FROM crm_drafts ORDER BY created_at DESC';
  const drafts = db.prepare(sql).all(...(status ? [status] : []));
  return NextResponse.json({ drafts });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  try {
    const body = await request.json();
    const { title, description, price, city, category, sellerName, phone, images, source, sourceUrl } = body;

    if (!title) {
      return NextResponse.json({ error: 'Насловот е задолжителен' }, { status: 400 });
    }

    const imgs = Array.isArray(images) ? images : [];

    const result = db.prepare(`
      INSERT INTO crm_drafts (title, description, price, city, category, seller_name, phone, images, source, source_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      description || '',
      String(price || ''),
      city || '',
      category || '',
      sellerName || '',
      phone || '',
      JSON.stringify(imgs),
      source || '',
      sourceUrl || ''
    );

    return NextResponse.json({ id: result.lastInsertRowid, message: 'Зачувано во CRM' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
