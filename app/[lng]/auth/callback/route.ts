import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the Auth Helpers package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-sign-in-with-code-exchange
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  // Extract lng from URL path: /en/auth/callback or /zh-CN/auth/callback
  const pathMatch = requestUrl.pathname.match(/^\/([^/]+)\/auth\/callback/)
  const lng = pathMatch ? pathMatch[1] : 'en'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/${lng}?auth=1`)
}
