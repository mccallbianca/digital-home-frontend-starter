export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import ProducerQueue from './ProducerQueue';

export default async function ProducersAdminPage() {
  const supabase = await createClient();
  const { data: applications } = await supabase
    .from('producer_applications')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-light text-[var(--herr-white)] mb-8">
        Producer Applications
      </h1>
      <ProducerQueue initialData={applications || []} />
    </div>
  );
}
