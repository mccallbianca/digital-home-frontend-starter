/**
 * POST /api/auth/login
 *
 * ECQO Security Layer — Hardened login endpoint.
 *
 * - 5-attempt lockout with 15-min cool-down
 * - Generic error messages (no credential enumeration)
 * - Lockout email notification via Resend
 * - Security event logging
 * - Rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/security/audit-log';
import { sendSecurityAlert } from '@/lib/security/alerts';
import { sendEmail } from '@/lib/email/resend';
import { TRAUMA_MESSAGES } from '@/lib/security/trauma-messages';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function getDb() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('cf-connecting-ip')
    || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // ── Rate limit check ──────────────────────────────────────
  const rlKey = getRateLimitKey('login', ip);
  const rlResult = checkRateLimit(rlKey, RATE_LIMITS.login);
  if (!rlResult.allowed) {
    return NextResponse.json(
      { error: TRAUMA_MESSAGES.rateLimited },
      { status: 429 }
    );
  }

  try {
    const { email, password, captchaToken } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: TRAUMA_MESSAGES.loginFailed },
        { status: 400 }
      );
    }

    const db = getDb();

    // ── Check lockout ──────────────────────────────────────────
    const lockoutCutoff = new Date(Date.now() - LOCKOUT_MS).toISOString();
    const { data: recentAttempts } = await db
      .from('login_attempts')
      .select('id, success')
      .eq('email', email.toLowerCase())
      .gte('created_at', lockoutCutoff)
      .eq('success', false)
      .order('created_at', { ascending: false });

    if (recentAttempts && recentAttempts.length >= MAX_ATTEMPTS) {
      await logSecurityEvent({
        eventType: 'login_locked',
        email: email.toLowerCase(),
        ip,
        detail: `Account locked — ${recentAttempts.length} failed attempts in 15 min`,
      });

      return NextResponse.json(
        { error: TRAUMA_MESSAGES.loginLocked, locked: true },
        { status: 429 }
      );
    }

    // ── Attempt login via Supabase Auth ─────────────────────────
    // Use the anon key client for signInWithPassword
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const anonClient = createClient(SUPABASE_URL, anonKey);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signInOptions: any = {};
    if (captchaToken) signInOptions.captchaToken = captchaToken;

    const { data, error } = await anonClient.auth.signInWithPassword({
      email,
      password,
      options: signInOptions,
    });

    // ── Log attempt ─────────────────────────────────────────────
    await db.from('login_attempts').insert({
      email: email.toLowerCase(),
      ip_address: ip,
      success: !error,
    });

    if (error) {
      // Log failed attempt
      await logSecurityEvent({
        eventType: 'login_failed',
        email: email.toLowerCase(),
        ip,
        detail: 'Credentials did not match',
      });

      // Check if this puts them at lockout threshold
      const failCount = (recentAttempts?.length || 0) + 1;
      if (failCount >= MAX_ATTEMPTS) {
        // Send lockout notification email
        await sendEmail({
          to: email,
          subject: 'HERR Account Security Notice',
          html: `<div style="background:#0a0a0f;padding:40px;font-family:Georgia,serif;">
            <h2 style="color:#ffffff;font-weight:300;">Account Security Notice</h2>
            <p style="color:#8888aa;line-height:1.7;">${TRAUMA_MESSAGES.loginLockedEmail}</p>
            <p style="color:#6b6b8a;font-size:13px;margin-top:24px;">If you need to reset your password, visit h3rr.com/login and select "Forgot password?"</p>
            <p style="color:#4a4a6a;font-size:11px;margin-top:32px;">HERR™ by ECQO Holdings™</p>
          </div>`,
        });

        // Alert moderator if 10+ failed logins in an hour
        await sendSecurityAlert({
          type: 'lockout',
          subject: 'Account Lockout Triggered',
          detail: `${email} locked out after ${MAX_ATTEMPTS} failed attempts from IP ${ip}`,
          memberEmail: email,
          metadata: { ip, attempts: String(failCount) },
        });
      }

      return NextResponse.json(
        { error: TRAUMA_MESSAGES.loginFailed },
        { status: 401 }
      );
    }

    // ── Successful login ────────────────────────────────────────
    await logSecurityEvent({
      eventType: 'login_success',
      userId: data.user?.id,
      email: email.toLowerCase(),
      ip,
    });

    return NextResponse.json({
      ok: true,
      session: data.session,
      user: data.user,
    });

  } catch (err) {
    console.error('[auth/login] Error:', err);
    return NextResponse.json(
      { error: TRAUMA_MESSAGES.genericError },
      { status: 500 }
    );
  }
}
