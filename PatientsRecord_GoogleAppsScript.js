/**
 * Google Apps Script for "PatientsRecord" Google Sheet
 * 
 * Instructions:
 * 1. Open your Google Drive and create a new Google Sheet named: PatientsRecord
 * 2. In Google Sheets, click: Extensions > Apps Script
 * 3. Replace all code in the editor with this script
 * 4. Click: Deploy > New deployment
 * 5. Select type: "Web app"
 * 6. Set Description: "PatientsRecord Webhook"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"
 * 9. Click "Deploy" and copy the Web app URL
 * 10. Paste the URL into the "Google Sheet Sync Settings" modal on your Reception page (/reception)
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("PatientsRecord");
    
    // Create sheet if it does not exist
    if (!sheet) {
      sheet = ss.insertSheet("PatientsRecord");
      var headers = [
        "Timestamp",
        "Patient ID",
        "Patient Name",
        "Age",
        "Gender",
        "Contact",
        "Condition / Reason for Visit",
        "Assigned Doctor",
        "Status",
        "Photo URL"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#d1fae5"); // Emerald light
      headerRange.setFontColor("#065f46"); // Emerald dark
      sheet.setFrozenRows(1);
    }
    
    // Append the patient intake record
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
      data.photoUrl || "No photo"
    ]);
    
    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, 10);
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Row appended to PatientsRecord" })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
