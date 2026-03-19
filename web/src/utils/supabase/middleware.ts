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
  
  // Proteger rutas directamente rebotando a home con redirección de vuelta (Si no es híbrida)
  const isStrictProtected = protectedRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/hazte-profesor')

  if (isStrictProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login' // Redirigiremos al login oficial o raiz si no hay login dedicado
    // En SmarTune, el Auth Modal suele estar en '/' o en una ruta separada.
    // Usaremos '/' con ?login=true&redirectTo=... según el prompt
    url.pathname = '/'
    url.searchParams.set('login', 'true')
    url.searchParams.set('redirectTo', pathname)
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
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    const roleName = usuario?.rol

    if (roleName !== 'profesor') {
      const url = request.nextUrl.clone()
      url.pathname = '/hazte-profesor'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
