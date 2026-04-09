import { createClient } from '@/lib/supabase/server';
import MomentsManager from './MomentsManager';

export default async function MomentsAdminPage() {
  const supabase = await createClient();
  const { data: moments } = await supabase
    .from('moment_for_music')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-light text-[var(--herr-white)] mb-8">
        A Moment for Music
      </h1>
      <MomentsManager initialData={moments || []} />
    </div>
  );
}
