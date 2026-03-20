import { motion } from 'motion/react';
import { Bell, Lock, Globe, Moon, Shield, CreditCard } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            Configuración
          </h1>
          <p className="text-lg text-white/70">
            Personaliza tu experiencia en Nexora
          </p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Notificaciones
                </h3>
                <p className="text-sm text-white/60">Gestiona tus preferencias de notificación</p>
              </div>
            </div>

            <div className="space-y-4">
              {['Mensajes nuevos', 'Actualizaciones de proyectos', 'Solicitudes de conexión'].map((item) => (
                <div key={item} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                  <span className="text-white/80">{item}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#2563EB] peer-checked:to-[#6D5EF3]"></div>
                  </label>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Privacy */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D5EF3] to-[#5b4ed4] flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Privacidad y Seguridad
                </h3>
                <p className="text-sm text-white/60">Controla quién puede ver tu información</p>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors">
                Cambiar contraseña
              </button>
              <button className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors">
                Autenticación de dos factores
              </button>
              <button className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors">
                Gestionar dispositivos conectados
              </button>
            </div>
          </GlassCard>

          {/* Other Settings */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Preferencias
                </h3>
                <p className="text-sm text-white/60">Idioma, región y más</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <span className="text-white/80">Idioma</span>
                <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2563EB]">
                  <option>Español</option>
                  <option>English</option>
                  <option>Français</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-white/80">Zona horaria</span>
                <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2563EB]">
                  <option>GMT+1 (Madrid)</option>
                  <option>GMT+0 (Londres)</option>
                  <option>GMT+2 (París)</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
}
