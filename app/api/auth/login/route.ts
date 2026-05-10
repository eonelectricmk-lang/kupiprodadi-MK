import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Е-пошта и лозинка се задолжителни' },
        { status: 400 }
      );
    }

    const user = db.prepare('SELECT id, email, password, name FROM users WHERE email = ?').get(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Корисникот не постои' },
        { status: 401 }
      );
    }

    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: 'Погрешна лозинка' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: 'Успешно логирање',
        user: { id: user.id, email: user.email, name: user.name }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Грешка при логирање' },
      { status: 500 }
    );
  }
}
