import { GlassCard } from '../components/GlassCard';
import { ConsultantCard } from '../components/ConsultantCard';
import { StatsCard } from '../components/StatsCard';
import { Users, Briefcase, TrendingUp, Sparkles, ArrowRight, Building2, Search, Target, Rocket, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';

const consultants = [
  {
    name: 'María González',
    role: 'Consultora en Transformación Digital',
    location: 'Madrid, España',
    rating: 4.9,
    projects: 47,
    experience: 12,
    age: 38,
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
    experience: 15,
    age: 42,
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
    experience: 18,
    age: 45,
    expertise: ['Estrategia', 'Growth', 'M&A'],
    image: 'https://images.unsplash.com/photo-1758369636836-60b3dcb76366?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGJ1c2luZXNzd29tYW4lMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczMzQwMDEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    verified: true,
  },
  {
    name: 'Roberto Silva',
    role: 'Consultor en Operaciones',
    location: 'Lisboa, Portugal',
    rating: 4.7,
    projects: 29,
    experience: 8,
    age: 34,
    expertise: ['Operaciones', 'Lean', 'Eficiencia'],
    image: 'https://images.unsplash.com/photo-1769839271768-aee5469799ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjb25zdWx0YW50JTIwYnVzaW5lc3MlMjBtZWV0aW5nfGVufDF8fHx8MTc3MzQzMzczNHww&ixlib=rb-4.1.0&q=80&w=1080',
    verified: false,
  },
];

export function HomePage() {
  const { profile } = useAuth();
  const isConsultant = profile?.user_type === 'CONSULTOR';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isConsultant ? <ConsultantHome /> : <CompanyHome />}
    </div>
  );
}

