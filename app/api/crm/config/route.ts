import { NextResponse } from 'next/server';
import { SYSTEM_EMAIL } from '@/lib/crm';

export async function GET() {
  return NextResponse.json({
    version: '1.0',
    systemEmail: SYSTEM_EMAIL,
    endpoints: {
      import: '/api/crm/import',
      update: '/api/crm/products/[id]',
      remove: '/api/crm/products/[id]',
    },
  });
}
