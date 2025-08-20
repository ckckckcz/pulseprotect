import { NextRequest, NextResponse } from 'next/server'

const PYTHON_YOLO_URL = process.env.PYTHON_YOLO_URL || 'http://127.0.0.1:8000'

export async function POST(req: NextRequest) {
  try {
    // Get form data from request
    const formData = await req.formData()
    const imgFile = formData.get('img') as File
    
    if (!imgFile) {
      return NextResponse.json(
        { error: 'File gambar diperlukan' },
        { status: 400 }
      )
    }

    // Forward to Python YOLO server
    const pythonFormData = new FormData()
    pythonFormData.append('file', imgFile)

    const response = await fetch(`${PYTHON_YOLO_URL}/yolo-scan`, {
      method: 'POST',
      body: pythonFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Python YOLO server error:', errorText)
      return NextResponse.json(
        { error: 'Gagal memproses gambar dengan YOLO' },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('YOLO scan API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}