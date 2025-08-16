export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(_request: NextRequest) {
  void _request;
  // Simulate DB update
  try {
    const canceledAt = new Date().toISOString();
    // In production, update DB: status="canceled", canceledAt, nextPaymentAt=null
    // await db.cancelSubscription(/* userId */, { status: "canceled", canceledAt, nextPaymentAt: null });
    return NextResponse.json({ ok: true, status: "canceled", canceledAt, nextPayment: null });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "DB error";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
