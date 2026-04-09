/**
 * GET /api/auth/callback
 *
 * Thin redirect — passes all Supabase auth params to the
 * client-side /auth/callback page which handles them in the browser.
 *
 * No Supabase SDK calls here — SSR client crashes in Cloudflare Workers.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // Forward all query params (code, token_hash, type, next, etc.)
  const clientUrl = new URL('/auth/callback', req.url);
  searchParams.forEach((value, key) => {
    clientUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(clientUrl);
}
