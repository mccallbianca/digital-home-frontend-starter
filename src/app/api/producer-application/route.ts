export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName, lastName, stageName, email,
      genreSpecialties, portfolioUrl, sampleTrackUrl,
      statement, originalityConfirmed,
    } = body;

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !stageName?.trim()) {
      return NextResponse.json({ error: 'Name fields are required.' }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }
    if (!Array.isArray(genreSpecialties) || genreSpecialties.length === 0) {
      return NextResponse.json({ error: 'Select at least one genre.' }, { status: 400 });
    }
    if (!portfolioUrl?.trim()) {
      return NextResponse.json({ error: 'Portfolio URL is required.' }, { status: 400 });
    }
    if (!statement?.trim() || statement.trim().length < 20) {
      return NextResponse.json({ error: 'Statement must be at least 20 characters.' }, { status: 400 });
    }
    if (!originalityConfirmed) {
      return NextResponse.json({ error: 'Originality agreement is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error: dbError } = await supabase.from('producer_applications').insert({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      stage_name: stageName.trim(),
      email: email.trim(),
      genre_specialties: genreSpecialties,
      portfolio_url: portfolioUrl.trim(),
      sample_track_url: sampleTrackUrl || null,
      statement: statement.trim(),
      originality_confirmed: true,
    });

    if (dbError) {
      console.error('[producer-application] DB error:', dbError);
      return NextResponse.json({ error: 'Failed to save application.' }, { status: 500 });
    }

    // Notify Bianca
    await sendEmail({
      to: 'mccall.bianca@gmail.com',
      subject: `New Producer Application — ${stageName} — ${genreSpecialties.join(', ')}`,
      html: `
        <h2>New ECQO Sound Producer Application</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Stage Name:</strong> ${stageName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Genres:</strong> ${genreSpecialties.join(', ')}</p>
        <p><strong>Portfolio:</strong> <a href="${portfolioUrl}">${portfolioUrl}</a></p>
        ${sampleTrackUrl ? `<p><strong>Sample Track:</strong> <a href="${sampleTrackUrl}">${sampleTrackUrl}</a></p>` : ''}
        <p><strong>Statement:</strong></p>
        <blockquote>${statement}</blockquote>
        <hr/>
        <p>Review in <a href="https://h3rr.com/admin/producers">Admin Portal</a></p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[producer-application]', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
