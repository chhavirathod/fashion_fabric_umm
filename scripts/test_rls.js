import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const VITE_SUPABASE_URL = urlMatch ? urlMatch[1].trim() : '';
const VITE_SUPABASE_ANON_KEY = keyMatch ? keyMatch[1].trim() : '';
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function testRLS() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@fashionfabric.in',
    password: 'admin123'
  });
  
  if (authErr) throw authErr;

  const uid = authData.session.user.id;
  console.log('Logged in with UUID:', uid);

  const writeErr = (name, err) => {
    console.error(name, err);
    fs.writeFileSync('error.json', JSON.stringify({ name, err }, null, 2));
  };


  // 1. Create a dummy hotel
  const { data: hotelData, error: hotelErr } = await supabase.from('hotels').insert([{
    name: 'Test Hotel', vertical: 'hospitality'
  }]).select().single();
  
  if (hotelErr) return writeErr('Hotel', hotelErr);

  const { data: deptData, error: deptErr } = await supabase.from('departments').insert([{
    name: 'Test Dept', hotel_id: hotelData.id
  }]).select().single();
  
  if (deptErr) return writeErr('Dept', deptErr);

  // 3. Create Emp
  const { data: empData, error: empErr } = await supabase.from('employees').insert([{
    name: 'max verstappen ' + Math.random(), role: 'Driver', gender: 'Male', dept_id: deptData.id, hotel_id: hotelData.id, emp_code: 'FF-' + Math.floor(Math.random() * 10000), status: 'pending'
  }]).select().single();

  if (empErr) return writeErr('Employee', empErr);

  // 4. Create measurement using UPSERT
  console.log('Upserting measurement with recorded_by:', uid);
  const { error: measErr } = await supabase.from('measurements').upsert([{
    employee_id: empData.id,
    uniform_type: 'shirt',
    field_name: 'test_field',
    value_inches: 10,
    recorded_by: uid
  }], {
    onConflict: 'employee_id,uniform_type,field_name',
    ignoreDuplicates: false
  });

  if (measErr) return writeErr('MeasurementUpsert', measErr);

  
  fs.writeFileSync('error.json', JSON.stringify({ success: true }));
  // Cleanup
  await supabase.from('hotels').delete().eq('id', hotelData.id);
}

testRLS().catch(console.error);
