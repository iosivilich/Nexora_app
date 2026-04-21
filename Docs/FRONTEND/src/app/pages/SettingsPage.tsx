'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Lock, Globe, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '../components/GlassCard';
import { fetchSettings, updatePassword, updateSettings } from '../../lib/api';
import type { UserSettings } from '../../lib/backend-types';

const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    projects: true,
  },
  language: 'es',
  timezone: 'America/Bogota',
};

export function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    let active = true;

    fetchSettings()
      .then((data) => {
        if (active) {
          setSettings(data);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : 'No pudimos cargar la configuración.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);

    try {
      const nextSettings = await updateSettings(settings);
      setSettings(nextSettings);
      toast.success('Configuración actualizada');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'No pudimos guardar la configuración.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setPasswordSaving(true);
    setError(null);

    try {
      await updatePassword(newPassword);
      setNewPassword('');
      toast.success('Contraseña actualizada');
    } catch (passwordError) {
      const message = passwordError instanceof Error ? passwordError.message : 'No pudimos actualizar la contraseña.';
      setError(message);
      toast.error(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl text-white mb-3" style={{ fontFamily: 'var(--font-secondary)' }}>
            Configuración
          </h1>
          <p className="text-lg text-white/70">Personaliza tu experiencia y asegura tu cuenta</p>
        </div>

        {error && (
          <GlassCard className="p-6 mb-6 border-red-400/20">
            <p className="text-red-300">{error}</p>
          </GlassCard>
        )}

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Notificaciones
                </h3>
                <p className="text-sm text-white/60">Preferencias persistidas en tu cuenta</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                ['email', 'Correos de actividad'],
                ['push', 'Alertas push'],
                ['projects', 'Actualizaciones de proyectos'],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                  <span className="text-white/80">{label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications[key as keyof UserSettings['notifications']]}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          notifications: {
                            ...current.notifications,
                            [key]: event.target.checked,
                          },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#2563EB] peer-checked:to-[#6D5EF3]"></div>
                  </label>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Preferencias
                </h3>
                <p className="text-sm text-white/60">Idioma y zona horaria</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-white/60 mb-2">Idioma</label>
                <select
                  value={settings.language}
                  onChange={(event) => setSettings((current) => ({ ...current, language: event.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Zona horaria</label>
                <select
                  value={settings.timezone}
                  onChange={(event) => setSettings((current) => ({ ...current, timezone: event.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="America/Bogota">America/Bogota</option>
                  <option value="America/Mexico_City">America/Mexico_City</option>
                  <option value="Europe/Madrid">Europe/Madrid</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={saving || loading}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#6D5EF3] text-white rounded-xl font-bold disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D5EF3] to-[#5b4ed4] flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl text-white" style={{ fontFamily: 'var(--font-secondary)' }}>
                  Seguridad
                </h3>
                <p className="text-sm text-white/60">Cambio de contraseña con Supabase Auth</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Nueva contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={passwordSaving || loading}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold disabled:opacity-50"
              >
                {passwordSaving ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-[#9CC2FF]" />
              <p className="text-sm uppercase tracking-widest text-white/40">Estado</p>
            </div>
            <p className="text-white/70">
              {loading ? 'Cargando configuración guardada...' : 'Tus preferencias ya están persistiendo en tablas reales de Supabase.'}
            </p>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
}
