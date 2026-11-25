import fs from 'fs';
import path from 'path';

export interface GoogleSheetRowPayload {
  sheetName:
    | 'PatientsRecord'
    | 'AppointmentsRecord'
    | 'ConsultationsAndPrescriptions'
    | 'BillingInvoices'
    | 'PaymentReceipts'
    | 'InventoryStock'
    | 'StaffCredentials';
  data: Record<string, any>;
}

const SHEETS_DIR = path.join(process.cwd(), 'public', 'sheets');

// Column definitions for each respective Google Sheet tab
export const SHEET_COLUMNS: Record<string, string[]> = {
  PatientsRecord: [
    'Timestamp',
    'Patient ID',
    'Patient Name',
    'Age',
    'Gender',
    'Contact',
    'Condition / Diagnosis',
    'Assigned Doctor',
    'Status',
    'Photo URL',
  ],
  AppointmentsRecord: [
    'Timestamp',
    'Booking ID',
    'Patient Name',
    'Mobile Number',
    'Email Address',
    'Consultation Type',
    'Department',
    'Assigned Doctor',
    'Appointment Date',
    'Time Slot',
    'OTP Code',
    'Payment Status',
    'Fee (PKR)',
    'Status',
  ],
  ConsultationsAndPrescriptions: [
    'Timestamp',
    'Consultation ID',
    'Patient ID',
    'Patient Name',
    'Doctor Name',
    'Department',
    'Vitals',
    'Chief Complaint',
    'Clinical Diagnosis',
    'Prescription Medications',
    'Advice & Instructions',
    'Follow-up Date',
  ],
  BillingInvoices: [
    'Timestamp',
    'Invoice Number',
    'Patient ID',
    'Patient Name',
    'Department',
    'Description',
    'Total Amount (PKR)',
    'Paid Amount (PKR)',
    'Outstanding (PKR)',
    'Status',
    'Due Date',
  ],
  PaymentReceipts: [
    'Timestamp',
    'Receipt Number',
    'Invoice Number',
    'Amount (PKR)',
    'Gateway Mode',
    'Payment Method',
    'Provider Txn Ref',
    'Status',
  ],
  InventoryStock: [
    'Timestamp',
    'Item ID',
    'Item Name',
    'Category',
    'Stock Quantity',
    'Unit Price (PKR)',
    'Min Threshold',
    'Status',
  ],
  StaffCredentials: [
    'Timestamp',
    'Username',
    'Staff Name',
    'Role',
    'Department',
    'Email',
    'Contact',
    'Designation',
    'Status',
  ],
};

// Ensure local CSV mirror file exists for instant download / fallback
export function ensureSheetCsvFile(sheetName: string) {
  if (!fs.existsSync(SHEETS_DIR)) {
    fs.mkdirSync(SHEETS_DIR, { recursive: true });
  }

  const filePath = path.join(SHEETS_DIR, `${sheetName}.csv`);
  if (!fs.existsSync(filePath)) {
    const cols = SHEET_COLUMNS[sheetName] || ['Timestamp', 'Record'];
    const headerRow = cols.map((c) => `"${c}"`).join(',') + '\n';
    fs.writeFileSync(filePath, headerRow, 'utf8');
  }
  return filePath;
}

// Append a row to the local CSV mirror
export function appendToLocalSheetCsv(sheetName: string, rowValues: any[]) {
  const filePath = ensureSheetCsvFile(sheetName);
  const escapeCsv = (val: any) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };
  const line = rowValues.map(escapeCsv).join(',') + '\n';
  fs.appendFileSync(filePath, line, 'utf8');
}

/**
 * Universal Dual-Write to Google Sheets
 * Targets owner: khanbadshahraj@gmail.com
 */
