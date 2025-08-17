// Minimal CSRF route for App Router, no NextResponse import needed.
export async function GET() {
  // simple random token; fine for this take-home
  const token = Math.random().toString(36).slice(2);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      // set the CSRF cookie
      "Set-Cookie": `csrf=${token}; Path=/; HttpOnly; SameSite=Lax`,
      "Content-Type": "application/json",
    },
  });
}
