export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(_request: NextRequest) {
  void _request;
  const supabase = await (await import("@/lib/supabase")).getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("cancellations").insert({
        user_id: null,
        reason: "from-confirm",
        other_reason: null,
      });
    } catch {}
  }
  return NextResponse.json({ ok: true, status: "canceled" });
}
