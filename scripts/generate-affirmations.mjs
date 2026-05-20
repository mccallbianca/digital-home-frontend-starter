#!/usr/bin/env node
/**
 * ECQO HERR — Affirmation Template Library generator.
 * Per WS1 + WS2 + WS3 + WS4 + WS6 fidelity.
 *
 * Approach:
 *   1. Build the (mode, domain, tier, week, variant, cultural) cell matrix,
 *      gating mortality and identity per WS2 6.4 and restricting elevated
 *      disruption to healing-only.
 *   2. For each cell, call Claude Sonnet 4.6 with an ARAI-structured prompt
 *      that bakes in WS2 risk-tier restrictions, WS3 10-category injury
 *      filter, and WS4 "never say" prohibitions.
 *   3. Self-screen the returned JSON for WS1/WS2/WS3/WS4 compliance flags
 *      before marking each verified.
 *   4. Stream successes to a local JSONL file for resumability.
 *   5. After all cells generated, bulk INSERT via supabase-js.
 *
 * Resume:  node scripts/generate-affirmations.mjs --resume
 * Dry-run: node scripts/generate-affirmations.mjs --dry-run --max=5
 */

import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { existsSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: '.env.local', override: true });

const OUT_PATH = 'scripts/.affirmations-generated.jsonl';
const FAIL_PATH = 'scripts/.affirmations-failed.jsonl';
const MODEL = 'claude-sonnet-4-6';
const PARALLEL = 6;          // concurrent Anthropic calls
const MAX_RETRIES = 2;
const ARGS = new Set(process.argv.slice(2));
const DRY_RUN = ARGS.has('--dry-run');
const RESUME = ARGS.has('--resume');
const MAX_FLAG = [...ARGS].find(a => a.startsWith('--max='));
const MAX_CELLS = MAX_FLAG ? parseInt(MAX_FLAG.split('=')[1], 10) : null;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* ── Coverage axes ─────────────────────────────────────────── */

const MODES = ['workout','driving','sleep','morning','deepwork','lovefamily','abundance','healing'];
const DOMAINS = ['mortality','meaning','connection','freedom','identity','guilt','spiritual'];
const TIERS = ['low_concern','moderate_unease','elevated_disruption'];
const WEEKS = [1,2,3,4];
const CULTURAL = ['default','black','latino','indigenous','lgbtq','neurodivergent','collectivist','athlete'];

/* ── Mode reference per WS2 6.5 ────────────────────────────── */

const MODE_REF = {
  workout:    { duration: [300, 900],  cadence: 'commanding rhythmic',                example: "I AM power. I AM discipline. I AM the one who shows up when it's hard." },
  driving:    { duration: [600, 1800], cadence: 'conversational reflective',         example: "I AM someone who uses this time to remember who I am. I AM clear. I AM moving toward something that matters." },
  sleep:      { duration: [900, 2700], cadence: 'whisper-adjacent slow repetitive',  example: "I AM safe in this moment. I AM allowed to rest. I AM becoming who I was always meant to be." },
  morning:    { duration: [300, 600],  cadence: 'energizing intentional',            example: "Today I AM choosing purpose. Today I AM enough. Today I AM exactly where I need to be." },
  deepwork:   { duration: [600, 1200], cadence: 'minimal ambient confident',         example: "I AM focused. I AM capable. My mind is clear and my work matters." },
  lovefamily: { duration: [300, 900],  cadence: 'warm tender relational',            example: "I AM present for the people who need me. I AM love in action. I AM worthy of the love I receive." },
  abundance:  { duration: [300, 900],  cadence: 'authoritative scarcity-disrupting', example: "I AM building wealth with intention. I AM worthy of financial freedom. Money flows toward me because I am disciplined." },
  healing:    { duration: [900, 1800], cadence: 'slowest trauma-informed grounding', example: "I AM healing at my own pace. I AM not what happened to me. I AM the one who survived and I AM still here." },
};

/* ── Frequency tier mapping (WS6) ──────────────────────────── */

