import { Outlet } from 'react-router';
import { GridFloor } from '../components/GridFloor';
import { ParticleSystem } from '../components/ParticleSystem';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';

export function RootLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <GridFloor />
      <ParticleSystem />

      {/* Layout */}
      <Sidebar />
      <Header />

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-20 pb-20 lg:pb-8 relative z-10">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}