export async function syncToGoogleSheets(payload: GoogleSheetRowPayload): Promise<{
  success: boolean;
  sheetSynced: boolean;
  message: string;
  csvUrl: string;
}> {
  const { sheetName, data } = payload;
  const timestamp = data.timestamp || new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Karachi',
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  // 1. Map to row array according to column definitions
  const columns = SHEET_COLUMNS[sheetName] || Object.keys(data);
  const rowValues = columns.map((col) => {
    if (col === 'Timestamp') return timestamp;
    return data[col] !== undefined ? data[col] : (data[col.toLowerCase().replace(/[^a-z0-9]/g, '')] ?? 'N/A');
  });

  // 2. Append to local CSV mirror
  try {
    appendToLocalSheetCsv(sheetName, rowValues);
  } catch (err: any) {
    console.warn(`[Google Sheets Local CSV Warning]: ${err.message}`);
  }

  // 3. Dispatch to live Google Apps Script Webhook if configured
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || (global as any)._AURA_GOOGLE_SHEET_WEBHOOK_URL;
  let sheetSynced = false;
  let message = `Appended to ${sheetName} (Mirrored locally at /sheets/${sheetName}.csv)`;

  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: 'khanbadshahraj@gmail.com',
          sheetName,
          timestamp,
          columns,
          rowValues,
          data,
        }),
      });

      if (response.ok) {
        sheetSynced = true;
        message = `Live synced to Google Sheet tab "${sheetName}" on khanbadshahraj@gmail.com`;
      } else {
        message = `Google Sheets webhook returned HTTP ${response.status}`;
      }
    } catch (networkErr: any) {
      console.warn(`[Google Sheets Cloud Sync Notice]: ${networkErr.message}`);
      message = `Saved to local CSV; Google Cloud webhook notice: ${networkErr.message}`;
    }
  }

  return {
    success: true,
    sheetSynced,
    message,
    csvUrl: `/sheets/${sheetName}.csv`,
  };
}

/**
 * Complete Google Apps Script template for khanbadshahraj@gmail.com
 * Automates creation of all sheets with formatted headers & styling
 */
export const MULTI_SHEET_APPS_SCRIPT = `/**
 * =======================================================================
 * AuraCare Hospital Management System - Automated Multi-Sheet Webhook
 * Account: khanbadshahraj@gmail.com
 * =======================================================================
 *
 * HOW TO DEPLOY:
 * 1. Open Google Sheets at https://sheets.google.com logged in as khanbadshahraj@gmail.com.
 * 2. Create a new Spreadsheet and name it: "AuraCare_Hospital_Master_Database".
 * 3. In the top menu, click Extensions > Apps Script.
 * 4. Replace all code in the script editor with THIS snippet.
 * 5. Click "Deploy" (top right) > "New deployment".
 * 6. Select type: "Web app".
 *    - Description: "AuraCare HMS Live Database Sync"
 *    - Execute as: "Me (khanbadshahraj@gmail.com)"
 *    - Who has access: "Anyone"
 * 7. Click "Deploy", authorize permissions, and copy the Web App URL (starts with https://script.google.com/macros/s/...).
 * 8. Paste the Web App URL into the AuraCare Admin Dashboard or in .env as GOOGLE_SHEET_WEBHOOK_URL.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var contents = e.postData.contents;
    var payload = JSON.parse(contents);

    var sheetName = payload.sheetName || "GeneralLog";
    var columns = payload.columns || [];
    var rowValues = payload.rowValues || [];

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    // Auto-create tab if it doesn't exist yet with beautiful styled headers
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (columns && columns.length > 0) {
        sheet.appendRow(columns);
        var headerRange = sheet.getRange(1, 1, 1, columns.length);
        headerRange.setFontWeight("bold");
        headerRange.setFontColor("#ffffff");
        
        // Color-code tabs
        if (sheetName === "PatientsRecord") {
          headerRange.setBackground("#059669"); // Emerald
        } else if (sheetName === "AppointmentsRecord") {
          headerRange.setBackground("#0284c7"); // Sky Blue
        } else if (sheetName === "ConsultationsAndPrescriptions") {
          headerRange.setBackground("#7c3aed"); // Purple
        } else if (sheetName === "BillingInvoices" || sheetName === "PaymentReceipts") {
          headerRange.setBackground("#d97706"); // Amber
        } else {
          headerRange.setBackground("#334155"); // Slate
        }
        sheet.setFrozenRows(1);
      }
    }

    // Append the incoming record row
    if (rowValues && rowValues.length > 0) {
      sheet.appendRow(rowValues);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      sheetName: sheetName,
      message: "Row appended successfully to " + sheetName + " for khanbadshahraj@gmail.com",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    hospital: "AuraCare Multi-Specialty Hospital",
    owner: "khanbadshahraj@gmail.com",
    activeSheets: [
      "PatientsRecord",
      "AppointmentsRecord",
      "ConsultationsAndPrescriptions",
      "BillingInvoices",
      "PaymentReceipts",
      "InventoryStock",
      "StaffCredentials"
    ]
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
