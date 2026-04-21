'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Users, ArrowRight, Sparkles, Rocket } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { toast } from 'sonner';

interface OnboardingRoleSelectionProps {
  onConfirm: (data: { role: 'EMPRESA' | 'CONSULTOR'; city: string }) => Promise<void>;
}

export function OnboardingRoleSelection({ onConfirm }: OnboardingRoleSelectionProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [city, setCity] = useState('');

  const handleSelect = async (role: 'EMPRESA' | 'CONSULTOR') => {
    if (!city.trim()) {
      toast.error('Por favor, dinos desde qué ciudad nos visitas.');
      return;
    }

    setLoading(role);
    try {
      await onConfirm({ role, city: city.trim() });
      toast.success(`¡Bienvenido a Nexora como ${role === 'EMPRESA' ? 'Empresa' : 'Consultor'}!`);
    } catch (error: any) {
      toast.error('Error al guardar tu información. Por favor intenta de nuevo.');
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-[90vh] py-12 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-[#2563EB]" />
          <span className="text-sm text-white/60 uppercase tracking-widest font-bold">Último Paso</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-secondary)' }}>
          Completa tu Perfil
        </h1>
        <p className="text-lg text-white/60 max-w-xl mx-auto">
          Para conectar con los mejores talentos y empresas, necesitamos estos detalles básicos.
        </p>
      </motion.div>

      <div className="w-full max-w-4xl space-y-12">
        {/* Step 1: City */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-8 max-w-md mx-auto border-white/10">
            <h3 className="text-xl text-white font-bold mb-6 flex items-center gap-3">
              <Rocket className="w-5 h-5 text-[#2563EB]" />
              ¿En qué ciudad te encuentras actualmente?
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej. Bogotá, Medellín, Madrid..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#2563EB]/50 transition-all"
              />
              <div className="absolute top-1/2 right-4 -translate-y-1/2">
                <div className={`w-3 h-3 rounded-full ${city.trim().length > 2 ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-white/10'}`} />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Step 2: Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Option: Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={city.trim() ? { y: -10 } : {}}
          >
            <GlassCard 
              className={`p-8 h-full cursor-pointer transition-all border-2 ${loading === 'EMPRESA' ? 'border-[#2563EB] opacity-70' : 'border-transparent hover:border-white/20'} ${!city.trim() ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              onClick={() => !loading && city.trim() && handleSelect('EMPRESA')}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#6D5EF3] rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-[#2563EB]/40">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
                Busco Talento
              </h2>
              <p className="text-white/60 mb-8">
                Soy una Empresa y busco consultores expertos para resolver retos estratégicos.
              </p>
              <button 
                disabled={!city.trim() || !!loading}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${city.trim() ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-transparent text-white/20 border border-white/5'}`}
              >
                {loading === 'EMPRESA' ? 'Guardando...' : 'Elegir Empresa'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </GlassCard>
          </motion.div>

          {/* Option: Consultant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={city.trim() ? { y: -10 } : {}}
          >
            <GlassCard 
              className={`p-8 h-full cursor-pointer transition-all border-2 ${loading === 'CONSULTOR' ? 'border-[#6D5EF3] opacity-70' : 'border-transparent hover:border-white/20'} ${!city.trim() ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              onClick={() => !loading && city.trim() && handleSelect('CONSULTOR')}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#6D5EF3] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-[#6D5EF3]/40">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
                Ofrezco Experiencia
              </h2>
              <p className="text-white/60 mb-8">
                Soy un Consultor y quiero colaborar con empresas líderes en desafíos del mercado.
              </p>
              <button 
                disabled={!city.trim() || !!loading}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${city.trim() ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-transparent text-white/20 border border-white/5'}`}
              >
                {loading === 'CONSULTOR' ? 'Guardando...' : 'Elegir Consultor'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
