import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { SYSTEM_EMAIL, mapCategory, parsePrice } from '@/lib/crm';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  try {
    const draft = db.prepare('SELECT * FROM crm_drafts WHERE id = ?').get(Number(id)) as any;
    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    const systemUser = db.prepare('SELECT id FROM users WHERE email = ?').get(SYSTEM_EMAIL) as { id: number } | undefined;
    if (!systemUser) {
      return NextResponse.json({ error: 'System user not found' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const images: string[] = (() => {
      try { return JSON.parse(draft.images); } catch { return []; }
    })();

    const rawCat = body.category || draft.category || '';
    const subcategory = body.subcategory || '';

    const allCats = db.prepare('SELECT name FROM categories WHERE parent_id IS NULL').all() as { name: string }[];
    const validCategoryNames = new Set(allCats.map((c: { name: string }) => c.name));

    let category: string;
    if (body.category && validCategoryNames.has(body.category)) {
      category = body.category;
    } else if (rawCat) {
      const matched = allCats.find((c: { name: string }) => rawCat.toLowerCase().includes(c.name.toLowerCase().slice(0, 8)));
      category = matched ? matched.name : mapCategory(rawCat);
    } else {
      category = mapCategory(draft.title + ' ' + draft.description);
    }

    const { price: priceNum, currency } = parsePrice(draft.price);

    const result = db.prepare(`
      INSERT INTO products (title, description, price, currency, category, subcategory, location, seller_id, image_url, city, contact_name, contact_phone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      draft.title,
      draft.description || '',
      priceNum,
      currency,
      category,
      subcategory,
      draft.city || '',
      systemUser.id,
      images[0] || '',
      draft.city || '',
      draft.seller_name || '',
      draft.phone || '',
      'active'
    );

    const productId = result.lastInsertRowid;

    for (let i = 0; i < images.length; i++) {
      db.prepare(
        'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)'
      ).run(productId, images[i], i);
    }

    db.prepare('UPDATE crm_drafts SET status = ? WHERE id = ?').run('published', Number(id));

    return NextResponse.json({
      id: productId,
      url: `/products/${productId}`,
      message: 'Огласот е објавен на КупиПродади'
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
