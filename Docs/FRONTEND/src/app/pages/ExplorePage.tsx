'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, SlidersHorizontal, ChevronDown, X, Award, MapPin, Briefcase, Star, User, Calendar, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { ConsultantCard } from '../components/ConsultantCard';

const allConsultants = [
  {
    name: 'María González',
    role: 'Consultora en Transformación Digital',
    location: 'Madrid, España',
    city: 'Madrid',
    rating: 4.9,
    projects: 47,
    experience: 12,
    age: 38,
    expertise: ['Digital', 'Estrategia', 'Innovación', 'Project Management'],
    image: 'https://images.unsplash.com/photo-1613473350016-1fe047d6d360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzMzODQyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
    bio: 'Experta en guiar empresas a través de su transformación digital con un enfoque en la eficiencia operativa y la experiencia del cliente.',
  },
  {
    name: 'Carlos Mendoza',
    role: 'Experto en Gestión de Cambio',
    location: 'Barcelona, España',
    city: 'Barcelona',
    rating: 4.8,
    projects: 35,
    experience: 15,
    age: 42,
    expertise: ['Cambio', 'Liderazgo', 'Cultura', 'Agile'],
    image: 'https://images.unsplash.com/photo-1530281834572-02d15fa61f64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwYnVzaW5lc3MlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzMzNTQxMjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
    bio: 'Apasionado por transformar culturas organizacionales y capacitar líderes para navegar en entornos de constante cambio.',
  },
  {
    name: 'Ana Chen',
    role: 'Consultora en Estrategia Empresarial',
    location: 'Valencia, España',
    city: 'Valencia',
    rating: 5.0,
    projects: 62,
    experience: 18,
    age: 45,
    expertise: ['Estrategia', 'Growth', 'M&A', 'Cloud Computing'],
    image: 'https://images.unsplash.com/photo-1758369636875-60b3dcb76366?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGJ1c2luZXNzd29tYW4lMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczMzQwMDEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
    bio: 'Estratega de negocios con amplia experiencia en fusiones, adquisiciones y planes de crecimiento exponencial para startups tecnológicas.',
  },
  {
    name: 'Roberto Silva',
    role: 'Consultor en Operaciones',
    location: 'Lisboa, Portugal',
    city: 'Lisboa',
    rating: 4.7,
    projects: 29,
    experience: 8,
    age: 34,
    expertise: ['Operaciones', 'Lean', 'Eficiencia', 'Data Science'],
    image: 'https://images.unsplash.com/photo-1769839271768-aee5469799ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjb25zdWx0YW50JTIwYnVzaW5lc3MlMjBtZWV0aW5nfGVufDF8fHx8MTc3MzQzMzczNHww&ixlib=rb-4.1.0&q=80&w=1080',
    verified: false,
    bio: 'Especialista en optimización de procesos operativos mediante metodologías lean y análisis de datos avanzado.',
  },
  {
    name: 'Diego Ramírez',
    role: 'Consultor en Marketing Digital',
    location: 'Sevilla, España',
    city: 'Sevilla',
    rating: 4.9,
    projects: 41,
    experience: 10,
    age: 32,
    expertise: ['Marketing', 'Digital', 'SEO', 'Artificial Intelligence'],
    image: 'https://images.unsplash.com/photo-1742569184536-77ff9ae46c99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXNwYW5pYyUyMG1hbGUlMjBjb25zdWx0YW50JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3NDAzNDE4OHww&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
    bio: 'Experto en estrategias de marketing impulsadas por IA, enfocado en maximizar el ROI y la visibilidad orgánica en buscadores.',
  },
];

const categories = [
  'Todos',
  'Artificial Intelligence',
  'Data Science',
  'Cyber Security',
  'Blockchain',
  'Cloud Computing',
  'Digital Marketing',
  'Project Management',
  'Innovation Strategy',
  'Digital Transformation',
  'Agile Coaching'
];

const cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Lisboa'];

