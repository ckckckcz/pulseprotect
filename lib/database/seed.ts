import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

async function seedUsers() {
  try {
    console.log('Starting to seed users...');
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    
    // Insert admin user
    const { data: adminUser, error: adminError } = await supabase
      .from('user')
      .upsert({
        nama_lengkap: 'Admin System',
        email: 'admin@smartcity.com',
        nomor_telepon: '081234567890',
        kata_sandi: adminPassword,
        role: 'admin',
        verifikasi_email: true,
        status: 'success',
        email_confirmed_at: new Date().toISOString(),
        foto_profile: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        account_membership: 'pro'
      }, {
        onConflict: 'email'
      })
      .select('email');
    
    if (adminError) {
      console.error('Error creating admin user:', adminError);
    } else {
      console.log('Admin user created or updated:', adminUser);
      
      // Insert admin profile
      const { error: adminProfileError } = await supabase
        .from('admin')
        .upsert({
          email: 'admin@smartcity.com',
          department: 'IT Department',
          access_level: 'Super Admin',
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        });
        
      if (adminProfileError) {
        console.error('Error creating admin profile:', adminProfileError);
      } else {
        console.log('Admin profile created or updated');
      }
    }
    
    // Insert doctor user
    const { data: doctorUser, error: doctorError } = await supabase
      .from('user')
      .upsert({
        nama_lengkap: 'Dr. John Doe',
        email: 'doctor@smartcity.com',
        nomor_telepon: '081298765432',
        kata_sandi: doctorPassword,
        role: 'dokter',
        verifikasi_email: true,
        status: 'success',
        email_confirmed_at: new Date().toISOString(),
        foto_profile: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor',
        account_membership: 'pro'
      }, {
        onConflict: 'email'
      })
      .select('email');
    
    if (doctorError) {
      console.error('Error creating doctor user:', doctorError);
    } else {
      console.log('Doctor user created or updated:', doctorUser);
      
      // Insert doctor profile
      const { error: doctorProfileError } = await supabase
        .from('dokter')
        .upsert({
          email: 'doctor@smartcity.com',
          spesialis: 'Dokter Umum',
          lokasi: 'Jakarta Selatan',
          lokasi_rumah_sakit: 'RS SmartCity Medika',
          pengalaman: '5 tahun',
          harga_konsultasi: 150000,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        });
        
      if (doctorProfileError) {
        console.error('Error creating doctor profile:', doctorProfileError);
      } else {
        console.log('Doctor profile created or updated');
      }
    }
    
    console.log('Seeding completed!');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

async function seedFromSqlFile() {
  try {
    console.log('Seeding database from SQL file...');
    
    const sqlPath = path.join(process.cwd(), 'lib', 'database', 'dummy-data.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        console.error(`Error executing SQL: ${error.message}`);
        console.error('Statement:', statement);
      }
    }
    
    console.log('SQL seeding completed!');
  } catch (error) {
    console.error('Error seeding from SQL file:', error);
  }
}

// Export the functions
export { seedUsers, seedFromSqlFile };
