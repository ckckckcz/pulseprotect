import { NextResponse } from 'next/server'
import { authService } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;
    
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token dan kata sandi baru diperlukan" },
        { status: 400 }
      );
    }
    
    // Validate password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Kata sandi harus minimal 8 karakter" },
        { status: 400 }
      );
    }
    
    try {
      // Call the auth service to reset the password
      const result = await authService.resetPassword(token, newPassword);
      
      if (result) {
        // console.log("Password reset completed successfully");
        return NextResponse.json({ 
          success: true,
          message: "Kata sandi berhasil diubah"
        });
      } else {
        return NextResponse.json(
          { error: "Gagal mengubah kata sandi" },
          { status: 500 }
        );
      }
    } catch (resetError: any) {
      console.error("Password reset failed:", resetError);
      return NextResponse.json(
        { error: resetError.message || "Terjadi kesalahan saat mengubah kata sandi" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Reset password API error:", error);
    
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat memproses permintaan" },
      { status: 500 }
    );
  }
}
