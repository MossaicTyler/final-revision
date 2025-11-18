import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
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
    const result = await verifyEmail(token)
    
    if (result.success) {
      redirect("/auth/verify-email?success=true")
    } else {
      const errorCode = result.code || (
        result.error?.includes("expired") ? "expired" :
        result.error?.includes("already") ? "already-verified" :
        result.error?.includes("used") ? "token-used" :
        result.error?.includes("Invalid") ? "invalid-token" : "unexpected"
      )
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
              Email Verified!
            </CardTitle>
            <CardDescription className="text-center text-base">
              Your email has been successfully verified. Welcome to reknur!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/?signin=true">Sign In to Your Account</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAlreadyVerified = error === "token-used" || error === "already-verified"
  
  let errorMessage = "An unexpected error occurred during verification."
  let errorTitle = "Verification Issue"
  let icon = XCircle
  let iconColor = "text-red-600 dark:text-red-500"
  let iconBg = "bg-red-100 dark:bg-red-900/20"
  let titleColor = "text-red-600 dark:text-red-500"
  let showResendButton = true

  if (error === "no-token") {
    errorTitle = "No Verification Token"
    errorMessage = "The verification link appears to be incomplete. Please check your email and use the full link provided."
  } else if (error === "invalid-token") {
    errorTitle = "Invalid Verification Link"
    errorMessage = "This verification link is not valid. Please request a new verification email from your account settings."
  } else if (error === "token-used" || error === "already-verified") {
    icon = CheckCircle2
    iconColor = "text-blue-600 dark:text-blue-500"
    iconBg = "bg-blue-100 dark:bg-blue-900/20"
    titleColor = "text-blue-600 dark:text-blue-500"
    errorTitle = "Already Verified"
    errorMessage = "Good news! Your email is already verified. You're all set to sign in and start shopping."
    showResendButton = false
  } else if (error === "expired") {
    icon = AlertCircle
    iconColor = "text-orange-600 dark:text-orange-500"
    iconBg = "bg-orange-100 dark:bg-orange-900/20"
    titleColor = "text-orange-600 dark:text-orange-500"
    errorTitle = "Link Expired"
    errorMessage = "This verification link has expired. Verification links are valid for 24 hours. Please request a new one from your account settings."
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className={`rounded-full ${iconBg} p-3`}>
              {icon === CheckCircle2 && <CheckCircle2 className={`h-16 w-16 ${iconColor}`} />}
              {icon === XCircle && <XCircle className={`h-16 w-16 ${iconColor}`} />}
              {icon === AlertCircle && <AlertCircle className={`h-16 w-16 ${iconColor}`} />}
            </div>
          </div>
          <CardTitle className={`text-center font-serif text-2xl ${titleColor}`}>
            {errorTitle}
          </CardTitle>
          <CardDescription className="text-center text-base">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {showResendButton ? (
            <>
              <Button asChild className="w-full">
                <Link href="/account/settings">Request New Verification Email</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Return Home</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="w-full">
                <Link href="/?signin=true">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Browse Products</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
