import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Star, UserPlus, MessageSquare } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { ConsultantCard } from '../components/ConsultantCard';
import { fetchConsultants } from '../../lib/api';
import type { ConsultantDirectoryItem } from '../../lib/backend-types';

export function NetworkPage() {
  const [activeTab, setActiveTab] = useState<'connections' | 'favorites'>('connections');
  const [consultants, setConsultants] = useState<ConsultantDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchConsultants()
      .then((response) => {
        if (active) {
          setConsultants(response.items);
        }
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

  const connections = consultants.slice(0, 3);
  const favorites = consultants.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            Mi Red
          </h1>
          <p className="text-lg text-white/70">
            Gestiona tus conexiones y consultores favoritos
          </p>
          <p className="text-sm text-[#9CC2FF] mt-2">
            Esta vista se construye con los consultores demo disponibles hoy en Supabase.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Conexiones</p>
                <p className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  {loading ? '...' : connections.length}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Favoritos</p>
                <p className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  {loading ? '...' : favorites.length}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D5EF3] to-[#5b4ed4] flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Perfiles Verificados</p>
                <p className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  {loading ? '...' : consultants.filter((consultant) => consultant.verified).length}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-2 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all relative ${
                activeTab === 'connections' ? 'text-white' : 'text-white/60 hover:text-white/80'
              }`}
            >
              {activeTab === 'connections' && (
                <motion.div
                  layoutId="activeNetworkTab"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(109, 94, 243, 0.3) 100%)',
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                <span>Mis Conexiones</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all relative ${
                activeTab === 'favorites' ? 'text-white' : 'text-white/60 hover:text-white/80'
              }`}
            >
              {activeTab === 'favorites' && (
                <motion.div
                  layoutId="activeNetworkTab"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(109, 94, 243, 0.3) 100%)',
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex items-center justify-center gap-2">
                <Star className="w-5 h-5" />
                <span>Favoritos</span>
              </div>
            </button>
          </div>
        </GlassCard>

        {error && (
          <GlassCard className="p-6 mb-8 border-red-400/20">
            <p className="text-red-300">{error}</p>
          </GlassCard>
        )}

        {activeTab === 'connections' && (
          <ResourceGrid
            title={`Mis Conexiones (${loading ? '...' : connections.length})`}
            description="Primeros perfiles disponibles en la red actual"
            items={connections}
            loading={loading}
            actionLabel="Añadir Conexión"
          />
        )}

        {activeTab === 'favorites' && (
          <ResourceGrid
            title={`Consultores Favoritos (${loading ? '...' : favorites.length})`}
            description="Perfiles adicionales tomados de la red activa en Supabase"
            items={favorites}
            loading={loading}
          />
        )}
      </motion.div>
    </div>
  );
}

function ResourceGrid({
  title,
  description,
  items,
  loading,
  actionLabel,
}: {
  title: string;
  description: string;
  items: ConsultantDirectoryItem[];
  loading: boolean;
  actionLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
            {title}
          </h2>
          <p className="text-white/60 mt-2">{description}</p>
        </div>
        {actionLabel && (
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white rounded-lg hover:scale-105 transition-transform shadow-lg shadow-[#2563EB]/30">
            <UserPlus className="w-5 h-5" />
            <span>{actionLabel}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <GlassCard key={index} className="p-6 h-[320px] border-white/10" hover={false}>
                <div className="h-full bg-white/5 rounded-2xl" />
              </GlassCard>
            ))
          : items.map((consultant, index) => (
              <motion.div
                key={consultant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
              >
                <ConsultantCard {...consultant} />
              </motion.div>
            ))}
      </div>
    </motion.div>
  );
}
