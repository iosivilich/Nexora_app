'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  X,
  Award,
  MapPin,
  Briefcase,
  Star,
  User,
  CheckCircle2,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { ConsultantCard } from '../components/ConsultantCard';
import { fetchConsultants } from '../../lib/api';
import type { ConsultantDirectoryItem } from '../../lib/backend-types';

export function ExplorePage() {
  const [consultants, setConsultants] = useState<ConsultantDirectoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantDirectoryItem | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [minExperience, setMinExperience] = useState(0);
  const [maxAge, setMaxAge] = useState(100);
  const [minProjects, setMinProjects] = useState(0);
  const [selectedCity, setSelectedCity] = useState('Todas');
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
          setError(fetchError instanceof Error ? fetchError.message : 'No pudimos cargar los consultores.');
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

  const categories = ['Todos', ...new Set(consultants.flatMap((consultant) => consultant.expertise))];
  const cities = [...new Set(consultants.map((consultant) => consultant.city))];

  const filteredConsultants = consultants.filter((consultant) => {
    const matchesSearch =
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.expertise.some((expertise) =>
        expertise.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === 'Todos' ||
      consultant.expertise.some((expertise) => expertise.includes(selectedCategory));

    const matchesRating = consultant.rating >= minRating;
    const matchesExperience = consultant.experience >= minExperience;
    const matchesAge = consultant.age <= maxAge;
    const matchesProjects = consultant.projects >= minProjects;
    const matchesCity = selectedCity === 'Todas' || consultant.city === selectedCity;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesRating &&
      matchesExperience &&
      matchesAge &&
      matchesProjects &&
      matchesCity
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            Explorar Consultores
          </h1>
          <p className="text-lg text-white/70">
            Encuentra al experto perfecto para tu proyecto
          </p>
          <p className="text-sm text-[#9CC2FF] mt-2">
            Directorio sincronizado con los 5 consultores demo disponibles en Supabase.
          </p>
        </div>

        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por nombre, especialidad o habilidades..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB] transition-all"
              />
            </div>

            <div className="relative min-w-[200px]">
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-[#2563EB] transition-all cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-[#0A1F44]">
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 border rounded-xl transition-all ${
                showFilters
                  ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filtros Avanzados</span>
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                key="filter-drawer"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 pb-4 border-t border-white/10 mt-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/60">Rating Mínimo</label>
                    <div className="flex gap-2">
                      {[3, 3.5, 4, 4.5, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                          className={`flex-1 py-2 rounded-lg border transition-all text-sm ${
                            minRating === rating
                              ? 'bg-[#2563EB]/20 border-[#2563EB] text-[#2563EB]'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {rating}+ ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/60">Años de Experiencia</label>
                    <div className="flex gap-2">
                      {[2, 5, 10, 15].map((experience) => (
                        <button
                          key={experience}
                          onClick={() => setMinExperience(experience === minExperience ? 0 : experience)}
                          className={`flex-1 py-2 rounded-lg border transition-all text-sm ${
                            minExperience === experience
                              ? 'bg-[#2563EB]/20 border-[#2563EB] text-[#2563EB]'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {experience}+ años
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/60">Ciudad de Residencia</label>
                    <select
                      value={selectedCity}
                      onChange={(event) => setSelectedCity(event.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white appearance-none focus:outline-none focus:border-[#2563EB]"
                    >
                      <option value="Todas" className="bg-[#0A1F44]">
                        Todas las ciudades
                      </option>
                      {cities.map((city) => (
                        <option key={city} value={city} className="bg-[#0A1F44]">
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/60">Proyectos Realizados</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={minProjects}
                      onChange={(event) => setMinProjects(Number(event.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                    />
                    <div className="flex justify-between text-xs text-white/40">
                      <span>0</span>
                      <span>Min: {minProjects} proyectos</span>
                      <span>100+</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/60">Edad Máxima</label>
                    <input
                      type="range"
                      min="20"
                      max="70"
                      value={maxAge}
                      onChange={(event) => setMaxAge(Number(event.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                    />
                    <div className="flex justify-between text-xs text-white/40">
                      <span>20</span>
                      <span>Máx: {maxAge} años</span>
                      <span>70</span>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setMinRating(0);
                        setMinExperience(0);
                        setMaxAge(100);
                        setMinProjects(0);
                        setSelectedCity('Todas');
                      }}
                      className="w-full py-2 bg-red-400/10 border border-red-400/20 text-red-400 rounded-lg hover:bg-red-400/20 transition-all text-sm font-medium"
                    >
                      Restablecer Filtros
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {error && (
          <GlassCard className="p-6 mb-6 border-red-400/20">
            <p className="text-red-300">{error}</p>
          </GlassCard>
        )}

        <div className="mb-6 flex justify-between items-center">
          <p className="text-white/60">
            Mostrando <span className="text-white font-medium">{loading ? '...' : filteredConsultants.length}</span> consultores
          </p>
          {selectedCategory !== 'Todos' && (
            <button onClick={() => setSelectedCategory('Todos')} className="text-sm text-[#2563EB] hover:underline">
              Limpiar categoría
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
            : filteredConsultants.map((consultant, index) => (
                <motion.div
                  key={consultant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                >
                  <ConsultantCard {...consultant} onViewProfile={() => setSelectedConsultant(consultant)} />
                </motion.div>
              ))}
        </div>

        {!loading && filteredConsultants.length === 0 && (
          <GlassCard className="p-12 text-center mt-8">
            <Filter className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2" style={{ fontFamily: 'var(--font-secondary)' }}>
              No se encontraron resultados
            </h3>
            <p className="text-white/60">
              Intenta ajustar tus filtros o buscar con otros términos
            </p>
          </GlassCard>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedConsultant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedConsultant(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0A1F44] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="relative h-48 bg-gradient-to-br from-[#2563EB] to-[#6D5EF3]">
                <button
                  onClick={() => setSelectedConsultant(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute -bottom-12 left-8">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#0A1F44] shadow-2xl">
                    <img
                      src={selectedConsultant.image}
                      alt={selectedConsultant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-8 px-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-white">{selectedConsultant.name}</h2>
                      {selectedConsultant.verified && (
                        <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                      )}
                    </div>
                    <p className="text-[#2563EB] font-medium">{selectedConsultant.role}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
                    <span className="text-white font-bold">{selectedConsultant.rating}</span>
                  </div>
                </div>

                <p className="text-white/70 mb-8 leading-relaxed">
                  {selectedConsultant.bio}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <Briefcase className="w-5 h-5 text-white/40 mb-2" />
                    <p className="text-xs text-white/40 uppercase tracking-wider">Experiencia</p>
                    <p className="text-white font-semibold">{selectedConsultant.experience} años</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <Award className="w-5 h-5 text-white/40 mb-2" />
                    <p className="text-xs text-white/40 uppercase tracking-wider">Proyectos</p>
                    <p className="text-white font-semibold">{selectedConsultant.projects}+ realizados</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <User className="w-5 h-5 text-white/40 mb-2" />
                    <p className="text-xs text-white/40 uppercase tracking-wider">Edad</p>
                    <p className="text-white font-semibold">{selectedConsultant.age} años</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <MapPin className="w-5 h-5 text-white/40 mb-2" />
                    <p className="text-xs text-white/40 uppercase tracking-wider">Ciudad</p>
                    <p className="text-white font-semibold">{selectedConsultant.city}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Especialidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedConsultant.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] rounded-xl text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white rounded-2xl font-bold shadow-lg shadow-[#2563EB]/30 hover:scale-[1.02] transition-all">
                    Agendar Consultoría
                  </button>
                  <button className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all">
                    Enviar Mensaje
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
