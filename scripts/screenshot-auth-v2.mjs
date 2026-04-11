#!/usr/bin/env node
/**
 * HERR — Screenshot Authenticated Pages (form-based login)
 * Logs in via the actual login form so SSR cookies are set properly.
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

const AUTH_PAGES = [
  { route: '/onboarding', name: 'Onboarding' },
  { route: '/community', name: 'Community' },
  { route: '/affirmations', name: 'Affirmations' },
  { route: '/assessment', name: 'Assessment' },
  { route: '/live-sessions', name: 'Live Sessions' },
  { route: '/my-voice', name: 'My Voice' },
  { route: '/portal', name: 'Member Portal' },
  { route: '/update-password', name: 'Update Password' },
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
  console.log('\n  HERR — Authenticated Pages Screenshot (Form Login)');
  console.log(`  Target: ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: VIEWPORT,
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // ── Login via actual form ──────────────────────────────────────────────────
  console.log('  Navigating to login page...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // Fill in email
  console.log('  Filling login form...');
  const emailInput = await page.$('input[type="email"], input[name="email"]');
  if (emailInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type('mccall.bianca@gmail.com', { delay: 30 });
  } else {
    console.log('  WARNING: Could not find email input');
  }

  // Fill in password
  const passwordInput = await page.$('input[type="password"], input[name="password"]');
  if (passwordInput) {
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.type('Herr2026!Secure', { delay: 30 });
  } else {
    console.log('  WARNING: Could not find password input');
  }

  // Submit
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    console.log('  Submitted login form, waiting for navigation...');

    // Wait for navigation away from /login
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    } catch {
      // May already have navigated
    }
    await new Promise((r) => setTimeout(r, 3000));

    const currentUrl = page.url();
    const currentPath = new URL(currentUrl).pathname;
    console.log(`  Current page after login: ${currentPath}`);

    if (currentPath === '/login') {
      console.log('  WARNING: Still on login page — login may have failed');
      // Take a screenshot of the login page state for debugging
      await page.screenshot({ path: path.resolve(SCREENSHOTS_DIR, 'debug-login-result.png'), fullPage: true });

      // Check for error messages
      const errorText = await page.evaluate(() => {
        const errors = document.querySelectorAll('[role="alert"], .error, .text-red-500, .text-destructive');
        return Array.from(errors).map(e => e.textContent).join(' | ');
      });
      if (errorText) console.log(`  Login errors: ${errorText}`);
    } else {
      console.log('  Login successful!\n');
    }
  } else {
    console.log('  WARNING: Could not find submit button');
  }

  // ── Capture pages ──────────────────────────────────────────────────────────
  const results = [];
  let seq = 29;

  for (const p of AUTH_PAGES) {
    const result = await captureScreenshot(page, p.route, seq++, p.name);
    results.push(result);
  }

  await browser.close();

  // ── Update manifest ────────────────────────────────────────────────────────
  const manifestPath = path.resolve(SCREENSHOTS_DIR, 'manifest.json');
  let manifest = {};
  if (fs.existsSync(manifestPath)) manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

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

  console.log(`\n  ═══ SUMMARY ═══`);
  console.log(`  Total auth pages: ${results.length}`);
  console.log(`  Captured:  ${results.filter(r => r.status === 'captured').length}`);
  console.log(`  Redirects: ${results.filter(r => r.status === 'redirect').length}`);
  console.log(`  Errors:    ${results.filter(r => r.status === 'error').length}`);
  console.log(`\n  Combined manifest (public + auth): ${all.length} pages`);
  console.log(`  Manifest: ${manifestPath}\n`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
