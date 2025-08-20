// app/api/medverify/verify/route.ts

import { NextRequest, NextResponse } from 'next/server'

const MEDVERIFY_BASE_URL = process.env.MEDVERIFY_BASE_URL || 'https://<ai-service-domain>'
const SERVICE_API_KEY = process.env.MEDVERIFY_API_KEY || '<SERVICE_API_KEY>'

export async function POST(req: NextRequest) {
  try {
    // Get session ID from header
    const sessionId = req.headers.get('X-Session-Id')
    
    // Get request body
    const body = await req.json()
    const { nie, text } = body

    if (!nie && !text) {
      return NextResponse.json(
        { error: 'NIE atau text produk diperlukan' },
        { status: 400 }
      )
    }

    // Prepare headers for MedVerify service
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Api-Key': SERVICE_API_KEY,
    }
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId
    }

    // Call MedVerify verification endpoint
    const response = await fetch(`${MEDVERIFY_BASE_URL}/v1/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ nie, text }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('MedVerify verify error:', errorText)
      return NextResponse.json(
        { error: 'Gagal memverifikasi produk' },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Verify API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}