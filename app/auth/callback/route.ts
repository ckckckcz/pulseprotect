import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import { authService } from '@/lib/auth'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const code = requestUrl.searchParams.get('code')

  // Handle OAuth callback (Google sign-in)
  if (code && !token_hash) {
    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/verify-error?message=Gagal memverifikasi sesi`)
    }
    
    return NextResponse.redirect(`${requestUrl.origin}/`)
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
        try {
          // Update verification status in our custom user table
          await authService.verifyEmail(data.user.email)
          
          return NextResponse.redirect(`${requestUrl.origin}/auth/verify-success`)
        } catch (verificationError: any) {
          console.error('Verification process error:', verificationError)
          return NextResponse.redirect(`${requestUrl.origin}/auth/verify-error?message=Gagal memperbarui status verifikasi`)
        }
      }
    } catch (error) {
      console.error('Verification process error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/verify-error?message=Terjadi kesalahan saat verifikasi`)
    }
  }

  // Handle regular code exchange (for email confirmation)
  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Code exchange error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/verify-error?message=Gagal memverifikasi email`)
      }

      if (data.user && data.user.email) {
        // Update verification status
        try {
          await authService.verifyEmail(data.user.email)
          return NextResponse.redirect(`${requestUrl.origin}/auth/verify-success`)
        } catch (verificationError: any) {
          console.error('Verification update error:', verificationError)
          return NextResponse.redirect(`${requestUrl.origin}/auth/verify-error?message=Gagal memperbarui status verifikasi`)
        }
      }
    } catch (error) {
      console.error('Exchange code error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/verify-error?message=Terjadi kesalahan saat verifikasi`)
    }
  }

  // Default redirect
  return NextResponse.redirect(`${requestUrl.origin}/auth/verify-error?message=Parameter verifikasi tidak valid`)
}

function createRouteHandlerClient({ cookies }: { cookies: typeof import('next/headers').cookies }): SupabaseClient {
  return createServerComponentClient({ cookies })
}

