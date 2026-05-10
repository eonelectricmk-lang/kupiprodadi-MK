import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const db = getDb();
    const product = db.prepare(`
      SELECT 
        p.id, 
        p.title, 
        p.description, 
        p.price,
        p.currency,
        p.category,
        p.subcategory,
        p.condition,
        p.negotiable,
        p.location,
        p.city,
        p.neighborhood,
        p.address_note,
        p.delivery,
        p.contact_name,
        p.contact_phone,
        p.contact_email,
        p.preferred_contact,
        p.image_url,
        p.views,
        p.created_at,
        u.id as seller_id,
        u.name as seller_name,
        u.phone as seller_phone,
        u.email as seller_email,
        u.rating as seller_rating
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = ? AND p.status = 'active'
    `).get(resolvedParams.id);

    if (!product) {
      return NextResponse.json(
        { error: 'Производот не постои' },
        { status: 404 }
      );
    }

    const images = db.prepare(`
      SELECT image_url
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order ASC, id ASC
    `).all(resolvedParams.id) as Array<{ image_url: string }>;

    return NextResponse.json({
      ...(product as Record<string, unknown>),
      images: images.map((image) => image.image_url),
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Грешка при преземање производ' },
      { status: 500 }
    );
  }
}
