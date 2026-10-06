'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarClock,
  Video,
  Hospital,
  Camera,
  RotateCcw,
  CheckCircle2,
  Lock,
  CreditCard,
  Smartphone,
  Mail,
  Phone,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  ExternalLink,
  User,
  Stethoscope,
  Sparkles,
  Clock,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  Building,
  CheckCheck,
  Sliders,
  DollarSign,
  ArrowRight,
  Send,
  VideoOff
} from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  availability: string;
  contact: string;
  email: string;
  experience: string;
  avatarUrl: string;
}

interface SlotStatus {
  timeSlot: string;
  isOccupied: boolean;
  status: 'Vacant' | 'Occupied';
  appointment?: {
    id: number;
    bookingCode: string;
    patientName: string;
    consultationType: string;
    doctorName: string;
    department: string;
    paymentStatus: string;
    photoUrl?: string;
  } | null;
}

interface AppointmentRecord {
  id: number;
  bookingCode: string;
  patientName: string;
  mobileNumber: string;
  email: string;
  consultationType: string;
  department: string;
  doctorName: string;
  appointmentDate: string;
  timeSlot: string;
  otpCode: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionId: string;
  consultationFee: number;
  photoUrl?: string;
  status: string;
  createdAt: string;
}

export default function ConsultancyPage() {
  const todayStr = new Date().toISOString().split('T')[0];

  // Filters
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<SlotStatus[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Form State
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [consultationType, setConsultationType] = useState<'Online Video Call' | 'Physical at Hospital Inspection'>('Online Video Call');
  const [bookingDoctorId, setBookingDoctorId] = useState<string>('');
  const [bookingDepartment, setBookingDepartment] = useState<string>('General Practice');

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Payment Gateway Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Credit/Debit Card' | 'UPI / Digital Wallet' | 'Net Banking'>('Credit/Debit Card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Confirmation & OTP Notification Modal
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Google Sheet Webhook Modal State
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [googleWebhookUrl, setGoogleWebhookUrl] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);

  const GOOGLE_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew/edit';

  // 1. Fetch appointments & slot occupancy
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedDoctorId) params.append('doctorId', selectedDoctorId);
      if (selectedDepartment && selectedDepartment !== 'All') params.append('department', selectedDepartment);

      const res = await fetch(`/api/appointments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slotsStatus || []);
        setDoctors(data.doctors || []);
        setAllAppointments(data.appointments || []);

        // Default booking doctor if not set
        if (!bookingDoctorId && data.doctors && data.doctors.length > 0) {
          setBookingDoctorId(String(data.doctors[0].id));
          setBookingDepartment(data.doctors[0].specialty);
        }
      }
    } catch (err) {
      console.error('Failed to load consultancy appointments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const saved = localStorage.getItem('aura_google_sheet_webhook');
    if (saved) setGoogleWebhookUrl(saved);

    return () => {
      stopCamera();
    };
  }, [selectedDate, selectedDoctorId, selectedDepartment]);

  // Handle department changes in booking form
  const handleBookingDeptChange = (dept: string) => {
    setBookingDepartment(dept);
    const matchingDoc = doctors.find((d) => d.specialty.toLowerCase().includes(dept.toLowerCase()));
    if (matchingDoc) {
      setBookingDoctorId(String(matchingDoc.id));
    }
  };

  const handleBookingDocChange = (docIdStr: string) => {
    setBookingDoctorId(docIdStr);
    const doc = doctors.find((d) => String(d.id) === docIdStr);
    if (doc) {
      setBookingDepartment(doc.specialty);
    }
  };

  // 2. Camera Functions
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access unavailable. You can proceed without portrait photo.');
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
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const retakePicture = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // 3. Form Validation -> Open Payment Gateway Modal
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Patient Name is compulsory');
      return;
    }
    if (!mobileNumber.trim()) {
      alert('Mobile Number is compulsory to receive OTP & SMS confirmation');
      return;
    }
    if (!selectedSlot) {
      alert('Please select an available (green) consultancy time slot');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  // 4. Confirm Payment & Execute Booking
  const handleExecuteBooking = async () => {
    setIsProcessingPayment(true);
    try {
      const targetDoctor = doctors.find((d) => String(d.id) === bookingDoctorId) || doctors[0];

      const payload = {
        patientName: patientName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim(),
        consultationType,
        department: bookingDepartment,
        doctorId: targetDoctor ? targetDoctor.id : 1,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        paymentMethod,
        photoData: capturedPhoto,
        googleSheetWebhookUrl: googleWebhookUrl.trim() || undefined,
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setIsPaymentModalOpen(false);
        setConfirmedBooking(data);

        // Reset inputs
        setSelectedSlot(null);
        setPatientName('');
        setMobileNumber('');
        setEmail('');
        setCapturedPhoto(null);
        stopCamera();

        // Refresh slot calendar
        fetchData();
      } else {
        alert(data.error || 'Failed to complete booking');
      }
    } catch (err: any) {
      console.error('Payment / booking execution error:', err);
      alert('Booking error: ' + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const currentFee = consultationType === 'Online Video Call' ? 45.0 : 60.0;
  const currentDocObj = doctors.find((d) => String(d.id) === bookingDoctorId);

  const sampleAppsScript = `// Apps Script for Google Sheet (1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew)
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Consultancy_Appointments");
    if (!sheet) {
      sheet = ss.insertSheet("Consultancy_Appointments");
      var headers = ["Timestamp", "Booking ID", "Patient Name", "Mobile Number", "Email Address", "Mode", "Department", "Doctor", "Date", "Time Slot", "OTP Code", "Payment Status", "Payment Method", "Txn ID", "Amount ($)", "Photo URL", "Status"];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#059669").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.bookingCode || "",
      data.patientName || "",
      data.mobileNumber || "",
      data.email || "",
      data.consultationType || "Online Video Call",
      data.department || "",
      data.doctorName || "",
      data.appointmentDate || "",
      data.timeSlot || "",
      data.otpCode || "",
      data.paymentStatus || "Paid (Advance)",
      data.paymentMethod || "Credit/Debit Card",
      data.transactionId || "",
      data.fee || 50.0,
      data.photoUrl || "No Photo",
      "Confirmed"
    ]);
    sheet.autoResizeColumns(1, 17);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  return (
    <div className="flex-1 bg-transparent min-h-screen flex flex-col">
      <Header
        title="Consultancy Booking & Slot Platform"
        subtitle="Reserve vacant consultancy time slots with advance payment, OTP verification, SMS/Email dispatch & Google Sheets sync"
      />

      <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Banner with Google Sheet and Test Data Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 md:p-8 shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-bold backdrop-blur-sm border border-emerald-400/30">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                <span>Synced with Google Sheet 1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Online Consultancy & In-Person Booking
              </h2>
              <p className="text-emerald-100/90 text-xs md:text-sm max-w-2xl leading-relaxed">
                Vacant slots appear in vibrant emerald. As soon as a slot is booked, it <strong>turns RED</strong> and becomes occupied.
                Patients receive a secure 6-digit OTP sent to both patient and doctor via SMS & Email upon advance payment.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={GOOGLE_SPREADSHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                <span>Open Google Spreadsheet</span>
              </a>

              <a
                href="/AppointmentsRecord.csv"
                download="AppointmentsRecord.csv"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 backdrop-blur-sm border border-white/20 transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                <span>Download AppointmentsRecord.csv</span>
              </a>

              <button
                onClick={() => setWebhookModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Sliders className="w-4 h-4" />
                <span>Sheet Webhook</span>
              </button>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none blur-xl" />
        </motion.div>

        {/* Filters Bar: Date & Physician / Department */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Date Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-bold text-slate-700">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-bold text-slate-700">Department:</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Departments</option>
                <option value="General Practice">General Practice</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dermatology">Dermatology</option>
              </select>
            </div>

            {/* Doctor Filter */}
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-bold text-slate-700">Doctor:</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Attending Physicians</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Slot Legend */}
          <div className="flex items-center gap-4 text-xs font-bold shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-xs"></span>
              <span className="text-slate-700">Vacant / Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shadow-xs"></span>
              <span className="text-slate-700">Occupied / Reserved (Red)</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Slots Calendar (7 cols) + Booking Form (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Modern Consultancy Time Slots Grid (7 cols) */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Consultancy Time Slots</h3>
                  <p className="text-xs text-slate-500">
                    Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
                {slots.filter((s) => !s.isOccupied).length} Vacant Slots Available
              </span>
            </div>

            {/* Time Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {isLoading ? (
                <div className="col-span-2 py-12 text-center text-slate-400 text-sm">
                  Loading available consultancy slots...
                </div>
              ) : (
                slots.map((slot, index) => {
                  const isSelected = selectedSlot === slot.timeSlot && !slot.isOccupied;

                  if (slot.isOccupied) {
                    // OCCUPIED SLOT: Shown in RED as explicitly requested!
                    return (
                      <motion.div
                        key={slot.timeSlot}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="p-4 rounded-2xl border-2 border-rose-300 bg-rose-50/90 text-rose-950 shadow-sm relative overflow-hidden flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs uppercase tracking-wider">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Occupied / Reserved</span>
                            </div>
                            <h4 className="text-sm font-black text-rose-950 mt-1">{slot.timeSlot}</h4>
                          </div>

                          <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
                            RED (Full)
                          </span>
                        </div>

                        {/* Patient & Doctor booked detail */}
                        {slot.appointment && (
                          <div className="mt-3 pt-2.5 border-t border-rose-200/80 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {slot.appointment.photoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={slot.appointment.photoUrl}
                                  alt={slot.appointment.patientName}
                                  className="w-7 h-7 rounded-full object-cover border border-rose-300"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-rose-200 text-rose-800 font-bold flex items-center justify-center text-[10px]">
                                  {slot.appointment.patientName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-rose-950 leading-tight">
                                  {slot.appointment.patientName}
                                </p>
                                <p className="text-[10px] text-rose-700 font-medium">
                                  {slot.appointment.consultationType}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-rose-800 bg-white/70 px-1.5 py-0.5 rounded">
                              {slot.appointment.bookingCode}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  }

                  // VACANT SLOT: Shown in Modern Emerald/Teal Layout
                  return (
                    <motion.div
                      key={slot.timeSlot}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSlot(slot.timeSlot)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                          : 'border-emerald-200/90 bg-emerald-50/40 hover:bg-emerald-100/60 text-slate-800 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            isSelected ? 'text-emerald-100' : 'text-emerald-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Vacant Slot</span>
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Available
                        </span>
                      </div>

                      <div className="my-2">
                        <h4 className="text-sm font-black tracking-tight">{slot.timeSlot}</h4>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className={isSelected ? 'text-emerald-100' : 'text-slate-500'}>
                          30-min Consultation
                        </span>
                        <span className={`font-bold ${isSelected ? 'text-white underline' : 'text-emerald-700'}`}>
                          {isSelected ? 'Selected' : 'Click to Reserve'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Quick note */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-600 text-xs flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Select any vacant time slot above to proceed with the booking form and advance gateway payment.
                Occupied slots turn red automatically.
              </span>
            </div>
          </div>

          {/* Right Column: Booking Platform Form & Camera Snapshot (5 cols) */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-100/80 text-teal-700">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Patient Booking Form</h3>
                  <p className="text-xs text-slate-500">Compulsory patient details & photo</p>
                </div>
              </div>

              {selectedSlot ? (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Slot: {selectedSlot}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                  Pick a Slot
                </span>
              )}
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Compulsory Patient Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Patient Full Name</span>
                  <span className="text-rose-500 font-bold">* Compulsory</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexander Hamilton"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Compulsory Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Mobile Number (For SMS & OTP)</span>
                  <span className="text-rose-500 font-bold">* Compulsory</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 019-2834"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Email Address (For Appointment Mail)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Consultation Type: Video Call vs Physical Hospital Inspection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Consultation Mode:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConsultationType('Online Video Call')}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${
                      consultationType === 'Online Video Call'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                      <Video className="w-4 h-4" />
                      <span>Online Video Call</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">HD Telehealth ($45)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType('Physical at Hospital Inspection')}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${
                      consultationType === 'Physical at Hospital Inspection'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                      <Hospital className="w-4 h-4" />
                      <span>Physical Hospital</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">In-person Exam ($60)</span>
                  </button>
                </div>
              </div>

              {/* Department & Specific Doctor Selection */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Department / Specialty:</label>
                  <select
                    value={bookingDepartment}
                    onChange={(e) => handleBookingDeptChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="General Practice">General Practice (Dr. Sarah Jenkins)</option>
                    <option value="Pediatrics">Pediatrics (Dr. Marcus Vance)</option>
                    <option value="Cardiology">Cardiology (Dr. Elena Rostova)</option>
                    <option value="Orthopedics">Orthopedics (Dr. David Kim)</option>
                    <option value="Dermatology">Dermatology (Dr. Anita Desai)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Assigned Doctor:</label>
                  <select
                    value={bookingDoctorId}
                    onChange={(e) => handleBookingDocChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-emerald-500"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} — {doc.specialty} ({doc.experience})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Camera Portrait Capture */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Optional Picture (Laptop or Phone Camera):</span>
                  </label>
                  {capturedPhoto && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Photo Ready
                    </span>
                  )}
                </div>

                {/* Camera Viewport or Snapshot */}
                <div className="relative aspect-video w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                  {!isCameraActive && !capturedPhoto && (
                    <div className="text-center p-3">
                      <p className="text-xs text-slate-300 font-medium">Capture portrait from camera</p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Start Camera</span>
                      </button>
                    </div>
                  )}

                  {isCameraActive && (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  )}

                  {capturedPhoto && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={capturedPhoto} alt="Patient Portrait" className="w-full h-full object-cover" />
                  )}
                </div>

                {isCameraActive && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={takePicture}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Picture</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {capturedPhoto && (
                  <button
                    type="button"
                    onClick={retakePicture}
                    className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </button>
                )}
              </div>

              {/* Submit / Proceed to Advance Payment Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-all mt-4"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  Proceed to Advance Payment (${currentFee.toFixed(2)})
                </span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>
          </div>
        </div>

        {/* Bottom Section: All Bookings & Google Sheet Log */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Consultancy Appointments Registry</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {allAppointments.length} Bookings Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Saved into SQLite, CSV & Linked to Google Sheet 1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={GOOGLE_SPREADSHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>Open Google Sheet</span>
              </a>

              <a
                href="/AppointmentsRecord.csv"
                download="AppointmentsRecord.csv"
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
                  <th className="pb-3 px-3">Patient</th>
                  <th className="pb-3 px-3">Contact & Email</th>
                  <th className="pb-3 px-3">Doctor & Dept</th>
                  <th className="pb-3 px-3">Date & Slot</th>
                  <th className="pb-3 px-3">Mode</th>
                  <th className="pb-3 px-3">Verification OTP</th>
                  <th className="pb-3 px-3">Payment</th>
                  <th className="pb-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {allAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Patient Name & Portrait */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        {apt.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={apt.photoUrl}
                            alt={apt.patientName}
                            className="w-10 h-10 rounded-xl object-cover border border-emerald-300 shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200">
                            {apt.patientName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{apt.patientName}</p>
                          <span className="text-[10px] font-mono text-slate-400">{apt.bookingCode}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact & Email */}
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-800">{apt.mobileNumber}</p>
                      <p className="text-[11px] text-slate-400">{apt.email || 'No email'}</p>
                    </td>

                    {/* Doctor & Dept */}
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{apt.doctorName}</p>
                      <p className="text-[11px] text-emerald-700 font-medium">{apt.department}</p>
                    </td>

                    {/* Date & Slot */}
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{apt.timeSlot}</p>
                      <p className="text-[11px] text-slate-400">{apt.appointmentDate}</p>
                    </td>

                    {/* Mode */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border inline-flex items-center gap-1 ${
                          apt.consultationType === 'Online Video Call'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-teal-50 text-teal-700 border-teal-200'
                        }`}
                      >
                        {apt.consultationType === 'Online Video Call' ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <Hospital className="w-3 h-3" />
                        )}
                        <span>{apt.consultationType}</span>
                      </span>
                    </td>

                    {/* OTP */}
                    <td className="py-3.5 px-3 font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs tracking-wider">
                        {apt.otpCode}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full block w-fit">
                        ${apt.consultationFee.toFixed(2)} Paid
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{apt.transactionId}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 1. EASY PAYMENT GATEWAY MODAL */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 relative"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>AuraCare Secure Payment Gateway</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Advance Consultation Fee
                  </h3>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Patient Name:</span>
                  <strong className="text-slate-900">{patientName}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Consultation Mode:</span>
                  <strong className="text-slate-900">{consultationType}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Reserved Slot:</span>
                  <strong className="text-emerald-700 font-bold">{selectedSlot}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Physician:</span>
                  <strong className="text-slate-900">{currentDocObj?.name}</strong>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Advance Payable:</span>
                  <span className="text-emerald-700 text-base">${currentFee.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Select Payment Method:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Credit/Debit Card')}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                      paymentMethod === 'Credit/Debit Card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI / Digital Wallet')}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                      paymentMethod === 'UPI / Digital Wallet'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    UPI / Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Net Banking')}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                      paymentMethod === 'Net Banking'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Net Banking
                  </button>
                </div>
              </div>

              {/* Card Inputs */}
              {paymentMethod === 'Credit/Debit Card' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700">CVC / CVV</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pay Now Button */}
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleExecuteBooking}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <span>Processing Secure Payment & Generating OTP...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay ${currentFee.toFixed(2)} & Confirm Slot</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. OTP & DISPATCHED NOTIFICATIONS MODAL */}
      <AnimatePresence>
        {confirmedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCheck className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  Appointment Confirmed!
                </h3>
                <p className="text-xs text-slate-500">
                  Your time slot is reserved and turned RED. OTP dispatched via SMS & Email.
                </p>
              </div>

              {/* Highlighting the OTP Code */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-center space-y-1.5 shadow-lg">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                  Your Secure Consultation OTP
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest">
                    {confirmedBooking.otpCode}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(confirmedBooking.otpCode);
                      setCopiedOtp(true);
                      setTimeout(() => setCopiedOtp(false), 2000);
                    }}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
                    title="Copy OTP"
                  >
                    {copiedOtp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-emerald-100 font-medium">
                  Share this OTP with your physician at the start of your consultation.
                </p>
              </div>

              {/* Dispatched SMS & Email Notification Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Live Dispatch Simulation (SMS & Email Delivered)
                </h4>

                {/* Patient SMS */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>SMS to Patient ({confirmedBooking.notifications?.patientSms?.to})</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Delivered
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono leading-relaxed">
                    "{confirmedBooking.notifications?.patientSms?.text}"
                  </p>
                </div>

                {/* Doctor SMS */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                      <span>SMS to Doctor ({confirmedBooking.notifications?.doctorSms?.to})</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Delivered
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono leading-relaxed">
                    "{confirmedBooking.notifications?.doctorSms?.text}"
                  </p>
                </div>

                {/* Email to Patient */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Email to Patient ({confirmedBooking.notifications?.patientEmail?.to})</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Sent to Inbox
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono leading-relaxed">
                    Subject: {confirmedBooking.notifications?.patientEmail?.subject}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <a
                  href={GOOGLE_SPREADSHEET_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Verify in Google Sheet</span>
                </a>

                <button
                  onClick={() => setConfirmedBooking(null)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. GOOGLE SHEET WEBHOOK MODAL */}
      <AnimatePresence>
        {webhookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    Google Sheets "Consultancy_Appointments" Webhook
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect your Google Sheet (1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew)
                  </p>
                </div>
                <button
                  onClick={() => setWebhookModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Google Apps Script Webhook URL:
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={googleWebhookUrl}
                  onChange={(e) => setGoogleWebhookUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Apps Script Template for Sheet 1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew:
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
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setWebhookModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('aura_google_sheet_webhook', googleWebhookUrl.trim());
                    setWebhookModalOpen(false);
                  }}
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
