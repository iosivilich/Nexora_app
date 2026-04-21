import { NextResponse } from 'next/server';
import {
  getAuthenticatedContext,
  getCurrentProfileDetails,
  updateProfileDetails,
} from '../../../../src/lib/backend-data';

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : 500;
}

export async function GET() {
  try {
    const context = await getAuthenticatedContext();
    const profile = await getCurrentProfileDetails(context);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('GET /api/profile/me failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos cargar el perfil solicitado.' },
      { status: getErrorStatus(error) },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      city?: string;
      avatarUrl?: string;
      userType?: 'EMPRESA' | 'CONSULTOR';
      role?: string;
      bio?: string;
      expertise?: string[];
    };

    const context = await getAuthenticatedContext();

    const profile = await updateProfileDetails({
      profileId: context.user.id,
      fullName: body.fullName,
      city: body.city,
      avatarUrl: body.avatarUrl,
      userType: body.userType,
      role: body.role,
      bio: body.bio,
      expertise: body.expertise,
    }, context.routeClient);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('PUT /api/profile/me failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos actualizar el perfil.' },
      { status: getErrorStatus(error) },
    );
  }
}
