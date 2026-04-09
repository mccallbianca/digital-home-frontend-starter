import { redirect } from 'next/navigation';

export default function LiveSessionsRedirect() {
  redirect('/dashboard/sessions');
}
