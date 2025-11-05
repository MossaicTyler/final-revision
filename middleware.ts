import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySession } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const adminRoutes = ["/admin"]
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if (isAdminRoute) {
    const token = request.cookies.get("session")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/?auth=admin", request.url))
    }

    const user = await verifySession(token)

    if (!user) {
      return NextResponse.redirect(new URL("/?error=unauthorized", request.url))
    }

    // Check admin access via environment variable
    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || []
    const userEmailLower = user.email.toLowerCase()

    console.log("[v0] Admin access check:", {
      userEmail: user.email,
      adminEmailsConfigured: process.env.ADMIN_EMAILS,
      adminEmailsList: adminEmails,
      isMatch: adminEmails.includes(userEmailLower),
    })

    if (!adminEmails.includes(userEmailLower)) {
      console.log("[v0] Access denied: User email not in ADMIN_EMAILS")
      // Pass user email and admin emails in the redirect for debugging
      const url = new URL("/", request.url)
      url.searchParams.set("error", "unauthorized")
      url.searchParams.set("email", user.email)
      url.searchParams.set("adminEmails", adminEmails.join(","))
      return NextResponse.redirect(url)
    }

    console.log("[v0] Admin access granted")
  }

  const protectedRoutes = ["/account"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const token = request.cookies.get("session")?.value

    if (!token) {
      const url = new URL("/", request.url)
      url.searchParams.set("auth", "required")
      return NextResponse.redirect(url)
    }

    const user = await verifySession(token)

    if (!user) {
      const url = new URL("/", request.url)
      url.searchParams.set("auth", "required")
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
}
