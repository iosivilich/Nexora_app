'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Star, UserPlus, MessageSquare } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { ConsultantCard } from '../components/ConsultantCard';

const connections = [
  {
    name: 'María González',
    role: 'Consultora en Transformación Digital',
    location: 'Madrid, España',
    rating: 4.9,
    projects: 47,
    expertise: ['Digital', 'Estrategia', 'Innovación'],
    image: 'https://images.unsplash.com/photo-1613473350016-1fe047d6d360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzMzODQyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
  },
  {
    name: 'Carlos Mendoza',
    role: 'Experto en Gestión de Cambio',
    location: 'Barcelona, España',
    rating: 4.8,
    projects: 35,
    expertise: ['Cambio', 'Liderazgo', 'Cultura'],
    image: 'https://images.unsplash.com/photo-1530281834572-02d15fa61f64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwYnVzaW5lc3MlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzMzNTQxMjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
  },
  {
    name: 'Ana Chen',
    role: 'Consultora en Estrategia Empresarial',
    location: 'Valencia, España',
    rating: 5.0,
    projects: 62,
    expertise: ['Estrategia', 'Growth', 'M&A'],
    image: 'https://images.unsplash.com/photo-1758369636875-60b3dcb76366?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGJ1c2luZXNzd29tYW4lMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczMzQwMDEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
  },
  {
    name: 'Diego Ramírez',
    role: 'Consultor en Marketing Digital',
    location: 'Sevilla, España',
    rating: 4.9,
    projects: 41,
    expertise: ['Marketing', 'Digital', 'SEO'],
    image: 'https://images.unsplash.com/photo-1742569184536-77ff9ae46c99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXNwYW5pYyUyMG1hbGUlMjBjb25zdWx0YW50JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3NDAzNDE4OHww&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
  },
];

const favorites = [
  {
    name: 'Marcus Johnson',
    role: 'Consultor en Finanzas Corporativas',
    location: 'Londres, Reino Unido',
    rating: 5.0,
    projects: 55,
    expertise: ['Finanzas', 'M&A', 'Valuación'],
    image: 'https://images.unsplash.com/photo-1616804947838-6646ae0e423d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYW1lcmljYW4lMjBidXNpbmVzcyUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzQwMzQxODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
  },
  {
    name: 'Sophie Laurent',
    role: 'Consultora en Recursos Humanos',
    location: 'París, Francia',
    rating: 4.8,
    projects: 38,
    expertise: ['RRHH', 'Talento', 'Cultura'],
    image: 'https://images.unsplash.com/photo-1771340589132-35ce3496ee29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldXJvcGVhbiUyMGJ1c2luZXNzd29tYW4lMjBleGVjdXRpdmV8ZW58MXx8fHwxNzc0MDM0MTg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
  },
  {
    name: 'Roberto Silva',
    role: 'Consultor en Operaciones',
    location: 'Lisboa, Portugal',
    rating: 4.7,
    projects: 29,
    expertise: ['Operaciones', 'Lean', 'Eficiencia'],
    image: 'https://images.unsplash.com/photo-1769839271768-aee5469799ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjb25zdWx0YW50JTIwYnVzaW5lc3MlMjBtZWV0aW5nfGVufDF8fHx8MTc3MzQzMzczNHww&ixlib=rb-4.1.0&q=80&w=1080',
    verified: false,
  },
];

export function NetworkPage() {
  const [activeTab, setActiveTab] = useState<'connections' | 'favorites'>('connections');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            Mi Red
          </h1>
          <p className="text-lg text-white/70">
            Gestiona tus conexiones y consultores favoritos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Conexiones</p>
                <p className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  {connections.length}
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
                  {favorites.length}
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
                <p className="text-sm text-white/60">Conversaciones</p>
                <p className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  {connections.length + 2}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Tabs */}
        <GlassCard className="p-2 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all relative ${
                activeTab === 'connections'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80'
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
                activeTab === 'favorites'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80'
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

        {/* Content */}
        {activeTab === 'connections' && (
          <motion.div
            key="connections"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                Mis Conexiones ({connections.length})
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white rounded-lg hover:scale-105 transition-transform shadow-lg shadow-[#2563EB]/30">
                <UserPlus className="w-5 h-5" />
                <span>Añadir Conexión</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {connections.map((consultant, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                >
                  <ConsultantCard {...consultant} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'favorites' && (
          <motion.div
            key="favorites"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                Consultores Favoritos ({favorites.length})
              </h2>
              <p className="text-white/60 mt-2">
                Consultores que has marcado como favoritos para referencia futura
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((consultant, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                >
                  <ConsultantCard {...consultant} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
