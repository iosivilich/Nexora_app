import { NextResponse } from 'next/server';
import { getAuthenticatedContext, updateProfileDetails } from '@/src/lib/backend-data';
import { createAdminClient } from '@/src/lib/supabase-server';

const AVATAR_BUCKET = 'avatars';
const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const AVATAR_ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : 500;
}

async function ensureAvatarBucket(adminClient: NonNullable<ReturnType<typeof createAdminClient>>) {
  const { data: buckets, error } = await adminClient.storage.listBuckets();

  if (error) {
    throw error;
  }

  const bucket = buckets.find((item) => item.name === AVATAR_BUCKET);

  if (!bucket) {
    const { error: createError } = await adminClient.storage.createBucket(AVATAR_BUCKET, {
      public: true,
      fileSizeLimit: `${AVATAR_MAX_SIZE_BYTES}`,
      allowedMimeTypes: Array.from(AVATAR_ALLOWED_TYPES),
    });

    if (createError) {
      throw createError;
    }

    return;
  }

  if (!bucket.public) {
    const { error: updateError } = await adminClient.storage.updateBucket(AVATAR_BUCKET, {
      public: true,
      fileSizeLimit: `${AVATAR_MAX_SIZE_BYTES}`,
      allowedMimeTypes: Array.from(AVATAR_ALLOWED_TYPES),
    });

    if (updateError) {
      throw updateError;
    }
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAuthenticatedContext();
    const adminClient = createAdminClient();

    if (!adminClient) {
      return NextResponse.json(
        { error: 'La subida de fotos requiere SUPABASE_SERVICE_ROLE_KEY en el servidor.' },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const avatar = formData.get('avatar');

    if (!(avatar instanceof File)) {
      return NextResponse.json(
        { error: 'Debes seleccionar una imagen para continuar.' },
        { status: 400 },
      );
    }

    if (!AVATAR_ALLOWED_TYPES.has(avatar.type)) {
      return NextResponse.json(
        { error: 'Usa una imagen JPG, PNG o WEBP.' },
        { status: 400 },
      );
    }

    if (avatar.size > AVATAR_MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'La foto debe pesar menos de 5 MB.' },
        { status: 400 },
      );
    }

    await ensureAvatarBucket(adminClient);

    const extension = MIME_TO_EXTENSION[avatar.type] ?? 'jpg';
    const basePath = `${context.user.id}/avatar`;
    const filePath = `${basePath}.${extension}`;

    await adminClient.storage.from(AVATAR_BUCKET).remove([
      `${basePath}.jpg`,
      `${basePath}.png`,
      `${basePath}.webp`,
    ]);

    const { error: uploadError } = await adminClient.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, await avatar.arrayBuffer(), {
        contentType: avatar.type,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = adminClient.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

    const profile = await updateProfileDetails(
      {
        profileId: context.user.id,
        avatarUrl: publicUrl,
      },
      context.routeClient,
    );

    const { error: updateUserError } = await context.routeClient.auth.updateUser({
      data: {
        avatar_url: publicUrl,
      },
    });

    if (updateUserError) {
      console.warn('POST /api/profile/avatar could not sync auth metadata', updateUserError);
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('POST /api/profile/avatar failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos subir la foto de perfil.' },
      { status: getErrorStatus(error) },
    );
  }
}
