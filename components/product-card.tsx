"use client"

import type React from "react"

import { useState, useTransition } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Product } from "@/lib/products"
import Checkout from "./checkout"
import { addToCart } from "@/app/actions/cart"
import { ShoppingCart, Tag } from "lucide-react"
import { LoadingSpinner } from "./loading-spinner"

interface ProductCardProps {
  product: Product
  onCartOpen?: () => void
}

export function ProductCard({ product, onCartOpen }: ProductCardProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isPending, startTransition] = useTransition()

  const formattedPrice = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(product.priceInCents / 100)

  const formattedOriginalPrice = product.originalPriceInCents
    ? new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(product.originalPriceInCents / 100)
    : null

  const discountPercentage =
    product.originalPriceInCents && product.onSale
      ? Math.round(((product.originalPriceInCents - product.priceInCents) / product.originalPriceInCents) * 100)
      : null

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      try {
        await addToCart(product.id, 1)
        // Trigger cart drawer to open
        window.dispatchEvent(new CustomEvent("openCart"))
      } catch (error) {
        console.error("Failed to add to cart:", error)
      }
    })
  }

  function handleCardClick() {
    setShowDetails(true)
  }

  return (
    <>
      <Card
        className="group overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-300 h-full flex flex-col cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-0 flex flex-col h-full">
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            <Image
              src={product.images?.[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.onSale && discountPercentage && (
              <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-3 py-1 rounded-full font-semibold flex items-center gap-1 shadow-lg text-sm">
                <Tag className="h-3 w-3" />
                {discountPercentage}% OFF
              </div>
            )}
          </div>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex-1 flex flex-col">
            <div className="space-y-2 flex-1">
              <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">{product.category}</p>
              <h3 className="text-lg sm:text-xl font-serif text-balance leading-tight">{product.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{product.description}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex flex-col">
                {product.onSale && formattedOriginalPrice && (
                  <p className="text-sm text-muted-foreground line-through">{formattedOriginalPrice}</p>
                )}
                <p
                  className={`text-xl sm:text-2xl font-serif ${product.onSale ? "text-red-600 dark:text-red-400" : ""}`}
                >
                  {formattedPrice}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDetails(true)
                  }}
                  className="flex-1 sm:flex-none hover:bg-muted hover:border-primary/40 hover:text-muted-background"
                >
                  Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={isPending}
                  className="flex-1 sm:flex-none hover:bg-muted hover:border-primary/40 hover:text-muted-background bg-transparent"
                >
                  {isPending ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Add</span>
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCheckout(true)
                  }}
                  className="hidden sm:inline-flex border hover:border-accent-foreground/40"
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">{product.name}</DialogTitle>
            <DialogDescription className="text-base">{product.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image src={product.images?.[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              {product.onSale && discountPercentage && (
                <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                  <Tag className="h-4 w-4" />
                  {discountPercentage}% OFF
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Details</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.details}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t">
                <div className="flex flex-col">
                  {product.onSale && formattedOriginalPrice && (
                    <p className="text-lg text-muted-foreground line-through">{formattedOriginalPrice}</p>
                  )}
                  <p
                    className={`text-2xl sm:text-3xl font-serif ${product.onSale ? "text-red-600 dark:text-red-400" : ""}`}
                  >
                    {formattedPrice}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleAddToCart}
                    disabled={isPending}
                    className="flex-1 sm:flex-none bg-transparent hover:bg-muted"
                  >
                    {isPending ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span className="ml-2">Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetails(false)
                      setShowCheckout(true)
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Complete Your Purchase</DialogTitle>
            <DialogDescription>
              {product.name} - {formattedPrice}
            </DialogDescription>
          </DialogHeader>
          <Checkout productId={product.id} />
        </DialogContent>
      </Dialog>
    </>
  )
}
