import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import Link from "next/link"

export default function VerifyEmailPage({ searchParams }: { searchParams: { success?: string; error?: string } }) {
  const success = searchParams.success
  const error = searchParams.error

  // Success states
  if (success === "true") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-center font-serif text-2xl">Email Verified!</CardTitle>
            <CardDescription className="text-center">
              Your email has been successfully verified. You can now access all features of your account.
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

  // Error states
  let errorMessage = "An unexpected error occurred during verification."
  let errorTitle = "Verification Failed"

  if (error === "no-token") {
    errorTitle = "Invalid Link"
    errorMessage = "No verification token was provided. Please check your email and click the verification link."
  } else if (error === "invalid-token") {
    errorTitle = "Invalid or Expired Link"
    errorMessage = "This verification link is invalid or has already been used. Please request a new verification email."
  } else if (error === "expired") {
    errorTitle = "Link Expired"
    errorMessage = "This verification link has expired. Please request a new verification email from your account page."
  } else if (error === "already-verified") {
    errorTitle = "Already Verified"
    errorMessage = "Your email is already verified. You can sign in to your account."
  } else if (error === "unexpected") {
    errorTitle = "Verification Failed"
    errorMessage = "An unexpected error occurred. Please try again or contact support if the problem persists."
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-center font-serif text-2xl">{errorTitle}</CardTitle>
          <CardDescription className="text-center">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/account">Try Signing In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
