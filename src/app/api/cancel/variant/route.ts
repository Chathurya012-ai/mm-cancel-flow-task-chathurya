

import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET() {
  // Parse query string for reason
  const url = new URL("http://localhost" + (typeof window === "undefined" ? (globalThis as any).request?.url || "" : window.location.href));
  const reason = url.searchParams.get("reason") || "";
  const offerEligible = /too_expensive/i.test(reason);

  // Query latest variant for user_id = "1"
  let variant: 'A' | 'B' = 'A';
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data: last, error } = await supabase
      .from('cancellations')
      .select('downsell_variant')
      .eq('user_id', "1")
      .order('created_at', { ascending: false })
      .limit(1);
    if (!error && last && last.length > 0 && (last[0].downsell_variant === 'A' || last[0].downsell_variant === 'B')) {
      variant = last[0].downsell_variant;
    }
  }

  // Compute price
  const base = 29;
  const price = offerEligible && variant === 'B' ? base - 10 : base;

  return NextResponse.json({ offerEligible, variant, price });
// ...existing code...
}
