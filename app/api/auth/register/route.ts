import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, city, userType } = body;

    if (!userId || !fullName || !userType) {
      return NextResponse.json({ error: 'userId, fullName y userType son obligatorios' }, { status: 400 });
    }

    if (!['EMPRESA', 'CONSULTOR'].includes(userType)) {
      return NextResponse.json({ error: 'userType debe ser EMPRESA o CONSULTOR' }, { status: 400 });
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        city: city || 'Bogotá',
        user_type: userType,
        updated_at: new Date().toISOString(),
      });

    if (profileError) throw profileError;

    if (userType === 'CONSULTOR') {
      await supabaseAdmin
        .from('consultants')
        .upsert({ id: userId, rating: 5, projects: 0, verified: false });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
