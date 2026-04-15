'use client';

import { motion } from 'motion/react';
import { Mail, MapPin, Briefcase, Calendar, Edit } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export function ProfilePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            Mi Perfil
          </h1>
          <p className="text-lg text-white/70">
            Gestiona tu información personal y profesional
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <img
                  src="https://images.unsplash.com/photo-1613473350016-1fe047d6d360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzMzODQyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#2563EB] shadow-lg shadow-[#2563EB]/30"
                />
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] rounded-full flex items-center justify-center shadow-lg">
                  <Edit className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <h2 className="text-2xl text-white mb-2" style={{ fontFamily: 'var(--font-secondary)' }}>
                María González
              </h2>
              <p className="text-white/70 mb-4">Consultora Digital Senior</p>

              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-white/60">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">maria@nexora.com</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">Madrid, España</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <Calendar className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">Miembro desde Enero 2024</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Información Personal
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors">
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Nombre Completo</label>
                  <p className="text-white">María González Pérez</p>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email</label>
                  <p className="text-white">maria@nexora.com</p>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Teléfono</label>
                  <p className="text-white">+34 612 345 678</p>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Ubicación</label>
                  <p className="text-white">Madrid, España</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-xl text-white mb-4" style={{ fontFamily: 'var(--font-secondary)' }}>
                Experiencia Profesional
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#6D5EF3] flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white mb-1">Consultora Senior</h4>
                    <p className="text-sm text-white/60 mb-2">Nexora Consulting • 2022 - Presente</p>
                    <p className="text-sm text-white/70">
                      Liderando proyectos de transformación digital para clientes corporativos en Europa.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D5EF3] to-[#5b4ed4] flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white mb-1">Consultora Digital</h4>
                    <p className="text-sm text-white/60 mb-2">Tech Innovators • 2019 - 2022</p>
                    <p className="text-sm text-white/70">
                      Implementación de estrategias digitales para startups y empresas tecnológicas.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
