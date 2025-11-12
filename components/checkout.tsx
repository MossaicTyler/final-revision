"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

export default function Checkout({ productId }: { productId: string }) {
  const router = useRouter()

  const handleCheckout = async () => {
    // Add product to cart and redirect to cart page for guest checkout
    const { addToCart } = await import("@/app/actions/cart")
    const result = await addToCart(productId, 1)

    if (result.error) {
      alert(result.error)
    } else {
      router.push("/cart")
    }
  }

  return (
    <div className="py-8 space-y-6">
      <div className="text-center space-y-4">
        <ShoppingCart className="h-16 w-16 mx-auto text-primary" />
        <div>
          <h3 className="text-xl font-semibold mb-2">Ready to Purchase?</h3>
          <p className="text-muted-foreground">Click below to add this item to your cart and proceed to checkout.</p>
        </div>
        <Button onClick={handleCheckout} size="lg" className="w-full">
          Add to Cart & Checkout
        </Button>
      </div>
    </div>
  )
}
