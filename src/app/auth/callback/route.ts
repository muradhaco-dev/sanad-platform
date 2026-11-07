import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  let redirectTarget = '/dashboard';

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.session?.user) {
        const user = data.session.user;
        const role = user.user_metadata?.role;
        if (role === 'vendor') {
          redirectTarget = '/vendor';
        } else if (role === 'admin') {
          redirectTarget = '/admin';
        }
      }
    } catch (err) {
      console.error('Error exchanging confirmation code:', err);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}${redirectTarget}`);
}
