'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Star, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import {
  addConnection,
  fetchConnections,
  fetchConsultants,
  fetchFavorites,
  removeConnection,
  toggleFavorite,
} from '../../lib/api';
import type { ConsultantDirectoryItem, NetworkCollection } from '../../lib/backend-types';

const emptyCollection: NetworkCollection = {
  items: [],
  count: 0,
  source: 'supabase',
  persistent: true,
  note: '',
};

export function NetworkPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'connections' | 'favorites'>('connections');
  const [consultants, setConsultants] = useState<ConsultantDirectoryItem[]>([]);
  const [connections, setConnections] = useState<NetworkCollection>(emptyCollection);
  const [favorites, setFavorites] = useState<NetworkCollection>(emptyCollection);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([fetchConsultants(), fetchConnections(), fetchFavorites()])
      .then(([consultantsResponse, connectionsResponse, favoritesResponse]) => {
        if (!active) {
          return;
        }

        setConsultants(consultantsResponse.items);
        setConnections(connectionsResponse);
        setFavorites(favoritesResponse);
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : 'No pudimos cargar la red.');
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

  const connectionIds = useMemo(() => new Set(connections.items.map((item) => item.id)), [connections]);
  const favoriteIds = useMemo(() => new Set(favorites.items.map((item) => item.id)), [favorites]);
  const discoverItems = consultants.filter((consultant) => !connectionIds.has(consultant.id));
  const activeItems = activeTab === 'connections' ? connections.items : favorites.items;

  const handleConnectionToggle = async (consultantId: string, connected: boolean) => {
    setBusyId(consultantId);

    try {
      const next = connected ? await removeConnection(consultantId) : await addConnection(consultantId);
      setConnections(next);
      toast.success(connected ? 'Conexión eliminada' : 'Conexión añadida');
    } catch (actionError) {
      toast.error(actionError instanceof Error ? actionError.message : 'No pudimos actualizar la red');
    } finally {
      setBusyId(null);
    }
  };

  const handleFavoriteToggle = async (consultantId: string) => {
    setBusyId(consultantId);

    try {
      const next = await toggleFavorite(consultantId);
      setFavorites(next);
      toast.success(favoriteIds.has(consultantId) ? 'Favorito eliminado' : 'Favorito actualizado');
    } catch (actionError) {
      toast.error(actionError instanceof Error ? actionError.message : 'No pudimos actualizar favoritos');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            {profile?.userType === 'CONSULTOR' ? 'Comunidad' : 'Mi Red'}
          </h1>
          <p className="text-lg text-white/70">Conexiones y favoritos persistidos en Supabase</p>
        </div>

        {error && (
          <GlassCard className="p-6 mb-8 border-red-400/20">
            <p className="text-red-300">{error}</p>
          </GlassCard>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <MetricCard icon={Users} title="Conexiones" value={loading ? '...' : String(connections.count)} />
          <MetricCard icon={Star} title="Favoritos" value={loading ? '...' : String(favorites.count)} />
          <MetricCard icon={UserPlus} title="Disponibles" value={loading ? '...' : String(discoverItems.length)} />
        </div>

        <GlassCard className="p-2 mb-8">
          <div className="flex gap-2">
            {(['connections', 'favorites'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-3 rounded-lg transition-all relative ${
                  activeTab === tab ? 'text-white' : 'text-white/60 hover:text-white/80'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeNetworkTabReal"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(109, 94, 243, 0.3) 100%)',
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10">{tab === 'connections' ? 'Mis Conexiones' : 'Favoritos'}</div>
              </button>
            ))}
          </div>
        </GlassCard>

        <Section title={activeTab === 'connections' ? 'Conexiones activas' : 'Consultores favoritos'}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <GlassCard key={index} className="p-6 h-52 border-white/10" hover={false}>
                    <div className="h-full bg-white/5 rounded-2xl" />
                  </GlassCard>
                ))
              : activeItems.map((consultant) => (
                  <ConsultantActionCard
                    key={consultant.id}
                    consultant={consultant}
                    connected={connectionIds.has(consultant.id)}
                    favorite={favoriteIds.has(consultant.id)}
                    busy={busyId === consultant.id}
                    onToggleConnection={handleConnectionToggle}
                    onToggleFavorite={handleFavoriteToggle}
                  />
                ))}
          </div>
        </Section>

        <Section title="Descubrir consultores" className="mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {discoverItems.map((consultant) => (
              <ConsultantActionCard
                key={consultant.id}
                consultant={consultant}
                connected={false}
                favorite={favoriteIds.has(consultant.id)}
                busy={busyId === consultant.id}
                onToggleConnection={handleConnectionToggle}
                onToggleFavorite={handleFavoriteToggle}
              />
            ))}
          </div>
        </Section>
      </motion.div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof Users;
  title: string;
  value: string;
}) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#6D5EF3] flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <p className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
            {value}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

function Section({
  title,
  className = '',
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <h2 className="text-2xl text-white mb-6" style={{ fontFamily: 'var(--font-secondary)' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function ConsultantActionCard({
  consultant,
  connected,
  favorite,
  busy,
  onToggleConnection,
  onToggleFavorite,
}: {
  consultant: ConsultantDirectoryItem;
  connected: boolean;
  favorite: boolean;
  busy: boolean;
  onToggleConnection: (consultantId: string, connected: boolean) => Promise<void>;
  onToggleFavorite: (consultantId: string) => Promise<void>;
}) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <img src={consultant.image} alt={consultant.name} className="w-16 h-16 rounded-xl object-cover" />
        <div>
          <h3 className="text-white">{consultant.name}</h3>
          <p className="text-sm text-white/60">{consultant.role}</p>
          <p className="text-xs text-white/40">{consultant.city}</p>
        </div>
      </div>

      <p className="text-sm text-white/70 mb-4 line-clamp-3">{consultant.bio}</p>

      <div className="flex gap-3">
        <button
          onClick={() => void onToggleConnection(consultant.id, connected)}
          disabled={busy}
          className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold disabled:opacity-50"
        >
          {connected ? (
            <span className="inline-flex items-center gap-2">
              <UserMinus className="w-4 h-4" />
              Quitar
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Conectar
            </span>
          )}
        </button>
        <button
          onClick={() => void onToggleFavorite(consultant.id)}
          disabled={busy}
          className={`px-4 rounded-xl border font-semibold disabled:opacity-50 ${
            favorite ? 'bg-[#f59e0b]/20 border-[#f59e0b]/40 text-[#f59e0b]' : 'bg-white/5 border-white/10 text-white'
          }`}
        >
          <Star className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
        </button>
      </div>
    </GlassCard>
  );
}
