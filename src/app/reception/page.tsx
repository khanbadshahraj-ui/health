'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Video,
  VideoOff,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  ExternalLink,
  UserPlus,
  Stethoscope,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  Eye,
  Sliders,
  Calendar,
  Clock,
  Send
} from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

interface ReceptionPatient {
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  condition: string;
  status: string;
  assignedDoctor?: string;
  photoUrl?: string;
  createdAt: string;
  doctor?: { name: string; specialty: string };
}

export default function ReceptionPage() {
  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [contact, setContact] = useState('');
  const [condition, setCondition] = useState('');
  const [status, setStatus] = useState('Outpatient');
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Sheet & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sheetSyncStatus, setSheetSyncStatus] = useState<string | null>(null);
  const [recentPatients, setRecentPatients] = useState<ReceptionPatient[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Google Sheet Webhook Modal State
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [googleWebhookUrl, setGoogleWebhookUrl] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);

  // 1. Fetch registered doctors & recent reception intake list
  const loadDoctors = async () => {
    try {
      const res = await fetch('/api/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (err) {
      console.error('Failed to load doctors', err);
    }
  };

  const loadReceptionData = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/reception');
      if (res.ok) {
        const data = await res.json();
        setRecentPatients(data.patients || []);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error('Failed to load reception records', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadDoctors();
    loadReceptionData();

    // Load saved Google Webhook from localStorage if available
    const savedWebhook = localStorage.getItem('aura_google_sheet_webhook');
    if (savedWebhook) {
      setGoogleWebhookUrl(savedWebhook);
    }

    // Enumerate connected cameras (internal laptop webcam vs external camera)
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      }).catch(err => {
        console.warn('Device enumeration notice:', err);
      });
    }

    return () => {
      stopCamera();
    };
  }, []);

  // 2. Camera Controls
  const startCamera = async (deviceId?: string) => {
    setCameraError(null);
    stopCamera();

    const targetDeviceId = deviceId || selectedDeviceId;
    const constraints: MediaStreamConstraints = {
      video: targetDeviceId
        ? { deviceId: { exact: targetDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: false,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);

      // Re-enumerate to get labeled device names once permission is granted
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
      });
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(err.message || 'Unable to access camera. Please check browser permissions.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const takePicture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the current video frame onto canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(photoDataUrl);

    // Stop live stream to conserve resources
    stopCamera();
  };

  const retakePicture = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // 3. Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);
    setSheetSyncStatus(null);

    try {
      const payload = {
        name: name.trim(),
        age: age ? Number(age) : 0,
        gender,
        contact: contact.trim(),
        condition: condition.trim() || 'General Intake',
        status,
        doctorId: doctorId || null,
        photoData: capturedPhoto,
        googleSheetWebhookUrl: googleWebhookUrl.trim() || undefined,
      };

      const res = await fetch('/api/reception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`Patient "${name}" registered successfully! Photo saved to records.`);
        setSheetSyncStatus(data.sheetMessage || 'PatientsRecord file updated');

        // Reset form
        setName('');
        setAge('');
        setContact('');
        setCondition('');
        setCapturedPhoto(null);
        stopCamera();

        // Refresh list
        loadReceptionData();
      } else {
        alert(data.error || 'Failed to record patient');
      }
    } catch (err: any) {
      console.error('Submission failed', err);
      alert('Error registering patient: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveWebhookUrl = () => {
    localStorage.setItem('aura_google_sheet_webhook', googleWebhookUrl.trim());
    setWebhookModalOpen(false);
  };

  const sampleAppsScript = `// Apps Script for Google Sheet named: PatientsRecord
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("PatientsRecord");
    if (!sheet) {
      sheet = ss.insertSheet("PatientsRecord");
      sheet.appendRow(["Timestamp", "Patient ID", "Name", "Age", "Gender", "Contact", "Condition", "Assigned Doctor", "Status", "Photo URL"]);
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#d1fae5");
    }
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.patientId || "",
      data.name || "",
      data.age || "",
      data.gender || "",
      data.contact || "",
      data.condition || "",
      data.assignedDoctor || "Unassigned",
      data.status || "Outpatient",
      data.photoUrl || ""
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  return (
    <div className="flex-1 bg-transparent min-h-screen flex flex-col">
      <Header
        title="Reception & Intake Desk"
        subtitle="Capture incoming patient photos via laptop or external camera & sync with PatientsRecord Google Sheet"
      />

      <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Banner with Google Sheet sync summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 md:p-8 shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-bold backdrop-blur-sm border border-emerald-400/30">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                <span>Google Sheet Integration: PatientsRecord</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Patient Registration & Photo Station
              </h2>
              <p className="text-emerald-100/90 text-xs md:text-sm max-w-2xl leading-relaxed">
                Snapshot portraits of incoming patients using integrated laptop webcams or USB external cameras.
                Every intake instantly appends to the <strong className="text-white">PatientsRecord</strong> spreadsheet and clinic database.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/PatientsRecord.csv"
                download="PatientsRecord.csv"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 backdrop-blur-sm border border-white/20 transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                <span>Download PatientsRecord.csv</span>
              </a>

              <button
                onClick={() => setWebhookModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Google Sheet Sync Settings</span>
              </button>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-52 h-52 rounded-full bg-white/5 pointer-events-none blur-xl" />
        </motion.div>

        {/* Success Alert */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold">{successMessage}</p>
                  {sheetSyncStatus && (
                    <p className="text-xs text-emerald-700 mt-0.5">Spreadsheet status: {sheetSyncStatus}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold px-2 py-1"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main 2-Column Section: Camera on Left, Intake Details on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Camera & Photo Capture (5 cols) */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Patient Portrait Camera</h3>
                  <p className="text-xs text-slate-500">Laptop or external USB webcam</p>
                </div>
              </div>

              {isCameraActive && (
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Camera Live
                </span>
              )}
            </div>

            {/* Camera Device Selector (if multiple available) */}
            {videoDevices.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>Select Camera Source:</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {videoDevices.length} cameras detected
                  </span>
                </label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => {
                    setSelectedDeviceId(e.target.value);
                    if (isCameraActive) {
                      startCamera(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                >
                  {videoDevices.map((dev, idx) => (
                    <option key={dev.deviceId || idx} value={dev.deviceId}>
                      {dev.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Video Viewport / Photo Frame */}
            <div className="relative aspect-4/3 w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
              {/* Error Notice */}
              {cameraError && (
                <div className="p-4 text-center space-y-2 max-w-xs text-rose-300">
                  <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
                  <p className="text-xs">{cameraError}</p>
                  <p className="text-[11px] text-slate-400">
                    Check your browser address bar to allow camera access.
                  </p>
                </div>
              )}

              {/* Inactive State */}
              {!isCameraActive && !capturedPhoto && !cameraError && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
                    <VideoOff className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Camera is Inactive</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Click below to activate laptop or external camera and capture incoming patient photo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Start Camera</span>
                  </button>
                </div>
              )}

              {/* Live Video Preview */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {/* Viewport alignment guide lines when camera is active */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-t-2 border-l-2 border-emerald-400/80 rounded-tl-lg"></div>
                    <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400/80 rounded-tr-lg"></div>
                  </div>
                  <div className="self-center border border-dashed border-white/30 w-36 h-48 rounded-full pointer-events-none"></div>
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-b-2 border-l-2 border-emerald-400/80 rounded-bl-lg"></div>
                    <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400/80 rounded-br-lg"></div>
                  </div>
                </div>
              )}

              {/* Captured Photo Preview */}
              {capturedPhoto && (
                <div className="relative w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capturedPhoto}
                    alt="Captured Patient"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Picture Ready</span>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Actions Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {isCameraActive && (
                <>
                  <button
                    type="button"
                    onClick={takePicture}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
                  >
                    <Camera className="w-4 h-4 stroke-[2.5]" />
                    <span>Take Picture</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <VideoOff className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </>
              )}

              {capturedPhoto && (
                <button
                  type="button"
                  onClick={retakePicture}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Picture</span>
                </button>
              )}

              {!isCameraActive && !capturedPhoto && (
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <Video className="w-4 h-4 stroke-[2.5]" />
                  <span>Start Camera</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Intake Details Form (7 cols) */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-100/80 text-teal-700">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Incoming Patient Details</h3>
                  <p className="text-xs text-slate-500">Record visitor intake information</p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                Auto-Sync to Google Sheet
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Patient Full Name</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Age</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="125"
                    placeholder="e.g. 34"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Contact / Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2834"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                </div>

                {/* Triage / Admission Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Admission / Triage Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all bg-white"
                  >
                    <option value="Outpatient">Outpatient Consultation</option>
                    <option value="Under Observation">Under Observation</option>
                    <option value="Admitted">Admitted Inpatient</option>
                    <option value="Critical">Critical Triage</option>
                    <option value="Recovering">Recovering</option>
                  </select>
                </div>

                {/* Assigned Doctor */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Assign Attending Physician (Optional)</span>
                  </label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all bg-white"
                  >
                    <option value="">-- No doctor assigned at reception --</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} — {doc.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reason for Visit / Symptoms */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    Chief Complaint / Symptoms & Clinical Reason
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Acute migraine with light sensitivity, routine blood pressure checkup..."
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Photo attached indicator */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-slate-600">
                    {capturedPhoto ? (
                      <strong className="text-emerald-700">Photo attached & ready to save</strong>
                    ) : (
                      'No photo captured yet (optional, can save with camera snapshot)'
                    )}
                  </span>
                </div>
                {capturedPhoto && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Attached
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-700/25 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Patient Record & Syncing Sheet...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Save Patient Record & Append to PatientsRecord</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Bottom Section: Recent Reception Log (PatientsRecord) */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Today's PatientsRecord Log</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {totalCount} Total Registered
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time records synced to local file and Google Sheet endpoint
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadReceptionData}
                disabled={isLoadingList}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
                <span>Refresh Log</span>
              </button>

              <a
                href="/PatientsRecord.csv"
                download="PatientsRecord.csv"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Portrait</th>
                  <th className="pb-3 px-3">Patient Details</th>
                  <th className="pb-3 px-3">Age / Gender</th>
                  <th className="pb-3 px-3">Chief Complaint</th>
                  <th className="pb-3 px-3">Assigned Physician</th>
                  <th className="pb-3 px-3">Admission Status</th>
                  <th className="pb-3 px-3 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoadingList ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading records...
                    </td>
                  </tr>
                ) : recentPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No patients recorded yet. Start intake above!
                    </td>
                  </tr>
                ) : (
                  recentPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Photo Thumbnail */}
                      <td className="py-3 px-3">
                        {p.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.photoUrl}
                            alt={p.name}
                            className="w-11 h-11 rounded-xl object-cover border border-emerald-300 shadow-xs"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                            {p.name.charAt(0)}
                          </div>
                        )}
                      </td>

                      {/* Name & Contact */}
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{p.contact || 'No phone'}</p>
                      </td>

                      {/* Age & Gender */}
                      <td className="py-3 px-3 text-slate-700">
                        <span className="font-medium">{p.age} yrs</span>
                        <span className="text-slate-400 text-[11px] block">{p.gender}</span>
                      </td>

                      {/* Condition */}
                      <td className="py-3 px-3 max-w-xs">
                        <p className="text-slate-800 font-medium line-clamp-2">{p.condition}</p>
                      </td>

                      {/* Assigned Doctor */}
                      <td className="py-3 px-3 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium">
                            {p.doctor?.name || p.assignedDoctor || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            p.status === 'Admitted'
                              ? 'bg-purple-100 text-purple-800'
                              : p.status === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-3 text-right text-slate-500 font-mono text-[11px]">
                        {new Date(p.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Google Sheets Sync Settings Modal */}
      <AnimatePresence>
        {webhookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    Google Sheets "PatientsRecord" Configuration
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect your live Google Sheet file to receive real-time patient admissions
                  </p>
                </div>
                <button
                  onClick={() => setWebhookModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Status info */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5 text-xs">
                <p className="font-bold flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Local PatientsRecord.csv active
                </p>
                <p className="leading-relaxed">
                  Every patient registered is automatically written to <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-800">public/PatientsRecord.csv</code>.
                  You can also link a live cloud Google Sheet via Apps Script Webhook below.
                </p>
              </div>

              {/* Webhook Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Google Apps Script Webhook URL (Optional):
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={googleWebhookUrl}
                  onChange={(e) => setGoogleWebhookUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  Leave blank to use local CSV, or paste a deployed Apps Script URL to push to Google Drive.
                </p>
              </div>

              {/* Ready-to-use Apps Script snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Apps Script for your Google Sheet:
                  </label>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sampleAppsScript);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                </div>

                <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 text-[10px] font-mono overflow-x-auto max-h-40 border border-slate-800">
                  {sampleAppsScript}
                </pre>
                <p className="text-[11px] text-slate-500">
                  1. Open your Google Sheet named <strong>PatientsRecord</strong>.<br />
                  2. Click <strong>Extensions &gt; Apps Script</strong>, paste the snippet, and click <strong>Deploy &gt; New deployment &gt; Web app</strong> (Access: Anyone).
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setWebhookModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={saveWebhookUrl}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
