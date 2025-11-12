"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Edit2, Save, X, TrendingUp, TrendingDown, Tag } from "lucide-react"
import { updateProductFull, adjustCurrentStock } from "@/app/actions/inventory"
import { useRouter } from "next/navigation"
import type { InventoryItem } from "@/app/actions/inventory"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { PRODUCTS } from "@/lib/products"

export function InventoryTable({ inventory }: { inventory: InventoryItem[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<{
    id: string
    name: string
    description: string
    category: string
    details: string
    maxStock: string
    priceInCents: string
    onSale: boolean
    originalPriceInCents: string
    stockAdjustment: string
  }>({
    id: "",
    name: "",
    description: "",
    category: "",
    details: "",
    maxStock: "",
    priceInCents: "",
    onSale: false,
    originalPriceInCents: "",
    stockAdjustment: "0",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEdit = (item: InventoryItem) => {
    const product = PRODUCTS.find((p) => p.id === item.productId)
    setEditingId(item.productId)
    setEditData({
      id: item.productId,
      name: item.productName,
      description: product?.description || "",
      category: item.category,
      details: product?.details || "",
      maxStock: item.maxStock.toString(),
      priceInCents: item.priceInCents.toString(),
      onSale: item.onSale || false,
      originalPriceInCents: item.originalPriceInCents?.toString() || item.priceInCents.toString(),
      stockAdjustment: "0",
    })
    setError(null)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({
      id: "",
      name: "",
      description: "",
      category: "",
      details: "",
      maxStock: "",
      priceInCents: "",
      onSale: false,
      originalPriceInCents: "",
      stockAdjustment: "0",
    })
    setError(null)
  }

  const handleSave = async (originalProductId: string) => {
    setLoading(true)
    setError(null)

    const maxStock = Number.parseInt(editData.maxStock)
    const priceInCents = Number.parseInt(editData.priceInCents)
    const originalPriceInCents = editData.onSale ? Number.parseInt(editData.originalPriceInCents) : undefined
    const stockAdjustment = Number.parseInt(editData.stockAdjustment)

    if (!editData.id || !/^[a-z0-9-]+$/.test(editData.id)) {
      setError("Product ID must contain only lowercase letters, numbers, and hyphens")
      setLoading(false)
      return
    }

    if (!editData.name.trim()) {
      setError("Product name is required")
      setLoading(false)
      return
    }

    if (!editData.category.trim()) {
      setError("Category is required")
      setLoading(false)
      return
    }

    if (isNaN(maxStock) || maxStock < 0) {
      setError("Please enter a valid stock quantity")
      setLoading(false)
      return
    }

    if (isNaN(priceInCents) || priceInCents < 0) {
      setError("Please enter a valid price")
      setLoading(false)
      return
    }

    if (editData.onSale && (!originalPriceInCents || originalPriceInCents <= priceInCents)) {
      setError("Original price must be higher than sale price")
      setLoading(false)
      return
    }

    // First update product details
    const result = await updateProductFull(originalProductId, {
      id: editData.id,
      name: editData.name,
      description: editData.description,
      category: editData.category,
      details: editData.details,
      maxStock,
      priceInCents,
      onSale: editData.onSale,
      originalPriceInCents,
    })

    if (!result.success) {
      setError(result.error || "Failed to update product")
      setLoading(false)
      return
    }

    // Then apply stock adjustment if any
    if (stockAdjustment !== 0) {
      const adjustResult = await adjustCurrentStock(editData.id, stockAdjustment)
      if (!adjustResult.success) {
        setError(adjustResult.error || "Failed to adjust stock")
        setLoading(false)
        return
      }
    }

    setEditingId(null)
    setEditData({
      id: "",
      name: "",
      description: "",
      category: "",
      details: "",
      maxStock: "",
      priceInCents: "",
      onSale: false,
      originalPriceInCents: "",
      stockAdjustment: "0",
    })
    router.refresh()
    setLoading(false)
  }

  const getStockStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100

    if (current === 0) {
      return { label: "Out of Stock", variant: "destructive" as const, color: "text-red-600 dark:text-red-400" }
    } else if (percentage <= 10) {
      return { label: "Critical", variant: "destructive" as const, color: "text-red-600 dark:text-red-400" }
    } else if (percentage <= 20) {
      return { label: "Low", variant: "secondary" as const, color: "text-amber-600 dark:text-amber-400" }
    } else if (percentage <= 50) {
      return { label: "Medium", variant: "secondary" as const, color: "text-yellow-600 dark:text-yellow-400" }
    } else {
      return { label: "Good", variant: "secondary" as const, color: "text-green-600 dark:text-green-400" }
    }
  }

  const formatPrice = (cents: number) => `£${(cents / 100).toFixed(2)}`

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="border border-border/40 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="font-medium min-w-[200px]">Product</TableHead>
                <TableHead className="font-medium">Category</TableHead>
                <TableHead className="font-medium text-right">Price</TableHead>
                <TableHead className="font-medium text-right">Max Stock</TableHead>
                <TableHead className="font-medium text-right">Available</TableHead>
                <TableHead className="font-medium text-right">Sold</TableHead>
                <TableHead className="font-medium text-center">Status</TableHead>
                <TableHead className="font-medium text-right min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => {
                const isEditing = editingId === item.productId
                const status = getStockStatus(item.currentStock, item.maxStock)
                const stockPercentage = Math.round((item.currentStock / item.maxStock) * 100)

                return (
                  <TableRow key={item.productId} className="border-border/40">
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{item.productName}</p>
                        {item.onSale && (
                          <Badge variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            On Sale
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{item.category}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={editData.priceInCents}
                            onChange={(e) => setEditData({ ...editData, priceInCents: e.target.value })}
                            className="w-28 h-8 text-right"
                            placeholder="Price (pence)"
                            min="0"
                            disabled={loading}
                          />
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(Number(editData.priceInCents) || 0)}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          {item.onSale && item.originalPriceInCents && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatPrice(item.originalPriceInCents)}
                            </p>
                          )}
                          <p className={item.onSale ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                            {formatPrice(item.priceInCents)}
                          </p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editData.maxStock}
                          onChange={(e) => setEditData({ ...editData, maxStock: e.target.value })}
                          className="w-24 h-8 text-right"
                          min="0"
                          disabled={loading}
                        />
                      ) : (
                        <span className="tabular-nums">{item.maxStock}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`tabular-nums font-medium ${status.color}`}>{item.currentStock}</span>
                        <span className="text-xs text-muted-foreground">({stockPercentage}%)</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.soldQuantity > 0 ? (
                          <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="tabular-nums">{item.soldQuantity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.variant} className="whitespace-nowrap">
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSave(item.productId)}
                            disabled={loading}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancel} disabled={loading}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update all product information, pricing, and inventory</DialogDescription>
          </DialogHeader>

          {editingId && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-id">Product ID *</Label>
                  <Input
                    id="product-id"
                    value={editData.id}
                    onChange={(e) => setEditData({ ...editData, id: e.target.value })}
                    placeholder="e.g., mochi-pig"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    placeholder="e.g., Running Boars"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="e.g., Mochi the Running Pig"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="Short description"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Details</Label>
                <textarea
                  id="details"
                  value={editData.details}
                  onChange={(e) => setEditData({ ...editData, details: e.target.value })}
                  placeholder="Detailed product information"
                  disabled={loading}
                  className="w-full min-h-[100px] px-3 py-2 text-sm border border-input bg-background rounded-md"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Pricing & Sale</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Current Price (pence) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editData.priceInCents}
                      onChange={(e) => setEditData({ ...editData, priceInCents: e.target.value })}
                      placeholder="e.g., 2500"
                      min="0"
                      disabled={loading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Display: {formatPrice(Number(editData.priceInCents) || 0)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-stock">Maximum Stock *</Label>
                    <Input
                      id="max-stock"
                      type="number"
                      value={editData.maxStock}
                      onChange={(e) => setEditData({ ...editData, maxStock: e.target.value })}
                      placeholder="e.g., 100"
                      min="0"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <Switch
                    id="on-sale"
                    checked={editData.onSale}
                    onCheckedChange={(checked) => setEditData({ ...editData, onSale: checked })}
                    disabled={loading}
                  />
                  <Label htmlFor="on-sale">Mark as On Sale</Label>
                </div>

                {editData.onSale && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="original-price">Original Price (pence)</Label>
                    <Input
                      id="original-price"
                      type="number"
                      value={editData.originalPriceInCents}
                      onChange={(e) => setEditData({ ...editData, originalPriceInCents: e.target.value })}
                      placeholder="e.g., 3500"
                      min="0"
                      disabled={loading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Display: {formatPrice(Number(editData.originalPriceInCents) || 0)}
                    </p>
                    {Number(editData.originalPriceInCents) > 0 && Number(editData.priceInCents) > 0 && (
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        {Math.round(
                          ((Number(editData.originalPriceInCents) - Number(editData.priceInCents)) /
                            Number(editData.originalPriceInCents)) *
                            100,
                        )}
                        % OFF
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Stock Adjustment</h4>
                <div className="space-y-2">
                  <Label htmlFor="stock-adjustment">Adjust Current Stock</Label>
                  <Input
                    id="stock-adjustment"
                    type="number"
                    value={editData.stockAdjustment}
                    onChange={(e) => setEditData({ ...editData, stockAdjustment: e.target.value })}
                    placeholder="0"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter positive number to increase stock, negative to decrease. This adjusts the current available
                    quantity.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={() => editingId && handleSave(editingId)} disabled={loading}>
              {loading ? "Saving..." : "Save All Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
