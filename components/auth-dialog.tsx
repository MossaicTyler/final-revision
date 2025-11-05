"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signUp, resendVerificationEmail } from "@/app/actions/auth"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Mail } from "lucide-react"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: "signin" | "signup"
}

export function AuthDialog({ open, onOpenChange, defaultMode = "signin" }: AuthDialogProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    setUserEmail(email)

    const result = mode === "signin" ? await signIn(formData) : await signUp(formData)

    if (result.error) {
      setError(result.error)
      setRequiresVerification(result.requiresVerification || false)
      setLoading(false)
    } else if (result.requiresVerification) {
      setSuccess(result.message || "Please check your email to verify your account.")
      setRequiresVerification(true)
      setLoading(false)
    } else {
      onOpenChange(false)
      router.refresh()
    }
  }

  async function handleResendVerification() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    const result = await resendVerificationEmail(userEmail)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(result.message || "Verification email sent!")
    }

    setLoading(false)
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)

    // Redirect to Google OAuth
    window.location.href = "/api/auth/google"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin"
              ? "Sign in to access your account and orders"
              : "Join reknur to track orders and save your preferences"}
          </DialogDescription>
        </DialogHeader>

        {requiresVerification ? (
          <div className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                {success || "Please check your email to verify your account before signing in."}
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleResendVerification}
              variant="outline"
              className="w-full bg-transparent"
              disabled={loading}
            >
              {loading ? "Sending..." : "Resend Verification Email"}
            </Button>

            <Button
              onClick={() => {
                setRequiresVerification(false)
                setError(null)
                setSuccess(null)
              }}
              variant="ghost"
              className="w-full"
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" type="text" required placeholder="John Doe" disabled={loading} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                disabled={loading}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                minLength={8}
                disabled={loading}
              />
              {mode === "signup" && <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>

            <div className="text-center text-sm">
              {mode === "signin" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup")
                    setError(null)
                    setSuccess(null)
                  }}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Don't have an account? Sign up
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin")
                    setError(null)
                    setSuccess(null)
                  }}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
