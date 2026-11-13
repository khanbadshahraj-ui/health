'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import LockedPageGate from '@/components/LockedPageGate';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  KeyRound,
  FileText,
  Copy,
  Check,
  Download,
  Users,
  Stethoscope,
  Building,
  Lock,
  ExternalLink,
  Search,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Activity,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [credentials, setCredentials] = useState<any[]>([]);
  const [markdown, setMarkdown] = useState('');
  const [loadingCreds, setLoadingCreds] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<{ [key: string]: boolean }>({});
  const [viewTab, setViewTab] = useState<'table' | 'file'>('table');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      // Allow demo viewing or redirect if needed
    }
  }, [user, loading]);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await fetch('/api/admin/credentials');
      const data = await res.json();
      if (data.success) {
        setCredentials(data.users);
        setMarkdown(data.markdownContent);
      }
    } catch (e) {
      console.error('Failed to load admin credentials', e);
    } finally {
      setLoadingCreds(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordVisibility = (username: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [username]: !prev[username] }));
  };

  const filteredUsers = credentials.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const departmentList = [
    { name: 'Cardiology', href: '/departments/cardiology', color: 'from-rose-600 to-red-700', doctor: 'Dr. Elena Rostova' },
    { name: 'Pediatrics', href: '/departments/pediatrics', color: 'from-teal-600 to-emerald-700', doctor: 'Dr. Marcus Vance' },
    { name: 'General Practice', href: '/departments/general-practice', color: 'from-blue-600 to-indigo-700', doctor: 'Dr. Sarah Jenkins' },
    { name: 'Orthopedics', href: '/departments/orthopedics', color: 'from-amber-600 to-orange-700', doctor: 'Dr. David Kim' },
    { name: 'Dermatology', href: '/departments/dermatology', color: 'from-purple-600 to-indigo-700', doctor: 'Dr. Anita Desai' },
  ];

  return (
    <LockedPageGate pageTitle="Hospital Administration Security Center" requiredRole="ADMIN">
      <div className="flex flex-col min-h-screen">
      <Header
        title="Hospital Administration & Security Center"
        subtitle="Manage master credentials, assign user access, and oversee departmental operations"
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">System Accounts</span>
              <h3 className="text-2xl font-extrabold text-slate-900">{credentials.length || 9}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Doctor Logins</span>
              <h3 className="text-2xl font-extrabold text-blue-700">5 Registered</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Departments</span>
              <h3 className="text-2xl font-extrabold text-purple-700">5 Specialized</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Cloud DB Auth</span>
              <h3 className="text-sm font-extrabold text-teal-800 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Neon PostgreSQL
              </h3>
            </div>
          </div>
        </div>

        {/* Department Dashboards Quick Access Row */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" /> Department Dashboards
            </h3>
            <span className="text-xs text-slate-400">Click to inspect any department console</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {departmentList.map((dept) => (
              <Link
                key={dept.name}
                href={dept.href}
                className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      {dept.name}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
                  </div>
                  <p className="text-[11px] text-slate-500">{dept.doctor}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                  <span>Open Console</span>
                  <span>&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Master Credentials Directory & File Viewer */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <KeyRound className="w-4 h-4" /> Confidential Master Directory
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">
                System Users & Doctor Login Credentials
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Every doctor and staff member has an assigned login account stored securely in the database.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/AuraCare_Master_Credentials.txt"
                download="AuraCare_Master_Credentials.txt"
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Notepad (.txt)</span>
              </a>

              <a
                href="/MASTER_CREDENTIALS.md"
                download="AuraCare_Master_Credentials.md"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Markdown (.md)</span>
              </a>

              <a
                href="/MASTER_CREDENTIALS.json"
                download="AuraCare_Master_Credentials.json"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </a>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by doctor, username, department..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setViewTab('table')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewTab === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Interactive Table View
              </button>
              <button
                onClick={() => setViewTab('file')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  viewTab === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Readable File Content</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Interactive Table View */}
          {viewTab === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3.5 px-6">User / Doctor</th>
                    <th className="py-3.5 px-6">Department</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Assigned Username</th>
                    <th className="py-3.5 px-6">Password</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isVisible = showPasswordMap[u.username];
                    const copyId = `user_${u.username}`;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-6">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            {u.role === 'DOCTOR' ? (
                              <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : u.role === 'ADMIN' ? (
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
                            )}
                            <span>{u.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{u.designation || u.email}</div>
                        </td>

                        <td className="py-3.5 px-6">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                            {u.department}
                          </span>
                        </td>

                        <td className="py-3.5 px-6">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'ADMIN'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.role === 'DOCTOR'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{u.username}</span>
                            <button
                              onClick={() => copyToClipboard(u.username, `uname_${u.username}`)}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy username"
                            >
                              {copiedKey === `uname_${u.username}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-6 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {isVisible ? u.password : '••••••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(u.username)}
                              className="text-slate-400 hover:text-slate-600"
                              title={isVisible ? 'Hide password' : 'Show password'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => copyToClipboard(`Username: ${u.username}\nPassword: ${u.password}`, copyId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold text-xs transition"
                          >
                            {copiedKey === copyId ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Credentials</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Readable File Content View */}
          {viewTab === 'file' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="text-xs text-slate-500">
                  Stored at: <span className="font-mono text-slate-700 font-semibold">public/MASTER_CREDENTIALS.md</span>
                </div>
                <button
                  onClick={() => copyToClipboard(markdown, 'full_markdown')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedKey === 'full_markdown' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'full_markdown' ? 'Copied Full Document!' : 'Copy Entire Document'}</span>
                </button>
              </div>

              <pre className="p-5 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 whitespace-pre-wrap">
                {markdown || 'Loading master credentials document...'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
    </LockedPageGate>
  );
}
