import { NextRequest } from 'next/server';

const dummyProduk = [
  {
    nomorRegistrasi: 'MD243182000100097',
    barcode: '8997212800295', // Fixed to match the barcode you're scanning
    nama: "Fox's Crystal Clear Mint Candy",
    status: 'Terdaftar',
    gramasi: '500gr/kantong',
    anjuranSajian: '15 gelas/kantong',
    sajianPerKantong: '24gr (+/- 2 sdm)/200 ml',
    jumlahKarton: '6 kantong/karton',
    masaSimpan: '12 bulan',
    dimensiKarton: '279 x 224 x 117 mm',
  },
  {
    nomorRegistrasi: 'MD123456789012345',
    barcode: '8997212801254', // Keep this one as well for testing
    nama: "Test Product Alternative",
    status: 'Terdaftar',
    gramasi: '250gr/pack',
    anjuranSajian: '10 serving/pack',
    sajianPerKantong: '25gr/serving',
    jumlahKarton: '8 pack/carton',
    masaSimpan: '18 bulan',
    dimensiKarton: '200 x 150 x 80 mm',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const barcode = searchParams.get('barcode');

  // console.log('🔍 API Request received:', { barcode, type: typeof barcode });

  if (!barcode) {
    return new Response(JSON.stringify({ error: 'Barcode diperlukan' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Clean and normalize barcode
  const cleanBarcode = barcode.trim().replace(/\s+/g, '');
  // console.log('🧹 Cleaned barcode:', cleanBarcode);
  // console.log('📊 Available barcodes:', dummyProduk.map((p) => p.barcode));

  // Find product with exact match
  const produk = dummyProduk.find((p) => {
    const productBarcode = p.barcode.trim();
    const isMatch = productBarcode === cleanBarcode;
    // console.log(`🔄 Comparing: "${productBarcode}" === "${cleanBarcode}" = ${isMatch}`);
    return isMatch;
  });

  console.log('✅ Product found:', produk ? 'YES' : 'NO');

  if (produk) {
    return new Response(
      JSON.stringify({
        found: true,
        success: true,
        ...produk,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({
      found: false,
      success: false,
      message: 'Produk tidak ditemukan.',
      searchedBarcode: cleanBarcode,
      availableBarcodes: dummyProduk.map((p) => p.barcode),
      saranPengecekan: `https://cekbpom.pom.go.id/all-produk/${cleanBarcode}`,
    }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}