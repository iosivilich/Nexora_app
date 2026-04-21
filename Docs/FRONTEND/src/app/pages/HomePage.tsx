'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '../components/GlassCard';
import { ConsultantCard } from '../components/ConsultantCard';
import { StatsCard } from '../components/StatsCard';
import {
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  Building2,
  Search,
  Target,
  Rocket,
  HelpCircle,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { fetchDashboard } from '../../lib/api';
import type { DashboardSnapshot } from '../../lib/backend-types';

const emptyDashboard: DashboardSnapshot = {
  consultantCount: 0,
  companyCount: 0,
  verifiedConsultantCount: 0,
  averageRating: 0,
  featuredConsultants: [],
  companies: [],
  topCities: [],
};

export function HomePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardSnapshot>(emptyDashboard);
  const [loading, setLoading] = useState(true);

  const userRole = profile?.userType || profile?.user_type || user?.user_metadata?.user_type;
  const hasRole = !!userRole;
  const isConsultant = userRole === 'CONSULTOR';

  useEffect(() => {
    if (!authLoading && user && !hasRole) {
      router.push('/onboarding');
      return;
    }

    let active = true;
    fetchDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((error) => console.error('Failed to load dashboard', error))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [authLoading, user, hasRole, router]);

  if (authLoading || (user && !hasRole)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isConsultant ? (
        <ConsultantHome dashboard={dashboard} loading={loading} />
      ) : (
        <CompanyHome dashboard={dashboard} loading={loading} />
      )}
    </div>
  );
}

function CompanyHome({
  dashboard,
  loading,
}: {
  dashboard: DashboardSnapshot;
  loading: boolean;
}) {
  const topCity = dashboard.topCities[0];

  return (
    <>
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#2563EB]" />
          <span className="text-sm text-white/60 uppercase tracking-wider">Gestión de Talento Elite</span>
        </div>
        <h1 className="text-4xl lg:text-5xl mb-4 text-white font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
          Encuentra el experto
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#6D5EF3]">
            que tu empresa necesita
          </span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mb-4">
          Accede a una red exclusiva de consultores verificados preparados para resolver los desafíos más complejos de tu organización.
        </p>
        <p className="text-sm text-[#9CC2FF] mb-8">
          Datos activos en Supabase: {dashboard.companyCount} empresas demo y {dashboard.consultantCount} consultores demo.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/explorar">
            <motion.button
              className="px-8 py-4 rounded-xl text-white shadow-2xl shadow-[#2563EB]/50 flex items-center gap-2 font-bold"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #6D5EF3 100%)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Explorar Talento</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <Link href="/proyectos">
            <motion.button
              className="px-8 py-4 rounded-xl border border-white/20 text-white backdrop-blur-xl hover:bg-white/5 transition-colors font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver Desafíos
            </motion.button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <StatsCard
          title="Consultores Activos"
          value={loading ? '...' : String(dashboard.consultantCount)}
          change={loading ? '...' : String(dashboard.verifiedConsultantCount)}
          changeLabel="verificados"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Cobertura de Red"
          value={loading ? '...' : String(dashboard.topCities.length || 1)}
          change={loading ? '...' : topCity ? topCity.city : 'Sin datos'}
          changeLabel="ciudad lider"
          icon={Building2}
          color="purple"
        />
        <StatsCard
          title="Rating Promedio"
          value={loading ? '...' : `${dashboard.averageRating.toFixed(1)}★`}
          change={loading ? '...' : `${dashboard.featuredConsultants.length}`}
          changeLabel="consultores destacados"
          icon={Star}
          color="green"
        />
      </div>

      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl text-white mb-2 font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
              Consultores Destacados
            </h2>
            <p className="text-white/60">Talento verificado cargado directamente desde Supabase</p>
          </div>
          <Link href="/explorar" className="hidden lg:flex items-center gap-2 text-[#2563EB] hover:text-[#6D5EF3] transition-colors font-bold">
            <span>Ver todos</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <GlassCard key={index} className="p-6 h-[320px] border-white/10" hover={false}>
                  <div className="h-full bg-white/5 rounded-2xl" />
                </GlassCard>
              ))
            : dashboard.featuredConsultants.map((consultant) => (
                <ConsultantCard key={consultant.id} {...consultant} />
              ))}
        </div>
      </section>

      <HowItWorks company />
    </>
  );
}

