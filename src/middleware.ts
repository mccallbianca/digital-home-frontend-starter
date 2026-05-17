/**
 * Edge Middleware — lightweight, no external calls.
 *
 * Responsibilities:
 * 1. Apply security headers (ECQO Security Layer — PART 5)
 * 2. Protect member routes by checking for Supabase session cookie
 * 3. Protect API routes (session cookie OR API_SECRET_KEY)
 * 4. Redirect authenticated users who haven't completed onboarding
 * 5. Initialize visitor cookies on first arrival; refresh session window
 *    on returning visits. Cookies are idempotent — only re-set when
 *    missing or when a campaign arrival (?utm_*) re-resolves attribution.
 *
 * NOTE: No Supabase SDK here — SDK calls in middleware crash Cloudflare Workers.
 * Auth is validated properly inside each protected Server Component instead.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveSource } from '@/lib/attribution/source';
import { hasUTMParams } from '@/lib/attribution/utm';
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
  '/update-password',
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

const SESSION_MAX_AGE = 1800; // 30 min

function applySecurityHeaders(response: NextResponse): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
}

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

  // ── 3. Visitor cookie initialization ─────────────────────────────
  // Fast path: returning visitor without any campaign arrival skips all
  // attribution work entirely. Cookie sets are idempotent — values are
  // only written when missing or when a UTM-tagged URL re-resolves the
  // segment.
  const existingVid = request.cookies.get(VISITOR_COOKIE_NAME)?.value;
  const existingSegment = request.cookies.get('bb_segment')?.value;
  const hasSession = !!request.cookies.get('bb_session')?.value;
  const hasUtm = hasUTMParams(nextUrl);

  const response = NextResponse.next();
  applySecurityHeaders(response);

  // ── Fast path: known visitor, no campaign params ─────────────────
  if (existingVid && existingSegment && !hasUtm) {
    // Refresh 30-min session window if it lapsed (returning after >30 min)
    if (!hasSession) {
      const visitCount = parseInt(request.cookies.get('bb_vc')?.value || '1', 10);
      response.cookies.set('bb_session', '1', {
        httpOnly: true, secure: true, sameSite: 'lax',
        maxAge: SESSION_MAX_AGE, path: '/',
      });
      response.cookies.set('bb_vc', String(visitCount + 1), {
        httpOnly: true, secure: true, sameSite: 'lax',
        maxAge: VISITOR_COOKIE_MAX_AGE, path: '/',
      });
    }
    return response;
  }

  // ── Slow path: new visitor OR campaign arrival ───────────────────
  const referrer  = headers.get('referer');
  const userAgent = headers.get('user-agent');
  const url       = new URL(nextUrl.toString());
  const attribution = resolveSource(url, referrer, userAgent);

  const visitorId = existingVid || generateVisitorId();
  const visitCount = parseInt(request.cookies.get('bb_vc')?.value || '0', 10);
  const segment = assignSegment({
    visitCount: visitCount || 1,
    latestSource: attribution.source,
    latestMedium: attribution.medium,
    isAITraffic: attribution.isAITraffic,
    pagesViewed: [],
    deviceType: detectDeviceType(userAgent),
  });

  // Only set bb_vid when missing — long-lived cookie doesn't need refresh
  if (!existingVid) {
    response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true, secure: true, sameSite: 'lax',
      maxAge: VISITOR_COOKIE_MAX_AGE, path: '/',
    });
  }

  // Only update bb_segment when missing or changed by attribution
  if (existingSegment !== segment) {
    response.cookies.set('bb_segment', segment, {
      httpOnly: true, secure: true, sameSite: 'lax',
      maxAge: VISITOR_COOKIE_MAX_AGE, path: '/',
    });
  }

  // Session start: refresh window + bump visit count
  if (!hasSession) {
    response.cookies.set('bb_session', '1', {
      httpOnly: true, secure: true, sameSite: 'lax',
      maxAge: SESSION_MAX_AGE, path: '/',
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
