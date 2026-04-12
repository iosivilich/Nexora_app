import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const empresaId = searchParams.get('empresa_id');

  try {
    let query = supabaseAdmin.from('desafio').select('*').order('created_at', { ascending: false });
    if (empresaId) query = query.eq('id_empresa', empresaId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.titulo || !body.descripcion || !body.id_empresa) {
      return NextResponse.json({ error: 'titulo, descripcion e id_empresa requeridos' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('desafio')
      .insert([{
        titulo: body.titulo,
        descripcion: body.descripcion,
        id_empresa: body.id_empresa,
        estado: 'abierto',
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
