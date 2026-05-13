import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSystemUser } from '@/lib/crm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const systemUser = getSystemUser();

    if (!systemUser) {
      return NextResponse.json({ error: 'Системски корисник не постои' }, { status: 500 });
    }

    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Невалиден ID' }, { status: 400 });
    }

    const product = db.prepare('SELECT id, seller_id FROM products WHERE id = ?').get(productId) as any;
    if (!product) {
      return NextResponse.json({ error: 'Производот не постои' }, { status: 404 });
    }
    if (product.seller_id !== systemUser.id) {
      return NextResponse.json({ error: 'Немате дозвола' }, { status: 403 });
    }

    const { status } = await request.json();
    const validStatuses = ['active', 'inactive', 'sold'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Невалиден статус' }, { status: 400 });
    }

    db.prepare('UPDATE products SET status = ? WHERE id = ?').run(status, productId);
    return NextResponse.json({ message: `Статусот е сменет во ${status}` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Грешка', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const systemUser = getSystemUser();

    if (!systemUser) {
      return NextResponse.json({ error: 'Системски корисник не постои' }, { status: 500 });
    }

    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Невалиден ID' }, { status: 400 });
    }

    const product = db.prepare('SELECT id, seller_id FROM products WHERE id = ?').get(productId) as any;
    if (!product) {
      return NextResponse.json({ error: 'Производот не постои' }, { status: 404 });
    }
    if (product.seller_id !== systemUser.id) {
      return NextResponse.json({ error: 'Немате дозвола за бришење' }, { status: 403 });
    }

    const removeProduct = db.transaction(() => {
      db.prepare('DELETE FROM product_images WHERE product_id = ?').run(productId);
      db.prepare('DELETE FROM cart WHERE product_id = ?').run(productId);
      db.prepare('DELETE FROM products WHERE id = ?').run(productId);
    });

    removeProduct();
    return NextResponse.json({ message: 'Огласот е избришан' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при бришење', details: String(error) }, { status: 500 });
  }
}
