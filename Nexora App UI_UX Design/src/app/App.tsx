import { GridFloor } from './components/GridFloor';
import { ParticleSystem } from './components/ParticleSystem';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { GlassCard } from './components/GlassCard';
import { ConsultantCard } from './components/ConsultantCard';
import { StatsCard } from './components/StatsCard';
import { Users, Briefcase, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const consultants = [
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

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <GridFloor />
      <ParticleSystem />

      {/* Layout */}
      <Sidebar />
      <Header />

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-20 pb-20 lg:pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#2563EB]" />
              <span className="text-sm text-white/60 uppercase tracking-wider">Plataforma Premium</span>
            </div>
            <h1 className="text-4xl lg:text-5xl mb-4 text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
              Conecta con los mejores
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#6D5EF3]">
                consultores estratégicos
              </span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mb-6">
              Accede a una red exclusiva de expertos verificados en transformación empresarial,
              estrategia y gestión de cambio.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                className="px-8 py-4 rounded-xl text-white shadow-2xl shadow-[#2563EB]/50 flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #6D5EF3 100%)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Explorar Consultores</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="px-8 py-4 rounded-xl border border-white/20 text-white backdrop-blur-xl hover:bg-white/5 transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Unirse como Consultor
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <StatsCard
              title="Consultores Activos"
              value="1,247"
              change="+12.5%"
              icon={Users}
              color="blue"
            />
            <StatsCard
              title="Proyectos Completados"
              value="3,842"
              change="+23.1%"
              icon={Briefcase}
              color="purple"
            />
            <StatsCard
              title="Tasa de Éxito"
              value="98.5%"
              change="+2.3%"
              icon={TrendingUp}
              color="green"
            />
          </motion.div>

          {/* Featured Consultants */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl lg:text-3xl text-white mb-2" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Consultores Destacados
                </h2>
                <p className="text-white/60">Profesionales verificados con las mejores valoraciones</p>
              </div>
              <button className="hidden lg:flex items-center gap-2 text-[#2563EB] hover:text-[#6D5EF3] transition-colors">
                <span>Ver todos</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {consultants.map((consultant, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <ConsultantCard {...consultant} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl lg:text-3xl text-white mb-8 text-center" style={{ fontFamily: 'var(--font-secondary)' }}>
              Cómo funciona
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'Explora Perfiles',
                  description: 'Navega por nuestra base de datos de consultores verificados con experiencia comprobada.',
                },
                {
                  step: '02',
                  title: 'Conecta Directamente',
                  description: 'Envía propuestas y comunícate directamente con los expertos que necesitas.',
                },
                {
                  step: '03',
                  title: 'Transforma tu Negocio',
                  description: 'Colabora en proyectos estratégicos con seguimiento y resultados medibles.',
                },
              ].map((item, index) => (
                <GlassCard key={index} className="p-8 text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-2xl text-white"
                    style={{
                      background: 'linear-gradient(135deg, #2563EB 0%, #6D5EF3 100%)',
                      fontFamily: 'var(--font-secondary)',
                    }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
                    {item.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                </GlassCard>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <GlassCard className="p-8 lg:p-12 text-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.3) 0%, transparent 70%)',
                  filter: 'blur(60px)',
                }}
              />
              <div className="relative z-10">
                <h2 className="text-3xl lg:text-4xl text-white mb-4" style={{ fontFamily: 'var(--font-secondary)' }}>
                  ¿Listo para transformar tu organización?
                </h2>
                <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                  Únete a cientos de empresas que ya están trabajando con los mejores consultores de la industria.
                </p>
                <motion.button
                  className="px-10 py-5 rounded-xl text-white shadow-2xl shadow-[#2563EB]/50 text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #6D5EF3 100%)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Comenzar Ahora
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}

export default App;
