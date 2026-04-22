import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  if (!userId) return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });

  const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json(data, { status: 200 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  if (!userId) return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });

  try {
    const body = await request.json();
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ full_name: body.full_name, city: body.city, avatar_url: body.avatar_url, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
