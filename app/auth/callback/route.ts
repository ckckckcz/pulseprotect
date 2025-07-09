import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authService } from '@/lib/auth'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/verify-error?message=Gagal memverifikasi sesi`)
    }
  }

  // Handle email verification
  if (token_hash && type === 'email') {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      // Verify the email confirmation token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'email'
      })

      if (error) {
        console.error('Email verification error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/verify-error?message=Token tidak valid atau sudah kedaluwarsa`)
      }

      if (data.user && data.user.email) {
        // Update verification status in our custom user table
        await authService.verifyEmail(data.user.email)
        
        return NextResponse.redirect(`${requestUrl.origin}/auth/verify-success`)
      }
    } catch (error) {
      console.error('Verification process error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/verify-error?message=Terjadi kesalahan saat verifikasi`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
