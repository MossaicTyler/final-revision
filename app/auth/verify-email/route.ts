import { NextRequest, NextResponse } from "next/server"
import { verifyEmail } from "@/app/actions/auth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")

  console.log("[v0] Verification route hit with token:", token ? "present" : "missing")

  if (!token) {
    console.log("[v0] No token provided, redirecting to error page")
    return NextResponse.redirect(new URL("/auth/verify-email?error=no-token", request.url))
  }

  try {
    console.log("[v0] Calling verifyEmail action...")
    const result = await verifyEmail(token)

    if (result.error) {
      console.log("[v0] Verification failed:", result.error)
      
      // Map error messages to specific error codes
      let errorCode = "unexpected"
      if (result.error.includes("Invalid or expired")) {
        errorCode = "invalid-token"
      } else if (result.error.includes("expired")) {
        errorCode = "expired"
      } else if (result.error.includes("already verified")) {
        errorCode = "already-verified"
      }
      
      return NextResponse.redirect(new URL(`/auth/verify-email?error=${errorCode}`, request.url))
    }

    console.log("[v0] Verification successful, redirecting to success page")
    return NextResponse.redirect(new URL("/auth/verify-email?success=true", request.url))
  } catch (error) {
    console.error("[v0] Verification route exception:", error)
    return NextResponse.redirect(new URL("/auth/verify-email?error=unexpected", request.url))
  }
}
