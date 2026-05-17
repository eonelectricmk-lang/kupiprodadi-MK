import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

const ALLOWED = new Set(['pending', 'active', 'rejected']);

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const db = getDb();
    const params = await context.params;
    const id = Number(params.id);
    const body = await request.json();
    const { status, has_viber, has_whatsapp, trade_possible } = body;

    if (status !== undefined) {
      if (!ALLOWED.has(status)) {
        return NextResponse.json({ error: 'Невалиден статус' }, { status: 400 });
      }
      db.prepare(`UPDATE products SET status = ? WHERE id = ?`).run(status, id);
    }

    if (has_viber !== undefined) {
      db.prepare(`UPDATE products SET has_viber = ? WHERE id = ?`).run(has_viber ? 1 : 0, id);
    }
    if (has_whatsapp !== undefined) {
      db.prepare(`UPDATE products SET has_whatsapp = ? WHERE id = ?`).run(has_whatsapp ? 1 : 0, id);
    }
    if (trade_possible !== undefined) {
      db.prepare(`UPDATE products SET trade_possible = ? WHERE id = ?`).run(trade_possible ? 1 : 0, id);
    }
    if (body.negotiable !== undefined) {
      db.prepare(`UPDATE products SET negotiable = ? WHERE id = ?`).run(body.negotiable ? 1 : 0, id);
    }

    const editableFields = ['title', 'description', 'price', 'city', 'category', 'subcategory', 'condition', 'delivery', 'contact_name', 'contact_phone', 'contact_email'];
    for (const field of editableFields) {
      if (body[field] !== undefined) {
        db.prepare(`UPDATE products SET ${field} = ? WHERE id = ?`).run(body[field], id);
      }
    }

    return NextResponse.json({ message: 'Ажурирано' }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при менување статус', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const db = getDb();
    const params = await context.params;
    const id = Number(params.id);

    db.prepare(`DELETE FROM product_images WHERE product_id = ?`).run(id);
    db.prepare(`DELETE FROM cart WHERE product_id = ?`).run(id);
    db.prepare(`DELETE FROM favorites WHERE product_id = ?`).run(id);
    db.prepare(`DELETE FROM messages WHERE product_id = ?`).run(id);
    db.prepare(`DELETE FROM products WHERE id = ?`).run(id);

    return NextResponse.json({ message: 'Огласот е избришан' });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при бришење', details: String(error) }, { status: 500 });
  }
}
