import { NextResponse } from 'next/server';
import { secureAB } from '../../../../lib/secure-ab';
import { getSupabaseClient } from '../../../../lib/supabase';

type CancellationRow = { downsell_variant: 'A'|'B'|null; pending_cancellation: boolean|null };

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const reason = searchParams.get('reason') || '';
    const force = searchParams.get('force');

    // Only eligible if reason === 'too_expensive' (case-insensitive)
    const offerEligible = reason.trim().toLowerCase() === 'too_expensive';
    let variant: 'A' | 'B';
    let price: number;

    // Dev-only override for variant
    if (process.env.NODE_ENV !== 'production' && (force === 'A' || force === 'B')) {
      variant = force as 'A' | 'B';
    } else {
      variant = secureAB();
    }
    price = variant === 'A' ? 25 : 15;

    return NextResponse.json({ offerEligible, variant, price });
  } catch (err) {
    console.error('variant handler error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
