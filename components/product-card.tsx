"use client"

import type React from "react"
import Link from "next/link"
import { useState, useTransition, useEffect, useRef } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Product } from "@/lib/products"
import Checkout from "./checkout"
import { addToCart } from "@/app/actions/cart"
import { getProductStock } from "@/lib/inventory"
import { ShoppingCart, Tag, ChevronLeft, ChevronRight } from "lucide-react"
import { LoadingSpinner } from "./loading-spinner"
import { useRegion } from "@/contexts/region-context"

interface ProductCardProps {
  product: Product
  onCartOpen?: () => void
}

export function ProductCard({ product: originalProduct, onCartOpen }: ProductCardProps) {
  const { region, getLocalizedProduct } = useRegion()
  const product = getLocalizedProduct(originalProduct)

  const [showCheckout, setShowCheckout] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [stock, setStock] = useState<number | null>(null)

  useEffect(() => {
    async function fetchStock() {
      const currentStock = await getProductStock(originalProduct.id)
      setStock(currentStock)
    }
    fetchStock()
  }, [originalProduct.id])

  useEffect(() => {
    const productImages = product.images || ["/placeholder.svg"]
    const hasMultipleImages = productImages.length > 1

    if (!hasMultipleImages || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
    }, 1200)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [product.images, isPaused])

  useEffect(() => {
    if (isHovering && isPaused) {
      setIsPaused(false)
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current)
        pauseTimeoutRef.current = null
      }
    }
  }, [isHovering, isPaused])

  const formattedPrice = new Intl.NumberFormat(region.locale, {
    style: "currency",
    currency: region.currency,
  }).format(product.priceInCents / 100)

  const formattedOriginalPrice = product.originalPriceInCents
    ? new Intl.NumberFormat(region.locale, {
        style: "currency",
        currency: region.currency,
      }).format(product.originalPriceInCents / 100)
    : null

  const discountPercentage =
    product.originalPriceInCents && product.onSale
      ? Math.round(((product.originalPriceInCents - product.priceInCents) / product.originalPriceInCents) * 100)
      : null

  const isSoldOut = stock !== null && stock === 0

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (isSoldOut) return

    startTransition(async () => {
      try {
        const result = await addToCart(originalProduct.id, 1)
        if (result.error) {
          alert(result.error)
          const currentStock = await getProductStock(originalProduct.id)
          setStock(currentStock)
        } else {
          window.dispatchEvent(new CustomEvent("openCart"))
        }
      } catch (error) {
        console.error("Failed to add to cart:", error)
      }
    })
  }

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
    handleManualNavigation()
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
    handleManualNavigation()
  }

  const handleManualNavigation = () => {
    setIsPaused(true)

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current)
    }

    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false)
    }, 10000)
  }

  const productImages = product.images || ["/placeholder.svg"]
  const hasMultipleImages = productImages.length > 1

  return (
    <>
      <Link href={`/products/${originalProduct.id}`} className="block h-full">
        <Card
          className="group overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-300 h-full flex flex-col cursor-pointer relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <CardContent className="p-0 flex flex-col h-full">
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
              <Image
                src={productImages[currentImageIndex] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {isSoldOut ? (
                <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-3 py-1 rounded-full font-semibold shadow-lg text-sm">
                  SOLD OUT
                </div>
              ) : (
                product.onSale &&
                discountPercentage && (
                  <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-3 py-1 rounded-full font-semibold flex items-center gap-1 shadow-lg text-sm">
                    <Tag className="h-3 w-3" />
                    {discountPercentage}% OFF
                  </div>
                )
              )}
              {hasMultipleImages && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {productImages.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full transition-all ${
                        index === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                      }`}
                    />
                  ))}
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
                      e.preventDefault()
                      e.stopPropagation()
                      setShowDetails(true)
                      setCurrentImageIndex(0)
                    }}
                    className="flex-1 sm:flex-none hover:bg-muted hover:border-primary/40 hover:text-muted-background"
                  >
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddToCart}
                    disabled={isPending || isSoldOut}
                    className="flex-1 sm:flex-none hover:bg-muted hover:border-primary/40 hover:text-muted-background bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">{isSoldOut ? "Sold Out" : "Add"}</span>
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowCheckout(true)
                    }}
                    disabled={isSoldOut}
                    className="hidden sm:inline-flex border hover:border-accent-foreground/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSoldOut ? "Sold Out" : "Buy Now"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Product Details Dialog */}
      <Dialog
        open={showDetails}
        onOpenChange={(open) => {
          setShowDetails(open)
          if (!open) setCurrentImageIndex(0)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-border/80">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">{product.name}</DialogTitle>
            <DialogDescription className="text-base">{product.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={productImages[currentImageIndex] || "/placeholder.svg"}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
              />
              {isSoldOut ? (
                <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  SOLD OUT
                </div>
              ) : (
                product.onSale &&
                discountPercentage && (
                  <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                    <Tag className="h-4 w-4" />
                    {discountPercentage}% OFF
                  </div>
                )
              )}

              {hasMultipleImages && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      prevImage(e)
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      nextImage(e)
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentImageIndex(index)
                        }}
                        className={`h-2 w-2 rounded-full transition-all ${
                          index === currentImageIndex ? "bg-primary w-6" : "bg-primary/30 hover:bg-primary/50"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? "border-primary" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Details</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.details}</p>
              </div>
              {stock !== null && stock <= 10 && stock > 0 && (
                <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Only {stock} left in stock!
                </div>
              )}
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
                    disabled={isPending || isSoldOut}
                    className="flex-1 sm:flex-none bg-transparent hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span className="ml-2">Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {isSoldOut ? "Sold Out" : "Add to Cart"}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetails(false)
                      setShowCheckout(true)
                    }}
                    disabled={isSoldOut}
                    className="flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSoldOut ? "Sold Out" : "Buy Now"}
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
          <Checkout productId={originalProduct.id} />
        </DialogContent>
      </Dialog>
    </>
  )
}
