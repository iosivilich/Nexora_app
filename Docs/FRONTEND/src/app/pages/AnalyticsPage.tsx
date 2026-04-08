import { motion } from 'motion/react';
import { TrendingUp, Users, Briefcase, Eye } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            Analytics
          </h1>
          <p className="text-lg text-white/70">
            Métricas y estadísticas de tu actividad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="p-6">
            <TrendingUp className="w-8 h-8 text-[#2563EB] mb-4" />
            <p className="text-sm text-white/60 mb-2">Vistas de Perfil</p>
            <p className="text-3xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>2,547</p>
          </GlassCard>

          <GlassCard className="p-6">
            <Users className="w-8 h-8 text-[#6D5EF3] mb-4" />
            <p className="text-sm text-white/60 mb-2">Nuevas Conexiones</p>
            <p className="text-3xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>142</p>
          </GlassCard>

          <GlassCard className="p-6">
            <Briefcase className="w-8 h-8 text-[#22C55E] mb-4" />
            <p className="text-sm text-white/60 mb-2">Proyectos Activos</p>
            <p className="text-3xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>8</p>
          </GlassCard>

          <GlassCard className="p-6">
            <Eye className="w-8 h-8 text-[#f59e0b] mb-4" />
            <p className="text-sm text-white/60 mb-2">Engagement</p>
            <p className="text-3xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>94%</p>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
}