function weekToFrequency(week) {
  if (week <= 2) return { tier: 'low',    hz: [174, 285],                emotional_tone: 'embodied grounding gentle reprogramming', brainwave: 'delta/theta' };
  if (week === 3) return { tier: 'median', hz: [396, 417, 432],          emotional_tone: 'expansion integration agency',           brainwave: 'theta/alpha border' };
  return            { tier: 'high',   hz: [528, 639, 741, 852, 963], emotional_tone: 'activation manifestation expanded consciousness', brainwave: 'alpha/beta' };
}

/* ── WS2 6.4 gating ─────────────────────────────────────────
   - mortality content allowed only in low_concern
   - identity-CHALLENGE content prohibited in moderate/elevated;
     identity-AFFIRMATION (low) is permitted everywhere.
     We gate identity domain conservatively per spec: not generated
     in moderate_unease or elevated_disruption.
   - elevated_disruption tier is healing-mode-only.
   ────────────────────────────────────────────────────────────── */

function cellAllowed(mode, domain, tier) {
  if (tier !== 'low_concern' && domain === 'mortality') return false;
  if (tier !== 'low_concern' && domain === 'identity')  return false;
  if (tier === 'elevated_disruption' && mode !== 'healing') return false;
  return true;
}

/* ── Build cell matrix ──────────────────────────────────────
   Base variants per (mode, domain, tier, week, cultural=default): 2
   Cultural variants: top 20% of cells × 7 non-default cultural routings × 1 variant.
   "Top 20%" = healing across all (domain, tier, week) + workout low_concern
   meaning. That gives concrete, defensible cultural coverage without
   overcommitting on cells that need the most clinical care. */

function isTopCellForCultural(cell) {
  if (cell.mode === 'healing') return true;
  if (cell.mode === 'sleep' && cell.tier === 'moderate_unease') return true;
  if (cell.mode === 'workout' && cell.domain === 'meaning' && cell.tier === 'low_concern') return true;
  if (cell.mode === 'morning' && cell.domain === 'meaning' && cell.tier === 'low_concern') return true;
  return false;
}

function buildCells() {
  const cells = [];
  for (const mode of MODES) {
    for (const domain of DOMAINS) {
      for (const tier of TIERS) {
        if (!cellAllowed(mode, domain, tier)) continue;
        for (const week of WEEKS) {
          // default (cultural_routing='default') gets 2 variants
          for (let variant = 1; variant <= 2; variant++) {
            cells.push({ mode, domain, tier, week, variant, cultural: 'default' });
          }
          // top-20% cells get 1 variant per non-default cultural routing
          const top = isTopCellForCultural({ mode, domain, tier, week });
          if (top) {
            for (const cult of CULTURAL) {
              if (cult === 'default') continue;
              cells.push({ mode, domain, tier, week, variant: 1, cultural: cult });
            }
          }
        }
      }
    }
  }
  return cells;
}

/* ── Cultural framing guidance per WS6 ─────────────────────── */

const CULTURAL_FRAMING = {
  default:        '',
  black:          'Frame meaning through communal contribution, lineage, and legacy. Reference resilience without trauma-mining. No tokenizing language.',
  latino:         'Frame meaning through familismo — family-anchored identity. The user may rest in being a daughter, son, sibling, parent, tia, or tio. Spanish words allowed sparingly only if natural to the phrase ("mi gente", "familia"); no translation gymnastics.',
  indigenous:     'Frame meaning through land, ancestors, and community survival. Honor that identity preceded the user and continues beyond them. No specific tribal references — generic but grounded.',
  lgbtq:          'Frame identity through chosen family, self-determination, and the right to define oneself. Affirm bodily and pronoun autonomy implicitly. No outing framing.',
  neurodivergent: 'Frame identity through unmasking, sensory regulation, and authentic self-expression. Honor that the user may have spent decades performing neurotypicality. No "overcoming" language.',
  collectivist:   'Frame meaning through role in family and community as primary. The "I" exists as part of a larger "we". Avoid Western individualist self-actualization framing.',
  athlete:        'Frame identity through embodied performance, discipline, and capacity to do hard things on demand. Reference body wisdom and competitive history without locking identity to current performance.',
};

/* ── ARAI structured generation prompt ─────────────────────── */

