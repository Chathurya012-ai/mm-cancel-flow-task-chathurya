type CancellationRow = { downsell_variant: 'A'|'B'|null; pending_cancellation: boolean|null };


import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET() {
  // Parse query string for reason
  const url = new URL("http://localhost" + (typeof window === "undefined" ? (globalThis as { request?: { url?: string } }).request?.url || "" : window.location.href));
  const reason = url.searchParams.get("reason") || "";
  const offerEligible = reason.toLowerCase().includes("too_expensive");

  // Query latest variant for user_id = "1"
  let variant: 'A' | 'B' = 'A';
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data: row, error } = await supabase
      .from('cancellations')
      .select('downsell_variant, pending_cancellation')
      .eq('user_id', "1")
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<CancellationRow>();
    if (!error && (row?.downsell_variant === 'A' || row?.downsell_variant === 'B')) {
      variant = row.downsell_variant;
    }
  }

  // Compute price server-side
  const base = 29;
  const price = offerEligible && variant === 'B' ? Math.max(base - 10, 0) : base;

  return NextResponse.json({ offerEligible, variant, price });
// ...existing code...
}
