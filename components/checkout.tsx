"use client"

import { useCallback, useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCheckoutSession } from "@/app/actions/stripe"
import { LoadingSpinner } from "./loading-spinner"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Checkout({ productId }: { productId: string }) {
  const [isLoading, setIsLoading] = useState(true)

  const startCheckoutSessionForProduct = useCallback(async () => {
    const clientSecret = await startCheckoutSession(productId)
    setIsLoading(false)
    return clientSecret
  }, [productId])

  return (
    <div id="checkout">
      {isLoading && (
        <div className="py-16">
          <LoadingSpinner size="large" />
          <p className="text-center text-muted-foreground text-sm mt-4 tracking-wider uppercase">
            Loading secure checkout...
          </p>
        </div>
      )}
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret: startCheckoutSessionForProduct }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
