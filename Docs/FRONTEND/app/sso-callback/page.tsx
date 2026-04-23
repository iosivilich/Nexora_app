'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SsoCallbackPage() {
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
