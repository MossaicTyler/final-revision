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

  const result = await verifyEmail(token)
  const currentUser = await getCurrentUser()

  if (result.error) {
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
