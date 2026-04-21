const PENDING_AVATAR_KEY = 'nexora.pending-avatar';
const PENDING_AVATAR_TTL_MS = 1000 * 60 * 60 * 6;

export const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type PendingAvatarPayload = {
  fileName: string;
  type: string;
  dataUrl: string;
  email: string | null;
  createdAt: string;
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeEmail(value?: string | null) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed : null;
}

function isExpired(createdAt: string) {
  const createdAtMs = new Date(createdAt).getTime();

  if (Number.isNaN(createdAtMs)) {
    return true;
  }

  return Date.now() - createdAtMs > PENDING_AVATAR_TTL_MS;
}

function readStoredPayload() {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(PENDING_AVATAR_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const payload = JSON.parse(rawValue) as PendingAvatarPayload;

    if (
      typeof payload.fileName !== 'string' ||
      typeof payload.type !== 'string' ||
      typeof payload.dataUrl !== 'string' ||
      typeof payload.createdAt !== 'string'
    ) {
      clearPendingAvatar();
      return null;
    }

    if (isExpired(payload.createdAt)) {
      clearPendingAvatar();
      return null;
    }

    return {
      ...payload,
      email: normalizeEmail(payload.email),
    };
  } catch {
    clearPendingAvatar();
    return null;
  }
}

export function validateAvatarFile(file: File) {
  if (!AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number])) {
    return 'Usa una imagen JPG, PNG o WEBP.';
  }

  if (file.size > AVATAR_MAX_SIZE_BYTES) {
    return 'La foto debe pesar menos de 5 MB.';
  }

  return null;
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('No pudimos leer la imagen seleccionada.'));
    };

    reader.onerror = () => {
      reject(new Error('No pudimos leer la imagen seleccionada.'));
    };

    reader.readAsDataURL(file);
  });
}

export async function storePendingAvatar(file: File, email?: string | null) {
  if (!isBrowser()) {
    return;
  }

  const payload: PendingAvatarPayload = {
    fileName: file.name || 'avatar',
    type: file.type,
    dataUrl: await fileToDataUrl(file),
    email: normalizeEmail(email),
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(PENDING_AVATAR_KEY, JSON.stringify(payload));
}

export function getPendingAvatar(email?: string | null) {
  const payload = readStoredPayload();

  if (!payload) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);
  if (payload.email && normalizedEmail && payload.email !== normalizedEmail) {
    return null;
  }

  return payload;
}

export function clearPendingAvatar() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(PENDING_AVATAR_KEY);
}

export function dataUrlToFile(payload: PendingAvatarPayload) {
  const parts = payload.dataUrl.split(',');
  if (parts.length < 2) {
    throw new Error('La foto pendiente no es valida.');
  }

  const base64 = parts[1];
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], payload.fileName, { type: payload.type });
}