function buildPrompt(cell) {
  const freq = weekToFrequency(cell.week);
  const ref = MODE_REF[cell.mode];
  const cultural = CULTURAL_FRAMING[cell.cultural];

  const tierGuidance = {
    low_concern:        'LOW CONCERN tier — aspirational, energizing, full existential range. Standard length. Wellness-optimization posture.',
    moderate_unease:    'MODERATE UNEASE tier — grounding first then aspirational. "I AM safe" before "I AM powerful". Slightly shorter. More repetition for nervous-system regulation. NO mortality content. NO identity-challenge content. NO high-activation if mode is Sleep or Healing.',
    elevated_disruption:'ELEVATED DISRUPTION tier — regulated, gentle, safety-focused. Minimal — present-moment safety and self-compassion only. Abbreviated (max ~3 min, ~150 words). NO mortality. NO identity challenge. NO aspirational content. Healing mode only.',
  }[cell.tier];

  const domainPosture = {
    mortality:  'Death and Mortality. Yalom\'s framing — acceptance of finitude as ground for meaning. Never dramatize. Honor what feels delicate.',
    meaning:    'Meaning and Meaninglessness. Anchor in user\'s named values + defining achievement, not abstract purpose-seeking.',
    connection: 'Isolation and Connection. Affirm the user is not alone in the human experience. Do not promise specific relational outcomes.',
    freedom:    'Freedom, Choice, Responsibility. Yalom\'s framing — freedom carries weight; affirm the user\'s agency without minimizing the difficulty of choice.',
    identity:   'Identity and Authenticity. Affirm the user\'s self-language. Never challenge identity.',
    guilt:      'Existential guilt — failing to fulfill one\'s potential. NOT religious guilt or shame. Frame as honest self-compassion and repair-without-punishment.',
    spiritual:  'Spiritual or Transcendent Experience. Delicate — DO NOT ENDORSE OR CHALLENGE any specific belief system. Stay at the level of "what is sacred to the user" without naming what that is.',
  }[cell.domain];

  const slots = pickSlots(cell);

  const reqLength = cell.tier === 'elevated_disruption' ? '120-160 words total across the 4 ARAI sections'
                  : cell.mode === 'sleep' ? '180-260 words'
                  : cell.mode === 'healing' ? '170-240 words'
                  : cell.mode === 'driving' ? '140-200 words'
                  : '110-170 words';

  return `You are generating a single ECQO HERR I AM declaration template for the ECQO clinical wellness system. The template uses identity-anchor placeholder slots that will be filled per user at runtime.

╔══ MANDATORY OUTPUT STRUCTURE — ARAI ARC (WS4) ══╗
Return ONLY a valid JSON object, no preamble, no markdown fence:

{
  "arai_acknowledge": "...",   // Validate the user's lived experience. 1-3 sentences.
  "arai_reflect":     "...",   // Mirror what's true with clinical precision. 1-3 sentences. Use the user's anchor slots here.
  "arai_anchor":      "...",   // Ground in existential truth or protective factor. 1-3 sentences.
  "arai_invite":      "...",   // Offer next step without coercion. 1-2 sentences. Use {aspirational_phrase} if appropriate.
  "full_template_text": "..."  // The 4 sections joined into one continuous template the way a member would hear it. Slots remain as {slot_name} placeholders.
}

╔══ CELL PARAMETERS ══╗
Activity mode:        ${cell.mode}  (cadence: ${ref.cadence})
Existential domain:   ${cell.domain}  — ${domainPosture}
Risk tier:            ${cell.tier}  — ${tierGuidance}
Week of month:        ${cell.week}  (frequency tier: ${freq.tier}, ${freq.hz.join('Hz + ')}Hz, ${freq.brainwave} brainwave)
Cultural routing:     ${cell.cultural}${cultural ? '\n                      ' + cultural : ''}
Variant index:        ${cell.variant} (generate genuinely different wording from variant 1 even on the same cell)
Target length:        ${reqLength}

╔══ AVAILABLE PLACEHOLDER SLOTS ══╗
Use ONLY these. Compose at least 2 into the template. Fewer is acceptable for elevated_disruption.
${slots.map(s => '  {' + s + '}').join('\n')}

╔══ WS2 REFERENCE I AM EXAMPLE FOR THIS MODE ══╗
"${ref.example}"

╔══ WS3 PSYCHOLOGICAL INJURY GUARDRAILS (ALL MUST PASS) ══╗
1. Retraumatization — no probing trauma details. Trauma-informed language only.
2. Suicidal Contagion — zero suicidal content. No method discussion. No normalization.
3. Identity Destabilization — never challenge identity. Affirm autonomy.
4. Dependency Formation — no language suggesting HERR replaces human connection.
5. Discrimination-Induced Harm — cultural responsiveness mandatory.
6. Existential Deterioration — no content that deepens existential distress.
7. Spiritual Injury — never endorse or challenge religious / spiritual beliefs.
8. Grief Complication — validate without rushing. No stage-model imposition.
9. Autonomy Violation — preserve user agency in all declarations.
10. Data-Mediated Harm — no language assuming sharing of user data.

╔══ WS4 — PHRASES YOU MUST NEVER USE ══╗
- "Everything will be okay"     (false reassurance)
- "I understand how you feel"   (impossible claim for AI)
- "You should..."               (directive)
- "Calm down"                   (invalidating)
- "It's not that bad"           (minimizing)
- Any solution-offering during crisis
- Any HERR product / commercial language

╔══ STYLE ══╗
- Voice: first person, "I AM" anchored. Member speaks the words to themselves.
- Tone: per the cadence + tier + cultural framing above. Warm, never clinical-cold.
- Slots stay as {slot_name} placeholders in the text — do not invent slot values yourself.
- Lowercase 'i am' at sentence starts is allowed if it serves the cadence; uppercase is the default.

GENERATE THE JSON NOW.`;
}

