
import { NextResponse } from "next/server";

export async function GET() {
  // demo: always eligible for B at $15
  return NextResponse.json({ offerEligible: true, variant: "B", price: 15 });
// ...existing code...
}
