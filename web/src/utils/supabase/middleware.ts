import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refrescar la sesión si ha expirado llamando a getuser
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/perfil', '/practica', '/playlist/crear']
  
  // Rutas con contenido restringido pero vista pública bloqueada
  const hybridGatekeeperRoutes = ['/favoritos', '/playlist', '/novedades', '/profesores']
  
  // Proteger rutas directamente rebotando a home (Si no es híbrida)
  const isStrictProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isStrictProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('login', 'true')
    return NextResponse.redirect(url)
  }

  // Rutas de profesores
  const isTeacherRoute = pathname.startsWith('/teacher')

  if (isTeacherRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('login', 'true')
      return NextResponse.redirect(url)
    }

    // Comprobar rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles(name)')
      .eq('id', user.id)
      .single()

    const roleName = (profile?.roles as any)?.name

    if (roleName !== 'profesor_aprobado') {
      const url = request.nextUrl.clone()
      url.pathname = '/apply'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
