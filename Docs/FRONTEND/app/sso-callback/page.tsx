'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { isClerkClientConfigured } from '../../src/lib/clerk-client';

export default function SsoCallbackPage() {
  if (!isClerkClientConfigured) {
    return (
      <main className="min-h-screen bg-[#0A0B14] flex items-center justify-center px-6">
        <div className="max-w-sm rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center text-white">
          <p className="text-sm font-semibold">Clerk no esta configurado en este despliegue.</p>
          <p className="mt-2 text-xs text-white/60">
            Vuelve a `/login` cuando las claves de Clerk esten cargadas en Vercel.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0B14] flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin" />
        <div>
          <p className="text-sm font-semibold text-white">Terminando tu ingreso con Google...</p>
          <p className="mt-1 text-xs text-white/60">Estamos validando tu sesión y preparando tu perfil.</p>
        </div>
      </div>
      <AuthenticateWithRedirectCallback />
    </main>
  );
}
