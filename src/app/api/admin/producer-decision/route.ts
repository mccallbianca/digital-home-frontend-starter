export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, decision, adminNotes } = body;

    if (!applicationId || !['approved', 'rejected'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Update application
    const { error: updateError } = await admin
      .from('producer_applications')
      .update({
        status: decision,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('[producer-decision] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update application.' }, { status: 500 });
    }

    // Fetch application for email
    const { data: app } = await admin
      .from('producer_applications')
      .select('email, stage_name, first_name')
      .eq('id', applicationId)
      .single();

    if (app) {
      if (decision === 'approved') {
        await sendEmail({
          to: app.email,
          subject: "Welcome to ECQO Sound — You're In",
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; background: #0A0A0F; color: #F0EEE9;">
              <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin-bottom: 16px;">
                Welcome to ECQO Sound, ${app.first_name}.
              </h1>
              <p style="color: rgba(240,238,233,0.5); line-height: 1.6;">
                Your application to produce for the HERR platform has been approved. Your music will become the delivery mechanism for therapeutic change — original compositions heard by every member in your genre.
              </p>
              <p style="color: rgba(240,238,233,0.5); line-height: 1.6; margin-top: 16px;">
                Our team will reach out within 48 hours with your onboarding packet, genre brief assignments, and production timeline.
              </p>
              <hr style="border: none; border-top: 1px solid rgba(240,238,233,0.08); margin: 32px 0;" />
              <p style="font-size: 12px; color: rgba(240,238,233,0.25);">
                HERR™ by ECQO Holdings™ · h3rr.com
              </p>
            </div>
          `,
        });
      } else {
        await sendEmail({
          to: app.email,
          subject: 'ECQO Sound Application Update',
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; background: #0A0A0F; color: #F0EEE9;">
              <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin-bottom: 16px;">
                Thank you, ${app.first_name}.
              </h1>
              <p style="color: rgba(240,238,233,0.5); line-height: 1.6;">
                We reviewed your application to produce for ECQO Sound. At this time, we're not able to move forward — but this is not a reflection of your talent. Our catalog needs are specific, and timing matters.
              </p>
              <p style="color: rgba(240,238,233,0.5); line-height: 1.6; margin-top: 16px;">
                We encourage you to reapply in the future as our catalog expands into new genres and modes. Keep creating.
              </p>
              <hr style="border: none; border-top: 1px solid rgba(240,238,233,0.08); margin: 32px 0;" />
              <p style="font-size: 12px; color: rgba(240,238,233,0.25);">
                HERR™ by ECQO Holdings™ · h3rr.com
              </p>
            </div>
          `,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[producer-decision]', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
