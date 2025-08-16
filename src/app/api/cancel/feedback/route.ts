import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import your db util here
import { db } from '../../../lib/db';

// mock user for local dev
const USER_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: NextRequest) {
  const { rating, comment, reason } = await request.json();
  if (
    typeof rating !== 'number' ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    typeof reason !== 'string' ||
    !reason.trim()
  ) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const ts = new Date().toISOString();
  try {
    await db.saveCancelFeedback(USER_ID, { rating, comment, reason, ts });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
