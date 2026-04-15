'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Plus, Calendar, DollarSign, Users, Clock, Upload, X, Search, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

const publishedProjects = [
  {
    id: 1,
    title: 'Transformación Digital Bancaria',
    description: 'Necesitamos un consultor experimentado para liderar la transformación digital de nuestro banco.',
    budget: '€50,000 - €75,000',
    duration: '6 meses',
    applicants: 12,
    status: 'Activo',
    postedDate: '15 Feb 2026',
    skills: ['Digital', 'Banca', 'Estrategia'],
  },
  {
    id: 2,
    title: 'Optimización de Procesos Operativos',
    description: 'Buscamos un experto en Lean Management para optimizar nuestros procesos de manufactura.',
    budget: '€30,000 - €45,000',
    duration: '4 meses',
    applicants: 8,
    status: 'Activo',
    postedDate: '10 Feb 2026',
    skills: ['Lean', 'Operaciones', 'Manufactura'],
  },
  {
    id: 3,
    title: 'Estrategia de Marketing Digital',
    description: 'Desarrollo de estrategia integral de marketing digital para expansión en mercados europeos.',
    budget: '€25,000 - €40,000',
    duration: '3 meses',
    applicants: 15,
    status: 'En Revisión',
    postedDate: '5 Feb 2026',
    skills: ['Marketing', 'Digital', 'Growth'],
  },
];

export function ProjectsPage() {
  const { profile } = useAuth();
  const isConsultant = profile?.user_type === 'CONSULTOR';
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    budget: '',
    duration: '',
    skills: '',
  });

  // Simulamos que el consultor no tiene postulaciones aún
  const projects = isConsultant ? [] : publishedProjects;

  const handleSubmitProject = () => {
    setShowNewProjectModal(false);
    setNewProject({
      title: '',
      description: '',
      budget: '',
      duration: '',
      skills: '',
    });
  };

  if (isConsultant && projects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
        >
          <GlassCard className="p-16 max-w-2xl mx-auto border-white/10 shadow-2xl">
            <div className="w-24 h-24 bg-[#2563EB]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#2563EB]/30">
              <Search className="w-10 h-10 text-[#2563EB]" />
            </div>
            <h2 className="text-3xl text-white mb-4 font-bold" style={{ fontFamily: 'var(--font-secondary)' }}>
              ¿Buscas tu próximo desafío?
            </h2>
            <p className="text-lg text-white/50 mb-10">
              Actualmente no tienes postulaciones activas. Explora los proyectos publicados por las mejores empresas y empieza a colaborar.
            </p>
            <Link href="/explorar">
              <motion.button
                className="px-10 py-5 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white rounded-2xl flex items-center justify-center gap-3 mx-auto font-bold shadow-2xl shadow-blue-900/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Descubrir Proyectos</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
              {isConsultant ? 'Mis Postulaciones' : 'Proyectos'}
            </h1>
            <p className="text-lg text-white/70">
              {isConsultant 
                ? 'Controla el estado de tus candidaturas estratégicas' 
                : 'Publica proyectos y encuentra consultores para colaborar'}
            </p>
          </div>

          {!isConsultant && (
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white rounded-xl hover:scale-105 transition-transform shadow-lg shadow-[#2563EB]/30"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nuevo Proyecto</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Proyectos Activos</p>
                <p className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  {projects.filter(p => p.status === 'Activo').length}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D5EF3] to-[#5b4ed4] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Aplicantes</p>
                <p className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  {projects.reduce((sum, p) => sum + p.applicants, 0)}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">En Revisión</p>
                <p className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  {projects.filter(p => p.status === 'En Revisión').length}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Projects List */}
        <div>
          <h2 className="text-2xl text-white mb-6" style={{ fontFamily: 'var(--font-secondary)' }}>
            Proyectos Publicados
          </h2>

          <div className="space-y-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <GlassCard className="p-6 hover:border-[#2563EB]/50 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#6D5EF3] flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl text-white mb-2" style={{ fontFamily: 'var(--font-secondary)' }}>
                            {project.title}
                          </h3>
                          <p className="text-white/70 mb-4">{project.description}</p>
                          
                          {/* Skills */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.skills.map((skill, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 text-xs rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 text-[#2563EB]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span>{project.budget}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{project.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Publicado {project.postedDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end gap-4">
                      <span
                        className={`px-4 py-2 rounded-lg text-sm ${
                          project.status === 'Activo'
                            ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30'
                            : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30'
                        }`}
                      >
                        {project.status}
                      </span>
                      
                      <div className="flex items-center gap-2 text-white/60">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{project.applicants} aplicantes</span>
                      </div>

                      <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors text-sm">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowNewProjectModal(false)}
        >
          <motion.div
            className="w-full max-w-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Publicar Nuevo Proyecto
                </h2>
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white/60" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-white/80 mb-2">Título del Proyecto</label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="Ej: Transformación Digital Empresarial"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/80 mb-2">Descripción</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Describe los objetivos y requisitos del proyecto..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB] transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/80 mb-2">Presupuesto</label>
                    <input
                      type="text"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                      placeholder="€30,000 - €50,000"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/80 mb-2">Duración</label>
                    <input
                      type="text"
                      value={newProject.duration}
                      onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
                      placeholder="3-6 meses"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/80 mb-2">Habilidades Requeridas</label>
                  <input
                    type="text"
                    value={newProject.skills}
                    onChange={(e) => setNewProject({ ...newProject, skills: e.target.value })}
                    placeholder="Estrategia, Digital, Innovación (separadas por comas)"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#2563EB] transition-all"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSubmitProject}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white rounded-xl hover:scale-105 transition-transform shadow-lg shadow-[#2563EB]/30 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Publicar Proyecto</span>
                  </button>
                  <button
                    onClick={() => setShowNewProjectModal(false)}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
