import { NextResponse, NextRequest } from 'next/server';
// ...existing code...

// In-memory store for demonstration (replace with DB in production)
const downsellAccepted: Record<string, boolean> = {};

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  downsellAccepted[userId] = true;
  return NextResponse.json({ success: true });
}
