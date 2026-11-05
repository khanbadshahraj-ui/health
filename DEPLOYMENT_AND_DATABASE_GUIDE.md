# Real Database Server & Custom Domain Deployment Guide

This guide walks you through connecting your hospital management application to a real production cloud database server and deploying it under your own custom domain name (e.g. `yourclinic.com` or `clinic.yourhospital.org`).

---

## Part 1: Provisioning a Real Cloud Database (PostgreSQL)

Your project schema [`prisma/schema.prisma`](./prisma/schema.prisma) has already been updated to use **PostgreSQL**.

The top recommended production cloud database for Vercel is **Neon** (or **Supabase**), both of which offer generous free tiers with automated backups, SSL connections, and high performance.

### Option A: Neon Serverless Postgres (Recommended - Easiest & Fastest)
1. Go to **[https://neon.tech](https://neon.tech)** and click **Sign Up** (you can sign in with your GitHub account `khanbadshahraj-ui`).
2. Click **New Project**:
   - **Name**: `clinic-hms-db`
   - **Region**: Select the region closest to you (e.g., `Singapore`, `Frankfurt`, or `US East`).
3. Once created, Neon displays your **Connection Details**.
4. In the dropdown, choose **Prisma** or **Node.js**:
   - You will see a connection string that looks like:
     ```text
     postgresql://neondb_owner:npg_xxxxxxxxxxxx@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
5. Copy this URL — this is your `DATABASE_URL`.

---

## Part 2: Migrating & Seeding Your Tables to the Cloud Database

Once you have your connection string, run these commands from your computer to create all tables (Doctors, Patients, Appointments, Invoices, Inventory, etc.) and populate them:

Open PowerShell / Terminal in your project directory:
```powershell
cd C:\Users\hp\.gemini\antigravity\scratch\clinic-hms

# 1. Temporarily set your DATABASE_URL in PowerShell
$env:DATABASE_URL="your_copied_postgresql_connection_string"

# 2. Push all database schema tables to the cloud database
cmd /c "npx prisma db push"

# 3. Seed initial doctors, patients, inventory, and invoices
cmd /c "npx prisma db seed"
cmd /c "npm run seed:all"
```
*All your tables and hospital data are now live in your cloud database server!*

---

## Part 3: Deploying on Vercel with Environment Variables

1. Go to your **[Vercel Dashboard](https://vercel.com/mustajab1/health)**.
2. Go to **Settings** > **Environment Variables**.
3. Add the following key:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://username:password@your-neon-host/neondb?sslmode=require` (your cloud database connection string)
   - **Environment**: Check **Production**, **Preview**, and **Development**.
4. *(Optional Payment / Email Keys)*:
   - `SAFEPAY_API_KEY`: your Safepay sandbox/live key
   - `SAFEPAY_SECRET_KEY`: your Safepay secret key
   - `PAYMENT_GATEWAY_MODE`: `SIMULATOR` (or `SANDBOX`)
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (for real patient confirmation emails)
5. Go to **Deployments** tab in Vercel and click **Redeploy** (or push to GitHub).
   - Vercel will run `npm run build` and automatically connect to your cloud database!

---

## Part 4: Attaching Your Real Custom Domain Name

Whether you purchased a domain on **Namecheap, GoDaddy, Cloudflare, Google Domains, or Hostinger**:

1. In your **[Vercel Project Dashboard](https://vercel.com/mustajab1/health)**:
   - Navigate to **Settings** > **Domains**.
   - Type your domain name (e.g. `yourclinic.com` or `subdomain.yourclinic.com`) and click **Add**.
2. Vercel will recommend adding both:
   - `yourclinic.com`
   - `www.yourclinic.com`
3. Vercel will display the exact **DNS Records** you need to add to your domain registrar's DNS management panel:

| Type | Name / Host | Value / Target | Notes |
| :--- | :--- | :--- | :--- |
| **A** | `@` (or leave empty) | `76.76.21.21` | Points your root domain to Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Points your www subdomain to Vercel |

*(If using a subdomain like `clinic.myhospital.org`, you only need a single **CNAME** record with Name: `clinic` and Value: `cname.vercel-dns.com`)*.

4. Go to your domain registrar (GoDaddy, Namecheap, etc.):
   - Open **Manage DNS** / **DNS Records**.
   - Add the **A** and **CNAME** records shown above.
5. Return to Vercel and click **Refresh** / **Verify**:
   - Vercel will verify the DNS records.
   - Vercel **automatically provisions a free SSL Certificate (HTTPS)** for your domain within 1 to 5 minutes.

Your hospital management application will then be live at `https://yourdomain.com`!
