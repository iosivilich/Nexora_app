import { Home, Search, Users, MessageSquare, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router';

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { id: 'home', path: '/', icon: Home, label: 'Inicio' },
    { id: 'search', path: '/explorar', icon: Search, label: 'Buscar' },
    { id: 'projects', path: '/proyectos', icon: Briefcase, label: 'Proyectos' },
    { id: 'network', path: '/red', icon: Users, label: 'Red' },
    { id: 'messages', path: '/mensajes', icon: MessageSquare, label: 'Mensajes' },
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
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}