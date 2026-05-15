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

    const body = await request.json();
    const { status, title, description, price, currency, category, subcategory, city, contact_name, contact_phone, images } = body;

    if (status) {
      const validStatuses = ['active', 'inactive', 'sold'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Невалиден статус' }, { status: 400 });
      }
      if (status === 'sold') {
        db.prepare("UPDATE products SET sold_at = datetime('now') WHERE id = ?").run(productId);
      } else {
        db.prepare('UPDATE products SET status = ?, sold_at = NULL WHERE id = ?').run(status, productId);
      }
    }

    if (images && Array.isArray(images)) {
      db.prepare('DELETE FROM product_images WHERE product_id = ?').run(productId);
      for (let i = 0; i < images.length; i++) {
        db.prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)').run(productId, images[i], i);
      }
      db.prepare('UPDATE products SET image_url = ? WHERE id = ?').run(images[0] || '', productId);
    }

    if (title != null || description != null || price != null || currency != null || category != null || subcategory != null || city != null || contact_name != null || contact_phone != null) {
      const fields: string[] = [];
      const vals: any[] = [];
      if (title != null) { fields.push('title = ?'); vals.push(title); }
      if (description != null) { fields.push('description = ?'); vals.push(description); }
      if (price != null) { fields.push('price = ?'); vals.push(price); }
      if (currency != null) { fields.push('currency = ?'); vals.push(currency); }
      if (category != null) { fields.push('category = ?'); vals.push(category); }
      if (subcategory != null) { fields.push('subcategory = ?'); vals.push(subcategory); }
      if (city != null) { fields.push('city = ?'); vals.push(city); }
      if (contact_name != null) { fields.push('contact_name = ?'); vals.push(contact_name); }
      if (contact_phone != null) { fields.push('contact_phone = ?'); vals.push(contact_phone); }
      if (fields.length > 0) {
        vals.push(productId);
        db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
      }
    }

    return NextResponse.json({ message: 'Огласот е ажуриран' }, { status: 200 });
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
