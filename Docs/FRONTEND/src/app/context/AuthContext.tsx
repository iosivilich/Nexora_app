'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { fetchProfile, uploadProfileAvatar } from '../../lib/api';
import type { ProfileDetails } from '../../lib/backend-types';
import { clearPendingAvatar, dataUrlToFile, getPendingAvatar } from '../../lib/pending-avatar';

type AuthUser = {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown>;
};

interface AuthContextType {
  user: AuthUser | null;
  profile: ProfileDetails | null;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ClerkUser = NonNullable<ReturnType<typeof useUser>['user']>;

function getPrimaryEmail(user: ClerkUser | null | undefined) {
  if (!user) {
    return null;
  }

  const primaryEmail =
    user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0] ??
    null;

  return primaryEmail?.emailAddress ?? null;
}

function buildClientUser(user: ClerkUser): AuthUser {
  const publicMetadata =
    typeof user.publicMetadata === 'object' && user.publicMetadata
      ? (user.publicMetadata as Record<string, unknown>)
      : {};
  const unsafeMetadata =
    typeof user.unsafeMetadata === 'object' && user.unsafeMetadata
      ? (user.unsafeMetadata as Record<string, unknown>)
      : {};

  return {
    id: user.id,
    email: getPrimaryEmail(user),
    user_metadata: {
      ...publicMetadata,
      ...unsafeMetadata,
      full_name: user.fullName ?? publicMetadata.full_name ?? unsafeMetadata.full_name ?? null,
      name: user.fullName ?? publicMetadata.name ?? unsafeMetadata.name ?? null,
      avatar_url: user.imageUrl ?? publicMetadata.avatar_url ?? unsafeMetadata.avatar_url ?? null,
      picture: user.imageUrl ?? publicMetadata.picture ?? unsafeMetadata.picture ?? null,
      city: unsafeMetadata.city ?? publicMetadata.city ?? null,
      user_type: unsafeMetadata.user_type ?? unsafeMetadata.userType ?? publicMetadata.user_type ?? publicMetadata.userType ?? null,
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !clerkUser) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const nextUser = buildClientUser(clerkUser);
    setUser(nextUser);
    setLoading(true);
    void loadProfile(nextUser);
  }, [isLoaded, isSignedIn, clerkUser]);

  const finalizePendingAvatar = async (authUser: AuthUser, currentProfile: ProfileDetails) => {
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

  const loadProfile = async (authUser: AuthUser) => {
    try {
      const data = await fetchProfile();
      const profileWithAvatar = await finalizePendingAvatar(authUser, data);
      setProfile(profileWithAvatar);
    } catch (error) {
      console.error('Error fetching profile:', error);
      const fallbackName = authUser.email?.split('@')[0] ?? 'Usuario Nexora';
      const metadata = authUser.user_metadata;
      const fallbackUserType =
        metadata.user_type === 'EMPRESA' || metadata.user_type === 'CONSULTOR'
          ? metadata.user_type
          : null;

      setProfile({
        id: authUser.id,
        fullName:
          typeof metadata.full_name === 'string' && metadata.full_name.trim()
            ? metadata.full_name
            : fallbackName,
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

  const updateProfile = async (updates: any) => {
    if (!user) {
      return;
    }

    try {
      const response = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = (await response.json()) as ProfileDetails;
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
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
    await clerkSignOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, signOut, updateProfile, refreshProfile, loading }}>
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
