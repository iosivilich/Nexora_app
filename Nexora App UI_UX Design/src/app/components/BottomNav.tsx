import { Home, Search, Users, MessageSquare, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function BottomNav() {
  const [active, setActive] = useState('home');

  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'search', icon: Search, label: 'Buscar' },
    { id: 'network', icon: Users, label: 'Red' },
    { id: 'messages', icon: MessageSquare, label: 'Mensajes' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t border-white/10"
      style={{
        background: 'rgba(10, 31, 68, 0.9)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(109, 94, 243, 0.2) 100%)',
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-[#2563EB]' : 'text-white/60'
                }`}
              />
              <span
                className={`text-xs relative z-10 transition-colors ${
                  isActive ? 'text-white' : 'text-white/60'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
