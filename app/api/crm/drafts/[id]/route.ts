import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const draft = db.prepare('SELECT * FROM crm_drafts WHERE id = ?').get(Number(id));
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }
  return NextResponse.json(draft);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  try {
    const body = await request.json();
    const allowed = ['title', 'description', 'price', 'city', 'category', 'seller_name', 'phone', 'images', 'notes', 'status'];
    const sets: string[] = [];
    const vals: any[] = [];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        sets.push(`${key} = ?`);
        vals.push(typeof body[key] === 'object' ? JSON.stringify(body[key]) : body[key]);
      }
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    vals.push(Number(id));
    db.prepare(`UPDATE crm_drafts SET ${sets.join(', ')} WHERE id = ?`).run(...vals);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  db.prepare('DELETE FROM crm_drafts WHERE id = ?').run(Number(id));
  return NextResponse.json({ success: true });
}
