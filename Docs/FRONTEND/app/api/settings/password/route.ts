import { NextResponse } from 'next/server';
import { updateUserPassword } from '../../../../src/lib/backend-data';

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      profileId?: string;
      newPassword?: string;
    };

    if (!body.profileId || !body.newPassword) {
      return NextResponse.json(
        { error: 'profileId y newPassword son obligatorios.' },
        { status: 400 },
      );
    }

    if (body.newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 8 caracteres.' },
        { status: 400 },
      );
    }

    const result = await updateUserPassword(body.profileId, body.newPassword);
    return NextResponse.json(result);
  } catch (error) {
    console.error('PUT /api/settings/password failed', error);
    return NextResponse.json(
      { error: 'No pudimos cambiar la contraseña del usuario.' },
      { status: 500 },
    );
  }
}
