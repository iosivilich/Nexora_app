'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Rocket, Briefcase, Tag, DollarSign, Globe, AlertCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { createChallenge } from '../../lib/api';
import { useAuth } from '../context/AuthContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    specialty: '',
    budget: '',
    mode: 'Remoto'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.companyRecord?.idEmpresa) {
      setError('No se pudo encontrar el ID de tu empresa. Por favor, contacta a soporte.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createChallenge({
        idEmpresa: profile.companyRecord.idEmpresa,
        title: formData.title,
        description: formData.description,
        specialty: formData.specialty,
        budget: formData.budget ? Number(formData.budget) : null,
        mode: formData.mode,
        status: 'ACTIVO'
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear el proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-[#0A1F44] border border-white/10 rounded-2xl sm:rounded-3xl overflow-y-auto shadow-2xl custom-scrollbar"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Rocket className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Publicar Nuevo Desafío</h2>
                  <p className="text-sm text-white/40">Describe tu necesidad estratégica</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
              {error && (
                <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-3">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" /> Título del Proyecto
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Ej: Transformación Digital"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-all text-sm"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" /> Descripción Detallada
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe los objetivos..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-all text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Specialty */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                      <Rocket className="w-3.5 h-3.5" /> Especialidad
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.specialty}
                      onChange={e => setFormData({...formData, specialty: e.target.value})}
                      placeholder="Ej: Estrategia, IT"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-all text-sm"
                    />
                  </div>

                  {/* Budget */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5" /> Presupuesto
                    </label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={e => setFormData({...formData, budget: e.target.value})}
                      placeholder="Ej: 5000000"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> Modalidad
                  </label>
                  <select
                    value={formData.mode}
                    onChange={e => setFormData({...formData, mode: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500 transition-all text-sm"
                  >
                    <option value="Remoto" className="bg-[#0A1F44]">Remoto</option>
                    <option value="Presencial" className="bg-[#0A1F44]">Presencial</option>
                    <option value="Híbrido" className="bg-[#0A1F44]">Híbrido</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-white/10 text-white rounded-xl font-bold hover:bg-white/5 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 text-sm"
                >
                  {loading ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
