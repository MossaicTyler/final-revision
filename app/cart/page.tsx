"use client"

import { useEffect, useState } from "react"
import { getCart } from "@/app/actions/cart"
import { PRODUCTS } from "@/lib/products"
import { CartItem } from "@/components/cart-item"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingBag } from 'lucide-react'
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRegion } from "@/contexts/region-context"
import { formatPrice as formatRegionalPrice, getRegionalPrice } from "@/lib/regions"

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { region, getLocalizedProduct } = useRegion()

  useEffect(() => {
    async function loadCart() {
      const items = await getCart()
      setCartItems(items)
      setLoading(false)
    }
    loadCart()
  }, [])

  useEffect(() => {
    const handleCartUpdate = async () => {
      const items = await getCart()
      setCartItems(items)
      window.dispatchEvent(new Event("cartUpdated"))
    }

    window.addEventListener("cartUpdated", handleCartUpdate)
    return () => window.removeEventListener("cartUpdated", handleCartUpdate)
  }, [])

  const enrichedItems = cartItems.map((item) => {
    const product = PRODUCTS.find((p) => p.id === item.product_id)
    if (!product) return { ...item, product: undefined }
    
    const localizedProduct = getLocalizedProduct(product)
    return {
      ...item,
      product: localizedProduct,
    }
  })

  const subtotal = enrichedItems.reduce((sum, item) => {
    if (!item.product) return sum
    const product = PRODUCTS.find((p) => p.id === item.product_id)
    if (!product) return sum
    
    const regionalPrice = getRegionalPrice(product, region.code)
    const price = product.onSale && product.salePrice 
      ? getRegionalPrice({ ...product, priceInCents: product.salePrice }, region.code)
      : regionalPrice
    
    return sum + price * item.quantity
  }, 0)

  const formattedSubtotal = formatRegionalPrice(subtotal, region.code)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <ShoppingBag className="h-16 w-16 sm:h-20 sm:w-20 mx-auto text-muted-foreground" />
            <h1 className="text-3xl sm:text-4xl font-serif">Your Cart is Empty</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Discover our curated collection of exceptional items.
            </p>
            <Link href="/">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <h1 className="text-3xl sm:text-4xl font-serif mb-6 sm:mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Cart Items - Takes remaining space */}
          <div className="flex-1 space-y-4">
            {enrichedItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdate={() => {
                  // Refresh cart after update
                  getCart().then(setCartItems)
                }}
              />
            ))}
          </div>

          {/* Order Summary - Fixed width vertical column on right */}
          <div className="lg:w-96 shrink-0">
            <div className="border border-border/50 rounded-lg p-6 space-y-6 lg:sticky lg:top-24">
              <h2 className="text-xl sm:text-2xl font-serif">Order Summary</h2>

              <div className="space-y-3 py-4 border-y border-border/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formattedSubtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-sm">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-sm">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between text-lg sm:text-xl font-semibold">
                <span>Total</span>
                <span>{formattedSubtotal}</span>
              </div>

              <div className="space-y-3 pt-4">
                <Link href="/checkout" className="block">
                  <Button size="lg" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link href="/">
                  <Button variant="outline" size="lg" className="w-full bg-transparent">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
