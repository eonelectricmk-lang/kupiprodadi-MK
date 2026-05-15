import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const db = getDb();
    const { user_id, name, phone, location } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'Недостига ID на корисник' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id);
    if (!existing) {
      return NextResponse.json({ error: 'Корисникот не е пронајден' }, { status: 404 });
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (location !== undefined) { fields.push('location = ?'); values.push(location); }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Нема полиња за ажурирање' }, { status: 400 });
    }

    values.push(user_id);
    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare(
      'SELECT id, email, name, phone, location, rating, created_at, avatar_url, COALESCE(is_active, 1) AS is_active FROM users WHERE id = ?'
    ).get(user_id) as any;

    return NextResponse.json({
      message: 'Профилот е ажуриран',
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone || null,
        location: updated.location || null,
        rating: updated.rating ?? 5,
        created_at: updated.created_at || null,
        avatar_url: updated.avatar_url || null,
        is_active: !!updated.is_active,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Грешка при ажурирање на профил' }, { status: 500 });
  }
}
