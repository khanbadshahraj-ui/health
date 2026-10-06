/**
 * Google Apps Script for Consultancy Appointments Google Sheet
 * 
 * Target Google Sheet URL:
 * https://docs.google.com/spreadsheets/d/1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew/edit
 * 
 * Instructions to connect:
 * 1. Open the Google Sheet above (ensure you have edit access or copy to your drive).
 * 2. In Google Sheets menu, click: Extensions > Apps Script
 * 3. Replace all code in the script editor with this file's code.
 * 4. Click: Deploy > New deployment
 * 5. Select type: "Web app"
 * 6. Set Description: "Consultancy Appointments Webhook"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"
 * 9. Click "Deploy", copy the Web app URL.
 * 10. Paste the Web app URL into the "Google Sheet Sync Settings" modal on your /consultancy page!
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Target sheet name: Consultancy_Appointments or first sheet
    var sheet = ss.getSheetByName("Consultancy_Appointments");
    if (!sheet) {
      sheet = ss.insertSheet("Consultancy_Appointments");
      var headers = [
        "Timestamp",
        "Booking ID",
        "Patient Name",
        "Mobile Number",
        "Email Address",
        "Consultation Mode",
        "Department",
        "Assigned Doctor",
        "Appointment Date",
        "Time Slot",
        "Verification OTP",
        "Payment Status",
        "Payment Method",
        "Transaction ID",
        "Fee Amount ($)",
        "Photo URL",
        "Status"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#059669"); // Emerald primary
      headerRange.setFontColor("#ffffff"); // White text
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
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Booking saved to Google Sheet 1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew" })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
