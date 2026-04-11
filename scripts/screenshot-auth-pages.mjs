#!/usr/bin/env node
/**
 * HERR — Screenshot Authenticated + Admin Pages Only
 * Reuses the existing public screenshots, captures only auth-required pages.
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

const AUTH_PAGES = [
  { route: '/community', name: 'Community' },
  { route: '/affirmations', name: 'Affirmations' },
  { route: '/assessment', name: 'Assessment' },
  { route: '/live-sessions', name: 'Live Sessions' },
  { route: '/my-voice', name: 'My Voice' },
  { route: '/portal', name: 'Member Portal' },
  { route: '/update-password', name: 'Update Password' },
  { route: '/onboarding', name: 'Onboarding' },
  { route: '/dashboard', name: 'Dashboard Home' },
  { route: '/dashboard/ecqo-sound', name: 'Dashboard — ECQO Sound Player' },
  { route: '/dashboard/affirmations', name: 'Dashboard — Affirmations' },
  { route: '/dashboard/assessment', name: 'Dashboard — Assessment' },
  { route: '/dashboard/billing', name: 'Dashboard — Billing' },
  { route: '/dashboard/community', name: 'Dashboard — Community' },
  { route: '/dashboard/sessions', name: 'Dashboard — Sessions' },
  { route: '/dashboard/voice', name: 'Dashboard — Voice' },
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

function slugify(route) {
  if (route === '/') return 'home';
  return route.replace(/^\//, '').replace(/\//g, '-').replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/-$/, '');
}

async function captureScreenshot(page, route, seq, name) {
  const seqStr = String(seq).padStart(2, '0');
  const filename = `${seqStr}-${slugify(route)}.png`;
  const filepath = path.resolve(SCREENSHOTS_DIR, filename);
  const url = `${BASE_URL}${route}`;

  const result = { sequence: seq, route, name, screenshot: filename, section: route.startsWith('/admin') ? 'admin' : route.startsWith('/dashboard') ? 'dashboard' : 'authenticated', status: 'captured', notes: '' };

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    const statusCode = response?.status() || 0;
    const finalPath = new URL(page.url()).pathname;

    if (finalPath !== route && !finalPath.startsWith(route)) {
      result.notes += `Redirected to ${finalPath}. `;
      result.status = 'redirect';
    }
    if (statusCode === 404) { result.status = '404'; result.notes += '404 Not Found. '; }

    await new Promise((r) => setTimeout(r, 3000));

    const pageText = await page.evaluate(() => document.body?.innerText || '');
    if (pageText.includes('Coming soon') || pageText.includes('coming soon')) result.notes += 'Contains "Coming soon". ';
    if (pageText.trim().length < 50) result.notes += 'Very little content. ';

    const brokenImages = await page.evaluate(() => {
      let broken = 0;
      document.querySelectorAll('img').forEach((img) => { if (img.naturalWidth === 0 && img.src && !img.src.startsWith('data:')) broken++; });
      return broken;
    });
    if (brokenImages > 0) result.notes += `${brokenImages} broken image(s). `;

    await page.screenshot({ path: filepath, fullPage: true });
    result.notes = result.notes.trim() || 'OK';
    console.log(`  ${seqStr}. [${result.status.toUpperCase()}] ${route} — ${result.notes}`);
  } catch (err) {
    result.status = 'error';
    result.notes = err.message.slice(0, 200);
    console.log(`  ${seqStr}. [ERROR] ${route} — ${err.message.slice(0, 100)}`);
    try { await page.screenshot({ path: filepath, fullPage: true }); } catch {}
  }

  return result;
}

async function main() {
  console.log('\n  HERR — Authenticated Pages Screenshot Capture');
  console.log(`  Target: ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: VIEWPORT,
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // ── Login ──────────────────────────────────────────────────────────────────
  console.log('  Logging in...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  const supabaseUrl = ENV.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const loginResult = await page.evaluate(async (url, key, email) => {
    try {
      const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
        body: JSON.stringify({ email, password: 'Herr2026!Secure' }),
      });
      const data = await res.json();
      if (data.access_token) {
        const storageKey = `sb-${url.split('//')[1].split('.')[0]}-auth-token`;
        localStorage.setItem(storageKey, JSON.stringify({
          access_token: data.access_token, refresh_token: data.refresh_token,
          expires_in: data.expires_in, token_type: 'bearer', user: data.user,
        }));
        return { success: true, email: data.user?.email };
      }
      return { success: false, error: data.error_description || data.msg || JSON.stringify(data) };
    } catch (err) { return { success: false, error: err.message }; }
  }, supabaseUrl, supabaseAnonKey, 'mccall.bianca@gmail.com');

  if (loginResult.success) {
    console.log(`  Logged in as ${loginResult.email}\n`);
    // Navigate to dashboard to set cookies
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 3000));
  } else {
    console.log(`  Login FAILED: ${loginResult.error}`);
    console.log('  Continuing anyway...\n');
  }

  // ── Capture ────────────────────────────────────────────────────────────────
  const results = [];
  let seq = 29; // Continue numbering from public screenshots

  for (const p of AUTH_PAGES) {
    const result = await captureScreenshot(page, p.route, seq++, p.name);
    results.push(result);
  }

  await browser.close();

  // ── Update manifest ────────────────────────────────────────────────────────
  const manifestPath = path.resolve(SCREENSHOTS_DIR, 'manifest.json');
  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  }

  // Replace auth entries in existing manifest or append
  const existingPublic = (manifest.pages || []).filter(p => p.sequence <= 28);
  manifest.pages = [...existingPublic, ...results];

  const all = manifest.pages;
  manifest.summary = {
    total_routes: all.length,
    captured: all.filter(r => r.status === 'captured').length,
    redirects: all.filter(r => r.status === 'redirect').length,
    errors: all.filter(r => r.status === 'error').length,
    not_found: all.filter(r => r.status === '404').length,
    missing_content: all.filter(r => r.notes.includes('Coming soon') || r.notes.includes('Very little')).length,
    broken_images: all.filter(r => r.notes.includes('broken image')).map(r => r.route),
    dead_ends: all.filter(r => r.notes.includes('dead-end')).map(r => r.route),
  };
  manifest.generated_at = new Date().toISOString();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\n  ═══ AUTH CAPTURE SUMMARY ═══`);
  console.log(`  Total:     ${results.length}`);
  console.log(`  Captured:  ${results.filter(r => r.status === 'captured').length}`);
  console.log(`  Redirects: ${results.filter(r => r.status === 'redirect').length}`);
  console.log(`  Errors:    ${results.filter(r => r.status === 'error').length}`);
  console.log(`\n  Updated manifest: ${manifestPath}\n`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
