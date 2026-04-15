'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/app/context/AuthContext';
import { GridFloor } from '../../src/app/components/GridFloor';
import { ParticleSystem } from '../../src/app/components/ParticleSystem';
import { Header } from '../../src/app/components/Header';
import { Sidebar } from '../../src/app/components/Sidebar';
import { BottomNav } from '../../src/app/components/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1F44]">
        <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GridFloor />
      <ParticleSystem />
      <Sidebar />
      <Header />
      <main className="lg:ml-72 pt-16 lg:pt-20 pb-20 lg:pb-8 relative z-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
