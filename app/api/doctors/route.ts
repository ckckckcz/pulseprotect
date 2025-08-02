import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // First query the user table to get all users with role 'dokter'
    const { data: doctorUsers, error: userError } = await supabase
      .from('user')
      .select('*')
      .eq('role', 'dokter');

    if (userError) {
      console.error('Error fetching doctor users:', userError);
      return NextResponse.json({ error: 'Failed to fetch doctor users' }, { status: 500 });
    }

    if (!doctorUsers || doctorUsers.length === 0) {
      return NextResponse.json([]);
    }

    // Extract emails to use for joining with dokter table
    const doctorEmails = doctorUsers.map(user => user.email);

    // Query dokter table for those emails
    const { data: doctorsData, error: doctorError } = await supabase
      .from('dokter')
      .select('*')
      .in('email', doctorEmails);

    if (doctorError) {
      console.error('Error fetching doctor details:', doctorError);
      return NextResponse.json({ error: 'Failed to fetch doctor details' }, { status: 500 });
    }

    // Combine the data from both tables
    const formattedDoctors = doctorEmails.map((email, index) => {
      const userInfo = doctorUsers.find(user => user.email === email);
      const doctorInfo = doctorsData?.find(doc => doc.email === email);
      
      if (!userInfo) return null;

      // Check if this is Dr. Nadia Saraswati by name (not by email)
      const isNadiaSaraswati = userInfo.nama_lengkap?.includes("Nadia Saraswati") || false;
      
      // Generate a random height for carousel variation (between 300-500)
      const randomHeight = 300 + Math.floor(Math.random() * 200);
      
      return {
        id: doctorInfo?.id || index + 1,
        name: userInfo.nama_lengkap || 'Unknown',
        position: `Dokter Spesialis ${doctorInfo?.spesialis || 'Umum'}`,
        hospital: doctorInfo?.lokasi_rumah_sakit || 'Rumah Sakit Umum',
        location: doctorInfo?.lokasi || 'Indonesia',
        image: userInfo.foto_profile || '/placeholder.svg?height=300&width=300',
        rating: doctorInfo?.rating || 4.5,
        experience: doctorInfo?.pengalaman || '5+ tahun',
        patients: doctorInfo?.jumlah_ulasan ? `${doctorInfo.jumlah_ulasan}+` : '500+',
        availability: isNadiaSaraswati ? 'Tersedia' : (userInfo.status === 'active' ? 'Tersedia' : 'Sibuk'),
        price: `Rp ${new Intl.NumberFormat('id-ID').format(doctorInfo?.harga_konsultasi || 150000)}`,
        height: randomHeight, // Add height property for proper carousel display
      };
    }).filter(Boolean);

    // If we have fewer than 5 doctors, duplicate them to have at least 5
    let resultDoctors = [...formattedDoctors];
    while (resultDoctors.length < 5) {
      resultDoctors = [...resultDoctors, ...formattedDoctors];
    }

    return NextResponse.json(resultDoctors);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