/* ── Slot selection per (mode, domain) ─────────────────────── */

function pickSlots(cell) {
  const ALL = ['self_word_1','self_word_2','self_word_3','core_value_1','core_value_2','defining_achievement_language','aspirational_phrase','relational_identity'];
  if (cell.mode === 'lovefamily') return ['relational_identity','self_word_1','core_value_1','aspirational_phrase'];
  if (cell.mode === 'workout')    return ['self_word_1','self_word_2','core_value_1','defining_achievement_language'];
  if (cell.mode === 'morning')    return ['self_word_1','self_word_2','self_word_3','core_value_1','aspirational_phrase'];
  if (cell.mode === 'sleep')      return ['self_word_1','self_word_2','core_value_1'];
  if (cell.mode === 'healing')    return ['self_word_1','self_word_2','core_value_1'];
  if (cell.mode === 'abundance')  return ['core_value_1','core_value_2','defining_achievement_language','aspirational_phrase'];
  if (cell.mode === 'deepwork')   return ['self_word_1','core_value_1','defining_achievement_language'];
  return ALL.slice(0, 5);
}

/* ── Clinically-safe fallback slot values ──────────────────── */

function fallbackValues(slots) {
  const base = {
    self_word_1: 'steady',
    self_word_2: 'present',
    self_word_3: 'becoming',
    core_value_1: 'integrity',
    core_value_2: 'care',
    defining_achievement_language: 'showed up for what mattered',
    aspirational_phrase: 'lives with intention',
    relational_identity: 'someone who shows up with love',
  };
  return Object.fromEntries(slots.map(s => [s, base[s]]));
}

/* ── Self-screening (WS1 / WS2 / WS3 / WS4) ────────────────── */

const NEVER_PHRASES = [
  'everything will be okay',
  'i understand how you feel',
  'you should',
  'calm down',
  "it's not that bad",
  'it is not that bad',
];

const INJURY_PATTERNS = [
  /\b(kill (yourself|myself)|suicide|suicidal|end (it|my) life)\b/i,                  // suicidal_contagion
  /\b(you are (not|nothing) (without|unless))\b/i,                                    // identity_destabilization (challenge)
  /\b(only HERR can|HERR replaces|HERR is your|instead of (talking to|seeing) (a|your) (therapist|friend|family))\b/i, // dependency_formation
  /\b(your (god|jesus|allah|buddha|spirit) (is|wants|demands))\b/i,                    // spiritual_injury (endorse)
  /\b(there is no (god|higher power))\b/i,                                            // spiritual_injury (challenge)
  /\b(you (should|need to) (move on|get over|let go of))\b/i,                          // grief_complication
];

