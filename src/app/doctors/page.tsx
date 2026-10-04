'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import {
  Stethoscope,
  Phone,
  Mail,
  Award,
  Users,
  Plus,
  CheckCircle,
  Clock,
  Search,
  Filter,
  AlertCircle,
  Check,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  availability: string;
  contact: string;
  email: string;
  experience: string;
  avatarUrl: string;
  _count?: {
    patients: number;
  };
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    specialty: 'General Practice',
    availability: 'On Duty',
    contact: '',
    email: '',
    experience: '8 years',
  });

  const specialties = [
    'All',
    'General Practice',
    'Pediatrics',
    'Cardiology',
    'Orthopedics',
    'Dermatology',
    'Neurology',
  ];

  const fetchDoctors = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty !== 'All') params.set('specialty', selectedSpecialty);
      if (selectedAvailability !== 'All') params.set('availability', selectedAvailability);

      const res = await fetch(`/api/doctors?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setDoctors(json);
      }
    } catch (err) {
      console.error('Failed to load doctors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, selectedAvailability]);

  const handleToggleAvailability = async (docId: number, current: string) => {
    const nextStatus =
      current === 'On Duty' ? 'On Call' : current === 'On Call' ? 'Off Duty' : 'On Duty';

    try {
      const res = await fetch(`/api/doctors/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: nextStatus }),
      });
      if (res.ok) {
        setDoctors((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, availability: nextStatus } : d))
        );
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.email) {
      setErrorMsg('Please enter doctor name, contact, and email.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          specialty: 'General Practice',
          availability: 'On Duty',
          contact: '',
          email: '',
          experience: '8 years',
        });
        await fetchDoctors();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to register doctor');
      }
    } catch (err) {
      setErrorMsg('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-transparent min-h-screen flex flex-col">
      <Header
        title="Doctor & Staff Registry"
        subtitle="Manage clinical staff, assigned specialties, and instant duty availability"
      />

      <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Filter & Action bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Specialty:
            </span>
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSpecialty === spec
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Physician</span>
          </motion.button>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              Loading physician roster...
            </div>
          ) : doctors.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              No doctors found matching the selected filter.
            </div>
          ) : (
            doctors.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between group"
              >
                <div>
                  {/* Top: Avatar and Status */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm group-hover:border-emerald-200 transition-colors"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          doc.availability === 'On Duty'
                            ? 'bg-emerald-500'
                            : doc.availability === 'On Call'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    {/* Interactive Availability Toggle */}
                    <button
                      onClick={() => handleToggleAvailability(doc.id, doc.availability)}
                      title="Click to toggle availability status"
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer hover:ring-2 hover:ring-emerald-400/40 ${
                        doc.availability === 'On Duty'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : doc.availability === 'On Call'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          doc.availability === 'On Duty'
                            ? 'bg-emerald-600 animate-pulse'
                            : doc.availability === 'On Call'
                            ? 'bg-amber-600'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{doc.availability}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>

                  {/* Doctor Info */}
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {doc.name}
                    </h3>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                      <Stethoscope className="w-3 h-3" />
                      <span>{doc.specialty}</span>
                    </div>
                  </div>

                  {/* Stats & Meta */}
                  <div className="mt-5 space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        Experience:
                      </span>
                      <span className="font-semibold text-slate-800">{doc.experience}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Active Patients:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {doc._count?.patients ?? 0} patients
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        Direct Line:
                      </span>
                      <span className="font-mono text-slate-700">{doc.contact}</span>
                    </div>

                    <div className="flex items-center justify-between truncate">
                      <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        Email:
                      </span>
                      <span className="font-mono text-slate-600 truncate text-[11px] ml-2">
                        {doc.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAvailability(doc.id, doc.availability)}
                    className="w-full py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-colors border border-slate-200/70"
                  >
                    Cycle Duty Shift
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Clinic Physician"
        subtitle="Add a licensed doctor to the clinical registry"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Doctor Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Jennifer Lopez, MD"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Specialty *
              </label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50"
              >
                {specialties
                  .filter((s) => s !== 'All')
                  .map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Shift Status
              </label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50"
              >
                <option value="On Duty">On Duty</option>
                <option value="On Call">On Call</option>
                <option value="Off Duty">Off Duty</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Direct Contact *
              </label>
              <input
                type="text"
                required
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="+1 (555) 789-0123"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Years of Experience
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 10 years"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinic Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="doctor.name@clinic.org"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <span>Registering...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Register Physician</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
