"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/products"
import { useRegion } from "@/contexts/region-context"
import { getRegionalPrice } from "@/lib/regions"
import { getProductStock } from "@/lib/inventory"
import { addToCart } from "@/app/actions/cart"
import { ProductCard } from "@/components/product-card"
import {
  ShoppingCart,
  Tag,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Package,
  Shield,
  Sparkles,
  Home,
  LucideCircleArrowUp as BreadcrumbArrow,
} from "lucide-react"
import { LoadingSpinner } from "./loading-spinner"
import Checkout from "./checkout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useBookmarks } from "@/hooks/use-bookmarks"

interface ProductDetailClientProps {
  product: Product
  relatedProducts: Product[]
  isAuthenticated: boolean // Added isAuthenticated prop from server
}

export function ProductDetailClient({
  product: originalProduct,
  relatedProducts,
  isAuthenticated,
}: ProductDetailClientProps) {
  const { region, getLocalizedProduct } = useRegion()
  const product = getLocalizedProduct(originalProduct)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [stock, setStock] = useState<number | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [imageZoom, setImageZoom] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)

  const {
    isBookmarked,
    isLoading: isBookmarkLoading,
    toggleBookmark,
  } = useBookmarks(originalProduct.id, isAuthenticated)

  useEffect(() => {
    async function fetchStock() {
      const currentStock = await getProductStock(originalProduct.id)
      setStock(currentStock)
    }
    fetchStock()
  }, [originalProduct.id])

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const productImages = product.images || ["/placeholder.svg"]
  const isSoldOut = stock !== null && stock === 0

  const regionalPrice = getRegionalPrice(originalProduct, region.code)
  const displayPrice =
    originalProduct.onSale && originalProduct.salePrice
      ? getRegionalPrice({ ...originalProduct, priceInCents: originalProduct.salePrice }, region.code)
      : regionalPrice

  const formattedPrice = new Intl.NumberFormat(region.locale, {
    style: "currency",
    currency: region.currency,
  }).format(displayPrice / 100)

  const formattedOriginalPrice =
    originalProduct.onSale && originalProduct.salePrice
      ? new Intl.NumberFormat(region.locale, {
          style: "currency",
          currency: region.currency,
        }).format(regionalPrice / 100)
      : null

  const discountPercentage =
    originalProduct.onSale && originalProduct.salePrice && regionalPrice > displayPrice
      ? Math.round(((regionalPrice - displayPrice) / regionalPrice) * 100)
      : null

  async function handleAddToCart() {
    if (isSoldOut) return

    setIsAddingToCart(true)
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
    } finally {
      setIsAddingToCart(false)
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  async function handleToggleBookmark() {
    await toggleBookmark()

    if (!isAuthenticated) {
      const message = isBookmarked ? "Removed from saved items" : "Saved! Sign in to sync across devices"
      console.log(message)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="border-b border-border/50 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <BreadcrumbArrow className="h-4 w-4" />
            <Link href={`/?category=${product.category}`} className="hover:text-foreground transition-colors">
              {product.category}
            </Link>
            <BreadcrumbArrow className="h-4 w-4" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted border border-border/50">
              <Image
                src={productImages[currentImageIndex] || "/placeholder.svg"}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                fill
                className={`object-cover transition-transform duration-300 ${imageZoom ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"}`}
                onClick={() => setImageZoom(!imageZoom)}
                priority
              />

              {isSoldOut ? (
                <div className="absolute top-6 right-6 bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-base font-semibold shadow-xl">
                  SOLD OUT
                </div>
              ) : (
                product.onSale &&
                discountPercentage && (
                  <div className="absolute top-6 right-6 bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-base font-semibold flex items-center gap-2 shadow-xl">
                    <Tag className="h-5 w-5" />
                    {discountPercentage}% OFF
                  </div>
                )
              )}

              {productImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full opacity-80 hover:opacity-100"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full opacity-80 hover:opacity-100"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
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
          </div>

          <div className="space-y-6">
            <Badge variant="secondary" className="text-xs font-medium tracking-wider uppercase">
              {product.category}
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-balance leading-tight">{product.name}</h1>

            <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="flex items-baseline gap-4 py-4 border-y border-border/50">
              {formattedOriginalPrice && (
                <p className="text-2xl text-muted-foreground line-through">{formattedOriginalPrice}</p>
              )}
              <p className={`text-4xl font-serif ${originalProduct.onSale ? "text-red-600 dark:text-red-400" : ""}`}>
                {formattedPrice}
              </p>
            </div>

            {stock !== null && (
              <div className="space-y-2">
                {stock === 0 ? (
                  <p className="text-destructive font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    Out of Stock
                  </p>
                ) : stock <= 10 ? (
                  <p className="text-orange-600 dark:text-orange-400 font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400 animate-pulse" />
                    Only {stock} left in stock!
                  </p>
                ) : (
                  <p className="text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                    In Stock
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isAddingToCart || isSoldOut}
                className="flex-1 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {isSoldOut ? "Sold Out" : "Add to Cart"}
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowCheckout(true)}
                disabled={isSoldOut}
                className="flex-1 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSoldOut ? "Sold Out" : "Buy Now"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={handleToggleBookmark}
                disabled={isBookmarkLoading}
              >
                <Heart className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current text-red-500" : ""}`} />
                {isBookmarked ? "Saved" : "Save"}
              </Button>
            </div>

            <Card className="border-border/50 bg-muted/30 p-6 space-y-4">
              <h3 className="font-semibold text-lg mb-4">Why You'll Love This</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Handcrafted Quality</p>
                    <p className="text-sm text-muted-foreground">
                      Each piece is meticulously crafted by skilled artisans
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Limited Edition</p>
                    <p className="text-sm text-muted-foreground">Exclusive collectible with limited availability</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Premium Materials</p>
                    <p className="text-sm text-muted-foreground">Made with the finest, sustainably-sourced materials</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-4 pt-6 border-t border-border/50">
              <h3 className="font-semibold text-xl">Product Details</h3>
              <p className="text-base text-muted-foreground leading-relaxed">{product.details}</p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground pt-4 border-t border-border/50">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium text-foreground">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Product ID:</span>
                <span className="font-medium text-foreground">{product.id}</span>
              </div>
              {product.maxStock && (
                <div className="flex justify-between">
                  <span>Max Stock:</span>
                  <span className="font-medium text-foreground">{product.maxStock} units</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 lg:mt-24 space-y-12">
          <section className="bg-gradient-to-br from-muted/50 to-background rounded-3xl p-8 sm:p-12 border border-border/50">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl font-serif">Why Choose reknur</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We curate exceptional, limited-edition plushies for collectors who appreciate quality, craftsmanship,
                and whimsical design. Each piece tells a story and brings joy to everyday moments.
              </p>
              <div className="grid sm:grid-cols-3 gap-6 pt-6">
                <div className="space-y-2">
                  <div className="text-4xl font-serif text-primary">100%</div>
                  <p className="font-medium">Handcrafted</p>
                  <p className="text-sm text-muted-foreground">Every detail perfected by hand</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-serif text-primary">Limited</div>
                  <p className="font-medium">Edition</p>
                  <p className="text-sm text-muted-foreground">Exclusive collectibles</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-serif text-primary">Premium</div>
                  <p className="font-medium">Materials</p>
                  <p className="text-sm text-muted-foreground">Sustainably sourced quality</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-serif">Care Instructions</h2>
            <Card className="border-border/50 p-6 sm:p-8">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>Spot clean with a damp cloth and mild soap when needed</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>Avoid direct sunlight for extended periods to preserve colors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>Store in a cool, dry place when not on display</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>Handle with care to maintain the crafted details</span>
                </li>
              </ul>
            </Card>
          </section>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16 lg:mt-24 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-4xl font-serif">You Might Also Love</h2>
              <p className="text-muted-foreground">More treasures from the {product.category} collection</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-lg transition-transform duration-300 ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3 sm:py-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                <Image src={productImages[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                <div className="flex items-center gap-2">
                  {formattedOriginalPrice && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-through">{formattedOriginalPrice}</p>
                  )}
                  <p
                    className={`text-sm sm:text-lg font-serif ${originalProduct.onSale ? "text-red-600 dark:text-red-400" : ""}`}
                  >
                    {formattedPrice}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddToCart}
                disabled={isAddingToCart || isSoldOut}
                className="hidden sm:flex disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
              >
                {isAddingToCart ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isSoldOut ? "Sold Out" : "Add to Cart"}
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => setShowCheckout(true)}
                disabled={isSoldOut}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSoldOut ? "Sold Out" : "Buy Now"}
              </Button>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  )
}
