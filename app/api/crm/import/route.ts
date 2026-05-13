import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { CrmAdData, mapCategory, getSystemUser, parsePrice } from '@/lib/crm';

export async function POST(request: NextRequest) {
  try {
    const systemUser = getSystemUser();
    if (!systemUser) {
      return NextResponse.json({ error: 'Системскиот корисник не постои' }, { status: 500 });
    }

    const body: CrmAdData = await request.json();

    const {
      title, description, price, city, category,
      sellerName, phone, images, link, rawText
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Насловот е задолжителен' }, { status: 400 });
    }

    const db = getDb();
    const categoryName = mapCategory(category || '');
    const imageList = Array.isArray(images)
      ? images.filter((img: string) => typeof img === 'string' && img.length > 0).slice(0, 8)
      : [];
    const primaryImage = imageList[0] || null;
    const resolvedLocation = city || '';

    const insertProduct = db.prepare(`
      INSERT INTO products (
        title, description, price, currency, category, location,
        seller_id, image_url, contact_name, contact_phone, status,
        city, subcategory, condition, negotiable,
        neighborhood, address_note, delivery, contact_email, preferred_contact
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertImage = db.prepare(`
      INSERT INTO product_images (product_id, image_url, sort_order)
      VALUES (?, ?, ?)
    `);

    const { price: parsedPrice, currency } = parsePrice(price);

    const createProduct = db.transaction(() => {
      const result = insertProduct.run(
        title,
        description || '',
        parsedPrice,
        currency,
        categoryName,
        resolvedLocation,
        systemUser.id,
        primaryImage,
        sellerName || 'Непознат',
        phone || '',
        'active',
        city || null,
        null, null, 0,
        null, null, null, null, null,
      );

      const productId = Number(result.lastInsertRowid);
      imageList.forEach((image: string, index: number) => insertImage.run(productId, image, index));
      return productId;
    });

    const id = createProduct();

    return NextResponse.json({
      id,
      url: `/products/${id}`,
      message: 'Огласот е објавен на КупиПродади',
    }, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    console.error('CRM import error:', error);
    return NextResponse.json(
      { error: 'Грешка при импорт на оглас', details: String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
