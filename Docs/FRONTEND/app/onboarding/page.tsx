'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/app/context/AuthContext';
import { OnboardingRoleSelection } from '../../src/app/components/OnboardingRoleSelection';

export default function OnboardingPage() {
  const { user, profile, updateProfile, loading } = useAuth();
  const router = useRouter();

  const userRole = profile?.userType || profile?.user_type || user?.user_metadata?.user_type;

  useEffect(() => {
    // Si ya tiene rol, lo mandamos al home
    if (!loading && userRole) {
      router.replace('/');
    }
    // Si no está logueado, lo mandamos al login
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, userRole, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0B14] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2563EB]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#6D5EF3]/10 rounded-full blur-[120px]" />
      </div>
      
      <OnboardingRoleSelection 
        onConfirm={async ({ role, city }) => {
          await updateProfile({ userType: role, city: city });
          router.push('/');
        }} 
      />
    </main>
  );
}
