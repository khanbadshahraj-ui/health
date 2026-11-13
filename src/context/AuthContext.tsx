'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  role: 'ADMIN' | 'DOCTOR' | 'STAFF';
  department: string;
  designation?: string;
  email: string;
  doctorId?: number | null;
  doctor?: any;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, pass: string) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  logout: () => Promise<void>;
  hasAccess: (allowedRoles?: string[], allowedDepartments?: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  hasAccess: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check local session cookie or localStorage
    try {
      const saved = localStorage.getItem('auracare_user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse local auth user', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('auracare_user', JSON.stringify(data.user));
        return { success: true, redirectUrl: data.redirectUrl };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' });
    } catch (e) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('auracare_user');
    router.push('/login');
  };

  const hasAccess = (allowedRoles?: string[], allowedDepartments?: string[]) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true; // Super admin has universal access
    if (allowedRoles && !allowedRoles.includes(user.role)) return false;
    if (allowedDepartments && !allowedDepartments.includes(user.department)) return false;
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
