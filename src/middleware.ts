/**
 * Edge Middleware — lightweight, no external calls.
 *
 * Responsibilities:
 * 1. Apply security headers (ECQO Security Layer — PART 5)
 * 2. Protect member routes by checking for Supabase session cookie
 * 3. Protect API routes (session cookie OR API_SECRET_KEY)
 * 4. Redirect authenticated users who haven't completed onboarding
 * 5. Visitor tracking headers for personalization
 *
 * NOTE: No Supabase SDK here — SDK calls in middleware crash Cloudflare Workers.
 * Auth is validated properly inside each protected Server Component instead.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveSource } from '@/lib/attribution/source';
import {
  VISITOR_COOKIE_NAME,
  VISITOR_COOKIE_MAX_AGE,
  generateVisitorId,
  assignSegment,
  detectDeviceType,
} from '@/lib/personalization/visitor';
import { SECURITY_HEADERS } from '@/lib/security/headers';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/onboarding',
  '/admin',
];

// API routes that require auth (session cookie OR API_SECRET_KEY)
const PROTECTED_API_ROUTES = [
  '/api/community',
  '/api/affirmations',
  '/api/onboarding',
  '/api/admin',
];

// Supabase SSR stores the session in a cookie named sb-{projectRef}-auth-token
const SUPABASE_COOKIE = 'sb-uyhfdtrvlhdhrhniysvw-auth-token';

export function middleware(request: NextRequest) {
  const { nextUrl, headers } = request;
  const path = nextUrl.pathname;

  // ── 1. Route protection — check for session cookie ───────────────
  const isProtected = PROTECTED_ROUTES.some(route => path.startsWith(route));
  if (isProtected) {
    const sessionCookieA = request.cookies.get(SUPABASE_COOKIE)?.value;
    const sessionCookieB = request.cookies.get(SUPABASE_COOKIE + '.0')?.value;
    const hasSession = !!(sessionCookieA || sessionCookieB);
    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    // ── 2. Onboarding redirect ─────────────────────────────────────
    const onboardingComplete = request.cookies.get('herr_onboarded')?.value;
    if (path.startsWith('/dashboard') && onboardingComplete === '0') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // ── 2b. API route protection — session OR API_SECRET_KEY ─────────
  const isProtectedApi = PROTECTED_API_ROUTES.some(route => path.startsWith(route));
  if (isProtectedApi) {
    const sessionCookieA = request.cookies.get(SUPABASE_COOKIE)?.value;
    const sessionCookieB = request.cookies.get(SUPABASE_COOKIE + '.0')?.value;
    const hasSession = !!(sessionCookieA || sessionCookieB);
    const apiKey = request.headers.get('x-api-key');
    const apiSecret = process.env.API_SECRET_KEY || '';

    if (!hasSession && !(apiKey && apiSecret && apiKey === apiSecret)) {
      return NextResponse.json(
        { error: 'Let\'s get you signed in first so we can continue.' },
        { status: 401 }
      );
    }
  }

  // ── 3. Attribution + visitor tracking ───────────────────────────
  const referrer  = headers.get('referer');
  const userAgent = headers.get('user-agent');
  const url       = new URL(nextUrl.toString());
  const attribution = resolveSource(url, referrer, userAgent);

  let visitorId = request.cookies.get(VISITOR_COOKIE_NAME)?.value;
  const isNewVisitor = !visitorId;
  if (!visitorId) visitorId = generateVisitorId();

  const visitCount = parseInt(request.cookies.get('bb_vc')?.value || '0', 10);
  const segment = assignSegment({
    visitCount: visitCount || 1,
    latestSource: attribution.source,
    latestMedium: attribution.medium,
    isAITraffic: attribution.isAITraffic,
    pagesViewed: [],
    deviceType: detectDeviceType(userAgent),
  });

  const response = NextResponse.next();

  // ── Security headers (ECQO Security Layer — PART 5) ─────────────
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // Personalization headers
  response.headers.set('x-visitor-id', visitorId);
  response.headers.set('x-visitor-segment', segment);
  response.headers.set('x-visitor-new', isNewVisitor ? '1' : '0');
  response.headers.set('x-attribution-source', attribution.source);
  response.headers.set('x-attribution-medium', attribution.medium);
  response.headers.set('x-ai-traffic', attribution.isAITraffic ? '1' : '0');
  if (attribution.aiSource) response.headers.set('x-ai-source', attribution.aiSource);
  if (attribution.campaign) response.headers.set('x-attribution-campaign', attribution.campaign);

  // Visitor cookies
  response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
    httpOnly: true, secure: true, sameSite: 'lax',
    maxAge: VISITOR_COOKIE_MAX_AGE, path: '/',
  });
  response.cookies.set('bb_segment', segment, {
    httpOnly: true, secure: true, sameSite: 'lax',
    maxAge: VISITOR_COOKIE_MAX_AGE, path: '/',
  });

  if (!request.cookies.get('bb_session')?.value) {
    response.cookies.set('bb_session', '1', {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: 1800, path: '/',
    });
    response.cookies.set('bb_vc', String(visitCount + 1), {
      httpOnly: true, secure: true, sameSite: 'lax',
      maxAge: VISITOR_COOKIE_MAX_AGE, path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
};
