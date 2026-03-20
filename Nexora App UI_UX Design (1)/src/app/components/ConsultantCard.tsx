import { GlassCard } from './GlassCard';
import { CheckCircle2, Star, MapPin, Briefcase, User } from 'lucide-react';
import { motion } from 'motion/react';

interface ConsultantCardProps {
  name: string;
  role: string;
  location: string;
  rating: number;
  projects: number;
  experience: number;
  age: number;
  expertise: string[];
  image: string;
  verified?: boolean;
  onViewProfile?: () => void;
}

export function ConsultantCard({
  name,
  role,
  location,
  rating,
  projects,
  experience,
  age,
  expertise,
  image,
  verified = false,
  onViewProfile,
}: ConsultantCardProps) {
  return (
    <GlassCard className="p-6 relative overflow-hidden group">
      {/* Gradient Accent */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Image & Verified Badge */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl">
              <img src={image} alt={name} className="w-full h-full object-cover" />
            </div>
            {verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#22C55E] rounded-full flex items-center justify-center border-2 border-[#0A1F44] shadow-lg shadow-[#22C55E]/50">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white mb-1 truncate">{name}</h3>
            <p className="text-sm text-white/60 mb-2 truncate">{role}</p>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
            <span className="text-sm text-white/90">{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-white/60">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm">{experience}a exp</span>
          </div>
          <div className="flex items-center gap-1 text-white/50">
            <User className="w-4 h-4" />
            <span className="text-sm">{age} años</span>
          </div>
        </div>

        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {expertise.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 text-[#2563EB]"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <motion.button
          onClick={onViewProfile}
          className="w-full py-3 rounded-lg text-white relative overflow-hidden group/btn"
          style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #6D5EF3 100%)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="relative z-10">Ver Perfil</span>
          <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity" />
        </motion.button>
      </div>
    </GlassCard>
  );
}
