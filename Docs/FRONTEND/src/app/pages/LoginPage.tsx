'use client';

import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { Button } from '../components/ui/button';
import { GlassCard } from '../components/GlassCard';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { isClerkClientConfigured } from '../../lib/clerk-client';

function getPublicAppUrl() {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }

  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  return 'http://localhost:3000';
}

export function LoginPage() {
  if (!isClerkClientConfigured) {
    return <ClerkUnavailablePage />;
  }

  return <ClerkLoginPage />;
}

function ClerkUnavailablePage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <GlassCard className="p-8 md:p-10 text-center relative overflow-hidden backdrop-blur-3xl border-white/10 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#2563EB]/20 rounded-full blur-[60px]" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#6D5EF3]/20 rounded-full blur-[60px]" />

          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-secondary)' }}>
              Acceso en configuración
            </h1>
            <p className="text-white/60 text-sm">
              Este despliegue ya incluye la migración a Clerk, pero Vercel todavía no tiene las claves de Clerk
              configuradas.
            </p>

            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-left">
              <p className="text-sm font-semibold text-white">Qué falta para habilitar el login</p>
              <p className="mt-2 text-xs text-white/70">
                Agrega `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` en Vercel para activar el acceso con Google.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function ClerkLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const clerk = useClerk();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    const redirectTo = new URL('/sso-callback', getPublicAppUrl()).toString();
    const redirectToComplete = new URL('/auth/complete', getPublicAppUrl()).toString();

    setIsLoading(true);
    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: redirectTo,
        redirectUrlComplete: redirectToComplete,
      });
    } catch (error: any) {
      toast.error('Error con Google: ' + (error?.errors?.[0]?.longMessage ?? error?.message ?? 'No fue posible iniciar sesión.'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <GlassCard className="p-8 md:p-10 text-center relative overflow-hidden backdrop-blur-3xl border-white/10 shadow-2xl">
          {/* Blobs de fondo decorativos */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#2563EB]/20 rounded-full blur-[60px]" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#6D5EF3]/20 rounded-full blur-[60px]" />

          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-secondary)' }}>
              Bienvenido
            </h1>
            <p className="text-white/60 mb-8 text-sm">Bienvenido de nuevo a tu espacio profesional</p>

            <div className="mb-6 rounded-2xl border border-[#2563EB]/20 bg-[#2563EB]/10 px-4 py-3 text-left">
              <p className="text-sm font-semibold text-white">Google es el acceso principal en esta versión.</p>
              <p className="mt-1 text-xs text-white/60">
                Al entrar con Google te pediremos escoger si quieres continuar como empresa o consultor.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-6 text-base bg-white/5 text-white border border-white/10 hover:bg-white/10 flex items-center justify-center gap-3 rounded-xl transition-all"
            >
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className="w-5 h-5"
              />
              <span className="text-sm font-semibold">{isLoading ? 'Redirigiendo...' : 'Google'}</span>
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
