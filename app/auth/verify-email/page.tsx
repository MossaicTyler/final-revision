import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from 'lucide-react'
import Link from "next/link"
import { verifyEmail } from "@/app/actions/auth"
import { redirect } from 'next/navigation'

export default async function VerifyEmailPage({ 
  searchParams 
}: { 
  searchParams: { token?: string; success?: string; error?: string } 
}) {
  const { token, success, error } = searchParams

  if (token && !success && !error) {
    console.log("[v0] Page received token, processing verification...")
    const result = await verifyEmail(token)
    
    if (result.success) {
      console.log("[v0] Verification successful, redirecting...")
      redirect("/auth/verify-email?success=true")
    } else {
      console.log("[v0] Verification failed, redirecting with error...")
      const errorCode = result.error?.includes("expired") ? "expired" :
                       result.error?.includes("already verified") ? "already-verified" :
                       result.error?.includes("Invalid") ? "invalid-token" : "unexpected"
      redirect(`/auth/verify-email?error=${errorCode}`)
    }
  }

  if (success === "true") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-500" />
              </div>
            </div>
            <CardTitle className="text-center font-serif text-2xl text-green-600 dark:text-green-500">
              Verification Successful!
            </CardTitle>
            <CardDescription className="text-center text-base">
              Your email has been successfully verified. You can now sign in and access all features of your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/?signin=true">Sign In Now</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/account">Go to My Account</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  let errorMessage = "An unexpected error occurred during verification."
  let errorTitle = "Verification Unsuccessful"

  if (error === "no-token") {
    errorTitle = "Invalid Verification Link"
    errorMessage = "No verification token was provided. Please check your email and click the verification link."
  } else if (error === "invalid-token") {
    errorTitle = "Verification Unsuccessful"
    errorMessage = "This verification link is invalid or has already been used. Please request a new verification email."
  } else if (error === "expired") {
    errorTitle = "Verification Expired"
    errorMessage = "This verification link has expired. Please request a new verification email from your account settings."
  } else if (error === "already-verified") {
    errorTitle = "Already Verified"
    errorMessage = "Your email is already verified. You can sign in to your account."
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
              <XCircle className="h-16 w-16 text-red-600 dark:text-red-500" />
            </div>
          </div>
          <CardTitle className="text-center font-serif text-2xl text-red-600 dark:text-red-500">
            {errorTitle}
          </CardTitle>
          <CardDescription className="text-center text-base">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error === "already-verified" ? (
            <>
              <Button asChild className="w-full">
                <Link href="/?signin=true">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/">Return Home</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="w-full">
                <Link href="/account?resend=true">Request New Verification Email</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/">Return Home</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
