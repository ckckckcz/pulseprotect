-- Insert admin user
INSERT INTO public.user (
  nama_lengkap,
  email,
  nomor_telepon,
  kata_sandi,
  role,
  foto_profile,
  status,
  verifikasi_email,
  email_confirmed_at,
  account_membership
) VALUES (
  'Admin System',
  'admin@pulseprotect.com',
  '081234567890',
  '$2a$10$rZfN.xQ9BFNpMZN.0X0IueP/u6H8dB9JVT.ZWwXTrVJSs.6B1LS4i', -- hashed password: admin123
  'admin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  'success',
  true,
  CURRENT_TIMESTAMP,
  'pro'
) ON CONFLICT (email) DO NOTHING;

-- Insert admin profile data
INSERT INTO public.admin (
  email,
  department,
  access_level,
  last_login,
  created_at,
  updated_at
) VALUES (
  'admin@pulseprotect.com',
  'IT Department',
  'Super Admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Insert doctor user
INSERT INTO public.user (
  nama_lengkap,
  email,
  nomor_telepon,
  kata_sandi,
  role,
  foto_profile,
  status,
  verifikasi_email,
  email_confirmed_at,
  account_membership
) VALUES (
  'Dr. John Doe',
  'doctor@pulseprotect.com',
  '081298765432',
  '$2a$10$HCrwNQsVUpoOQRdOu.QnBu5mDVvXfrHAzEMya7wioYhcYy9F9L0gm', -- hashed password: doctor123
  'dokter',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor',
  'success',
  true,
  CURRENT_TIMESTAMP,
  'pro'
) ON CONFLICT (email) DO NOTHING;

-- Insert doctor profile data
INSERT INTO public.dokter (
  email,
  spesialis,
  lokasi,
  lokasi_rumah_sakit,
  pengalaman,
  harga_konsultasi,
  pendidikan,
  rating,
  jumlah_ulasan,
  bahasa,
  created_at,
  updated_at
) VALUES (
  'doctor@pulseprotect.com',
  'Dokter Umum',
  'Jakarta Selatan',
  'RS pulseprotect Medika',
  '5 tahun',
  150000.00,
  '{
    "institusi": "Universitas Indonesia",
    "gelar": "Dokter",
    "tahun": "2015"
  }'::jsonb,
  4.8,
  124,
  '["Indonesia", "English"]'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET
  pendidikan = EXCLUDED.pendidikan,
  rating = EXCLUDED.rating,
  jumlah_ulasan = EXCLUDED.jumlah_ulasan,
  bahasa = EXCLUDED.bahasa,
  updated_at = CURRENT_TIMESTAMP;

-- Insert another doctor user (for variety)
INSERT INTO public.user (
  nama_lengkap,
  email,
  nomor_telepon,
  kata_sandi,
  role,
  foto_profile,
  status,
  verifikasi_email,
  email_confirmed_at,
  account_membership
) VALUES (
  'Dr. Jane Smith',
  'drjane@pulseprotect.com',
  '081287654321',
  '$2a$10$HCrwNQsVUpoOQRdOu.QnBu5mDVvXfrHAzEMya7wioYhcYy9F9L0gm', -- hashed password: doctor123
  'dokter',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
  'success',
  true,
  CURRENT_TIMESTAMP,
  'pro'
) ON CONFLICT (email) DO NOTHING;

-- Insert second doctor profile data
INSERT INTO public.dokter (
  email,
  spesialis,
  lokasi,
  lokasi_rumah_sakit,
  pengalaman,
  harga_konsultasi,
  pendidikan,
  rating,
  jumlah_ulasan,
  bahasa,
  created_at,
  updated_at
) VALUES (
  'drjane@pulseprotect.com',
  'Spesialis Jantung',
  'Jakarta Pusat',
  'Rumah Sakit Jantung Indonesia',
  '8 tahun',
  250000.00,
  '{
    "institusi": "Harvard Medical School",
    "gelar": "Doctor of Medicine",
    "tahun": "2012"
  }'::jsonb,
  4.9,
  278,
  '["Indonesia", "English", "Mandarin"]'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET
  pendidikan = EXCLUDED.pendidikan,
  rating = EXCLUDED.rating,
  jumlah_ulasan = EXCLUDED.jumlah_ulasan,
  bahasa = EXCLUDED.bahasa,
  updated_at = CURRENT_TIMESTAMP;

-- Insert another admin user
INSERT INTO public.user (
  nama_lengkap,
  email,
  nomor_telepon,
  kata_sandi,
  role,
  foto_profile,
  status,
  verifikasi_email,
  email_confirmed_at,
  account_membership
) VALUES (
  'Super Administrator',
  'superadmin@pulseprotect.com',
  '081212341234',
  '$2a$10$rZfN.xQ9BFNpMZN.0X0IueP/u6H8dB9JVT.ZWwXTrVJSs.6B1LS4i', -- hashed password: admin123
  'admin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
  'success',
  true,
  CURRENT_TIMESTAMP,
  'pro'
) ON CONFLICT (email) DO NOTHING;

-- Insert second admin profile data
INSERT INTO public.admin (
  email,
  department,
  access_level,
  last_login,
  created_at,
  updated_at
) VALUES (
  'superadmin@pulseprotect.com',
  'Executive Management',
  'System Administrator',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
