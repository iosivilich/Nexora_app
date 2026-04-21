'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Mail, MapPin, Briefcase, Calendar, Edit, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadProfileAvatar } from '../../lib/api';
import { validateAvatarFile } from '../../lib/pending-avatar';

export function ProfilePage() {
  const { profile, loading, refreshProfile } = useAuth();
  const isConsultant = profile?.userType === 'CONSULTOR';
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    city: '',
    avatarUrl: '',
    role: '',
    bio: '',
    expertise: '',
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      fullName: profile.fullName,
      city: profile.city,
      avatarUrl: profile.avatarUrl,
      role: profile.consultantProfile?.role ?? '',
      bio: profile.consultantProfile?.bio ?? '',
      expertise: profile.consultantProfile?.expertise.join(', ') ?? '',
    });
  }, [profile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError = validateAvatarFile(file);
    if (validationError) {
      toast.error(validationError);
      event.target.value = '';
      return;
    }

    setUploadingAvatar(true);

    try {
      const updatedProfile = await uploadProfileAvatar(file);
      setForm((current) => ({ ...current, avatarUrl: updatedProfile.avatarUrl }));
      await refreshProfile();
      toast.success('Foto de perfil actualizada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos subir la foto de perfil');
    } finally {
      event.target.value = '';
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await updateProfile({
        fullName: form.fullName,
        city: form.city,
        avatarUrl: form.avatarUrl,
        role: isConsultant ? form.role : undefined,
        bio: isConsultant ? form.bio : undefined,
        expertise: isConsultant
          ? form.expertise
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
      });
      await refreshProfile();
      setIsEditing(false);
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            Mi Perfil
          </h1>
          <p className="text-lg text-white/70">Gestiona tu información personal y profesional</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <GlassCard className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={form.avatarUrl || profile.avatarUrl}
                  alt={form.fullName || profile.fullName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#2563EB] shadow-lg shadow-[#2563EB]/30"
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] rounded-full flex items-center justify-center shadow-lg"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarUpload}
                className="sr-only"
              />

              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                >
                  <Camera className="h-4 w-4" />
                  {uploadingAvatar ? 'Subiendo foto...' : 'Cambiar foto'}
                </button>
                <p className="mt-2 text-xs text-white/45">JPG, PNG o WEBP hasta 5 MB.</p>
              </div>

              <h2 className="text-2xl text-white mb-2" style={{ fontFamily: 'var(--font-secondary)' }}>
                {profile.fullName}
              </h2>
              <p className="text-white/70 mb-4">
                {isConsultant ? profile.consultantProfile?.role ?? 'Consultor' : 'Empresa'}
              </p>

              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-white/60">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{profile.email ?? 'Sin correo público'}</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{profile.city || 'Sin ciudad'}</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <Calendar className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">
                    {profile.updatedAt
                      ? `Actualizado ${new Date(profile.updatedAt).toLocaleDateString('es-CO')}`
                      : 'Perfil activo'}
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Información Personal
                </h3>
                <button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  <span>{saving ? 'Guardando...' : isEditing ? 'Guardar' : 'Editar'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ['Nombre Completo', 'fullName'],
                  ['Ciudad', 'city'],
                  ...(isConsultant ? [['Rol Profesional', 'role']] : []),
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-sm text-white/60 mb-2">{label}</label>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, [key]: event.target.value }))
                      }
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-60 focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                ))}
              </div>
            </GlassCard>

            {isConsultant ? (
              <GlassCard className="p-6">
                <h3 className="text-xl text-white mb-4" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Resumen Profesional
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Biografía</label>
                    <textarea
                      rows={4}
                      value={form.bio}
                      onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-60 focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Especialidades (separadas por coma)</label>
                    <input
                      value={form.expertise}
                      onChange={(event) => setForm((current) => ({ ...current, expertise: event.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-60 focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <Briefcase className="w-5 h-5 text-white/40 mb-2" />
                      <p className="text-xs text-white/40 uppercase tracking-wider">Experiencia</p>
                      <p className="text-white font-semibold">
                        {profile.consultantProfile?.experience ?? profile.consultantRecord?.anosExperiencia ?? 0} años
                      </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <Briefcase className="w-5 h-5 text-white/40 mb-2" />
                      <p className="text-xs text-white/40 uppercase tracking-wider">Proyectos</p>
                      <p className="text-white font-semibold">{profile.consultantProfile?.projects ?? 0}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-6">
                <h3 className="text-xl text-white mb-4" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Perfil de Empresa
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Sector</p>
                    <p className="text-white">{profile.companyRecord?.sector ?? 'Sin sector definido'}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Tamaño</p>
                    <p className="text-white">{profile.companyRecord?.tamanoEmpresa ?? 'Sin tamaño definido'}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Correo de contacto</p>
                    <p className="text-white">{profile.companyRecord?.emailContacto ?? profile.email ?? 'Sin correo público'}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Estado</p>
                    <p className="text-white">{profile.companyRecord?.estado ?? 'Activo'}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Descripción</p>
                  <p className="text-white/70">
                    {profile.companyRecord?.descripcion ?? 'Completa la información operativa de la empresa en tu base de datos para enriquecer este perfil.'}
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
