import { NextResponse } from 'next/server';
import { deleteChallenge, getAuthenticatedContext, updateChallenge } from '../../../../src/lib/backend-data';

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : 500;
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return NextResponse.json({ error: 'ID de desafío inválido.' }, { status: 400 });
    }

    const context = await getAuthenticatedContext();
    if (context.profile.user_type !== 'EMPRESA' || !context.companyRecord?.id_empresa) {
      return NextResponse.json({ error: 'Solo una empresa vinculada puede eliminar desafíos.' }, { status: 403 });
    }

    await deleteChallenge(numericId, context.companyRecord.id_empresa, context.routeClient);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/challenges/[id] failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos eliminar el desafío.' },
      { status: getErrorStatus(error) },
    );
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return NextResponse.json({ error: 'ID de desafío inválido.' }, { status: 400 });
    }

    const context = await getAuthenticatedContext();
    if (context.profile.user_type !== 'EMPRESA' || !context.companyRecord?.id_empresa) {
      return NextResponse.json({ error: 'Solo una empresa vinculada puede editar desafíos.' }, { status: 403 });
    }

    const body = (await req.json()) as {
      title?: string;
      description?: string;
      specialty?: string;
      budget?: number | null;
      mode?: string | null;
      status?: string | null;
    };

    const item = await updateChallenge(
      numericId,
      context.companyRecord.id_empresa,
      body,
      context.routeClient,
    );
    return NextResponse.json(item);
  } catch (error) {
    console.error('PATCH /api/challenges/[id] failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos actualizar el desafío.' },
      { status: getErrorStatus(error) },
    );
  }
}
