'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Building2, BadgeCheck, Star, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from './GlassCard';
import { fetchRecommendations } from '../../lib/api';
import type {
  RecommendationsResponse,
  RecommendedConsultant,
  RecommendedEmpresa,
} from '../../lib/backend-types';

export function RecommendationsSection() {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchRecommendations(8)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((error) => console.error('Failed to load recommendations', error))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="mb-16">
        <Header />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <GlassCard key={index} className="p-6 h-[260px] border-white/10" hover={false}>
              <div className="h-full bg-white/5 rounded-2xl" />
            </GlassCard>
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.items.length === 0) {
    return null;
  }

  const isEmpresa = data.userType === 'EMPRESA';

  return (
    <section className="mb-16">
      <Header />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.items.slice(0, 8).map((rec, index) => (
          <motion.div
            key={`${rec.id}-${index}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            {isEmpresa ? (
              <ConsultantRecCard rec={rec.item as RecommendedConsultant} score={rec.score} reasons={rec.reasons} />
            ) : (
              <EmpresaRecCard rec={rec.item as RecommendedEmpresa} score={rec.score} reasons={rec.reasons} />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[#2563EB]" />
          <span className="text-xs text-white/60 uppercase tracking-wider">ML · Recomendaciones para ti</span>
        </div>
        <h2 className="text-2xl lg:text-3xl text-white font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
          Matches sugeridos
        </h2>
        <p className="text-white/60 text-sm">Basado en tu perfil, ciudad y compatibilidad de texto (TF-IDF + cosine).</p>
      </div>
      <Link href="/explorar" className="hidden lg:flex items-center gap-2 text-[#2563EB] hover:text-[#6D5EF3] transition-colors font-bold text-sm">
        Ver todo
      </Link>
    </div>
  );
}

function ConsultantRecCard({
  rec,
  score,
  reasons,
}: {
  rec: RecommendedConsultant;
  score: number;
  reasons: string[];
}) {
  return (
    <GlassCard className="p-5 h-full border-white/10">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={rec.avatarUrl || `https://ui-avatars.com/api/?background=0A1F44&color=FFFFFF&bold=true&name=${encodeURIComponent(rec.name)}`}
          alt={rec.name}
          className="w-12 h-12 rounded-full object-cover border border-white/20"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{rec.name}</h3>
          <p className="text-white/60 text-xs truncate">{rec.role}</p>
        </div>
        {rec.verified && <BadgeCheck className="w-5 h-5 text-[#2563EB]" />}
      </div>
      <div className="flex items-center gap-3 text-xs text-white/50 mb-3">
        {rec.city && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {rec.city}
          </span>
        )}
        {typeof rec.rating === 'number' && rec.rating > 0 && (
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5" /> {rec.rating.toFixed(1)}
          </span>
        )}
      </div>
      <ReasonChips reasons={reasons} score={score} />
    </GlassCard>
  );
}

function EmpresaRecCard({
  rec,
  score,
  reasons,
}: {
  rec: RecommendedEmpresa;
  score: number;
  reasons: string[];
}) {
  return (
    <GlassCard className="p-5 h-full border-white/10">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#6D5EF3] flex items-center justify-center">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{rec.nombreEmpresa}</h3>
          {rec.sector && <p className="text-white/60 text-xs truncate">{rec.sector}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-white/50 mb-3">
        {rec.city && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {rec.city}
          </span>
        )}
        {rec.website && (
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> Web
          </span>
        )}
      </div>
      <ReasonChips reasons={reasons} score={score} />
    </GlassCard>
  );
}

function ReasonChips({ reasons, score }: { reasons: string[]; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-white/40">Compatibilidad</span>
        <span className="text-xs font-semibold text-white">{Math.round(score * 100)}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#2563EB] to-[#6D5EF3]"
          style={{ width: `${Math.min(100, Math.round(score * 100))}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {reasons.slice(0, 3).map((reason) => (
          <span
            key={reason}
            className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70"
          >
            {reason}
          </span>
        ))}
      </div>
    </div>
  );
}
