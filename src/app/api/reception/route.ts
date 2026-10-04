import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const CSV_FILE_PATH = path.join(process.cwd(), 'public', 'PatientsRecord.csv');
const PHOTOS_DIR = path.join(process.cwd(), 'public', 'patient-photos');

// Ensure directories and CSV structure exist
function ensureCsvFile() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  }

  if (!fs.existsSync(CSV_FILE_PATH)) {
    const header = [
      'Timestamp',
      'Patient ID',
      'Patient Name',
      'Age',
      'Gender',
      'Contact',
      'Condition / Reason for Visit',
      'Assigned Doctor',
      'Status',
      'Photo URL',
    ].map((f) => `"${f}"`).join(',') + '\n';

    fs.writeFileSync(CSV_FILE_PATH, header, 'utf8');
  }
}

function appendRecordToCsv(record: {
  timestamp: string;
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  condition: string;
  assignedDoctor: string;
  status: string;
  photoUrl: string;
}) {
  ensureCsvFile();

  const escapeCsv = (val: any) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const row = [
    escapeCsv(record.timestamp),
    escapeCsv(record.id),
    escapeCsv(record.name),
    escapeCsv(record.age),
    escapeCsv(record.gender),
    escapeCsv(record.contact),
    escapeCsv(record.condition),
    escapeCsv(record.assignedDoctor),
    escapeCsv(record.status),
    escapeCsv(record.photoUrl),
  ].join(',') + '\n';

  fs.appendFileSync(CSV_FILE_PATH, row, 'utf8');
}

export async function GET() {
  try {
    ensureCsvFile();

    // Fetch recent patients with their photos
    const recentPatients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        doctor: {
          select: { id: true, name: true, specialty: true },
        },
      },
    });

    const totalCount = await prisma.patient.count();

    return NextResponse.json({
      success: true,
      sheetName: 'PatientsRecord',
      csvUrl: '/PatientsRecord.csv',
      totalCount,
      patients: recentPatients,
    });
  } catch (error) {
    console.error('Failed to retrieve reception data:', error);
    return NextResponse.json({ error: 'Failed to retrieve reception data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    ensureCsvFile();
    const body = await request.json();
    const {
      name,
      age,
      gender,
      contact,
      condition,
      status,
      doctorId,
      photoData,
      googleSheetWebhookUrl,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
    }

    // Resolve assigned doctor
    let assignedDoctor = 'Unassigned';
    let validDocId = doctorId ? Number(doctorId) : null;
    if (validDocId) {
      const doc = await prisma.doctor.findUnique({ where: { id: validDocId } });
      if (doc) assignedDoctor = doc.name;
    }

    // Process & save photo if captured
    let photoUrl = '';
    if (photoData && typeof photoData === 'string' && photoData.startsWith('data:image/')) {
      try {
        const matches = photoData.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const extension = matches[1] === 'png' ? 'png' : 'jpg';
          const buffer = Buffer.from(matches[2], 'base64');
          const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
          const fileName = `patient_${Date.now()}_${cleanName}.${extension}`;
          const filePath = path.join(PHOTOS_DIR, fileName);

          fs.writeFileSync(filePath, buffer);
          photoUrl = `/patient-photos/${fileName}`;
        }
      } catch (photoErr) {
        console.error('Error saving patient photo:', photoErr);
      }
    }

    // Save to Database
    const newPatient = await prisma.patient.create({
      data: {
        name,
        age: Number(age) || 0,
        gender: gender || 'Other',
        contact: contact || 'N/A',
        condition: condition || 'General Checkup',
        status: status || 'Outpatient',
        doctorId: validDocId,
        assignedDoctor,
        photoUrl: photoUrl || null,
        roomNumber: 'Reception Desk',
      },
      include: {
        doctor: true,
      },
    });

    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });

    // Append to PatientsRecord.csv
    appendRecordToCsv({
      timestamp,
      id: newPatient.id,
      name: newPatient.name,
      age: newPatient.age,
      gender: newPatient.gender,
      contact: newPatient.contact,
      condition: newPatient.condition,
      assignedDoctor,
      status: newPatient.status,
      photoUrl: photoUrl ? `${photoUrl}` : 'No photo taken',
    });

    // Forward to Google Sheet Webhook if configured
    let sheetSynced = false;
    let sheetMessage = 'Local PatientsRecord file updated';
    const targetWebhook = googleSheetWebhookUrl || process.env.GOOGLE_SHEET_WEBHOOK_URL;

    if (targetWebhook) {
      try {
        const sheetPayload = {
          sheetName: 'PatientsRecord',
          timestamp,
          patientId: newPatient.id,
          name: newPatient.name,
          age: newPatient.age,
          gender: newPatient.gender,
          contact: newPatient.contact,
          condition: newPatient.condition,
          assignedDoctor,
          status: newPatient.status,
          photoUrl: photoUrl || 'No photo',
        };

        const sheetRes = await fetch(targetWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sheetPayload),
        });

        if (sheetRes.ok) {
          sheetSynced = true;
          sheetMessage = 'Successfully appended to PatientsRecord Google Sheet';
        } else {
          sheetMessage = `Google Sheet endpoint returned status ${sheetRes.status}`;
        }
      } catch (syncErr: any) {
        console.warn('Google Sheet webhook sync notice:', syncErr.message);
        sheetMessage = `Google Sheet webhook notice: ${syncErr.message}`;
      }
    }

    return NextResponse.json({
      success: true,
      patient: newPatient,
      sheetSynced,
      sheetMessage,
      csvUrl: '/PatientsRecord.csv',
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create reception record:', error);
    return NextResponse.json({ error: 'Failed to create reception record' }, { status: 500 });
  }
}
