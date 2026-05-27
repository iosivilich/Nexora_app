'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  X, MapPin, Star, Clock, BadgeCheck,
  UserPlus, UserMinus, Heart, Briefcase, Check, MessageSquare,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { addConnection, removeConnection, toggleFavorite, ensureConversation } from '../../lib/api';

export interface ConsultantModalData {
  profileId: string;
  name: string;
  role: string;
  city?: string | null;
  rating?: number | null;
  experience?: number | null;
  verified?: boolean | null;
  avatarUrl?: string | null;
  bio?: string | null;
  expertise?: string[];
  score?: number;
  reasons?: string[];
}

interface Props {
  consultant: ConsultantModalData;
  /** True when the logged-in user already has a connection with this consultant */
  initialConnected?: boolean;
  /** True when the logged-in user already has this consultant as a favorite */
  initialFavorite?: boolean;
  /** Called after a successful connect/disconnect so the parent can update its state */
  onConnectionChange?: (profileId: string, nowConnected: boolean) => void;
  /** Called after a successful favorite toggle so the parent can update its state */
  onFavoriteChange?: (profileId: string, nowFavorited: boolean) => void;
  onClose: () => void;
}

export function ConsultantProfileModal({
  consultant,
  initialConnected = false,
  initialFavorite = false,
  onConnectionChange,
  onFavoriteChange,
  onClose,
}: Props) {
  const router = useRouter();
  const [connected, setConnected] = useState(initialConnected);
  const [favorited, setFavorited] = useState(initialFavorite);
  const [busy, setBusy] = useState<'connect' | 'disconnect' | 'favorite' | 'message' | null>(null);

  const avatarSrc =
    consultant.avatarUrl ||
    `https://ui-avatars.com/api/?background=0A1F44&color=FFFFFF&bold=true&size=128&name=${encodeURIComponent(consultant.name)}`;

  const handleConnect = async () => {
    if (busy) return;
    setBusy(connected ? 'disconnect' : 'connect');
    try {
      if (connected) {
        await removeConnection(consultant.profileId);
        setConnected(false);
        onConnectionChange?.(consultant.profileId, false);
        toast.success('Conexión eliminada');
      } else {
        await addConnection(consultant.profileId);
        setConnected(true);
        onConnectionChange?.(consultant.profileId, true);
        toast.success(`Conectado con ${consultant.name}`);
      }
    } catch {
      toast.error('No pudimos actualizar la conexión. Intenta de nuevo.');
    } finally {
      setBusy(null);
    }
  };

  const handleFavorite = async () => {
    if (busy) return;
    setBusy('favorite');
    try {
      await toggleFavorite(consultant.profileId);
      const next = !favorited;
      setFavorited(next);
      onFavoriteChange?.(consultant.profileId, next);
      toast.success(next ? `${consultant.name} guardado en favoritos` : 'Eliminado de favoritos');
    } catch {
      toast.error('No pudimos actualizar favoritos. Intenta de nuevo.');
    } finally {
      setBusy(null);
    }
  };

  const handleMessage = async () => {
    if (busy) return;
    setBusy('message');
    try {
      const { id } = await ensureConversation(consultant.profileId);
      onClose();
      router.push(`/mensajes?conversationId=${id}`);
    } catch {
      toast.error('No pudimos abrir la conversación. Intenta de nuevo.');
      setBusy(null);
    }
  };

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
        className="relative w-full max-w-lg bg-[#0A1F44] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Banner */}
        <div className="relative h-32 bg-gradient-to-br from-[#2563EB] to-[#6D5EF3] flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -bottom-10 left-6">
            <img
              src={avatarSrc}
              alt={consultant.name}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-[#0A1F44] shadow-xl"
            />
          </div>
        </div>

        <div className="pt-14 pb-6 px-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{consultant.name}</h2>
                {consultant.verified && <BadgeCheck className="w-5 h-5 text-[#2563EB]" />}
              </div>
              <p className="text-[#9CC2FF] text-sm">{consultant.role}</p>
            </div>
            {typeof consultant.score === 'number' && (
              <div className="text-right flex-shrink-0 ml-3">
                <span className="text-2xl font-bold text-white">{Math.round(consultant.score * 100)}%</span>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">compatibilidad</p>
              </div>
            )}
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 text-xs text-white/60 mb-4">
            {consultant.city && (
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5" /> {consultant.city}
              </span>
            )}
            {typeof consultant.rating === 'number' && consultant.rating > 0 && (
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
                <Star className="w-3.5 h-3.5 text-yellow-400" /> {consultant.rating.toFixed(1)}
              </span>
            )}
            {typeof consultant.experience === 'number' && consultant.experience > 0 && (
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" /> {consultant.experience} años exp.
              </span>
            )}
          </div>

          {/* Bio */}
          {consultant.bio && (
            <p className="text-white/70 text-sm leading-relaxed mb-4">{consultant.bio}</p>
          )}

          {/* Expertise */}
          {consultant.expertise && consultant.expertise.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Expertise</p>
              <div className="flex flex-wrap gap-1.5">
                {consultant.expertise.slice(0, 6).map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#2563EB]/15 border border-[#2563EB]/30 text-[#9CC2FF]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ML reasons */}
          {consultant.reasons && consultant.reasons.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Por qué te recomendamos</p>
              <div className="flex flex-wrap gap-1.5">
                {consultant.reasons.map((reason) => (
                  <span
                    key={reason}
                    className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje — solo visible cuando ya hay conexión */}
          {connected && (
            <button
              onClick={() => void handleMessage()}
              disabled={busy !== null}
              className="w-full flex items-center justify-center gap-2 py-3 mb-3 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4" />
              {busy === 'message' ? 'Abriendo chat...' : 'Enviar Mensaje'}
            </button>
          )}

          {/* Acciones secundarias */}
          <div className={`grid gap-2 ${connected ? 'grid-cols-3' : 'grid-cols-3'}`}>
            {/* Conectar / Quitar */}
            <button
              onClick={() => void handleConnect()}
              disabled={busy !== null}
              className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-xs font-semibold transition-all disabled:opacity-50 ${
                connected
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-[#2563EB]/20 hover:border-[#2563EB]/40'
              }`}
            >
              {connected
                ? <UserMinus className="w-4 h-4" />
                : busy === 'connect' ? <Check className="w-4 h-4 animate-pulse" /> : <UserPlus className="w-4 h-4" />
              }
              {busy === 'connect' || busy === 'disconnect' ? '...' : connected ? 'Quitar' : 'Conectar'}
            </button>

            {/* Favorito */}
            <button
              onClick={() => void handleFavorite()}
              disabled={busy !== null}
              className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-xs font-semibold transition-all disabled:opacity-50 ${
                favorited
                  ? 'bg-pink-500/20 border-pink-500/40 text-pink-400'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-pink-500/10 hover:border-pink-500/30'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-pink-400' : ''}`} />
              {busy === 'favorite' ? '...' : favorited ? 'Guardado' : 'Favorito'}
            </button>

            {/* Ver explorar */}
            <Link
              href="/explorar"
              className="flex flex-col items-center gap-1 py-3 rounded-2xl border border-white/10 bg-white/5 text-xs font-semibold text-white/80 hover:bg-white/10 transition-all"
            >
              <Briefcase className="w-4 h-4" />
              Explorar
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
