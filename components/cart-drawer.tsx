"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingCart, X } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { removeFromCart, updateCartQuantity, getCart } from "@/app/actions/cart"
import { Minus, Plus, Tag } from "lucide-react"
import { LoadingSpinner } from "./loading-spinner"
import { PRODUCTS } from "@/lib/products"
import { Badge } from "@/components/ui/badge"

interface CartItem {
  id: number
  product_id: string
  quantity: number
  product?: {
    id: string
    name: string
    priceInCents: number
    originalPriceInCents?: number
    onSale?: boolean
    images?: string[]
  }
}

interface CartDrawerProps {
  initialItems: CartItem[]
  cartItemCount: number
}

export function CartDrawer({ initialItems, cartItemCount }: CartDrawerProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(initialItems)
  const [loadingItems, setLoadingItems] = useState<Set<number>>(new Set())
  const [cartCount, setCartCount] = useState(cartItemCount)

  useEffect(() => {
    setItems(initialItems)
    const totalCount = initialItems.reduce((sum, item) => sum + item.quantity, 0)
    setCartCount(totalCount)
  }, [initialItems])

  useEffect(() => {
    const handleCartUpdate = async () => {
      const freshCart = await getCart()
      const enrichedCart = freshCart.map((item) => {
        const product = PRODUCTS.find((p) => p.id === item.product_id)
        return {
          ...item,
          product,
        }
      })
      setItems(enrichedCart)
      const totalCount = enrichedCart.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(totalCount)
    }

    window.addEventListener("cartUpdated", handleCartUpdate)
    return () => window.removeEventListener("cartUpdated", handleCartUpdate)
  }, [])

  useEffect(() => {
    const handleOpenCart = async () => {
      const freshCart = await getCart()
      const enrichedCart = freshCart.map((item) => {
        const product = PRODUCTS.find((p) => p.id === item.product_id)
        return {
          ...item,
          product,
        }
      })
      setItems(enrichedCart)
      const totalCount = enrichedCart.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(totalCount)
      setOpen(true)
    }

    window.addEventListener("openCart", handleOpenCart)
    return () => window.removeEventListener("openCart", handleOpenCart)
  }, [])

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.product?.priceInCents || 0) * item.quantity
  }, 0)

  const formattedSubtotal = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(subtotal / 100)

  async function handleUpdateQuantity(itemId: number, newQuantity: number) {
    setLoadingItems((prev) => new Set(prev).add(itemId))
    const result = await updateCartQuantity(itemId, newQuantity)
    setLoadingItems((prev) => {
      const next = new Set(prev)
      next.delete(itemId)
      return next
    })

    if (result.success) {
      if (newQuantity <= 0) {
        setItems((prev) => prev.filter((item) => item.id !== itemId))
        setCartCount((prev) => Math.max(0, prev - 1))
      } else {
        setItems((prev) =>
          prev.map((item) => {
            if (item.id === itemId) {
              const diff = newQuantity - item.quantity
              setCartCount((prevCount) => prevCount + diff)
              return { ...item, quantity: newQuantity }
            }
            return item
          }),
        )
      }
    }
  }

  async function handleRemove(itemId: number) {
    const item = items.find((i) => i.id === itemId)
    setLoadingItems((prev) => new Set(prev).add(itemId))
    const result = await removeFromCart(itemId)
    setLoadingItems((prev) => {
      const next = new Set(prev)
      next.delete(itemId)
      return next
    })

    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== itemId))
      if (item) {
        setCartCount((prev) => Math.max(0, prev - item.quantity))
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-muted">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {cartCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <div className="px-6 pt-6 pb-4 border-b border-border/50">
          <SheetHeader>
            <SheetTitle className="text-2xl font-serif">Shopping Cart</SheetTitle>
            {cartCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
              </p>
            )}
          </SheetHeader>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12 px-6">
            <div className="rounded-full bg-muted p-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">Discover our curated collection of exceptional items</p>
            </div>
            <Button onClick={() => setOpen(false)} size="lg" className="mt-4">
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-6 px-6">
              <div className="space-y-6">
                {items.map((item) => {
                  if (!item.product) return null
                  const isLoading = loadingItems.has(item.id)

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-6 border-b border-border/50 last:border-0 last:pb-0 relative"
                    >
                      {isLoading && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
                          <LoadingSpinner size="small" />
                        </div>
                      )}

                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted border border-border/50">
                        <Image
                          src={item.product.images?.[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex justify-between gap-2">
                          <div className="space-y-1 flex-1">
                            <h4 className="font-medium leading-tight line-clamp-2">{item.product.name}</h4>
                            {item.product.onSale && item.product.originalPriceInCents && (
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                  <Tag className="h-2.5 w-2.5 mr-0.5" />
                                  {Math.round(
                                    ((item.product.originalPriceInCents - item.product.priceInCents) /
                                      item.product.originalPriceInCents) *
                                      100,
                                  )}
                                  % OFF
                                </Badge>
                                <span className="text-xs text-muted-foreground line-through">
                                  {new Intl.NumberFormat("en-GB", {
                                    style: "currency",
                                    currency: "GBP",
                                  }).format(item.product.originalPriceInCents / 100)}
                                </span>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {new Intl.NumberFormat("en-GB", {
                                style: "currency",
                                currency: "GBP",
                              }).format(item.product.priceInCents / 100)}{" "}
                              each
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleRemove(item.id)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-background"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={isLoading || item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-background"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={isLoading}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <p className="text-base font-semibold">
                            {new Intl.NumberFormat("en-GB", {
                              style: "currency",
                              currency: "GBP",
                            }).format((item.product.priceInCents * item.quantity) / 100)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="border-t border-border/50 px-6 py-6 space-y-4 bg-muted/30">
              <div className="flex justify-between items-center">
                <span className="text-base text-muted-foreground">Subtotal</span>
                <span className="text-2xl font-serif font-semibold">{formattedSubtotal}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">Shipping and taxes calculated at checkout</p>

              <div className="space-y-3 pt-2">
                <Link href="/checkout" onClick={() => setOpen(false)}>
                  <Button size="lg" className="w-full text-base py-2 h-auto mb-2">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/cart" onClick={() => setOpen(false)}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full bg-transparent hover:bg-muted text-base py-2 h-auto"
                  >
                    View Full Cart
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
