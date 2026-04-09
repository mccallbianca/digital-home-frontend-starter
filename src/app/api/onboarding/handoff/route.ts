/**
 * POST /api/onboarding/handoff
 * ==============================
 * Phase 5: Script Generation Handoff
 *
 * Assembles the complete ScriptHandoffData object from all
 * onboarding phases and stores it in the script_handoff table.
 * This is the contract between the intake system and the
 * content generation system (per WS2 Section 6).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { ScriptHandoffData, ActivityMode } from '@/lib/ecqo-config';

interface HandoffRequest {
  userId: string;
  // Phase 2 data
  activeModes: string[];
  primaryMode: string;
  // Phase 3 data
  coreValues: string[];
  definingAchievement: {
    description: string;
    emotional_signature: string;
    identity_language: string;
  };
  significantRelationship?: {
    relationship_type: string;
    quality_of_being_known: string;
    relational_language: string;
  };
  aspirationalIdentity: {
    description: string;
    gap_assessment: string;
    pathway_clarity: string;
  };
  selfLanguageWords: string[];
  // Optional detected context
  communicationStyle?: string;
  improvementLever?: string;
  culturalContext?: {
    self_identified_background: string;
    language_preference: string;
    cultural_values: string;
  };
  athleticBackground?: {
    sport: string;
    level: string;
    transition_status: string;
    identity_fusion_score: number;
  };
  spiritualFramework?: {
    tradition: string;
    active_practice: boolean;
    crisis_status: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: HandoffRequest = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // ── Fetch Phase 1 assessment ────────────────────────────
    const { data: assessment } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!assessment) {
      return NextResponse.json(
        { error: 'No risk assessment found. Complete Phase 1 first.' },
        { status: 400 }
      );
    }

    // ── Fetch safety flags ──────────────────────────────────
    const { data: safetyFlags } = await supabase
      .from('safety_flags')
      .select('trigger_type, source_phase, created_at, resolution')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    // ── Fetch voice consent status ──────────────────────────
    const { data: voiceConsent } = await supabase
      .from('voice_consents')
      .select('consented_at')
      .eq('user_id', userId)
      .single();

    // ── Assemble ScriptHandoffData (Section 6.2 + 6.3) ─────
    const handoffData: ScriptHandoffData = {
      // Required fields
      user_id: userId,
      risk_tier: assessment.risk_tier,
      ecqo_risk_index: assessment.ecqo_risk_index,
      domain_scores: assessment.domain_scores,
      active_modes: (body.activeModes || []) as ActivityMode[],
      primary_mode: (body.primaryMode || body.activeModes?.[0] || 'MORNING') as ActivityMode,
      core_values: body.coreValues || [],
      defining_achievement: body.definingAchievement || {
        description: '',
        emotional_signature: '',
        identity_language: '',
      },
      aspirational_identity: body.aspirationalIdentity || {
        description: '',
        gap_assessment: '',
        pathway_clarity: '',
      },
      self_language_words: body.selfLanguageWords || [],
      consent_status: {
        platform: true,
        voice_clone: !!voiceConsent,
        screening: true,
        data_sharing: true,  // consented during signup
        research: false,     // not yet offered
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      safety_flags: (safetyFlags || []).map((f: any) => ({
        type: f.trigger_type,
        source_phase: f.source_phase,
        timestamp: f.created_at,
        resolution: f.resolution || 'pending',
      })),

      // Optional fields
      ...(body.significantRelationship && {
        significant_relationship: body.significantRelationship,
      }),
      ...(body.culturalContext && {
        cultural_context: body.culturalContext,
      }),
      ...(body.athleticBackground && {
        athletic_background: body.athleticBackground,
      }),
      ...(body.spiritualFramework && {
        spiritual_framework: body.spiritualFramework,
      }),
      ...(body.improvementLever && {
        improvement_lever: body.improvementLever,
      }),
      ...(body.communicationStyle && {
        communication_style: body.communicationStyle as ScriptHandoffData['communication_style'],
      }),
    };

    // ── Save to script_handoff table ────────────────────────
    const { error: upsertError } = await supabase
      .from('script_handoff')
      .upsert({
        user_id: userId,
        handoff_data: handoffData,
        risk_tier: assessment.risk_tier,
        primary_mode: handoffData.primary_mode,
        moderator_cleared: assessment.risk_tier !== 'ELEVATED_DISRUPTION',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('[ECQO Handoff Error]', upsertError);
      return NextResponse.json(
        { error: 'Failed to save handoff data.' },
        { status: 500 }
      );
    }

    // ── Save identity anchors ───────────────────────────────
    await supabase.from('identity_anchors').upsert({
      user_id: userId,
      core_values: body.coreValues || [],
      defining_achievement: body.definingAchievement || null,
      significant_relationship: body.significantRelationship || null,
      aspirational_identity: body.aspirationalIdentity || null,
      self_language_words: body.selfLanguageWords || [],
      cultural_context: body.culturalContext || null,
      athletic_background: body.athleticBackground || null,
      spiritual_framework: body.spiritualFramework || null,
      improvement_lever: body.improvementLever || null,
      communication_style: body.communicationStyle || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    return NextResponse.json({
      success: true,
      risk_tier: assessment.risk_tier,
      primary_mode: handoffData.primary_mode,
      modes_count: handoffData.active_modes.length,
    });

  } catch (error) {
    console.error('[ECQO Handoff Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
