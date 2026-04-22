import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabase';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { data, error } = await supabaseAdmin
      .from('consultants')
      .select('*, profiles(id, full_name, avatar_url, city)')
      .eq('id', id)
      .single();

    if (error) throw error;

    const normalized = {
      ...data,
      full_name: data.profiles?.full_name,
      avatar_url: data.profiles?.avatar_url,
      city: data.profiles?.city,
      profiles: undefined,
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
