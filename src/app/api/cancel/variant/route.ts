import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "node:crypto";
// Constants
const ORIGINAL_PRICE = 25;

// mock user for local dev
const USER_ID = "00000000-0000-0000-0000-000000000001";

// Return the most recent downsell_variant from the DB, if any
async function lookupVariantInDb(): Promise<"A" | "B" | null> {
  const { data, error } = await supabaseAdmin
    .from("cancellations")
    .select("downsell_variant")
    .eq("user_id", USER_ID)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) {
    console.error("[variant] db lookup error:", error);
    return null;
  }
  const v = data?.[0]?.downsell_variant;
  return v === "A" || v === "B" ? v : null;
}

// Generate secure A/B (server-side RNG)
function secureAB(): "A" | "B" {
  return crypto.randomInt(0, 2) === 0 ? "A" : "B";
}

export async function GET() {
  // Get reason from query param, normalize to lower_snake
  // e.g. "Too expensive" -> "too_expensive"
  const req = arguments[0];
  const url = req?.nextUrl;
  let reason = url?.searchParams?.get("reason") || "";
  reason = reason.trim().toLowerCase().replace(/\s+/g, "_");

  if (reason !== "too_expensive") {
    return NextResponse.json({ offerEligible: false, variant: null, price: ORIGINAL_PRICE });
  }

  // --- Eligible for offer ---
  // Get userId (mock for now)
  const userId = USER_ID;

  // Try to get sticky variant from DB
  let variant = await lookupVariantInDb();
  if (!variant) {
    // Generate 50/50
    let rand;
    if (typeof crypto.getRandomValues === "function") {
      rand = crypto.getRandomValues(new Uint8Array(1))[0] & 1;
    } else {
      rand = crypto.randomInt(0, 2);
    }
    variant = rand === 1 ? "B" : "A";
    // Persist sticky variant
    if (supabaseAdmin) {
      await supabaseAdmin.from("cancellations").insert({ user_id: userId, downsell_variant: variant });
    }
  }

  // Compute price
  const price = variant === "B" ? 15 : ORIGINAL_PRICE;

  return NextResponse.json({ offerEligible: true, variant, price });
}
