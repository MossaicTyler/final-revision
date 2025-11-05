"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, Tag } from "lucide-react"
import { removeFromCart, updateCartQuantity } from "@/app/actions/cart"
import { useState } from "react"
import type { Product } from "@/lib/products"
import { LoadingSpinner } from "./loading-spinner"
import { formatPrice } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"

interface CartItemProps {
  item: {
    id: number
    product_id: string
    quantity: number
    product?: Product
  }
  onUpdate?: () => void
}

export function CartItem({ item, onUpdate }: CartItemProps) {
  const [loading, setLoading] = useState(false)

  if (!item.product) return null

  const discountPercent =
    item.product.onSale && item.product.originalPriceInCents
      ? Math.round(
          ((item.product.originalPriceInCents - item.product.priceInCents) / item.product.originalPriceInCents) * 100,
        )
      : 0

  const formattedPrice = formatPrice(item.product.priceInCents, "GBP")
  const formattedOriginalPrice = item.product.originalPriceInCents
    ? formatPrice(item.product.originalPriceInCents, "GBP")
    : null
  const formattedTotal = formatPrice(item.product.priceInCents * item.quantity, "GBP")

  async function handleUpdateQuantity(newQuantity: number) {
    if (newQuantity < 1) return
    setLoading(true)
    console.log("[v0] Updating cart quantity", { itemId: item.id, newQuantity })
    await updateCartQuantity(item.id, newQuantity)
    window.dispatchEvent(new Event("cartUpdated"))
    if (onUpdate) onUpdate()
    setLoading(false)
  }

  async function handleRemove() {
    setLoading(true)
    console.log("[v0] Removing cart item", { itemId: item.id })
    await removeFromCart(item.id)
    window.dispatchEvent(new Event("cartUpdated"))
    if (onUpdate) onUpdate()
    setLoading(false)
  }

  return (
    <div className="border border-border/50 rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 relative">
      {loading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <LoadingSpinner size="small" />
        </div>
      )}

      <div className="relative w-full sm:w-24 h-48 sm:h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        <Image
          src={item.product.images?.[0] || "/placeholder.svg"}
          alt={item.product.name}
          fill
          className="object-cover"
        />
        {item.product.onSale && discountPercent > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
            <Tag className="h-3 w-3 mr-1" />
            {discountPercent}% OFF
          </Badge>
        )}
      </div>

      <div className="flex-1 space-y-3 sm:space-y-2">
        <div className="flex justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg sm:text-xl">{item.product.name}</h3>
            <p className="text-sm text-muted-foreground">{item.product.category}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRemove} disabled={loading} className="flex-shrink-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={loading || item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-10 text-center font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={loading}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-left sm:text-right w-full sm:w-auto">
            {item.product.onSale && formattedOriginalPrice && (
              <p className="text-xs text-muted-foreground line-through">{formattedOriginalPrice} each</p>
            )}
            <p className="text-sm text-muted-foreground">{formattedPrice} each</p>
            <p className="font-semibold text-lg">{formattedTotal}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
