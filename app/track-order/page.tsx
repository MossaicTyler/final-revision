"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Package, Search, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { AuthDialog } from "@/components/auth-dialog"

export default function TrackOrderPage() {
  const router = useRouter()
  const [orderId, setOrderId] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!orderId || !email) {
      setError("Please enter both order ID and email")
      setLoading(false)
      return
    }

    const orderIdNum = Number.parseInt(orderId)
    if (Number.isNaN(orderIdNum) || orderIdNum <= 0) {
      setError("Please enter a valid order ID (numbers only)")
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      // Navigate to the order tracking detail page
      router.push(`/track-order/${orderIdNum}?email=${encodeURIComponent(email.toLowerCase().trim())}`)
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your order details to view real-time tracking information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
            <CardDescription>We'll look up your order using your order ID and email address</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  type="text"
                  placeholder="e.g., 12345678"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.trim())}
                  required
                />
                <p className="text-xs text-muted-foreground">8-digit order number from your confirmation email</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  required
                />
                <p className="text-xs text-muted-foreground">The email you used at checkout</p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    Track Order
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Have an account?{" "}
            <button onClick={() => setAuthDialogOpen(true)} className="text-primary hover:underline font-medium">
              Sign in to view all orders
            </button>
          </p>
        </div>
      </div>
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode="signin" />
    </div>
  )
}
