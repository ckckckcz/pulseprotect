import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`)
      }

      if (data.user) {
        // Check if user exists in custom users table
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single()

        // If user doesn't exist in custom table, create them
        if (userError && userError.code === 'PGRST116') {
          const userData = {
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            password_hash: '', // OAuth users don't have password
            phone: data.user.user_metadata?.phone || null,
            role: 'user',
            is_active: true,
            is_verified: true, // OAuth users are pre-verified
          }

          await supabase.from('users').insert(userData)
        }
      }
    } catch (err) {
      console.error('Callback processing error:', err)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=callback_error`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/user/dashboard`)
}
