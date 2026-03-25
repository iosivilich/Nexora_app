import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { user, profile, signOut, loading } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowProfileMenu(false);
    navigate('/');
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/10"
      style={{
        background: 'rgba(10, 31, 68, 0.7)',
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Nexora Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
              <span className="text-2xl tracking-tight text-white font-bold" style={{ fontFamily: 'var(--font-accent)' }}>
                Nexora
              </span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {user ? (
              <>
                <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-white" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#22C55E] rounded-full border border-[#0A1F44]"></span>
                </button>
                
                {/* Profile Dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2563EB] shadow-lg shadow-[#2563EB]/30 bg-blue-500/20">
                      <img
                        src={profile?.avatar_url || user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <ChevronDown className={`w-4 h-4 text-white/60 transition-transform hidden sm:block ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <motion.div
                      className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden"
                      style={{
                        background: 'rgba(10, 31, 68, 0.95)',
                      }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-4 border-b border-white/10 bg-white/5">
                        <p className="text-white font-medium truncate">{profile?.full_name || user.user_metadata.full_name || 'Usuario'}</p>
                        <p className="text-sm text-white/60 truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/perfil"
                          className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User className="w-5 h-5" />
                          <span>Mi Perfil</span>
                        </Link>
                        <Link
                          to="/configuracion"
                          className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings className="w-5 h-5" />
                          <span>Configuración</span>
                        </Link>
                      </div>
                      <div className="p-2 border-t border-white/10">
                        <button 
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors w-full"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              !loading && (
                <Link to="/login">
                  <motion.button
                    className="px-6 py-2 rounded-xl text-white flex items-center gap-2 border border-white/20 hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </motion.button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}