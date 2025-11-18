"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateOrderTracking } from "@/app/actions/admin"
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'

export function TrackingForm({ order }: { order: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    tracking_number: order.tracking_number || "",
    carrier: order.carrier || "",
    estimated_delivery: order.estimated_delivery || "",
    status: order.status || "processing",
    notes: order.notes || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const result = await updateOrderTracking(order.id, formData)

    setLoading(false)
    if (result.success) {
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <Card className="bg-card/50 border-border/40 sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Update Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs uppercase tracking-wider text-muted-foreground">
              Order Status
            </Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background/50 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="delayed">Delayed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking" className="text-xs uppercase tracking-wider text-muted-foreground">
              Tracking Number
            </Label>
            <Input
              id="tracking"
              value={formData.tracking_number}
              onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
              placeholder="1Z999AA10123456784"
              className="bg-background/50 border-border/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carrier" className="text-xs uppercase tracking-wider text-muted-foreground">
              Carrier
            </Label>
            <Input
              id="carrier"
              value={formData.carrier}
              onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
              placeholder="UPS, USPS, FedEx, DHL"
              className="bg-background/50 border-border/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery" className="text-xs uppercase tracking-wider text-muted-foreground">
              Estimated Delivery
            </Label>
            <Input
              id="delivery"
              type="date"
              value={formData.estimated_delivery}
              onChange={(e) => setFormData({ ...formData, estimated_delivery: e.target.value })}
              className="bg-background/50 border-border/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-muted-foreground">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add notes about delays, special handling, or other order updates..."
              rows={3}
              className="bg-background/50 border-border/40 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              These notes will be visible to customers when they check their order status.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Updated!
              </>
            ) : (
              "Update Tracking"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
