'use client';

import { Home, Search, Users, MessageSquare, Briefcase, Handshake, SearchCode } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const pathname = usePathname();
  const { profile, loading: authLoading } = useAuth();
  
  if (authLoading) return <div className="hidden lg:flex w-72 h-full border-r border-white/10 bg-black/20" />;

  const isConsultant = profile?.userType === 'CONSULTOR';

  const navItems = [
    { id: 'home', path: '/', icon: Home, label: 'Inicio' },
    { 
      id: 'search', 
      path: '/explorar', 
      icon: isConsultant ? SearchCode : Search, 
      label: isConsultant ? 'Buscar Desafíos' : 'Explorar Talento' 
    },
    { 
      id: 'network', 
      path: '/red', 
      icon: isConsultant ? Handshake : Users, 
      label: isConsultant ? 'Comunidad' : 'Mi Red' 
    },
    { 
      id: 'projects', 
      path: '/proyectos', 
      icon: Briefcase, 
      label: isConsultant ? 'Mis Postulaciones' : 'Proyectos Activos' 
    },
    { id: 'messages', path: '/mensajes', icon: MessageSquare, label: 'Mensajes' }
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
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Nexora Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(37,99,235,0.5)]" />
          <span className="text-2xl tracking-tight text-white font-bold" style={{ fontFamily: 'var(--font-accent)' }}>
            Nexora
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.id}
                href={item.path}
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
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
