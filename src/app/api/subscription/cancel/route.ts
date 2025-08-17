export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST() {
  const supabase = (await import("@/lib/supabase")).getSupabaseClient();
  if (supabase) {
    try {
      // Find latest pending cancellation for user_id = "1"
      const { data: rows, error } = await supabase
        .from("cancellations")
        .select("id")
        .eq("user_id", "1")
        .eq("pending_cancellation", true)
        .order("created_at", { ascending: false })
        .limit(1);
      if (!error && rows && rows.length > 0) {
        const id = rows[0].id;
        await supabase
          .from("cancellations")
          .update({ accepted_downsell: false, pending_cancellation: false })
          .eq("id", id);
      }
    } catch {}
  }
  return NextResponse.json({ ok: true, status: "canceled" });
}
