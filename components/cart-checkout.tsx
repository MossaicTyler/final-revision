"use client"

import { useCallback, useState, useEffect } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCartCheckoutSession } from "@/app/actions/stripe"
import Image from "next/image"
import { LoadingSpinner } from "./loading-spinner"
import { Badge } from "@/components/ui/badge"
import { Tag, User, Mail, AlertCircle } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AuthDialog } from "./auth-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRegion } from "@/contexts/region-context"
import { formatPrice as formatRegionalPrice } from "@/lib/regions"

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!)

function setCookie(name: string, value: string, days = 30) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

function getCookie(name: string): string {
  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return ""
}

interface CartCheckoutProps {
  items: Array<{
    id: number
    product_id: string
    quantity: number
    product?: {
      id: string
      name: string
      priceInCents: number
      images?: string[]
      onSale?: boolean
      originalPriceInCents?: number
    }
  }>
  user: { id: string; email: string; name: string | null } | null
}

export function CartCheckout({ items, user }: CartCheckoutProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [guestEmail, setGuestEmail] = useState("")
  const [guestName, setGuestName] = useState("")
  const [checkoutStarted, setCheckoutStarted] = useState(false)
  const [error, setError] = useState("")
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authDialogMode, setAuthDialogMode] = useState<"signin" | "signup">("signin")
  const { region, getLocalizedProduct } = useRegion()

  useEffect(() => {
    const savedEmail = getCookie("guest_email")
    const savedName = getCookie("guest_name")
    if (savedEmail) setGuestEmail(savedEmail)
    if (savedName) setGuestName(savedName)
  }, [])

  useEffect(() => {
    if (guestEmail) setCookie("guest_email", guestEmail)
  }, [guestEmail])

  useEffect(() => {
    if (guestName) setCookie("guest_name", guestName)
  }, [guestName])

  const localizedItems = items.map((item) => {
    if (!item.product) return item
    const localizedProduct = getLocalizedProduct(item.product)
    return { ...item, product: localizedProduct }
  })

  const subtotal = localizedItems.reduce((sum, item) => {
    return sum + (item.product?.priceInCents || 0) * item.quantity
  }, 0)

  const shippingCost = subtotal < 1500 ? 500 : 0
  const total = subtotal + shippingCost

  const startCheckout = useCallback(async () => {
    try {
      if (!user && (!guestEmail || !guestName)) {
        setError("Please provide your name and email to continue")
        setIsLoading(false)
        return null
      }

      const clientSecret = await startCartCheckoutSession(
        items.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
        })),
        region.code,
        !user ? { email: guestEmail, name: guestName } : undefined,
      )
      setIsLoading(false)
      setCheckoutStarted(true)
      return clientSecret
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start checkout"
      setError(errorMessage)
      setIsLoading(false)
      setCheckoutStarted(false)

      if (errorMessage.includes("out of stock")) {
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }

      return null
    }
  }, [items, user, guestEmail, guestName, region.code])

  const handleStartCheckout = () => {
    if (!user && (!guestEmail || !guestName)) {
      setError("Please provide your name and email to continue")
      return
    }
    setError("")
    setCheckoutStarted(true)
  }

  const formattedSubtotal = formatRegionalPrice(subtotal, region.code)
  const formattedShipping = formatRegionalPrice(shippingCost, region.code)
  const formattedTotal = formatRegionalPrice(total, region.code)

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Order Summary */}
      <div className="lg:col-span-1 order-2 lg:order-1">
        <div className="border border-border/50 rounded-lg p-6 space-y-4 sticky top-24">
          <h2 className="text-xl font-serif">Order Summary</h2>

          <div className="space-y-3">
            {localizedItems.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                  <Image
                    src={item.product?.images?.[0] || "/placeholder.svg"}
                    alt={item.product?.name || "Product"}
                    fill
                    className="object-cover"
                  />
                  {item.product?.onSale && item.product?.originalPriceInCents && (
                    <Badge className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-[10px] px-1 py-0">
                      <Tag className="h-2 w-2 mr-0.5" />
                      {Math.round(
                        ((item.product.originalPriceInCents - item.product.priceInCents) /
                          item.product.originalPriceInCents) *
                          100,
                      )}
                      %
                    </Badge>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product?.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  {item.product?.onSale && item.product?.originalPriceInCents && (
                    <p className="text-xs text-muted-foreground line-through">
                      {formatRegionalPrice(item.product.originalPriceInCents, region.code)}
                    </p>
                  )}
                </div>
                <p className="text-sm font-medium">
                  {formatRegionalPrice((item.product?.priceInCents || 0) * item.quantity, region.code)}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 py-4 border-y border-border/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formattedSubtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className={shippingCost === 0 ? "text-green-600 dark:text-green-400" : ""}>
                {shippingCost === 0 ? "FREE" : formattedShipping}
              </span>
            </div>
            {shippingCost === 0 && subtotal >= 1500 && (
              <p className="text-xs text-green-600 dark:text-green-400">🎉 You qualified for free shipping!</p>
            )}
            {shippingCost > 0 && (
              <p className="text-xs text-muted-foreground">
                Add {formatRegionalPrice(1500 - subtotal, region.code)} more for free shipping
              </p>
            )}
          </div>

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formattedTotal}</span>
          </div>
        </div>
      </div>

      {/* Checkout Form */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        <div className="border border-border/50 rounded-lg p-6">
          {!user && !checkoutStarted && (
            <div className="space-y-6 mb-6">
              <div>
                <h2 className="text-2xl font-serif mb-2">Guest Checkout</h2>
                <p className="text-sm text-muted-foreground">Enter your details to complete your purchase</p>
              </div>

              {error && (
                <Alert variant={error.includes("out of stock") ? "destructive" : "default"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="whitespace-pre-line">
                    {error}
                    {error.includes("out of stock") && (
                      <span className="block mt-2 text-sm">Refreshing cart in 3 seconds...</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guest-name">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="guest-name"
                    type="text"
                    placeholder="John Smith"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest-email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="guest-email"
                    type="email"
                    placeholder="john@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send your order confirmation and receipt to this email
                  </p>
                </div>

                <Button onClick={handleStartCheckout} className="w-full" size="lg">
                  Continue to Payment
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="text-center space-y-3">
                <p className="text-sm font-medium">Save time on your next order</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setAuthDialogMode("signin")
                      setAuthDialogOpen(true)
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      setAuthDialogMode("signup")
                      setAuthDialogOpen(true)
                    }}
                  >
                    Create Account
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Track orders, save addresses, and get exclusive offers</p>
              </div>
            </div>
          )}

          {(user || checkoutStarted) && (
            <>
              {error && !isLoading && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="whitespace-pre-line">
                    {error}
                    {error.includes("out of stock") && (
                      <span className="block mt-2 text-sm">Refreshing cart in 3 seconds...</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {isLoading && (
                <div className="py-16">
                  <LoadingSpinner size="large" />
                  <p className="text-center text-muted-foreground text-sm mt-4 tracking-wider uppercase">
                    Loading secure checkout...
                  </p>
                </div>
              )}
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret: startCheckout }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </>
          )}
        </div>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authDialogMode} />
    </div>
  )
}
