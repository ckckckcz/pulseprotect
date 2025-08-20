// app/api/medverify/agent/route.ts

import { NextRequest, NextResponse } from 'next/server'

const MEDVERIFY_BASE_URL = process.env.MEDVERIFY_BASE_URL || 'https://<ai-service-domain>'
const SERVICE_API_KEY = process.env.MEDVERIFY_API_KEY || '<SERVICE_API_KEY>'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { session_id, text } = body

    if (!session_id || !text) {
      return NextResponse.json(
        { error: 'session_id dan text diperlukan' },
        { status: 400 }
      )
    }

    // Call MedVerify agent endpoint
    const response = await fetch(`${MEDVERIFY_BASE_URL}/v1/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': SERVICE_API_KEY,
      },
      body: JSON.stringify({
        session_id,
        text
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('MedVerify agent error:', errorText)
      return NextResponse.json(
        { error: 'Gagal mendapatkan respons dari AI agent' },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Agent API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}