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
