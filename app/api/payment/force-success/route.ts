import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'This endpoint is not implemented' }, { status: 501 });
}
