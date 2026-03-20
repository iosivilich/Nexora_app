import { GlassCard } from './GlassCard';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green';
}

const colorStyles = {
  blue: {
    gradient: 'from-[#2563EB] to-[#1d4ed8]',
    glow: 'rgba(37, 99, 235, 0.3)',
    text: '#2563EB',
  },
  purple: {
    gradient: 'from-[#6D5EF3] to-[#5b4ed4]',
    glow: 'rgba(109, 94, 243, 0.3)',
    text: '#6D5EF3',
  },
  green: {
    gradient: 'from-[#22C55E] to-[#16a34a]',
    glow: 'rgba(34, 197, 94, 0.3)',
    text: '#22C55E',
  },
};

export function StatsCard({ title, value, change, icon: Icon, color }: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <GlassCard className="p-6 relative overflow-hidden" hover={false}>
      {/* Background Glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30"
        style={{
          background: `radial-gradient(circle, ${styles.glow} 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-white/60 mb-1">{title}</p>
            <h3 className="text-3xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
              {value}
            </h3>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${styles.gradient} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.span
            className="text-sm px-2 py-1 rounded-md"
            style={{ backgroundColor: `${styles.glow}`, color: styles.text }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {change}
          </motion.span>
          <span className="text-xs text-white/50">vs mes anterior</span>
        </div>
      </div>
    </GlassCard>
  );
}
