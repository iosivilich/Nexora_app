'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Calendar, Building2, Rocket, FileText } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { fetchApplications, fetchChallenges, fetchSeedStatus } from '../../lib/api';
import type { ApplicationSummary, ChallengeSummary, SeedStatus } from '../../lib/backend-types';
import { CreateProjectModal } from '../components/CreateProjectModal';

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
  const isConsultant = profile?.userType === 'CONSULTOR';
  const [projects, setProjects] = useState<ChallengeSummary[]>([]);
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [seedStatus, setSeedStatus] = useState<SeedStatus>(emptySeedStatus);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [seedResponse, challengesResponse, applicationsResponse] = await Promise.all([
        fetchSeedStatus(),
        isConsultant ? fetchChallenges() : fetchChallenges({ scope: 'mine' }),
        fetchApplications({}),
      ]);

      setSeedStatus(seedResponse);
      setProjects(challengesResponse.items);
      setApplications(applicationsResponse.items);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'No pudimos cargar la información.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [isConsultant]);

  const visibleChallenges = useMemo(() => (isConsultant ? [] : projects), [isConsultant, projects]);

  const cards = isConsultant
    ? [
        { icon: FileText, title: 'Mis Postulaciones', value: loading ? '...' : String(applications.length) },
        { icon: Briefcase, title: 'Activas', value: loading ? '...' : String(applications.filter((item) => item.status.toLowerCase() !== 'rechazada').length) },
        { icon: Building2, title: 'Empresas Demo', value: loading ? '...' : String(seedStatus.companiesSeeded) },
      ]
    : [
        { icon: Briefcase, title: 'Desafíos Publicados', value: loading ? '...' : String(visibleChallenges.length) },
        { icon: FileText, title: 'Postulaciones Recibidas', value: loading ? '...' : String(applications.length) },
        { icon: Rocket, title: 'Desafíos Activos', value: loading ? '...' : String(visibleChallenges.filter((item) => item.status.toLowerCase() === 'activo').length) },
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
              {isConsultant ? 'Mis Postulaciones' : 'Desafíos Publicados'}
            </h1>
            <p className="text-lg text-white/70">
              {isConsultant ? 'Seguimiento real de tus aplicaciones' : 'Gestión de retos asociados a tu empresa'}
            </p>
          </div>
          {!isConsultant && (
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-blue-500/30 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Rocket className="w-4 h-4" />
              <span>Nuevo Proyecto</span>
            </motion.button>
          )}
        </div>

        {error && (
          <GlassCard className="p-6 mb-8 border-red-400/20">
            <p className="text-red-300">{error}</p>
          </GlassCard>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {cards.map((card) => (
            <GlassCard key={card.title} className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#6D5EF3] flex items-center justify-center">
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/60">{card.title}</p>
                  <p className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                    {card.value}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <GlassCard key={index} className="p-6 h-48 border-white/10" hover={false}>
                <div className="h-full bg-white/5 rounded-2xl" />
              </GlassCard>
            ))}
          </div>
        ) : isConsultant ? (
          <div className="space-y-6">
            {applications.map((application) => (
              <GlassCard key={application.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl text-white mb-2" style={{ fontFamily: 'var(--font-secondary)' }}>
                      {application.challengeTitle ?? `Desafío #${application.challengeId ?? application.id}`}
                    </h3>
                    <p className="text-white/60 mb-3">{application.companyName ?? 'Empresa Nexora'}</p>
                    <p className="text-white/70 mb-4 line-clamp-3">{application.coverLetter}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-white/50">
                      <span>Estado: {application.status}</span>
                      <span>Postulado: {formatPublishedDate(application.appliedAt)}</span>
                      <span>Propuesta: {application.proposedBudget ? `$${application.proposedBudget}` : 'No definida'}</span>
                    </div>
                  </div>
                  <span className="px-4 py-2 rounded-lg text-sm bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">
                    {application.status}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Mis Desafíos
                </h2>
                <span className="text-sm text-white/50">{visibleChallenges.length} publicados</span>
              </div>

              <div className="space-y-6">
                {visibleChallenges.length === 0 ? (
                  <GlassCard className="p-6 border-white/10">
                    <p className="text-white/60">Aún no has publicado desafíos. Crea el primero desde el botón "Nuevo Proyecto".</p>
                  </GlassCard>
                ) : (
                  visibleChallenges.map((project) => (
                    <GlassCard key={project.id} className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
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
                            <span>{project.mode}</span>
                            <span>{project.specialty ?? 'Sin especialidad'}</span>
                            <span>{project.applicantCount ?? 0} postulaciones</span>
                          </div>
                        </div>
                        <span className="px-4 py-2 rounded-lg text-sm bg-[#2563EB]/20 text-[#9CC2FF] border border-[#2563EB]/30">
                          {project.status}
                        </span>
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Postulaciones Recibidas
                </h2>
                <span className="text-sm text-white/50">{applications.length} recibidas</span>
              </div>

              <div className="space-y-6">
                {applications.length === 0 ? (
                  <GlassCard className="p-6 border-white/10">
                    <p className="text-white/60">Todavía no has recibido postulaciones para tus desafíos.</p>
                  </GlassCard>
                ) : (
                  applications.map((application) => (
                    <GlassCard key={application.id} className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                          <h3 className="text-xl text-white mb-2" style={{ fontFamily: 'var(--font-secondary)' }}>
                            {application.challengeTitle ?? `Desafío #${application.challengeId ?? application.id}`}
                          </h3>
                          <p className="text-white/60 mb-3">
                            {application.consultantName ?? 'Consultor Nexora'}
                            {application.consultantEmail ? ` · ${application.consultantEmail}` : ''}
                          </p>
                          <p className="text-white/70 mb-4 line-clamp-3">{application.coverLetter}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-white/50">
                            <span>Estado: {application.status}</span>
                            <span>Recibida: {formatPublishedDate(application.appliedAt)}</span>
                            <span>Propuesta: {application.proposedBudget ? `$${application.proposedBudget}` : 'No definida'}</span>
                          </div>
                        </div>
                        <span className="px-4 py-2 rounded-lg text-sm bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">
                          {application.status}
                        </span>
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {!loading && ((isConsultant && applications.length === 0) || (!isConsultant && visibleChallenges.length === 0 && applications.length === 0)) && (
          <GlassCard className="p-10 mt-8 text-center border-white/10">
            <p className="text-xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
              {isConsultant ? 'Aún no tienes postulaciones reales' : 'Tu empresa aún no tiene desafíos publicados'}
            </p>
            <p className="text-white/60">
              {isConsultant
                ? 'Explora oportunidades desde la pantalla de Explorar y envía tu primera postulación.'
                : 'Publica un nuevo desafío para empezar a recibir postulaciones.'}
            </p>
          </GlassCard>
        )}
      </motion.div>

      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => void loadData()} />
    </div>
  );
}
