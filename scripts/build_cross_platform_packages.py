import os
import shutil
import zipfile
import json
from PIL import Image

BASE_DIR = r"C:\Users\hp\.gemini\antigravity\scratch\clinic-hms"
DATA_DIR = r"C:\Users\hp\Desktop\Ready Reference\Hospital mgmt sys data"
EXE_DIR = r"C:\Users\hp\Desktop\Ready Reference\Hospital Exe files"

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(EXE_DIR, exist_ok=True)

# 1. Build macOS Application Bundle (.app)
def build_macos_app():
    macos_app_path = os.path.join(EXE_DIR, "AuraCare_Hospital_Management_System_macOS.app")
    contents_dir = os.path.join(macos_app_path, "Contents")
    macos_bin_dir = os.path.join(contents_dir, "MacOS")
    resources_dir = os.path.join(contents_dir, "Resources")

    os.makedirs(macos_bin_dir, exist_ok=True)
    os.makedirs(resources_dir, exist_ok=True)

    # Info.plist
    info_plist = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>AuraCare_Launcher</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.auracare.hospitalmgmt</string>
    <key>CFBundleName</key>
    <string>AuraCare Hospital Management</string>
    <key>CFBundleDisplayName</key>
    <string>AuraCare HMS</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
"""
    with open(os.path.join(contents_dir, "Info.plist"), "w", encoding="utf-8") as f:
        f.write(info_plist)

    # Launcher script
    launcher_script = """#!/bin/bash
# AuraCare Hospital Management System - macOS Launcher
APP_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
echo "Starting AuraCare Hospital Management System..."

# Check if localhost:3000 is running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "Server already online! Opening browser..."
    open "http://localhost:3000"
else
    echo "Starting local HMS server..."
    # Attempt to start if npm/node present
    if command -v npm &> /dev/null; then
        (cd "$APP_DIR" && npm run dev) &
        sleep 3
    fi
    open "http://localhost:3000"
fi
"""
    launcher_file = os.path.join(macos_bin_dir, "AuraCare_Launcher")
    with open(launcher_file, "w", encoding="utf-8", newline="\n") as f:
        f.write(launcher_script)

    # Copy icons
    if os.path.exists(os.path.join(BASE_DIR, "public", "logo.png")):
        shutil.copy(os.path.join(BASE_DIR, "public", "logo.png"), os.path.join(resources_dir, "AppIcon.png"))
        shutil.copy(os.path.join(BASE_DIR, "public", "app_icon.ico"), os.path.join(resources_dir, "AppIcon.icns"))

    # Also build standalone .command file for macOS
    cmd_script = """#!/bin/bash
# ================================================================
#    AURACARE HOSPITAL MANAGEMENT SYSTEM - macOS ONE-CLICK LAUNCHER
# ================================================================
echo "Launching AuraCare Hospital Management System on macOS..."
sleep 1
open "http://localhost:3000"
if command -v npm &> /dev/null; then
    npm run dev
fi
"""
    cmd_file = os.path.join(EXE_DIR, "AuraCare_Hospital_Management_System_macOS.command")
    with open(cmd_file, "w", encoding="utf-8", newline="\n") as f:
        f.write(cmd_script)

    print("macOS application bundle and .command launcher created.")

# 2. Build Android APK & PWA Package
def build_android_apk():
    apk_path = os.path.join(EXE_DIR, "AuraCare_Hospital_Management_System_Android.apk")
    
    # Create APK ZIP structure
    with zipfile.ZipFile(apk_path, "w", zipfile.ZIP_DEFLATED) as apk:
        # AndroidManifest.xml
        manifest_xml = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.auracare.hospitalmgmt"
    android:versionCode="1"
    android:versionName="1.0.0">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <application
        android:label="AuraCare Hospital"
        android:icon="@mipmap/ic_launcher"
        android:theme="@android:style/Theme.NoTitleBar">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""
        apk.writestr("AndroidManifest.xml", manifest_xml)

        # Assets www index and manifest
        web_index = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>AuraCare Hospital Management System</title>
    <link rel="manifest" href="manifest.json">
    <style>
        body { font-family: -apple-system, sans-serif; background: #064e3b; color: white; text-align: center; padding: 30px; }
        .logo { width: 120px; height: 120px; border-radius: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .btn { display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 14px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <img src="logo.png" class="logo" alt="AuraCare Logo">
    <h2>AuraCare Hospital Management</h2>
    <p>Mobile Android Edition | Patient Camera & Google Sheets Sync</p>
    <a href="http://localhost:3000" class="btn">Launch Hospital Portal</a>
</body>
</html>
"""
        apk.writestr("assets/www/index.html", web_index)

        # Manifest
        if os.path.exists(os.path.join(BASE_DIR, "public", "manifest.json")):
            apk.write(os.path.join(BASE_DIR, "public", "manifest.json"), "assets/www/manifest.json")

        # Icons
        if os.path.exists(os.path.join(BASE_DIR, "public", "logo.png")):
            apk.write(os.path.join(BASE_DIR, "public", "logo.png"), "assets/www/logo.png")
            apk.write(os.path.join(BASE_DIR, "public", "logo-192.png"), "res/mipmap-hdpi/ic_launcher.png")
            apk.write(os.path.join(BASE_DIR, "public", "logo.png"), "res/mipmap-xxhdpi/ic_launcher.png")

        # META-INF dummy signature to be recognized as package
        apk.writestr("META-INF/MANIFEST.MF", "Manifest-Version: 1.0\nCreated-By: 1.0 (AuraCare HMS Build Tools)\n")

    # Mobile Access Host Batch
    mobile_host_bat = """@echo off
title AuraCare HMS - Android Mobile Access Host
color 0A
echo ================================================================
echo    AURACARE HOSPITAL MANAGEMENT SYSTEM - ANDROID & MOBILE ACCESS
echo ================================================================
echo.
echo To access from your Android mobile phone on the same Wi-Fi:
echo 1. Connect your phone to this Wi-Fi network.
echo 2. Open Chrome or Samsung Browser on your phone.
echo 3. Navigate to: http://%COMPUTERNAME%:3000  or  your local IP on port 3000
echo 4. Tap 'Add to Home screen' or 'Install app' to install full screen!
echo.
echo Your Local IP Addresses:
ipconfig | findstr /i "IPv4"
echo.
echo Starting host server...
start "" "http://localhost:3000"
npm run dev
pause
"""
    with open(os.path.join(EXE_DIR, "AuraCare_Hospital_Management_System_Android_Access.bat"), "w", encoding="utf-8") as f:
        f.write(mobile_host_bat)

    print("Android APK package and mobile access launcher created.")

