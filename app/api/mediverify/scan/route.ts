// app/api/medverify/scan/route.ts

import { NextRequest, NextResponse } from 'next/server'

const MEDVERIFY_BASE_URL = process.env.MEDVERIFY_BASE_URL || 'https://<ai-service-domain>'
const SERVICE_API_KEY = process.env.MEDVERIFY_API_KEY || '<SERVICE_API_KEY>'

export async function POST(req: NextRequest) {
  try {
    // Get session ID from header
    const sessionId = req.headers.get('X-Session-Id')
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID diperlukan' },
        { status: 400 }
      )
    }

    // Get form data
    const formData = await req.formData()
    const imgFile = formData.get('img') as File
    
    if (!imgFile) {
      return NextResponse.json(
        { error: 'File gambar diperlukan' },
        { status: 400 }
      )
    }

    // Prepare form data for MedVerify service
    const medverifyFormData = new FormData()
    medverifyFormData.append('img', imgFile)
    medverifyFormData.append('return_partial', 'true')

    // Call MedVerify OCR endpoint
    const response = await fetch(`${MEDVERIFY_BASE_URL}/v1/scan/photo`, {
      method: 'POST',
      headers: {
        'X-Api-Key': SERVICE_API_KEY,
        'X-Session-Id': sessionId,
      },
      body: medverifyFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('MedVerify OCR error:', errorText)
      return NextResponse.json(
        { error: 'Gagal memproses gambar dengan OCR' },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('OCR API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for multipart
  },
}