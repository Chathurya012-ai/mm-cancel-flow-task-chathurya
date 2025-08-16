import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const USER_ID = "00000000-0000-0000-0000-000000000001";
const ORIGINAL_PRICE = 100;

export async function POST(request: Request) {
  // Parse JSON body
  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Fetch last selected reason from DB (mock: assume sent in body for now)
  const lastReason = (data?.reason || "").trim().toLowerCase().replace(/\s+/g, "_");

  // Check for persisted variant
  const { data: variantData, error: variantError } = await supabaseAdmin
    .from("cancellations")
    .select("downsell_variant")
    .eq("user_id", USER_ID)
    .order("created_at", { ascending: false })
    .limit(1);
  const persistedVariant = variantData?.[0]?.downsell_variant;

  // Eligibility check
  const eligible = lastReason === "too_expensive" || (persistedVariant === "A" || persistedVariant === "B");
  if (!eligible) {
    return NextResponse.json({ error: "Offer not available for this reason." }, { status: 400 });
  }

  // Apply discount logic (defense-in-depth: ignore client price)
  const variant = persistedVariant === "A" || persistedVariant === "B" ? persistedVariant : "A";
  const price = variant === "B" ? ORIGINAL_PRICE - 10 : ORIGINAL_PRICE;

  // TODO: Apply cancellation logic, persist as needed

  return NextResponse.json({ ok: true, variant, price }, { status: 200 });
}