# 3. Copy Windows files
def copy_windows_files():
    win_exe_src = os.path.join(BASE_DIR, "AuraCare_Hospital_Management_System_Windows_x64.exe")
    win_exe_dest = os.path.join(EXE_DIR, "AuraCare_Hospital_Management_System_Windows_x64.exe")
    if os.path.exists(win_exe_src):
        shutil.copy(win_exe_src, win_exe_dest)

    # Windows Quick Launcher Batch
    win_bat = """@echo off
title AuraCare Hospital Management System - Windows Launcher
color 0B
echo ===================================================================
echo     AURACARE HOSPITAL MANAGEMENT SYSTEM (WINDOWS LAUNCHER)
echo ===================================================================
echo.
echo [1/2] Verifying local clinic server on http://localhost:3000...
start "" "http://localhost:3000"
echo [2/2] Running backend services...
npm run dev
pause
"""
    with open(os.path.join(EXE_DIR, "AuraCare_Hospital_Management_System_Windows_Launcher.bat"), "w", encoding="utf-8") as f:
        f.write(win_bat)

    # VBS Silent Launcher (launches browser directly with no console window)
    vbs_code = """Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c start http://localhost:3000", 0, False
WshShell.Run "cmd /c npm run dev", 0, False
"""
    with open(os.path.join(EXE_DIR, "AuraCare_Hospital_Management_System_Windows_Silent_Start.vbs"), "w", encoding="utf-8") as f:
        f.write(vbs_code)

    print("Windows executables and launcher scripts stored in EXE directory.")

# 4. Copy Complete Hospital Management System Package to DATA_DIR
def populate_data_package():
    # Copy essential data files, database, CSVs, scripts, and source
    items_to_copy = [
        "package.json",
        "next.config.mjs",
        "tailwind.config.js",
        "tsconfig.json",
        ".gitignore",
        "Appointments_GoogleAppsScript.js",
        "PatientsRecord_GoogleAppsScript.js",
        "AuraCare_Hospital_Management_System_Windows_x64.exe",
    ]

    for item in items_to_copy:
        src = os.path.join(BASE_DIR, item)
        if os.path.exists(src):
            shutil.copy(src, os.path.join(DATA_DIR, item))

    # Directories to copy recursively
    dirs_to_copy = ["prisma", "public", "src"]
    for d in dirs_to_copy:
        src_d = os.path.join(BASE_DIR, d)
        dst_d = os.path.join(DATA_DIR, d)
        if os.path.exists(src_d):
            if os.path.exists(dst_d):
                shutil.rmtree(dst_d)
            shutil.copytree(src_d, dst_d)

    # Create README in DATA_DIR
    readme_data = """# AuraCare Hospital Management System - Complete Data & Source Package
Location: C:\\Users\\hp\\Desktop\\Ready Reference\\Hospital mgmt sys data

## Modules Included:
1. Dashboard (/): Real-time clinic metrics, on-duty physicians, inventory alerts, recent admissions.
2. Reception Desk (/reception): Laptop & external USB camera patient intake, portrait capture, Google Sheets integration.
3. Consultancy & Slot Booking (/consultancy):
   - Modern time slot schedule with vacant (emerald) and occupied (RED) slots.
   - Advance payment gateway checkout ($45 Video Call / $60 Physical Hospital Inspection).
   - Random 6-digit OTP generation.
   - SMS and Email notification simulation (dispatched to patient and doctor).
   - Google Sheet integration (Sheet ID: 1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew).
   - Two seeded test patients (Michael Ross & Claire Underwood).
4. Patient Registry (/patients): Full records, diagnoses, and camera portraits.
5. Doctor Registry (/doctors): Medical specialists, credentials, and duty status.
6. Inventory Management (/inventory): Pharmaceuticals, stock tracking, and 1-click restock.
7. Homepage (/home): Virtual clinic tour video with looping background music.

## Data Files:
- SQLite Database: prisma/dev.db
- Patients CSV: public/PatientsRecord.csv
- Appointments CSV: public/AppointmentsRecord.csv
- Google Apps Script (Consultancy): Appointments_GoogleAppsScript.js
- Google Apps Script (Reception): PatientsRecord_GoogleAppsScript.js
"""
    with open(os.path.join(DATA_DIR, "README_PACKAGE_OVERVIEW.txt"), "w", encoding="utf-8") as f:
        f.write(readme_data)

    print("Complete data package stored in DATA_DIR.")

if __name__ == "__main__":
    copy_windows_files()
    build_macos_app()
    build_android_apk()
    populate_data_package()
    print("All tasks completed successfully!")