export function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null);
  
  // Advanced Filter States
  const [minRating, setMinRating] = useState(0);
  const [minExperience, setMinExperience] = useState(0);
  const [maxAge, setMaxAge] = useState(100);
  const [minProjects, setMinProjects] = useState(0);
  const [selectedCity, setSelectedCity] = useState('Todas');

  const filteredConsultants = allConsultants.filter((consultant) => {
    const matchesSearch =
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.expertise.some((exp) => exp.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'Todos' ||
      consultant.expertise.some((exp) => exp.includes(selectedCategory));

    const matchesRating = consultant.rating >= minRating;
    const matchesExperience = consultant.experience >= minExperience;
    const matchesAge = consultant.age <= maxAge;
    const matchesProjects = consultant.projects >= minProjects;
    const matchesCity = selectedCity === 'Todas' || consultant.city === selectedCity;

    return matchesSearch && matchesCategory && matchesRating && matchesExperience && matchesAge && matchesProjects && matchesCity;
  });

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
            Explorar Consultores
          </h1>
          <p className="text-lg text-white/70">
            Encuentra al experto perfecto para tu proyecto
          </p>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por nombre, especialidad o habilidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB] transition-all"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative min-w-[200px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-[#2563EB] transition-all cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0A1F44]">
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
            </div>

            {/* Filter Toggle Button */}
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

          {/* Advanced Filters Drawer */}
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
                  {/* Rating Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/60">Rating Mínimo</label>
                    <div className="flex gap-2">
                      {[3, 3.5, 4, 4.5, 5].map((r) => (
                        <button
                          key={r}
                          onClick={() => setMinRating(r === minRating ? 0 : r)}
                          className={`flex-1 py-2 rounded-lg border transition-all text-sm ${
                            minRating === r 
                            ? 'bg-[#2563EB]/20 border-[#2563EB] text-[#2563EB]' 
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {r}+ ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/60">Años de Experiencia</label>
                    <div className="flex gap-2">
                      {[2, 5, 10, 15].map((exp) => (
                        <button
                          key={exp}
                          onClick={() => setMinExperience(exp === minExperience ? 0 : exp)}
                          className={`flex-1 py-2 rounded-lg border transition-all text-sm ${
                            minExperience === exp 
                            ? 'bg-[#2563EB]/20 border-[#2563EB] text-[#2563EB]' 
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {exp}+ años
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* City Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/60">Ciudad de Residencia</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white appearance-none focus:outline-none focus:border-[#2563EB]"
                    >
                      <option value="Todas" className="bg-[#0A1F44]">Todas las ciudades</option>
                      {cities.map(city => (
                        <option key={city} value={city} className="bg-[#0A1F44]">{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Projects Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/60">Proyectos Realizados</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={minProjects}
                      onChange={(e) => setMinProjects(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                    />
                    <div className="flex justify-between text-xs text-white/40">
                      <span>0</span>
                      <span>Min: {minProjects} proyectos</span>
                      <span>100+</span>
                    </div>
                  </div>

                  {/* Age Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/60">Edad Máxima</label>
                    <input
                      type="range"
                      min="20"
                      max="70"
                      value={maxAge}
                      onChange={(e) => setMaxAge(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                    />
                    <div className="flex justify-between text-xs text-white/40">
                      <span>20</span>
                      <span>Máx: {maxAge} años</span>
                      <span>70</span>
                    </div>
                  </div>

                  {/* Reset Button */}
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

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-white/60">
            Mostrando <span className="text-white font-medium">{filteredConsultants.length}</span> consultores
          </p>
          {selectedCategory !== 'Todos' && (
            <button 
              onClick={() => setSelectedCategory('Todos')}
              className="text-sm text-[#2563EB] hover:underline"
            >
              Limpiar categoría
            </button>
          )}
        </div>

        {/* Consultants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredConsultants.map((consultant, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * index }}
            >
              <ConsultantCard 
                {...consultant} 
                onViewProfile={() => setSelectedConsultant(consultant)}
              />
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredConsultants.length === 0 && (
          <GlassCard className="p-12 text-center">
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

      {/* Consultant Details Modal */}
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
              {/* Modal Header/Hero */}
              <div className="relative h-48 bg-gradient-to-br from-[#2563EB] to-[#6D5EF3]">
                <button 
                  onClick={() => setSelectedConsultant(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute -bottom-12 left-8">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#0A1F44] shadow-2xl">
                    <img src={selectedConsultant.image} alt={selectedConsultant.name} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Modal Content */}
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
                  {selectedConsultant.bio || "Consultor especializado con amplia trayectoria en el sector bancario y tecnológico, apasionado por resolver problemas complejos."}
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
                    <p className="text-white font-semibold">{selectedConsultant.projects}+ Realizados</p>
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
                    {selectedConsultant.expertise.map((skill: string, idx: number) => (
                      <span key={idx} className="px-4 py-2 bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] rounded-xl text-sm">
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
