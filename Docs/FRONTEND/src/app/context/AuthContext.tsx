'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { fetchProfile, uploadProfileAvatar } from '../../lib/api';
import type { ProfileDetails } from '../../lib/backend-types';
import { clearPendingAvatar, dataUrlToFile, getPendingAvatar } from '../../lib/pending-avatar';
import { supabase } from '../../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: ProfileDetails | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        void loadProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        void loadProfile(session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const finalizePendingAvatar = async (authUser: User, currentProfile: ProfileDetails) => {
    const pendingAvatar = getPendingAvatar(authUser.email ?? null);

    if (!pendingAvatar) {
      return currentProfile;
    }

    try {
      const updatedProfile = await uploadProfileAvatar(dataUrlToFile(pendingAvatar));
      clearPendingAvatar();
      return updatedProfile;
    } catch (error) {
      console.error('Error uploading pending avatar:', error);
      return currentProfile;
    }
  };

  const loadProfile = async (authUser: User) => {
    try {
      const data = await fetchProfile();
      const profileWithAvatar = await finalizePendingAvatar(authUser, data);
      setProfile(profileWithAvatar);
    } catch (error) {
      console.error('Error fetching profile:', error);
      const fallbackName = authUser.email?.split('@')[0] ?? 'Usuario Nexora';
      const metadata = (authUser.user_metadata ?? {}) as Record<string, unknown>;
      const fallbackUserType =
        metadata.user_type === 'EMPRESA' || metadata.user_type === 'CONSULTOR'
          ? metadata.user_type
          : 'CONSULTOR';
      setProfile({
        id: authUser.id,
        fullName: typeof metadata.full_name === 'string' && metadata.full_name.trim() ? metadata.full_name : fallbackName,
        avatarUrl:
          typeof metadata.avatar_url === 'string' && metadata.avatar_url.trim()
            ? metadata.avatar_url
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
        city: typeof metadata.city === 'string' ? metadata.city : '',
        userType: fallbackUserType,
        email: authUser.email ?? null,
        updatedAt: null,
        consultantProfile: null,
        companyRecord: null,
        consultantRecord: null,
        settings: {
          notifications: {
            email: true,
            push: true,
            projects: true,
          },
          language: 'es',
          timezone: 'America/Bogota',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    setLoading(true);
    await loadProfile(user);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, signOut, refreshProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
