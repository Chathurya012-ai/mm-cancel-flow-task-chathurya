import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

function generateCsrfToken(): string {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    const arr = new Uint32Array(4);
    globalThis.crypto.getRandomValues(arr);
    return Array.from(arr).map(n => n.toString(16)).join('');
  }
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function GET() {
  try {
    const token = generateCsrfToken();
  (await cookies()).set('csrf', token, { httpOnly: true, path: '/', sameSite: 'lax' });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('csrf error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
