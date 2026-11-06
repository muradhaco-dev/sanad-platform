import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zwswwsnfcljhxnenjdcf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_1YAT4sxqKqMBGn-z8VgArw_4BEeuaFp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Authentication Helpers
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: {
    role?: 'customer' | 'vendor';
    full_name?: string;
    store_name?: string;
    city?: string;
  }
) {
  const role = metadata?.role || 'customer';
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      data: {
        role: role,
        full_name: metadata?.full_name || email.split('@')[0],
        store_name: metadata?.store_name || (role === 'vendor' ? 'متجر محلي معتمد' : ''),
        city: metadata?.city || 'دمشق',
      },
    },
  });
  return { data, error };
}

export async function verifyEmailOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    },
  });
  return { data, error };
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
