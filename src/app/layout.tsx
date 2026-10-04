import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'AuraCare Clinic - Hospital Management System',
  description: 'Modern, efficient clinic & hospital management MVP built for healthcare professionals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900 flex relative overflow-hidden bg-slate-100">
        {/* Fixed Hospital Background for all web pages */}
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url('/dashboard-bg.jpg')` }}
        />
        {/* Soft elegant white/glass wash overlay ensuring readability and pristine medical UI aesthetic */}
        <div className="fixed inset-0 z-0 bg-slate-50/75 backdrop-blur-[2px] pointer-events-none" />

        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
