import { NextResponse } from 'next/server';
import { getAuthenticatedContext, updateUserPassword } from '../../../../src/lib/backend-data';

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : 500;
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      newPassword?: string;
    };

    if (!body.newPassword) {
      return NextResponse.json(
        { error: 'newPassword es obligatorio.' },
        { status: 400 },
      );
    }

    if (body.newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 8 caracteres.' },
        { status: 400 },
      );
    }

    const context = await getAuthenticatedContext();
    const result = await updateUserPassword(context.user.id, body.newPassword);
    return NextResponse.json(result);
  } catch (error) {
    console.error('PUT /api/settings/password failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos cambiar la contraseña del usuario.' },
      { status: getErrorStatus(error) },
    );
  }
}
