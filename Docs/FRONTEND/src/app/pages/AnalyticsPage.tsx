'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users, Briefcase, Eye, Star, Activity } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { fetchAnalytics } from '../../lib/api';
import type { AnalyticsStats } from '../../lib/backend-types';

const emptyStats: AnalyticsStats = {
  profileViews: 0,
  newConnections: 0,
  activeProjects: 0,
  engagement: 0,
  favoriteConsultants: 0,
  applications: 0,
  note: '',
};

export function AnalyticsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AnalyticsStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !profile) {
      return;
    }

    let active = true;

    fetchAnalytics()
      .then((data) => {
        if (active) {
          setStats(data);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : 'No pudimos cargar analytics.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authLoading, profile]);

  if (authLoading) {
    return null;
  }

  const cards = [
    { title: 'Vistas de Perfil', value: stats.profileViews, icon: Eye, color: 'text-[#2563EB]' },
    { title: 'Nuevas Conexiones', value: stats.newConnections, icon: Users, color: 'text-[#6D5EF3]' },
    { title: 'Proyectos Activos', value: stats.activeProjects, icon: Briefcase, color: 'text-[#22C55E]' },
    { title: 'Engagement', value: `${stats.engagement}%`, icon: TrendingUp, color: 'text-[#f59e0b]' },
    { title: 'Favoritos', value: stats.favoriteConsultants, icon: Star, color: 'text-[#38bdf8]' },
    { title: 'Postulaciones', value: stats.applications, icon: Activity, color: 'text-[#fb7185]' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            Analytics
          </h1>
          <p className="text-lg text-white/70">Métricas reales de tu actividad dentro de Nexora</p>
        </div>

        {error && (
          <GlassCard className="p-6 mb-6 border-red-400/20">
            <p className="text-red-300">{error}</p>
          </GlassCard>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card) => (
            <GlassCard key={card.title} className="p-6">
              <card.icon className={`w-8 h-8 ${card.color} mb-4`} />
              <p className="text-sm text-white/60 mb-2">{card.title}</p>
              <p className="text-3xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                {loading ? '...' : card.value}
              </p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-6 mt-6 border-white/10">
          <p className="text-sm uppercase tracking-widest text-white/40 mb-2">Contexto</p>
          <p className="text-white/70">{loading ? 'Cargando métricas...' : stats.note}</p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
