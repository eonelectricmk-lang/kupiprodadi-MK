import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { email, password, name, phone } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Сите полиња се задолжителни' },
        { status: 400 }
      );
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Оваа е-пошта е веќе регистрирана' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);
    const stmt = db.prepare(
      'INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(email, hashedPassword, name, phone || null);

    return NextResponse.json(
      { 
        message: 'Успешна регистрација',
        user: { id: result.lastInsertRowid, email, name }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Грешка при регистрација' },
      { status: 500 }
    );
  }
}
