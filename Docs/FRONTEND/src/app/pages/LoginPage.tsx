'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { GlassCard } from '../components/GlassCard';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Building2, Briefcase } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [userType, setUserType] = useState<'EMPRESA' | 'CONSULTOR' | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const normalizeCity = (val: string) => {
    return val
      .trim()
      .split(/[\s-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      if (!fullName || !city || !userType) {
        toast.error('Por favor, completa todos los campos obligatorios.');
        return;
      }
    }

    setIsLoading(true);
    const normalizedCity = normalizeCity(city);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              city: normalizedCity,
              user_type: userType,
            }
          }
        });
        if (error) throw error;
        toast.success('¡Registro exitoso! Revisa tu correo por favor.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('¡Bienvenido de nuevo!');
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error en la autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error('Error con Google: ' + error.message);
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
              {isSignUp ? 'Únete a Nexora' : 'Bienvenido'}
            </h1>
            <p className="text-white/60 mb-8 text-sm">
              {isSignUp ? 'Completa tu perfil estratégico' : 'Bienvenido de nuevo a tu espacio profesional'}
            </p>
            
            <form onSubmit={handleEmailAuth} className="space-y-4 text-left mb-8">
              {isSignUp && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white/80 ml-1 font-semibold text-xs uppercase tracking-wider">Nombre Completo *</Label>
                    <Input
                      id="fullName"
                      placeholder="Ej: Carlos Ruiz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={isSignUp}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl focus:border-[#2563EB]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white/80 ml-1 font-semibold text-xs uppercase tracking-wider">Ciudad *</Label>
                    <Input
                      id="city"
                      placeholder="Ej: Madrid"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required={isSignUp}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl focus:border-[#2563EB]/50"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80 ml-1 font-semibold text-xs uppercase tracking-wider text-left">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl focus:border-[#2563EB]/50"
                />
              </div>

              {isSignUp && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-700">
                  <Label className="text-white/80 ml-1 font-semibold text-xs uppercase tracking-wider block">¿Cuál es tu rol? *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserType('EMPRESA')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 group ${
                        userType === 'EMPRESA' 
                          ? 'bg-[#2563EB]/20 border-[#2563EB] text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <Building2 className={`w-6 h-6 transition-colors ${userType === 'EMPRESA' ? 'text-[#2563EB]' : 'group-hover:text-white'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Soy Empresa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('CONSULTOR')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 group ${
                        userType === 'CONSULTOR' 
                          ? 'bg-[#6D5EF3]/20 border-[#6D5EF3] text-white shadow-[0_0_20px_rgba(109,94,243,0.2)]' 
                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <Briefcase className={`w-6 h-6 transition-colors ${userType === 'CONSULTOR' ? 'text-[#6D5EF3]' : 'group-hover:text-white'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Soy Consultor</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1 leading-none">
                  <Label htmlFor="password" className="text-white/80 font-semibold text-xs uppercase tracking-wider">Contraseña *</Label>
                  {!isSignUp && (
                    <button type="button" className="text-[10px] text-[#2563EB] hover:underline font-bold uppercase tracking-widest">
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl focus:border-[#2563EB]/50"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 text-lg bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white hover:opacity-90 rounded-xl transition-all shadow-xl font-bold mt-4 border-0"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  isSignUp ? 'Crear mi cuenta' : 'Ingresar'
                )}
              </Button>
            </form>

            <div className="relative flex items-center gap-4 mb-8">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">o continúa con Google</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-6 text-base bg-white/5 text-white border border-white/10 hover:bg-white/10 flex items-center justify-center gap-3 rounded-xl transition-all"
            >
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className="w-5 h-5"
              />
              <span className="text-sm font-semibold">Google</span>
            </Button>

            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-sm text-white/60">
                {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setUserType(null);
                  }}
                  className="ml-2 text-[#2563EB] font-bold hover:underline"
                >
                  {isSignUp ? 'Inicia sesión' : 'Regístrate aquí'}
                </button>
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
