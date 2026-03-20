import { Home, Search, Users, MessageSquare, Briefcase, Settings, TrendingUp, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function Sidebar() {
  const [active, setActive] = useState('home');

  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'search', icon: Search, label: 'Explorar' },
    { id: 'network', icon: Users, label: 'Mi Red' },
    { id: 'projects', icon: Briefcase, label: 'Proyectos' },
    { id: 'messages', icon: MessageSquare, label: 'Mensajes' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
  ];

  const secondaryItems = [
    { id: 'profile', icon: User, label: 'Perfil' },
    { id: 'settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 flex-col backdrop-blur-xl border-r border-white/10 z-40"
      style={{
        background: 'rgba(10, 31, 68, 0.7)',
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Nexora Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(37,99,235,0.5)]" />
          <span className="text-2xl tracking-tight text-white font-bold" style={{ fontFamily: 'var(--font-accent)' }}>
            Nexora
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className="relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebar"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(109, 94, 243, 0.2) 100%)',
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors ${
                    isActive ? 'text-[#2563EB]' : 'text-white/60 group-hover:text-white/80'
                  }`}
                />
                <span
                  className={`relative z-10 transition-colors ${
                    isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Secondary Navigation */}
      <div className="p-4 border-t border-white/10">
        <nav className="space-y-1">
          {secondaryItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white/60 hover:text-white/80 hover:bg-white/5"
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
