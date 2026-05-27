'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Building2, BadgeCheck, Star, Globe, X, ExternalLink, Briefcase, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { fetchRecommendations } from '../../lib/api';
import type {
  RecommendationsResponse,
  RecommendedConsultant,
  RecommendedEmpresa,
} from '../../lib/backend-types';

type SelectedConsultant = { rec: RecommendedConsultant; score: number; reasons: string[] };
type SelectedEmpresa = { rec: RecommendedEmpresa; score: number; reasons: string[] };

export function RecommendationsSection() {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedConsultant, setSelectedConsultant] = useState<SelectedConsultant | null>(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState<SelectedEmpresa | null>(null);

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
    <>
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
                <ConsultantRecCard
                  rec={rec.item as RecommendedConsultant}
                  score={rec.score}
                  reasons={rec.reasons}
                  onClick={() => setSelectedConsultant({ rec: rec.item as RecommendedConsultant, score: rec.score, reasons: rec.reasons })}
                />
              ) : (
                <EmpresaRecCard
                  rec={rec.item as RecommendedEmpresa}
                  score={rec.score}
                  reasons={rec.reasons}
                  onClick={() => setSelectedEmpresa({ rec: rec.item as RecommendedEmpresa, score: rec.score, reasons: rec.reasons })}
                />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedConsultant && (
          <ConsultantModal
            selected={selectedConsultant}
            onClose={() => setSelectedConsultant(null)}
          />
        )}
        {selectedEmpresa && (
          <EmpresaModal
            selected={selectedEmpresa}
            onClose={() => setSelectedEmpresa(null)}
          />
        )}
      </AnimatePresence>
    </>
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
  onClick,
}: {
  rec: RecommendedConsultant;
  score: number;
  reasons: string[];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full h-full text-left group"
    >
      <GlassCard className="p-5 h-full border-white/10 cursor-pointer transition-all group-hover:border-[#2563EB]/40 group-hover:scale-[1.02]">
        <div className="flex items-start gap-3 mb-3">
          <img
            src={rec.avatarUrl || `https://ui-avatars.com/api/?background=0A1F44&color=FFFFFF&bold=true&name=${encodeURIComponent(rec.name)}`}
            alt={rec.name}
            className="w-12 h-12 rounded-full object-cover border border-white/20"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate group-hover:text-[#9CC2FF] transition-colors">{rec.name}</h3>
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
    </button>
  );
}

function EmpresaRecCard({
  rec,
  score,
  reasons,
  onClick,
}: {
  rec: RecommendedEmpresa;
  score: number;
  reasons: string[];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full h-full text-left group"
    >
      <GlassCard className="p-5 h-full border-white/10 cursor-pointer transition-all group-hover:border-[#2563EB]/40 group-hover:scale-[1.02]">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#6D5EF3] flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate group-hover:text-[#9CC2FF] transition-colors">{rec.nombreEmpresa}</h3>
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
    </button>
  );
}

function ConsultantModal({ selected, onClose }: { selected: SelectedConsultant; onClose: () => void }) {
  const { rec, score, reasons } = selected;
  const avatarSrc = rec.avatarUrl || `https://ui-avatars.com/api/?background=0A1F44&color=FFFFFF&bold=true&size=128&name=${encodeURIComponent(rec.name)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-[#0A1F44] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Banner */}
        <div className="relative h-32 bg-gradient-to-br from-[#2563EB] to-[#6D5EF3]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -bottom-10 left-6">
            <img
              src={avatarSrc}
              alt={rec.name}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-[#0A1F44] shadow-xl"
            />
          </div>
        </div>

        <div className="pt-14 pb-6 px-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{rec.name}</h2>
                {rec.verified && <BadgeCheck className="w-5 h-5 text-[#2563EB]" />}
              </div>
              <p className="text-[#9CC2FF] text-sm">{rec.role}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">{Math.round(score * 100)}%</span>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">compatibilidad</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-xs text-white/60 mb-4">
            {rec.city && (
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5" /> {rec.city}
              </span>
            )}
            {typeof rec.rating === 'number' && rec.rating > 0 && (
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
                <Star className="w-3.5 h-3.5 text-yellow-400" /> {rec.rating.toFixed(1)}
              </span>
            )}
            {typeof rec.experience === 'number' && rec.experience > 0 && (
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" /> {rec.experience} años exp.
              </span>
            )}
          </div>

          {/* Bio */}
          {rec.bio && (
            <p className="text-white/70 text-sm leading-relaxed mb-4">{rec.bio}</p>
          )}

          {/* Expertise */}
          {rec.expertise && rec.expertise.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Expertise</p>
              <div className="flex flex-wrap gap-1.5">
                {rec.expertise.slice(0, 6).map((skill) => (
                  <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-[#2563EB]/15 border border-[#2563EB]/30 text-[#9CC2FF]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reasons */}
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Por qué te recomendamos</p>
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((reason) => (
                <span key={reason} className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                  {reason}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/explorar"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Briefcase className="w-4 h-4" />
            Ver más consultores
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function EmpresaModal({ selected, onClose }: { selected: SelectedEmpresa; onClose: () => void }) {
  const { rec, score, reasons } = selected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-[#0A1F44] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Banner */}
        <div className="relative h-32 bg-gradient-to-br from-[#2563EB] to-[#6D5EF3] flex items-center justify-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-[#0A1F44] border-4 border-[#0A1F44] shadow-xl flex items-center justify-center">
              <Building2 className="w-9 h-9 text-[#2563EB]" />
            </div>
          </div>
        </div>

        <div className="pt-14 pb-6 px-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{rec.nombreEmpresa}</h2>
              {rec.sector && <p className="text-[#9CC2FF] text-sm">{rec.sector}</p>}
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">{Math.round(score * 100)}%</span>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">compatibilidad</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-xs text-white/60 mb-4">
            {rec.city && (
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5" /> {rec.city}
              </span>
            )}
            {rec.esPyme && (
              <span className="bg-white/5 px-3 py-1.5 rounded-full">PyME</span>
            )}
          </div>

          {/* Descripción */}
          {rec.descripcion && (
            <p className="text-white/70 text-sm leading-relaxed mb-4">{rec.descripcion}</p>
          )}

          {/* Reasons */}
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Por qué te recomendamos</p>
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((reason) => (
                <span key={reason} className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                  {reason}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {rec.website && (
              <a
                href={rec.website.startsWith('http') ? rec.website : `https://${rec.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
                Visitar sitio
              </a>
            )}
            <Link
              href="/explorar"
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm transition-all border ${rec.website ? 'border-white/20 text-white/70 hover:bg-white/5' : 'flex-1 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white border-transparent hover:opacity-90'}`}
            >
              <Briefcase className="w-4 h-4" />
              Ver oportunidades
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
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
