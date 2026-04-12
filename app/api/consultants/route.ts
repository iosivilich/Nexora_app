import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const minRating = searchParams.get('minRating');

    let query = supabaseAdmin
      .from('consultants')
      .select('*, profiles(id, full_name, avatar_url, city)')
      .order('rating', { ascending: false });

    if (city) query = query.eq('profiles.city', city);
    if (minRating) query = query.gte('rating', parseFloat(minRating));

    const { data, error } = await query;
    if (error) throw error;

    const normalized = (data || []).map((row: any) => ({
      ...row,
      full_name: row.profiles?.full_name,
      avatar_url: row.profiles?.avatar_url,
      city: row.profiles?.city,
      profiles: undefined,
    }));

    return NextResponse.json(normalized, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
