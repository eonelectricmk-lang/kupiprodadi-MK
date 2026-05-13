import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { SYSTEM_EMAIL } from '@/lib/crm';

export async function GET() {
  const db = getDb();
  const drafts = db.prepare(
    'SELECT * FROM crm_drafts ORDER BY created_at DESC'
  ).all();
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
