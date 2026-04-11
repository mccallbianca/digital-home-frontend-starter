#!/usr/bin/env node
/**
 * HERR — Full-Site Screenshot Capture
 * ───────────────────────────────────────────────────────────────
 * Captures every page on h3rr.com for a visual walkthrough deck.
 *
 * Run: node scripts/screenshot-all-pages.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.resolve(PROJECT_ROOT, 'screenshots');
const BASE_URL = 'https://h3rr.com';
const VIEWPORT = { width: 1440, height: 900 };

// ── Load .env.local ───────────────────────────────────────────────────────────
const envPath = path.resolve(PROJECT_ROOT, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const ENV = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
  const eqIndex = trimmed.indexOf('=');
  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim();
  if (value) ENV[key] = value;
}

// ── Route definitions ─────────────────────────────────────────────────────────

const PUBLIC_PAGES = [
  { route: '/', name: 'Home Page' },
  { route: '/how-it-works', name: 'How It Works' },
  { route: '/ecqo-sound', name: 'ECQO Sound' },
  { route: '/ecqo-sound/producers', name: 'ECQO Sound Producers' },
  { route: '/science', name: 'The Science' },
  { route: '/journal', name: 'Journal' },
  { route: '/journal/the-inner-voice-is-not-yours', name: 'Journal — The Inner Voice Is Not Yours' },
  { route: '/journal/what-existential-psychology-reveals-about-identity-after-career-transition', name: 'Journal — Identity After Career Transition' },
  { route: '/journal/why-high-performers-struggle-to-quiet-their-inner-critic', name: 'Journal — High Performers Inner Critic' },
  { route: '/blog', name: 'Blog' },
  { route: '/about', name: 'About' },
  { route: '/services', name: 'Services' },
  { route: '/community', name: 'Community' },
  { route: '/practitioners', name: 'Practitioners' },
  { route: '/affirmations', name: 'Affirmations' },
  { route: '/assessment', name: 'Assessment' },
  { route: '/live-sessions', name: 'Live Sessions' },
  { route: '/my-voice', name: 'My Voice' },
  { route: '/subscribe', name: 'Subscribe / Pricing' },
  { route: '/checkout', name: 'Checkout' },
  { route: '/portal', name: 'Member Portal' },
  { route: '/contact', name: 'Contact' },
  { route: '/privacy', name: 'Privacy Policy' },
  { route: '/terms', name: 'Terms of Service' },
  { route: '/signup', name: 'Sign Up' },
  { route: '/login', name: 'Log In' },
  { route: '/update-password', name: 'Update Password' },
  { route: '/welcome', name: 'Welcome' },
];

const DASHBOARD_PAGES = [
  { route: '/dashboard', name: 'Dashboard Home' },
  { route: '/dashboard/ecqo-sound', name: 'Dashboard — ECQO Sound Player' },
  { route: '/dashboard/affirmations', name: 'Dashboard — Affirmations' },
  { route: '/dashboard/assessment', name: 'Dashboard — Assessment' },
  { route: '/dashboard/billing', name: 'Dashboard — Billing' },
  { route: '/dashboard/community', name: 'Dashboard — Community' },
  { route: '/dashboard/sessions', name: 'Dashboard — Sessions' },
  { route: '/dashboard/voice', name: 'Dashboard — Voice' },
];

const ADMIN_PAGES = [
  { route: '/admin', name: 'Admin Dashboard' },
  { route: '/admin/journal', name: 'Admin — Journal' },
  { route: '/admin/members', name: 'Admin — Members' },
  { route: '/admin/community', name: 'Admin — Community' },
  { route: '/admin/sessions', name: 'Admin — Sessions' },
  { route: '/admin/producers', name: 'Admin — Producers' },
  { route: '/admin/metrics', name: 'Admin — Metrics' },
  { route: '/admin/moments', name: 'Admin — Moments' },
  { route: '/admin/testimonials', name: 'Admin — Testimonials' },
  { route: '/admin/beta-lab', name: 'Admin — Beta Lab' },
  { route: '/admin/blist', name: 'Admin — BLIST' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(route) {
  if (route === '/') return 'home';
  return route
    .replace(/^\//, '')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/-$/, '');
}

async function captureScreenshot(page, route, seq, name) {
  const seqStr = String(seq).padStart(2, '0');
  const filename = `${seqStr}-${slugify(route)}.png`;
  const filepath = path.resolve(SCREENSHOTS_DIR, filename);
  const url = `${BASE_URL}${route}`;

  const result = {
    sequence: seq,
    route,
    name,
    screenshot: filename,
    section: route.startsWith('/admin') ? 'admin' : route.startsWith('/dashboard') ? 'dashboard' : 'public',
    status: 'captured',
    notes: '',
  };

  try {
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    const statusCode = response?.status() || 0;
    const finalUrl = page.url();

    // Check for redirect
    const finalPath = new URL(finalUrl).pathname;
    if (finalPath !== route && !finalPath.startsWith(route)) {
      result.notes += `Redirected to ${finalPath}. `;
      result.status = 'redirect';
    }

    // Check for 404
    if (statusCode === 404) {
      result.status = '404';
      result.notes += '404 Not Found. ';
    }

    // Wait a bit more for images/fonts
    await new Promise((r) => setTimeout(r, 2000));

    // Check for visible error messages or placeholder text
    const pageText = await page.evaluate(() => document.body?.innerText || '');
    if (pageText.includes('Coming soon') || pageText.includes('coming soon')) {
      result.notes += 'Contains "Coming soon" placeholder. ';
    }
    if (pageText.includes('404') && pageText.includes('not found')) {
      if (result.status !== '404') result.status = '404';
      result.notes += 'Page shows 404 content. ';
    }
    if (pageText.includes('Error') && pageText.length < 500) {
      result.notes += 'Possible error page (short content with "Error"). ';
    }
    if (pageText.trim().length < 50) {
      result.notes += 'Very little content on page. ';
    }

    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      let broken = 0;
      imgs.forEach((img) => {
        if (img.naturalWidth === 0 && img.src && !img.src.startsWith('data:')) broken++;
      });
      return broken;
    });
    if (brokenImages > 0) {
      result.notes += `${brokenImages} broken image(s). `;
    }

    // Check for navigation links (dead-end detection)
    const hasLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href]');
      let internalLinks = 0;
      links.forEach((a) => {
        const href = a.getAttribute('href') || '';
        if (href.startsWith('/') || href.includes('h3rr.com')) internalLinks++;
      });
      return internalLinks;
    });
    if (hasLinks < 2) {
      result.notes += 'Possible dead-end page (few internal links). ';
    }

    // Full-page screenshot
    await page.screenshot({
      path: filepath,
      fullPage: true,
    });

    result.notes = result.notes.trim() || 'OK';
    console.log(`  ${seqStr}. [${result.status.toUpperCase()}] ${route} — ${result.notes}`);
  } catch (err) {
    result.status = 'error';
    result.notes = err.message.slice(0, 200);
    console.log(`  ${seqStr}. [ERROR] ${route} — ${err.message.slice(0, 100)}`);

    // Try to capture whatever is on screen
    try {
      await page.screenshot({ path: filepath, fullPage: true });
    } catch {}
  }

  return result;
}

// ── Login helper ──────────────────────────────────────────────────────────────

async function loginWithSupabase(page) {
  console.log('\n  Logging in via Supabase Auth...');

  // Navigate to login page
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // Use Supabase JS directly in the browser to sign in
  const supabaseUrl = ENV.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const loginResult = await page.evaluate(
    async (url, key, email) => {
      // Supabase client should already be loaded on the page
      // But just in case, try using the global supabase or create one via fetch
      try {
        const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            email: email,
            password: 'Herr2026!Secure',
          }),
        });
        const data = await response.json();
        if (data.access_token) {
          // Store tokens in localStorage for Supabase SSR to pick up
          const storageKey = `sb-${url.split('//')[1].split('.')[0]}-auth-token`;
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_in: data.expires_in,
              token_type: 'bearer',
              user: data.user,
            })
          );
          return { success: true, email: data.user?.email };
        }
        return { success: false, error: data.error_description || data.msg || JSON.stringify(data) };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    supabaseUrl,
    supabaseAnonKey,
    'mccall.bianca@gmail.com'
  );

  if (loginResult.success) {
    console.log(`  Logged in as ${loginResult.email}`);
    // Reload to pick up the session cookies
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 3000));
    return true;
  } else {
    console.log(`  Login failed: ${loginResult.error}`);
    console.log('  Will attempt authenticated pages anyway (may show login redirects).');
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n  HERR — Full-Site Screenshot Capture');
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Viewport: ${VIEWPORT.width}x${VIEWPORT.height}`);
  console.log(`  Output: ${SCREENSHOTS_DIR}\n`);

  // Ensure screenshots dir exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: VIEWPORT,
  });

  const page = await browser.newPage();

  // Set a realistic user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  const allResults = [];
  let seq = 1;

  // ── Phase 1: Public Pages ──────────────────────────────────────────────────
  console.log('  ═══ PUBLIC PAGES ═══\n');
  for (const p of PUBLIC_PAGES) {
    const result = await captureScreenshot(page, p.route, seq++, p.name);
    allResults.push(result);
  }

  // ── Phase 2: Authenticated Pages ───────────────────────────────────────────
  console.log('\n  ═══ AUTHENTICATED PAGES ═══\n');
  const loggedIn = await loginWithSupabase(page);

  for (const p of DASHBOARD_PAGES) {
    const result = await captureScreenshot(page, p.route, seq++, p.name);
    if (!loggedIn && result.status === 'redirect') {
      result.notes += 'Login required — redirected. ';
    }
    allResults.push(result);
  }

  // ── Phase 3: Admin Pages ───────────────────────────────────────────────────
  console.log('\n  ═══ ADMIN PAGES ═══\n');
  for (const p of ADMIN_PAGES) {
    const result = await captureScreenshot(page, p.route, seq++, p.name);
    if (!loggedIn && result.status === 'redirect') {
      result.notes += 'Admin access required — redirected. ';
    }
    allResults.push(result);
  }

  await browser.close();

  // ── Generate Manifest ──────────────────────────────────────────────────────
  const captured = allResults.filter((r) => r.status === 'captured').length;
  const errors = allResults.filter((r) => r.status === 'error').length;
  const notFound = allResults.filter((r) => r.status === '404').length;
  const redirects = allResults.filter((r) => r.status === 'redirect').length;
  const missingContent = allResults.filter((r) => r.notes.includes('Coming soon') || r.notes.includes('Very little content')).length;
  const deadEnds = allResults.filter((r) => r.notes.includes('dead-end')).map((r) => r.route);
  const brokenImages = allResults.filter((r) => r.notes.includes('broken image')).map((r) => r.route);

  const manifest = {
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    viewport: VIEWPORT,
    pages: allResults,
    summary: {
      total_routes: allResults.length,
      captured,
      redirects,
      errors,
      not_found: notFound,
      missing_content: missingContent,
      broken_images: brokenImages,
      dead_ends: deadEnds,
    },
  };

  const manifestPath = path.resolve(SCREENSHOTS_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n  ═══ SUMMARY ═══`);
  console.log(`  Total:     ${allResults.length}`);
  console.log(`  Captured:  ${captured}`);
  console.log(`  Redirects: ${redirects}`);
  console.log(`  Errors:    ${errors}`);
  console.log(`  404s:      ${notFound}`);
  console.log(`  Missing:   ${missingContent}`);
  console.log(`  Broken:    ${brokenImages.length}`);
  console.log(`  Dead-ends: ${deadEnds.length}`);
  console.log(`\n  Manifest: ${manifestPath}`);
  console.log(`  Screenshots: ${SCREENSHOTS_DIR}/\n`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