function screen(t) {
  const all = ((t.arai_acknowledge||'') + ' ' + (t.arai_reflect||'') + ' ' + (t.arai_anchor||'') + ' ' + (t.arai_invite||'') + ' ' + (t.full_template_text||'')).toLowerCase();

  const has = (s) => all.includes(s);

  // WS3 — 10-category injury screen
  const ws3_clean =
    !NEVER_PHRASES.some(has) &&
    !INJURY_PATTERNS.some(re => re.test(all));

  // WS4 — ARAI structure complete
  const ws4_clean =
    !!(t.arai_acknowledge && t.arai_reflect && t.arai_anchor && t.arai_invite && t.full_template_text) &&
    t.full_template_text.length >= 60 &&
    !NEVER_PHRASES.some(has);

  // WS2 — risk tier content restrictions
  const ws2_clean = (() => {
    if (t.risk_tier === 'low_concern') return true;
    // moderate + elevated: no mortality words
    const mortalityWords = /\b(death|dying|mortality|grave|coffin)\b/i.test(all);
    if (mortalityWords && t.existential_domain !== 'mortality') return false;
    if (t.risk_tier === 'elevated_disruption') {
      // word ceiling
      if (t.word_count > 200) return false;
    }
    return true;
  })();

  // WS1 — domain alignment (does template touch the domain keyword family?)
  const ws1_clean = (() => {
    const domainAnchors = {
      mortality:  /\b(time|finite|moment|breath|here|present|legacy)\b/i,
      meaning:    /\b(matter|purpose|value|meaning|reason|why|here for)\b/i,
      connection: /\b(belong|seen|known|together|alone|connected|love)\b/i,
      freedom:    /\b(choose|choice|free|allowed|agency|step|move)\b/i,
      identity:   /\b(I AM|i am|self|who I am|true self)\b/,
      guilt:      /\b(enough|forgive|done|tried|imperfect|repair)\b/i,
      spiritual:  /\b(sacred|holy|larger|beyond|presence|reverent|hold)\b/i,
    };
    return domainAnchors[t.existential_domain].test(all);
  })();

  return { ws1_clean, ws2_clean, ws3_clean, ws4_clean };
}

/* ── Anthropic call w/ retry ───────────────────────────────── */

async function generateOne(cell, attempt = 1) {
  const prompt = buildPrompt(cell);
  let raw;
  try {
    const r = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1100,
      messages: [{ role: 'user', content: prompt }],
    });
    raw = r.content?.[0]?.text || '';
  } catch (e) {
    if (attempt <= MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 1500 * attempt));
      return generateOne(cell, attempt + 1);
    }
    throw new Error(`api: ${e.message}`);
  }

  // Strip markdown fences if Claude returned ```json
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    if (attempt <= MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 1500 * attempt));
      return generateOne(cell, attempt + 1);
    }
    throw new Error(`json: failed to parse output`);
  }

  const slots = pickSlots(cell);
  const fallback = fallbackValues(slots);
  const freq = weekToFrequency(cell.week);
  const wc = (parsed.full_template_text || '').trim().split(/\s+/).length;
  const durSec = Math.max(60, Math.round(wc / 110 * 60));   // ~110 wpm spoken-affirmation cadence

  const row = {
    activity_mode: cell.mode,
    existential_domain: cell.domain,
    risk_tier: cell.tier,
    week_of_month: cell.week,
    frequency_tier: freq.tier,
    solfeggio_hz: freq.hz,
    emotional_tone: freq.emotional_tone,
    arai_acknowledge: (parsed.arai_acknowledge || '').trim(),
    arai_reflect: (parsed.arai_reflect || '').trim(),
    arai_anchor: (parsed.arai_anchor || '').trim(),
    arai_invite: (parsed.arai_invite || '').trim(),
    full_template_text: (parsed.full_template_text || '').trim(),
    cultural_routing: cell.cultural,
    placeholder_slots: slots,
    fallback_slot_values: fallback,
    word_count: wc,
    duration_estimate_seconds: durSec,
  };
  const screen_result = screen(row);
  row.ws1_domain_alignment_verified = screen_result.ws1_clean;
  row.ws2_compliance_verified = screen_result.ws2_clean;
  row.ws3_safety_screened = screen_result.ws3_clean;
  row.ws4_arai_structure_verified = screen_result.ws4_clean;
  // status: flagged_review if any check failed, else pending_voice
  const allPassed = screen_result.ws1_clean && screen_result.ws2_clean && screen_result.ws3_clean && screen_result.ws4_clean;
  row.status = allPassed ? 'pending_voice' : 'flagged_review';
  return row;
}

