import { NextResponse } from 'next/server';

// Utility to generate a random CSRF token
function generateCsrfToken(length = 32) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return token;
}

export async function GET() {
  const csrfToken = generateCsrfToken();
  // Set CSRF token as a secure, HttpOnly cookie
  const response = NextResponse.json({ csrfToken });
  response.cookies.set('csrfToken', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
  return response;
}
