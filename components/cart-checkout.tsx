"use client"

import { useCallback, useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCartCheckoutSession } from "@/app/actions/stripe"
import Image from "next/image"
import { LoadingSpinner } from "./loading-spinner"
import { formatPrice } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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
  subtotal: number
  user: { id: string; email: string; name: string | null } | null
}

export function CartCheckout({ items, subtotal, user }: CartCheckoutProps) {
  const [isLoading, setIsLoading] = useState(true)

  const startCheckout = useCallback(async () => {
    const clientSecret = await startCartCheckoutSession(
      items.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
      })),
    )
    setIsLoading(false)
    return clientSecret
  }, [items])

  const formattedSubtotal = formatPrice(subtotal, "GBP")

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Order Summary */}
      <div className="lg:col-span-1 order-2 lg:order-1">
        <div className="border border-border/50 rounded-lg p-6 space-y-4 sticky top-24">
          <h2 className="text-xl font-serif">Order Summary</h2>

          <div className="space-y-3">
            {items.map((item) => (
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
                      {formatPrice(item.product.originalPriceInCents, "GBP")}
                    </p>
                  )}
                </div>
                <p className="text-sm font-medium">
                  {formatPrice((item.product?.priceInCents || 0) * item.quantity, "GBP")}
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
              <span>Calculated at checkout</span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formattedSubtotal}</span>
          </div>
        </div>
      </div>

      {/* Checkout Form */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        <div className="border border-border/50 rounded-lg p-6">
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
        </div>
      </div>
    </div>
  )
}
