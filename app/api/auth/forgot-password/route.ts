import { NextResponse } from 'next/server'
import { authService } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json(
        { error: "Email diperlukan" },
        { status: 400 }
      )
    }
    
    // We use try-catch but return success regardless of whether the email exists
    // This is a security measure to prevent email enumeration
    try {
      await authService.forgotPassword(email)
    } catch (error) {
      console.error("Forgot password processing error:", error);
      // We still return success even if the email doesn't exist
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Jika email terdaftar, instruksi reset kata sandi telah dikirim"
    })
  } catch (error: any) {
    console.error("Forgot password API error:", error)
    
    return NextResponse.json(
      { success: true, message: "Jika email terdaftar, instruksi reset kata sandi telah dikirim" },
      { status: 200 } // Always return 200 to prevent email enumeration
    )
  }
}
