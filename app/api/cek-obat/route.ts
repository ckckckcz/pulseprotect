import { NextRequest } from 'next/server';

const dummyProduk = [
  {
    nomorRegistrasi: 'MD243182000100097',
    barcode: '8997212801254',
    nama: "Fox's Crystal Clear Mint Candy",
    status: 'Terdaftar',
    gramasi: '500gr/kantong',
    anjuranSajian: '15 gelas/kantong',
    sajianPerKantong: '24gr (+/- 2 sdm)/200 ml',
    jumlahKarton: '6 kantong/karton',
    masaSimpan: '12 bulan',
    dimensiKarton: '279 x 224 x 117 mm',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const barcode = searchParams.get('barcode');

  if (!barcode) {
    return new Response(JSON.stringify({ error: 'Barcode diperlukan' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const produk = dummyProduk.find((p) => p.barcode === barcode);

  if (produk) {
    return new Response(JSON.stringify({ found: true, ...produk }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      found: false,
      message: 'Produk tidak ditemukan.',
      saranPengecekan: `https://cekbpom.pom.go.id/all-produk/${barcode}`,
    }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}