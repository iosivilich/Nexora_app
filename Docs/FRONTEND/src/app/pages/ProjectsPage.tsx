import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Calendar, Users, Search, ArrowRight, Building2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { fetchChallenges, fetchSeedStatus } from '../../lib/api';
import type { ChallengeSummary, SeedStatus } from '../../lib/backend-types';

const emptySeedStatus: SeedStatus = {
  companiesSeeded: 0,
  consultantsSeeded: 0,
  ready: false,
  canSeed: false,
  note: '',
};

function formatPublishedDate(value: string | null) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function ProjectsPage() {
  const { profile } = useAuth();
  const isConsultant = profile?.user_type === 'CONSULTOR';
  const [projects, setProjects] = useState<ChallengeSummary[]>([]);
  const [seedStatus, setSeedStatus] = useState<SeedStatus>(emptySeedStatus);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([fetchChallenges(), fetchSeedStatus()])
      .then(([projectsResponse, seedResponse]) => {
        if (active) {
          setProjects(projectsResponse.items);
          setSeedStatus(seedResponse);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : 'No pudimos cargar los desafios.');
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
  }, []);

  if (!loading && projects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard className="p-16 max-w-3xl mx-auto border-white/10 shadow-2xl">
            <div className="w-24 h-24 bg-[#2563EB]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#2563EB]/30">
              {isConsultant ? (
                <Search className="w-10 h-10 text-[#2563EB]" />
              ) : (
                <Briefcase className="w-10 h-10 text-[#2563EB]" />
              )}
            </div>
            <h2 className="text-3xl text-white mb-4 font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
              {isConsultant ? 'Aún no hay desafíos publicados' : 'Tu empresa aún no tiene desafíos activos'}
            </h2>
            <p className="text-lg text-white/50 mb-4">
              La tabla `desafio` ya está conectada al backend de Next.js, pero en Supabase todavía no hay registros visibles.
            </p>
            <p className="text-sm text-[#9CC2FF] mb-10">
              Estado demo actual: {seedStatus.companiesSeeded} empresas y {seedStatus.consultantsSeeded} consultores sincronizados.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/explorar">
                <motion.button
                  className="px-10 py-5 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white rounded-2xl flex items-center justify-center gap-3 mx-auto font-bold shadow-2xl shadow-blue-900/40"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{isConsultant ? 'Explorar Consultores' : 'Explorar Talento'}</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/">
                <motion.button
                  className="px-10 py-5 border border-white/15 text-white rounded-2xl flex items-center justify-center gap-3 mx-auto font-bold hover:bg-white/5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Volver al Inicio</span>
                </motion.button>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
              {isConsultant ? 'Desafíos del Mercado' : 'Desafíos Publicados'}
            </h1>
            <p className="text-lg text-white/70">
              Backend conectado a Supabase a través de la ruta `/api/challenges`
            </p>
          </div>
        </div>

        {error && (
          <GlassCard className="p-6 mb-8 border-red-400/20">
            <p className="text-red-300">{error}</p>
          </GlassCard>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Desafíos Activos</p>
                <p className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  {loading ? '...' : projects.length}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D5EF3] to-[#5b4ed4] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Empresas Demo</p>
                <p className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  {loading ? '...' : seedStatus.companiesSeeded}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Consultores Demo</p>
                <p className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  {loading ? '...' : seedStatus.consultantsSeeded}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <GlassCard key={index} className="p-6 h-48 border-white/10" hover={false}>
                  <div className="h-full bg-white/5 rounded-2xl" />
                </GlassCard>
              ))
            : projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <GlassCard className="p-6 hover:border-[#2563EB]/50 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#6D5EF3] flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl text-white mb-2" style={{ fontFamily: 'var(--font-secondary)' }}>
                              {project.title}
                            </h3>
                            <p className="text-white/70 mb-4">{project.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-white/60">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Publicado {formatPublishedDate(project.publishedAt)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                <span>{project.mode}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col items-center lg:items-end gap-4">
                        <span className="px-4 py-2 rounded-lg text-sm bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">
                          {project.status}
                        </span>
                        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors text-sm">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
        </div>
      </motion.div>
    </div>
  );
}
