
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, email } = body;

    if (!firstName?.trim()) {
      return NextResponse.json({ error: 'First name is required.' }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error: dbError } = await supabase
      .from('blist_waitlist')
      .upsert(
        { first_name: firstName.trim(), email: email.trim() },
        { onConflict: 'email' }
      );

    if (dbError) {
      console.error('[blist-waitlist] DB error:', dbError);
      return NextResponse.json({ error: 'Failed to join waitlist.' }, { status: 500 });
    }

    // Send confirmation email
    await sendEmail({
      to: email.trim(),
      subject: "You're on The B-LIST",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; background: #0A0A0F; color: #F0EEE9;">
          <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin-bottom: 16px;">
            You're on the list, ${firstName}.
          </h1>
          <p style="color: rgba(240,238,233,0.5); line-height: 1.6;">
            The B-LIST is coming — music, mental health, and movement converging in one place. You'll be the first to know when dates, location, and lineup drop.
          </p>
          <p style="color: rgba(240,238,233,0.5); line-height: 1.6; margin-top: 24px;">
            In the meantime, follow the journey:
          </p>
          <p style="margin-top: 8px;">
            <a href="https://instagram.com/herrbyecqo" style="color: #C42D8E; text-decoration: none;">@herrbyecqo on Instagram</a>
          </p>
          <hr style="border: none; border-top: 1px solid rgba(240,238,233,0.08); margin: 32px 0;" />
          <p style="font-size: 12px; color: rgba(240,238,233,0.25);">
            HERR™ by ECQO Holdings™ · h3rr.com
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[blist-waitlist]', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