/* ── Resume support ────────────────────────────────────────── */

function cellKey(c) { return `${c.mode}|${c.domain}|${c.tier}|${c.week}|${c.variant}|${c.cultural}`; }

function readGeneratedKeys() {
  if (!existsSync(OUT_PATH)) return new Set();
  const set = new Set();
  for (const line of readFileSync(OUT_PATH, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      set.add(`${obj.activity_mode}|${obj.existential_domain}|${obj.risk_tier}|${obj.week_of_month}|${obj._variant}|${obj.cultural_routing}`);
    } catch {}
  }
  return set;
}

/* ── Main ─────────────────────────────────────────────────── */

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY missing in env');
    process.exit(1);
  }

  const cells = buildCells();
  const total = cells.length;
  console.error(`[gen] total cells planned: ${total}`);

  const alreadyDone = RESUME ? readGeneratedKeys() : new Set();
  if (alreadyDone.size) console.error(`[gen] resuming — ${alreadyDone.size} already generated`);

  let pending = cells.filter(c => !alreadyDone.has(cellKey(c)));
  if (MAX_CELLS) pending = pending.slice(0, MAX_CELLS);
  console.error(`[gen] pending to generate: ${pending.length}`);

  if (DRY_RUN) {
    console.error('[gen] DRY RUN — no API calls. Showing first 3 cells:');
    for (const c of pending.slice(0, 3)) console.error(JSON.stringify(c));
    return;
  }

  if (!RESUME && existsSync(OUT_PATH)) {
    writeFileSync(OUT_PATH, '');
  }
  if (!existsSync(FAIL_PATH)) writeFileSync(FAIL_PATH, '');

  let done = 0;
  let failed = 0;

  // Worker pool — PARALLEL concurrent in-flight
  const queue = pending.slice();
  async function worker(id) {
    while (queue.length) {
      const c = queue.shift();
      if (!c) return;
      try {
        const row = await generateOne(c);
        row._variant = c.variant;
        appendFileSync(OUT_PATH, JSON.stringify(row) + '\n');
        done++;
        if (done % 25 === 0 || done === pending.length) {
          console.error(`[gen] worker-${id} progress: ${done}/${pending.length} (${failed} failed)`);
        }
      } catch (e) {
        failed++;
        appendFileSync(FAIL_PATH, JSON.stringify({ cell: c, error: e.message }) + '\n');
        console.error(`[gen] FAIL ${cellKey(c)} — ${e.message}`);
      }
    }
  }

  const t0 = Date.now();
  await Promise.all(Array.from({ length: PARALLEL }, (_, i) => worker(i + 1)));
  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.error(`[gen] done — ${done} generated, ${failed} failed in ${dt}s`);

  // Bulk insert to Supabase
  if (done === 0) {
    console.error('[gen] nothing to insert');
    return;
  }

  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const rows = readFileSync(OUT_PATH, 'utf8').split('\n').filter(Boolean).map(l => {
    const o = JSON.parse(l);
    delete o._variant;
    return o;
  });

  console.error(`[db] inserting ${rows.length} rows in batches of 100…`);
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await supabase.from('affirmation_template_library').insert(batch);
    if (error) {
      console.error(`[db] batch ${i / 100 + 1} failed:`, error.message);
      // Don't abort — log and continue. Individual rows may have specific issues.
    } else {
      inserted += batch.length;
    }
  }
  console.error(`[db] inserted ${inserted}/${rows.length} rows`);
}

main().catch(e => { console.error(e); process.exit(1); });
