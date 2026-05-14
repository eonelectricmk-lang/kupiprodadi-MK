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
    const { status, has_viber, has_whatsapp } = await request.json();

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

    return NextResponse.json({ message: 'Ажурирано' });
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
