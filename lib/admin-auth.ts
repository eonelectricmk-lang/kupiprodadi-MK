import crypto from 'crypto';
import { cookies } from 'next/headers';
import getDb from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';

const SESSION_COOKIE = 'kp_admin_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14;

type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export async function getAdminFromSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const row = db.prepare(`
    SELECT u.id, u.email, u.name, u.role
    FROM admin_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.role = 'admin'
  `).get(token) as AdminUser | undefined;

  return row || null;
}

export async function requireAdmin() {
  const admin = await getAdminFromSession();
  if (!admin) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }
  return admin;
}

export function hasAnyAdmin(): boolean {
  const db = getDb();
  const row = db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`).get() as { count: number };
  return row.count > 0;
}

export async function createAdminSession(userId: number) {
  const db = getDb();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  db.prepare(`INSERT INTO admin_sessions (token, user_id, expires_at) VALUES (?, ?, ?)`).run(token, userId, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = getDb();
    db.prepare(`DELETE FROM admin_sessions WHERE token = ?`).run(token);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export function createInitialAdmin(input: { email: string; password: string; name: string; phone?: string }) {
  const db = getDb();
  if (hasAnyAdmin()) throw new Error('ADMIN_EXISTS');
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(input.email);
  if (existing) throw new Error('EMAIL_EXISTS');

  const result = db.prepare(`
    INSERT INTO users (email, password, name, phone, role)
    VALUES (?, ?, ?, ?, 'admin')
  `).run(input.email, hashPassword(input.password), input.name, input.phone || null);

  return Number(result.lastInsertRowid);
}

export function authenticateAdmin(email: string, password: string): AdminUser | null {
  const db = getDb();
  const user = db.prepare(`
    SELECT id, email, password, name, role
    FROM users
    WHERE email = ? AND role = 'admin'
  `).get(email) as (AdminUser & { password: string }) | undefined;

  if (!user) return null;
  if (!verifyPassword(password, user.password)) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