function CompanyHome() {
  return (
    <>
      {/* Hero Section */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#2563EB]" />
          <span className="text-sm text-white/60 uppercase tracking-wider">Gestión de Talento Elite</span>
        </div>
        <h1 className="text-4xl lg:text-5xl mb-4 text-white font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
          Encuentra el experto
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#6D5EF3]">
            que tu empresa necesita
          </span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mb-8">
          Accede a una red exclusiva de consultores verificados preparados para resolver los desafíos más complejos de tu organización.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/explorar">
            <motion.button
              className="px-8 py-4 rounded-xl text-white shadow-2xl shadow-[#2563EB]/50 flex items-center gap-2 font-bold"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #6D5EF3 100%)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Explorar Talento</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <Link to="/proyectos">
            <motion.button
              className="px-8 py-4 rounded-xl border border-white/20 text-white backdrop-blur-xl hover:bg-white/5 transition-colors font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Publicar Desafío
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <StatsCard title="Consultores Activos" value="1,247" change="+12.5%" icon={Users} color="blue" />
        <StatsCard title="Proyectos en Curso" value="482" change="+5.2%" icon={Briefcase} color="purple" />
        <StatsCard title="Empresas Satisfechas" value="890" change="+18.3%" icon={Building2} color="green" />
      </div>

      {/* Featured Consultants */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl text-white mb-2 font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
              Consultores Destacados
            </h2>
            <p className="text-white/60">Talento verificado con las mejores métricas de desempeño</p>
          </div>
          <Link to="/explorar" className="hidden lg:flex items-center gap-2 text-[#2563EB] hover:text-[#6D5EF3] transition-colors font-bold">
            <span>Ver todos</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {consultants.map((consultant, index) => (
            <ConsultantCard key={index} {...consultant} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <HowItWorks company />
    </>
  );
}

function ConsultantHome() {
  return (
    <>
      {/* Hero Section */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="w-5 h-5 text-[#6D5EF3]" />
          <span className="text-sm text-white/60 uppercase tracking-wider">Tu Próximo Gran Desafío</span>
        </div>
        <h1 className="text-4xl lg:text-5xl mb-4 text-white font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
          Impulsa tu carrera con
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D5EF3] to-[#2563EB]">
            proyectos estratégicos
          </span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mb-8">
          Accede a los desafíos más relevantes de las empresas líderes y colabora en la transformación organizacional del mercado.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/explorar">
            <motion.button
              className="px-8 py-4 rounded-xl text-white shadow-2xl shadow-[#6D5EF3]/50 flex items-center gap-2 font-bold"
              style={{
                background: 'linear-gradient(135deg, #6D5EF3 0%, #2563EB 100%)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-5 h-5" />
              <span>Buscar Proyectos</span>
            </motion.button>
          </Link>
          <Link to="/proyectos">
            <motion.button
              className="px-8 py-4 rounded-xl border border-white/20 text-white backdrop-blur-xl hover:bg-white/5 transition-colors font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Mis Postulaciones
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Consultant Stats - Featured Companies Metrics */}
      <section className="mb-16">
        <h2 className="text-xl text-white/80 mb-6 font-semibold uppercase tracking-widest text-sm">Oportunidades en el Mercado</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <StatsCard title="Empresas Destacadas" value="124" change="+10" icon={Building2} color="purple" />
          <StatsCard title="Proyectos Abiertos" value="2,456" change="+120" icon={Briefcase} color="blue" />
          <StatsCard title="Tasa de Aceptación" value="85%" change="+2.4%" icon={Target} color="green" />
        </div>
      </section>

      {/* How it works for Consultants */}
      <HowItWorks />

      {/* Featured Companies metrics or categories */}
      <section className="mt-16 bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl text-white mb-6 font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
              ¿Qué necesitas hoy?
            </h2>
            <div className="space-y-4">
              {[
                { icon: Search, text: 'Encontrar nuevos desafíos estratégicos' },
                { icon: Users, text: 'Colaborar con otros consultores de la red' },
                { icon: HelpCircle, text: 'Recibir soporte de Nexora AI' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-white/70">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <item.icon className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <span className="text-lg">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
             <GlassCard className="p-6">
                <p className="text-3xl font-bold text-white mb-1">50+</p>
                <p className="text-xs text-white/40 uppercase font-bold">Empresas Top 500</p>
             </GlassCard>
             <GlassCard className="p-6">
                <p className="text-3xl font-bold text-white mb-1">$45k</p>
                <p className="text-xs text-white/40 uppercase font-bold">Ingresos Promedio</p>
             </GlassCard>
             <GlassCard className="p-6">
                <p className="text-3xl font-bold text-white mb-1">24/7</p>
                <p className="text-xs text-white/40 uppercase font-bold">Soporte Estratégico</p>
             </GlassCard>
             <GlassCard className="p-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/20">
                <p className="text-3xl font-bold mb-1">AI</p>
                <p className="text-xs uppercase font-bold">Enabled</p>
             </GlassCard>
          </div>
        </div>
      </section>
    </>
  );
}

function HowItWorks({ company }: { company?: boolean }) {
  const steps = company ? [
    { step: '01', title: 'Publica tu Desafío', description: 'Describe tus objetivos estratégicos y necesidades.' },
    { step: '02', title: 'Selecciona Talento', description: 'Revisa perfiles verificados y conecta con los mejores.' },
    { step: '03', title: 'Transforma', description: 'Colabora y obtén resultados tangibles para tu negocio.' },
  ] : [
    { step: '01', title: 'Completa tu Perfil', description: 'Muestra tu experiencia, rating y especialidad al mundo.' },
    { step: '02', title: 'Postula a Proyectos', description: 'Encuentra los desafíos que mejor se adaptan a tu perfil.' },
    { step: '03', title: 'Genera Valor', description: 'Ayuda a las empresas a crecer y consolida tu reputación.' },
  ];

  return (
    <section className="mt-16">
      <h2 className="text-2xl lg:text-3xl text-white mb-10 text-center font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
        Cómo funciona para {company ? 'Empresas' : 'Consultores'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((item, index) => (
          <GlassCard key={index} className="p-8 text-center border-white/5 hover:border-white/20 transition-all">
            <div
              className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-2xl text-white font-bold shadow-xl shadow-black/20`}
              style={{
                background: company 
                  ? 'linear-gradient(135deg, #2563EB 0%, #6D5EF3 100%)' 
                  : 'linear-gradient(135deg, #6D5EF3 0%, #2563EB 100%)',
              }}
            >
              {item.step}
            </div>
            <h3 className="text-xl text-white mb-3 font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
              {item.title}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