function ConsultantHome({
  dashboard,
  loading,
}: {
  dashboard: DashboardSnapshot;
  loading: boolean;
}) {
  return (
    <>
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="w-5 h-5 text-[#6D5EF3]" />
          <span className="text-sm text-white/60 uppercase tracking-wider">Tu Próximo Gran Desafío</span>
        </div>
        <h1 className="text-4xl lg:text-5xl mb-4 text-white font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
          Impulsa tu carrera con
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D5EF3] to-[#2563EB]">
            proyectos estratégicos
          </span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mb-4">
          Accede a los desafíos más relevantes de las empresas líderes y colabora en la transformación organizacional del mercado.
        </p>
        <p className="text-sm text-[#D7D2FF] mb-8">
          Red en vivo: {dashboard.companyCount} empresas demo visibles y {dashboard.consultantCount} consultores sincronizados.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/explorar">
            <motion.button
              className="px-8 py-4 rounded-xl text-white shadow-2xl shadow-[#6D5EF3]/50 flex items-center gap-2 font-bold"
              style={{
                background: 'linear-gradient(135deg, #6D5EF3 0%, #2563EB 100%)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Briefcase className="w-5 h-5" />
              <span>Buscar Desafíos</span>
            </motion.button>
          </Link>
          <Link href="/proyectos">
            <motion.button
              className="px-8 py-4 rounded-xl border border-white/20 text-white backdrop-blur-xl hover:bg-white/5 transition-colors font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver Desafíos
            </motion.button>
          </Link>
        </div>
      </motion.div>

      <section className="mb-16">
        <h2 className="text-xl text-white/80 mb-6 font-semibold uppercase tracking-widest text-sm">Oportunidades en el Mercado</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <StatsCard
            title="Empresas Activas"
            value={loading ? '...' : String(dashboard.companyCount)}
            change={loading ? '...' : String(dashboard.topCities.length || 1)}
            changeLabel="ciudades demo"
            icon={Building2}
            color="purple"
          />
          <StatsCard
            title="Consultores Verificados"
            value={loading ? '...' : String(dashboard.verifiedConsultantCount)}
            change={loading ? '...' : `${dashboard.averageRating.toFixed(1)}★`}
            changeLabel="rating promedio"
            icon={ShieldCheck}
            color="blue"
          />
          <StatsCard
            title="Talento en Red"
            value={loading ? '...' : String(dashboard.consultantCount)}
            change={loading ? '...' : String(dashboard.companies.length)}
            changeLabel="empresas visibles"
            icon={Target}
            color="green"
          />
        </div>
      </section>

      <HowItWorks />

      <section className="mt-16 bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl text-white mb-6 font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
              ¿Qué necesitas hoy?
            </h2>
            <div className="space-y-4">
              {[
                { icon: Search, text: 'Encontrar nuevos desafíos estratégicos' },
                { icon: Users, text: 'Colaborar con otros consultores de la red' },
                { icon: HelpCircle, text: 'Recibir soporte de Nexora AI' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-white/70">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <item.icon className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <span className="text-lg">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <GlassCard className="p-6">
              <p className="text-3xl font-bold text-white mb-1">{loading ? '...' : dashboard.companyCount}</p>
              <p className="text-xs text-white/40 uppercase font-bold">Empresas Demo</p>
            </GlassCard>
            <GlassCard className="p-6">
              <p className="text-3xl font-bold text-white mb-1">{loading ? '...' : `${dashboard.averageRating.toFixed(1)}★`}</p>
              <p className="text-xs text-white/40 uppercase font-bold">Rating Promedio</p>
            </GlassCard>
            <GlassCard className="p-6">
              <p className="text-3xl font-bold text-white mb-1">{loading ? '...' : dashboard.topCities[0]?.city ?? 'N/A'}</p>
              <p className="text-xs text-white/40 uppercase font-bold">Ciudad Lider</p>
            </GlassCard>
            <GlassCard className="p-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/20">
              <p className="text-3xl font-bold mb-1">{loading ? '...' : dashboard.consultantCount}</p>
              <p className="text-xs uppercase font-bold">Perfiles en Red</p>
            </GlassCard>
          </div>
        </div>
      </section>
    </>
  );
}

function HowItWorks({ company }: { company?: boolean }) {
  const steps = company
    ? [
        { step: '01', title: 'Publica tu Desafío', description: 'Describe tus objetivos estratégicos y necesidades.' },
        { step: '02', title: 'Selecciona Talento', description: 'Revisa perfiles verificados y conecta con los mejores.' },
        { step: '03', title: 'Transforma', description: 'Colabora y obtén resultados tangibles para tu negocio.' },
      ]
    : [
        { step: '01', title: 'Completa tu Perfil', description: 'Muestra tu experiencia, rating y especialidad al mundo.' },
        { step: '02', title: 'Postula a Proyectos', description: 'Encuentra los desafíos que mejor se adaptan a tu perfil.' },
        { step: '03', title: 'Genera Valor', description: 'Ayuda a las empresas a crecer y consolida tu reputación.' },
      ];

  return (
    <section className="mt-16">
      <h2 className="text-2xl lg:text-3xl text-white mb-10 text-center font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
        Cómo funciona para {company ? 'Empresas' : 'Consultores'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((item, index) => (
          <GlassCard key={index} className="p-8 text-center border-white/5 hover:border-white/20 transition-all">
            <div
              className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-2xl text-white font-bold shadow-xl shadow-black/20"
              style={{
                background: company
                  ? 'linear-gradient(135deg, #2563EB 0%, #6D5EF3 100%)'
                  : 'linear-gradient(135deg, #6D5EF3 0%, #2563EB 100%)',
              }}
            >
              {item.step}
            </div>
            <h3 className="text-xl text-white mb-3 font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
              {item.title}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
