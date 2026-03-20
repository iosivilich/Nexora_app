import { Search, Bell, Menu } from 'lucide-react';
import { motion } from 'motion/react';

export function Header() {
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
            <button className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Nexora Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
              <span className="text-2xl tracking-tight text-white font-bold" style={{ fontFamily: 'var(--font-accent)' }}>
                Nexora
              </span>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar consultores, organizaciones o proyectos..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB] focus:bg-white/10 transition-all backdrop-blur-xl"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-white" />
            </button>
            <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#22C55E] rounded-full border border-[#0A1F44]"></span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2563EB] shadow-lg shadow-[#2563EB]/30">
              <img
                src="https://images.unsplash.com/photo-1613473350016-1fe047d6d360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzMzODQyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
