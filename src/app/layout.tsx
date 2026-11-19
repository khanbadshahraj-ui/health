import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'AuraCare Clinic - Hospital Management System',
  description: 'Modern, efficient clinic & hospital management system built for healthcare professionals.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#047857',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Fast CDN Preconnections for Accelerated Asset Delivery */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
      </head>
      <body className="min-h-[100dvh] text-slate-900 flex relative overflow-x-hidden bg-slate-100">
        <AuthProvider>
          {/* Fixed Hospital Background for all web pages */}
          <div
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
            style={{ backgroundImage: `url('/dashboard-bg.jpg')` }}
          />
          {/* Soft elegant white/glass wash overlay ensuring readability */}
          <div className="fixed inset-0 z-0 bg-slate-50/75 backdrop-blur-[2px] pointer-events-none" />

          <Sidebar />
          {/* Main Content: Shifted top menu clearance and full unobstructed bottom view */}
          <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto relative z-10 pt-[82px] md:pt-0 pb-6 md:pb-0">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
