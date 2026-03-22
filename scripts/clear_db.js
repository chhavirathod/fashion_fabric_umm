import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const VITE_SUPABASE_URL = urlMatch ? urlMatch[1].trim() : '';
const VITE_SUPABASE_ANON_KEY = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function clearData() {
  console.log('Logging in as admin...');
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@fashionfabric.in',
    password: 'admin123'
  });
  
  if (authErr) {
    console.error('Failed to log in:', authErr.message);
    return;
  }
  console.log('Logged in successfully!');

  // Deleting in reverse dependency order
  const tables = ['measurements', 'employees', 'departments', 'hotels'];
  
  for (const table of tables) {
    console.log(`Clearing ${table}...`);
    const { data, error } = await supabase.from(table).delete().not('id', 'is', null);
    
    if (error) {
      console.error(`Error clearing ${table}:`, error.message);
    } else {
      console.log(`Successfully cleared ${table}.`);
    }
  }
  
  console.log('Database wipe complete!');
}

clearData();
