import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getServices } from '@/lib/store';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true);

      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, services: data, source: 'supabase' });
      }
    }

    const services = getServices();
    return NextResponse.json({ success: true, services, source: 'local_store' });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تحميل الخدمات' },
      { status: 500 }
    );
  }
}
