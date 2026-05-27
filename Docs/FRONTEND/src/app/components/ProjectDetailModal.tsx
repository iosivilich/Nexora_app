'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Save, Users, Calendar, Briefcase, AlertTriangle } from 'lucide-react';
import { deleteChallenge, fetchApplications, updateChallenge } from '../../lib/api';
import type { ApplicationSummary, ChallengeSummary } from '../../lib/backend-types';

interface ProjectDetailModalProps {
  project: ChallengeSummary;
  onClose: () => void;
  onDeleted: (id: string) => void;
  onUpdated: (updated: ChallengeSummary) => void;
}

function formatDate(value: string | null) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

const MODES = ['Remoto', 'Presencial', 'Híbrido'];
const STATUSES = ['activo', 'inactivo', 'pendiente'];

export function ProjectDetailModal({ project, onClose, onDeleted, onUpdated }: ProjectDetailModalProps) {
  const [tab, setTab] = useState<'info' | 'applicants'>('info');
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [specialty, setSpecialty] = useState(project.specialty ?? '');
  const [budget, setBudget] = useState(project.budget != null ? String(project.budget) : '');
  const [mode, setMode] = useState(project.mode);
  const [status, setStatus] = useState(project.status.toLowerCase());

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (tab !== 'applicants') return;
    if (!project.numericId) return;
    setLoadingApps(true);
    fetchApplications({ idDesafio: project.numericId })
      .then((res) => setApplications(res.items))
      .catch(() => setApplications([]))
      .finally(() => setLoadingApps(false));
  }, [tab, project.numericId]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateChallenge(project.id, {
        title: title.trim(),
        description: description.trim(),
        specialty: specialty.trim(),
        budget: budget.trim() !== '' ? Number(budget) : null,
        mode,
        status,
      });
      onUpdated(updated);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteChallenge(project.id);
      onDeleted(project.id);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al eliminar.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0B0F1A]/95"
          style={{ backdropFilter: 'blur(24px)' }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl text-white font-semibold" style={{ fontFamily: 'var(--font-secondary)' }}>
              Gestionar Proyecto
            </h2>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {(['info', 'applicants'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === t ? 'text-white border-b-2 border-blue-500' : 'text-white/50 hover:text-white/80'
                }`}
              >
                {t === 'info' ? 'Información' : `Postulantes (${project.applicantCount ?? 0})`}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'info' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Título</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Descripción</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 transition-colors text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Especialidad</label>
                    <input
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
                      Presupuesto (opcional)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="Sin presupuesto"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Modalidad</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/60 transition-colors text-sm"
                    >
                      {MODES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Estado</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/60 transition-colors text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1 text-sm text-white/40">
                  <Calendar className="w-4 h-4" />
                  <span>Publicado el {formatDate(project.publishedAt)}</span>
                  <Briefcase className="w-4 h-4 ml-2" />
                  <span>{project.applicantCount ?? 0} postulaciones</span>
                </div>

                {saveError && (
                  <p className="text-red-400 text-sm">{saveError}</p>
                )}

                <div className="flex items-center justify-between pt-2">
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar proyecto
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-300">¿Confirmar eliminación?</span>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleting ? 'Eliminando…' : 'Sí, eliminar'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => void handleSave()}
                    disabled={saving || !title.trim() || !description.trim() || !specialty.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 disabled:opacity-50 transition-opacity"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            )}

            {tab === 'applicants' && (
              <div className="space-y-4">
                {loadingApps ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50">Todavía no hay postulantes para este proyecto.</p>
                  </div>
                ) : (
                  applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-white font-medium text-sm">
                            {app.consultantName ?? 'Consultor'}
                          </p>
                          {app.consultantEmail && (
                            <p className="text-white/40 text-xs">{app.consultantEmail}</p>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                          {app.status}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm line-clamp-3">{app.coverLetter}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-white/40">
                        <span>Postulado: {formatDate(app.appliedAt)}</span>
                        {app.proposedBudget && <span>Propuesta: ${app.proposedBudget.toLocaleString()}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
