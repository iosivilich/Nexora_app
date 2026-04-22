'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Calendar,
  Heart,
  MessageSquare,
  UserPlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GlassCard } from '../components/GlassCard';
import { ConsultantCard } from '../components/ConsultantCard';
import { useAuth } from '../context/AuthContext';
import {
  addConnection,
  createApplication,
  createAppointment,
  ensureConversation,
  fetchChallenges,
  fetchConnections,
  fetchConsultants,
  fetchFavorites,
  toggleFavorite,
} from '../../lib/api';
import type {
  ConsultantDirectoryItem,
  ChallengeSummary,
  NetworkCollection,
} from '../../lib/backend-types';

const emptyCollection: NetworkCollection = {
  items: [],
  count: 0,
  source: 'supabase',
  persistent: true,
  note: '',
};

export function ExplorePage() {
  const router = useRouter();
  const { profile } = useAuth();
  const isConsultant = profile?.userType === 'CONSULTOR';

  const [consultants, setConsultants] = useState<ConsultantDirectoryItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [connections, setConnections] = useState<NetworkCollection>(emptyCollection);
  const [favorites, setFavorites] = useState<NetworkCollection>(emptyCollection);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantDirectoryItem | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeSummary | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [budget, setBudget] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [minExperience, setMinExperience] = useState(0);
  const [maxAge, setMaxAge] = useState(100);
  const [minProjects, setMinProjects] = useState(0);
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (isConsultant
      ? Promise.all([fetchChallenges()])
      : Promise.all([fetchConsultants(), fetchConnections(), fetchFavorites()]))
      .then((response) => {
        if (!active) {
          return;
        }

        if (isConsultant) {
          setChallenges((response[0] as Awaited<ReturnType<typeof fetchChallenges>>).items);
          return;
        }

        const [consultantsResponse, connectionsResponse, favoritesResponse] = response as [
          Awaited<ReturnType<typeof fetchConsultants>>,
          Awaited<ReturnType<typeof fetchConnections>>,
          Awaited<ReturnType<typeof fetchFavorites>>,
        ];
        setConsultants(consultantsResponse.items);
        setConnections(connectionsResponse);
        setFavorites(favoritesResponse);
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : 'No pudimos cargar los datos.');
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
  }, [isConsultant]);

  const connectionIds = useMemo(() => new Set(connections.items.map((item) => item.id)), [connections]);
  const favoriteIds = useMemo(() => new Set(favorites.items.map((item) => item.id)), [favorites]);

  const categories = isConsultant
    ? ['Todos', ...new Set(challenges.map((challenge) => challenge.specialty).filter(Boolean) as string[])]
    : ['Todos', ...new Set(consultants.flatMap((consultant) => consultant.expertise))];

  const cities = isConsultant ? [] : [...new Set(consultants.map((consultant) => consultant.city))];

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

    return (
      matchesSearch &&
      matchesCategory &&
      consultant.rating >= minRating &&
      consultant.experience >= minExperience &&
      consultant.age <= maxAge &&
      consultant.projects >= minProjects &&
      (selectedCity === 'Todas' || consultant.city === selectedCity)
    );
  });

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Todos' || challenge.specialty === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleFavorite = async (consultantId: string) => {
    setBusyId(consultantId);

    try {
      const next = await toggleFavorite(consultantId);
      setFavorites(next);
      toast.success(favoriteIds.has(consultantId) ? 'Favorito eliminado' : 'Favorito actualizado');
    } catch (actionError) {
      toast.error(actionError instanceof Error ? actionError.message : 'No pudimos actualizar favoritos.');
    } finally {
      setBusyId(null);
    }
  };

  const handleConnect = async (consultantId: string) => {
    setBusyId(consultantId);

    try {
      const next = await addConnection(consultantId);
      setConnections(next);
      toast.success('Conexión guardada');
    } catch (actionError) {
      toast.error(actionError instanceof Error ? actionError.message : 'No pudimos crear la conexión.');
    } finally {
      setBusyId(null);
    }
  };

  const handleMessage = async (consultantId: string) => {
    setBusyId(consultantId);

    try {
      const conversation = await ensureConversation(consultantId);
      router.push(`/mensajes?conversationId=${conversation.id}`);
    } catch (actionError) {
      toast.error(actionError instanceof Error ? actionError.message : 'No pudimos abrir la conversación.');
    } finally {
      setBusyId(null);
    }
  };

  const handleAppointment = async (consultantId: string) => {
    setBusyId(consultantId);

    try {
      await createAppointment({
        consultantId,
        requestedAt: new Date(Date.now() + 86400000).toISOString(),
        note: 'Solicitud creada desde Explorar.',
      });
      toast.success('Consultoría solicitada');
    } catch (actionError) {
      toast.error(actionError instanceof Error ? actionError.message : 'No pudimos agendar la consultoría.');
    } finally {
      setBusyId(null);
    }
  };

  const handleApply = async () => {
    if (!selectedChallenge || !coverLetter.trim()) {
      toast.error('Escribe una carta de presentación para continuar.');
      return;
    }

    setBusyId(selectedChallenge.id);

    try {
      await createApplication({
        idDesafio: selectedChallenge.numericId ?? Number(selectedChallenge.id),
        coverLetter,
        proposedBudget: budget ? Number(budget) : null,
      });
      toast.success('Postulación enviada');
      setSelectedChallenge(null);
      setCoverLetter('');
      setBudget('');
    } catch (actionError) {
      toast.error(actionError instanceof Error ? actionError.message : 'No pudimos enviar la postulación.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            {isConsultant ? 'Buscar Desafíos' : 'Explorar Consultores'}
          </h1>
          <p className="text-lg text-white/70">
            {isConsultant ? 'Encuentra oportunidades reales y postúlate desde la app' : 'Conecta con talento verificado desde Nexora'}
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
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="relative min-w-[200px]">
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-[#2563EB]"
              >
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-[#0A1F44]">
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
            </div>

            {!isConsultant && (
              <button
                onClick={() => setShowFilters((current) => !current)}
                className={`flex items-center gap-2 px-6 py-3 border rounded-xl transition-all ${
                  showFilters ? 'bg-[#2563EB] border-[#2563EB] text-white' : 'bg-white/5 border-white/10 text-white'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filtros Avanzados</span>
              </button>
            )}
          </div>

          <AnimatePresence>
            {!isConsultant && showFilters && (
              <motion.div
                key="filter-drawer"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 pb-4 border-t border-white/10 mt-6">
                  <RangeGroup label="Rating Mínimo" values={[3, 3.5, 4, 4.5, 5]} current={minRating} onChange={setMinRating} suffix="+ ⭐" />
                  <RangeGroup label="Años de Experiencia" values={[2, 5, 10, 15]} current={minExperience} onChange={setMinExperience} suffix="+ años" />

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/60">Ciudad de Residencia</label>
                    <select
                      value={selectedCity}
                      onChange={(event) => setSelectedCity(event.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white appearance-none focus:outline-none focus:border-[#2563EB]"
                    >
                      <option value="Todas" className="bg-[#0A1F44]">Todas las ciudades</option>
                      {cities.map((city) => (
                        <option key={city} value={city} className="bg-[#0A1F44]">{city}</option>
                      ))}
                    </select>
                  </div>

                  <SliderControl label="Proyectos Realizados" min={0} max={100} value={minProjects} onChange={setMinProjects} />
                  <SliderControl label="Edad Máxima" min={20} max={70} value={maxAge} onChange={setMaxAge} />

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
            Mostrando{' '}
            <span className="text-white font-medium">
              {loading ? '...' : isConsultant ? filteredChallenges.length : filteredConsultants.length}
            </span>{' '}
            {isConsultant ? 'desafíos' : 'consultores'}
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
            : isConsultant
              ? filteredChallenges.map((challenge, index) => (
                  <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 * index }}>
                    <GlassCard className="p-6 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{challenge.specialty}</span>
                            <p className="text-xs text-white/45 mt-1">{challenge.companyName ?? 'Empresa tecnologica'}</p>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{challenge.title}</h3>
                        <p className="text-sm text-white/60 line-clamp-3 mb-6">{challenge.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="text-xs text-white/40">
                          <p className="font-semibold text-white/60">{challenge.mode}</p>
                          <p>{challenge.status}</p>
                        </div>
                        <button
                          onClick={() => setSelectedChallenge(challenge)}
                          className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-600/30 transition-all border border-blue-600/30"
                        >
                          Postular
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              : filteredConsultants.map((consultant, index) => (
                  <motion.div key={consultant.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 * index }}>
                    <ConsultantCard {...consultant} onViewProfile={() => setSelectedConsultant(consultant)} />
                  </motion.div>
                ))}
        </div>

        {!loading && (isConsultant ? filteredChallenges.length === 0 : filteredConsultants.length === 0) && (
          <GlassCard className="p-12 text-center mt-8">
            <Filter className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2" style={{ fontFamily: 'var(--font-secondary)' }}>
              No se encontraron resultados
            </h3>
            <p className="text-white/60">Intenta ajustar tus filtros o buscar con otros términos</p>
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
              className="relative w-full max-w-2xl max-h-[80vh] bg-[#0A1F44] border border-white/10 rounded-2xl sm:rounded-3xl overflow-y-auto shadow-2xl custom-scrollbar"
            >
              <div className="relative h-36 bg-gradient-to-br from-[#2563EB] to-[#6D5EF3]">
                <button
                  onClick={() => setSelectedConsultant(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute -bottom-12 left-8 mt-[-36px]">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#0A1F44] shadow-2xl">
                    <img src={selectedConsultant.image} alt={selectedConsultant.name} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-8 px-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-white">{selectedConsultant.name}</h2>
                      {selectedConsultant.verified && <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
                    </div>
                    <p className="text-[#2563EB] font-medium">{selectedConsultant.role}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
                    <span className="text-white font-bold">{selectedConsultant.rating}</span>
                  </div>
                </div>

                <p className="text-white/70 mb-8 leading-relaxed">{selectedConsultant.bio}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <InfoBox icon={Briefcase} label="Experiencia" value={`${selectedConsultant.experience} años`} />
                  <InfoBox icon={Award} label="Proyectos" value={`${selectedConsultant.projects}+ realizados`} />
                  <InfoBox icon={User} label="Edad" value={`${selectedConsultant.age} años`} />
                  <InfoBox icon={MapPin} label="Ciudad" value={selectedConsultant.city} />
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Especialidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedConsultant.expertise.map((skill, index) => (
                      <span key={index} className="px-4 py-2 bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] rounded-xl text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ActionButton
                    label="Agendar Consultoría"
                    icon={Calendar}
                    busy={busyId === selectedConsultant.id}
                    onClick={() => void handleAppointment(selectedConsultant.id)}
                  />
                  <ActionButton
                    label={favoriteIds.has(selectedConsultant.id) ? 'Quitar Favorito' : 'Guardar Favorito'}
                    icon={Heart}
                    busy={busyId === selectedConsultant.id}
                    onClick={() => void handleFavorite(selectedConsultant.id)}
                  />
                  <ActionButton
                    label={connectionIds.has(selectedConsultant.id) ? 'Ya Conectado' : 'Añadir a mi red'}
                    icon={UserPlus}
                    busy={busyId === selectedConsultant.id || connectionIds.has(selectedConsultant.id)}
                    onClick={() => void handleConnect(selectedConsultant.id)}
                  />
                  <ActionButton
                    label="Enviar Mensaje"
                    icon={MessageSquare}
                    busy={busyId === selectedConsultant.id}
                    onClick={() => void handleMessage(selectedConsultant.id)}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedChallenge(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-[#0A1F44] border border-white/10 rounded-3xl p-8"
            >
              <button
                onClick={() => setSelectedChallenge(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl text-white mb-2" style={{ fontFamily: 'var(--font-secondary)' }}>
                {selectedChallenge.title}
              </h2>
              <p className="text-sm text-[#9CC2FF] mb-2">{selectedChallenge.companyName ?? 'Empresa tecnologica'}</p>
              <p className="text-white/60 mb-6">{selectedChallenge.description}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Carta de presentación</label>
                  <textarea
                    rows={5}
                    value={coverLetter}
                    onChange={(event) => setCoverLetter(event.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Presupuesto propuesto</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <button
                  onClick={() => void handleApply()}
                  disabled={busyId === selectedChallenge.id}
                  className="w-full py-4 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white rounded-2xl font-bold disabled:opacity-50"
                >
                  {busyId === selectedChallenge.id ? 'Enviando...' : 'Enviar Postulación'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RangeGroup({
  label,
  values,
  current,
  onChange,
  suffix,
}: {
  label: string;
  values: number[];
  current: number;
  onChange: (value: number) => void;
  suffix: string;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white/60">{label}</label>
      <div className="flex gap-2">
        {values.map((value) => (
          <button
            key={value}
            onClick={() => onChange(value === current ? 0 : value)}
            className={`flex-1 py-2 rounded-lg border transition-all text-sm ${
              current === value
                ? 'bg-[#2563EB]/20 border-[#2563EB] text-[#2563EB]'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            {value}{suffix}
          </button>
        ))}
      </div>
    </div>
  );
}

function SliderControl({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white/60">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
      />
      <div className="text-xs text-white/40">Valor actual: {value}</div>
    </div>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
      <Icon className="w-5 h-5 text-white/40 mb-2" />
      <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
      <p className="text-white font-semibold">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  busy,
  onClick,
}: {
  label: string;
  icon: typeof Calendar;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="py-4 px-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
    >
      <Icon className="w-4 h-4" />
      <span>{busy ? 'Procesando...' : label}</span>
    </button>
  );
}
