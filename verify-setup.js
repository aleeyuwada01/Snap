// Simple verification script to check Supabase connection
// Run with: node verify-setup.js

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Verifying Supabase Setup...\n');

// Check 1: Environment Variables
console.log('1️⃣ Checking environment variables...');
if (!supabaseUrl || supabaseUrl === 'YOUR_PROJECT_URL_HERE') {
  console.log('❌ VITE_SUPABASE_URL is not set correctly in .env.local');
  console.log('   Please update it with your actual Supabase project URL');
  process.exit(1);
} else {
  console.log('✅ VITE_SUPABASE_URL:', supabaseUrl);
}

if (!supabaseKey) {
  console.log('❌ VITE_SUPABASE_ANON_KEY is missing in .env.local');
  process.exit(1);
} else {
  console.log('✅ VITE_SUPABASE_ANON_KEY: sbp_***...' + supabaseKey.slice(-8));
}

// Check 2: Supabase Connection
console.log('\n2️⃣ Testing Supabase connection...');
const supabase = createClient(supabaseUrl, supabaseKey);

try {
  // Test connection by checking tables
  const { data: credentialsTest, error: credError } = await supabase
    .from('captured_credentials')
    .select('count')
    .limit(1);

  const { data: activityTest, error: actError } = await supabase
    .from('activity_logs')
    .select('count')
    .limit(1);

  if (credError) {
    console.log('❌ captured_credentials table error:', credError.message);
    console.log('   Have you run the migration SQL in Supabase SQL Editor?');
    console.log('   See supabase_migration.sql');
    process.exit(1);
  } else {
    console.log('✅ captured_credentials table exists and is accessible');
  }

  if (actError) {
    console.log('❌ activity_logs table error:', actError.message);
    console.log('   Have you run the migration SQL in Supabase SQL Editor?');
    console.log('   See supabase_migration.sql');
    process.exit(1);
  } else {
    console.log('✅ activity_logs table exists and is accessible');
  }

  // Check 3: Test Write Operation
  console.log('\n3️⃣ Testing write operations...');
  const testId = crypto.randomUUID();
  const { data: writeTest, error: writeError } = await supabase
    .from('activity_logs')
    .insert({
      id: testId,
      action: 'Setup verification test',
      metadata: { test: true, timestamp: new Date().toISOString() },
      created_at: new Date().toISOString(),
    })
    .select();

  if (writeError) {
    console.log('❌ Write test failed:', writeError.message);
    console.log('   Check your RLS policies in Supabase Dashboard');
    process.exit(1);
  } else {
    console.log('✅ Write operation successful');
    
    // Clean up test record
    await supabase.from('activity_logs').delete().eq('id', testId);
    console.log('✅ Test record cleaned up');
  }

  console.log('\n🎉 All checks passed! Your Supabase setup is complete.');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Visit: http://localhost:3000/');
  console.log('   3. Test login flow');
  console.log('   4. Check dashboard: http://localhost:3000/?dashboard=true');
  console.log('   5. Verify data in Supabase Dashboard → Table Editor');

} catch (error) {
  console.log('❌ Connection test failed:', error.message);
  console.log('   Please check your Supabase URL and API key');
  process.exit(1);
}
