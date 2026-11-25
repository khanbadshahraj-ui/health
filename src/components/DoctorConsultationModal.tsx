'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Stethoscope,
  Pill,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  X,
  Calendar,
  User,
  Activity,
  HeartPulse,
  Clock,
  Sparkles,
  Download,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

interface MedicineItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface DoctorConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPatient?: { id: number; name: string; age?: number; gender?: string; condition?: string };
  defaultDoctorName?: string;
  defaultDepartment?: string;
}

export default function DoctorConsultationModal({
  isOpen,
  onClose,
  defaultPatient,
  defaultDoctorName = 'Dr. Sarah Jenkins, MD',
  defaultDepartment = 'Cardiology',
}: DoctorConsultationModalProps) {
  // Form State
  const [patientName, setPatientName] = useState(defaultPatient?.name || '');
  const [patientId, setPatientId] = useState(defaultPatient?.id ? String(defaultPatient.id) : '');
  const [doctorName, setDoctorName] = useState(defaultDoctorName);
  const [department, setDepartment] = useState(defaultDepartment);

  const [vitals, setVitals] = useState({
    bp: '120/80',
    pulse: '74',
    temp: '98.6',
    spo2: '99',
  });

  const [chiefComplaint, setChiefComplaint] = useState(
    defaultPatient?.condition ? `Follow-up for ${defaultPatient.condition}` : 'Routine clinical review and general assessment'
  );
  const [diagnosis, setDiagnosis] = useState(defaultPatient?.condition || 'Essential Hypertension, Stage 1');
  const [doctorNotes, setDoctorNotes] = useState(
    'Patient instructed on low-sodium dietary regimen, adequate hydration, and moderate aerobic exercise 30 min daily.'
  );
  const [followUpDate, setFollowUpDate] = useState('After 14 days');

  // Medicines List
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    {
      name: 'Amlodipine Besylate',
      dosage: '5 mg',
      frequency: 'Once Daily (Morning)',
      duration: '30 Days',
      instructions: 'Take after breakfast with water',
    },
    {
      name: 'Rosuvastatin Calcium',
      dosage: '10 mg',
      frequency: 'Once Daily (Night)',
      duration: '30 Days',
      instructions: 'Take before sleep',
    },
  ]);

  // Submission & Confirmation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedRx, setGeneratedRx] = useState<any | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        dosage: '',
        frequency: 'Twice Daily',
        duration: '7 Days',
        instructions: 'After meals',
      },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index: number, field: keyof MedicineItem, val: string) => {
    const updated = [...medicines];
    updated[index][field] = val;
    setMedicines(updated);
  };

  const handleGeneratePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Patient name is required');
      return;
    }
    if (!diagnosis.trim()) {
      alert('Clinical diagnosis is required');
      return;
    }

    setIsSubmitting(true);
    setConfirmationNotice(null);

    const vitalsStr = `BP: ${vitals.bp} mmHg | Pulse: ${vitals.pulse} bpm | Temp: ${vitals.temp}Â°F | SpO2: ${vitals.spo2}%`;

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientId || undefined,
          patientName,
          doctorId: 1,
          doctorName,
          department,
          vitals: vitalsStr,
          chiefComplaint,
          diagnosis,
          doctorNotes,
          prescriptions: medicines,
          followUpDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedRx({
          ...data.consultation,
          rawMedicines: medicines,
          vitalsObj: vitals,
          doctorNotes,
          followUpDate,
          sheetMessage: data.sheetMessage,
          sheetSynced: data.sheetSynced,
        });
        setConfirmationNotice(
          'Doctor Consultation Record & Prescription Generated Successfully! Saved to Neon Database and synced to Google Sheets.'
        );
      } else {
        alert(data.error || 'Failed to save consultation record');
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                Doctor Consultation & Prescription Studio
              </h2>
              <p className="text-xs text-emerald-200">
                Official Clinical Diagnosis, Rx Generation, Neon Database & Google Sheets Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Confirmation Notice Banner if already generated */}
          <AnimatePresence>
            {confirmationNotice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 shadow-sm"
              >
                <div className="flex items-center gap-2.5 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{confirmationNotice}</span>
                </div>
                {generatedRx?.sheetMessage && (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-100/60 p-2 rounded-xl">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{generatedRx.sheetMessage}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!generatedRx ? (
            /* Consultation Input Form */
            <form onSubmit={handleGeneratePrescription} className="space-y-6">
              {/* Row 1: Patient and Doctor Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Robert Thornton"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Attending Physician</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Specialty / Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>
              </div>

              {/* Row 2: Clinical Vitals */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Patient Vital Signs</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={vitals.bp}
                      onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                      placeholder="120/80"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Heart Pulse (bpm)</label>
                    <input
                      type="text"
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                      placeholder="72"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Temperature (Â°F)</label>
                    <input
                      type="text"
                      value={vitals.temp}
                      onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                      placeholder="98.6"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">SpO2 Oxygen (%)</label>
                    <input
                      type="text"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                      placeholder="99"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Chief Complaint & Diagnosis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Chief Complaint</label>
                  <textarea
                    rows={2}
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Clinical Diagnosis *</label>
                  <textarea
                    rows={2}
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 4: Prescription Medication Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Prescribed Medications (Rx)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition border border-emerald-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Drug
                  </button>
                </div>

                <div className="space-y-2.5">
                  {medicines.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                    >
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold text-slate-500 block">Medicine Name</label>
                        <input
                          type="text"
                          required
                          value={med.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Paracetamol"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 block">Dosage</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          placeholder="500 mg"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold text-slate-500 block">Frequency</label>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          placeholder="Twice Daily (Morning/Night)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 block">Duration</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          placeholder="7 Days"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center justify-between gap-1 pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition ml-auto"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 5: Instructions & Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Dietary Advice & Special Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Next Follow-up Review</label>
                  <input
                    type="text"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    placeholder="After 14 days"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Saving Consultation & Syncing...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Confirm Consultation & Generate Prescription</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Official Printable Rx Prescription Slip */
            <div className="space-y-6">
              <div
                id="printable-rx"
                className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md"
              >
                {/* Hospital Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-5 gap-4">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                      AuraCare Hospital
                    </h1>
                    <p className="text-xs text-slate-600 font-medium">
                      Multi-Specialty Clinical Center & Diagnostic Institute
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Emergency 24/7 â€¢ Pharmacy & Clinical Care â€¢ Tel: +92 51 8899000
                    </p>
                  </div>
                  <div className="text-left sm:text-right space-y-1">
                    <span className="text-xs px-2.5 py-1 rounded bg-slate-900 text-white font-mono font-bold">
                      {generatedRx.consultationId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{generatedRx.doctorName}</h3>
                    <p className="text-xs text-emerald-800 font-semibold">{generatedRx.department}</p>
                    <p className="text-[11px] text-slate-500">{generatedRx.timestamp}</p>
                  </div>
                </div>

                {/* Patient Bar */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Patient Name</span>
                    <span className="font-bold text-slate-900">{generatedRx.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Patient ID</span>
                    <span className="font-mono font-bold text-slate-900">
                      {defaultPatient?.id ? `PAT-${String(defaultPatient.id).padStart(4, '0')}` : 'WALK-IN'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Diagnosis</span>
                    <span className="font-semibold text-emerald-800">{generatedRx.diagnosis}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Vitals</span>
                    <span className="font-mono text-[11px] text-slate-700">{generatedRx.vitals}</span>
                  </div>
                </div>

                {/* Rx Symbol & Medication Table */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-emerald-800 font-serif">Rx</span>
                    <span className="text-xs text-slate-400 font-medium">
                      Medical Prescription Directives
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">Drug / Formulation</th>
                          <th className="p-3">Dosage</th>
                          <th className="p-3">Frequency & Schedule</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {generatedRx.rawMedicines?.map((m: MedicineItem, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-3 text-slate-400 font-mono">{i + 1}</td>
                            <td className="p-3 font-bold text-slate-900">{m.name}</td>
                            <td className="p-3 font-mono text-emerald-700 font-semibold">{m.dosage}</td>
                            <td className="p-3">{m.frequency}</td>
                            <td className="p-3 font-medium">{m.duration}</td>
                            <td className="p-3 text-slate-500">{m.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Advice & Follow-up */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-700 mb-1">Clinical Instructions & Diet</h4>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {generatedRx.doctorNotes}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 mb-1">Next Follow-up</h4>
                    <p className="text-slate-600 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {generatedRx.followUpDate}
                    </p>
                  </div>
                </div>

                {/* Digital Doctor Signature Stamp */}
                <div className="border-t-2 border-slate-900 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-[10px] text-slate-400">
                    Electronic Medical Prescription Verified â€¢ Valid at all certified pharmacies
                  </div>
                  <div className="text-right space-y-1">
                    <div className="inline-block p-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-[11px] font-mono font-bold">
                      âœ“ Digitally Signed: {generatedRx.doctorName}
                    </div>
                    <div className="text-[10px] text-slate-500">Medical Registration # PMDC-448291</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setGeneratedRx(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Write Another Prescription
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Print / Save PDF
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
