import { verifyEmail } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"

export default async function VerifyEmailPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-center font-serif text-2xl">Invalid Link</CardTitle>
            <CardDescription className="text-center">This verification link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  console.log("[v0] Verify email page - token received:", token.substring(0, 20) + "...")
  const result = await verifyEmail(token)
  console.log("[v0] Verify email page - result:", JSON.stringify(result))
  
  const currentUser = await getCurrentUser()
  console.log("[v0] Verify email page - current user:", currentUser ? "logged in" : "not logged in")

  if (result.success) {
    console.log("[v0] Verification successful, showing success UI")
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-center font-serif text-2xl">Email Successfully Verified!</CardTitle>
            <CardDescription className="text-center">
              Your email has been verified and you're now logged in. You can access all features of your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/account">Go to My Account</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (result.error) {
    console.log("[v0] Verification error, showing error UI:", result.error)
    const isAlreadyVerified = result.error.includes("already verified")
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {isAlreadyVerified ? (
                <AlertCircle className="h-12 w-12 text-amber-600" />
              ) : (
                <XCircle className="h-12 w-12 text-destructive" />
              )}
            </div>
            <CardTitle className="text-center font-serif text-2xl">
              {isAlreadyVerified ? "Already Verified" : "Verification Failed"}
            </CardTitle>
            <CardDescription className="text-center">{result.error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAlreadyVerified && currentUser ? (
              <Button asChild className="w-full">
                <Link href="/account">Go to My Account</Link>
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link href="/">Return Home</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  console.log("[v0] Unexpected verification state - no success or error")
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-center font-serif text-2xl">Verification Failed</CardTitle>
          <CardDescription className="text-center">
            An unexpected error occurred. Please try again or contact support.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
