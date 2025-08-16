export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Stub CSRF verification
function verifyCsrf(csrf: string | null) {
  // In production, verify CSRF token
  return !!csrf;
}

// Stub userId
const USER_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: NextRequest) {
  const csrf = request.headers.get("CSRF-Token") || request.headers.get("x-csrf-token");
  if (!verifyCsrf(csrf)) {
    return NextResponse.json({ ok: false, error: "Invalid CSRF token" }, { status: 403 });
  }

  // Simulate DB update
  try {
    const canceledAt = new Date().toISOString();
    // In production, update DB: status="canceled", canceledAt, nextPaymentAt=null
    // await db.cancelSubscription(USER_ID, { status: "canceled", canceledAt, nextPaymentAt: null });
    return NextResponse.json({ ok: true, status: "canceled", canceledAt, nextPayment: null });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "DB error" }, { status: 500 });
  }
}
