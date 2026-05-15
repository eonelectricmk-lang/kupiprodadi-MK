import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    await requireAdmin();
    const db = getDb();

    const reports = db.prepare(`
      SELECT
        r.id,
        r.product_id,
        r.reporter_id,
        r.reason,
        r.status,
        r.created_at,
        p.title as product_title,
        p.image_url as product_image,
        p.price as product_price,
        p.currency as product_currency,
        p.status as product_status,
        u.name as reporter_name,
        u.email as reporter_email,
        seller.name as seller_name,
        seller.id as seller_id
      FROM reports r
      JOIN products p ON p.id = r.product_id
      LEFT JOIN users u ON u.id = r.reporter_id
      LEFT JOIN users seller ON seller.id = p.seller_id
      ORDER BY r.created_at DESC
    `).all();

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Admin reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM reports WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin update report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
