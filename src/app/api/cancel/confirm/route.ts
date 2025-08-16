import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '../../../lib/db';

// Stub: get userId from session/auth
function getUserIdFromSession(request: NextRequest): string {
  // Replace with real session logic
  return '00000000-0000-0000-0000-000000000001';
}

export async function POST(request: NextRequest) {
  const csrf = request.headers.get('CSRF-Token');
  if (!csrf) {
    return NextResponse.json({ ok: false, error: 'Missing CSRF-Token' }, { status: 400 });
  }

  const userId = getUserIdFromSession(request);
  const canceledAt = new Date().toISOString();
  try {
    // Update subscriptions table
    await db.cancelSubscription(userId, {
      status: 'canceled',
      canceled_at: canceledAt,
      next_payment_at: null,
    });
    return NextResponse.json({ ok: true, status: 'canceled', canceledAt, nextPayment: null });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'DB error' }, { status: 400 });
  }
}
