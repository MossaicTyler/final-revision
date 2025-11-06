import { getAdminOrderById } from "@/app/actions/admin"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { TrackingForm } from "@/components/admin/tracking-form"
import { TrackingTimeline } from "@/components/admin/tracking-timeline"

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { order, error } = await getAdminOrderById(Number.parseInt(id))

  if (error || !order) {
    notFound()
  }

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: order.currency,
  }).format(order.total_amount / 100)

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40">
        <div className="container mx-auto px-6 py-6">
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Order #{order.id}</h1>
              <p className="text-sm text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {order.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card className="bg-card/50 border-border/40">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm">{order.customer_email}</p>
                </div>
                {order.customer_name && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Name</p>
                    <p className="text-sm">{order.customer_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Payment ID</p>
                  <p className="text-sm font-mono">{order.stripe_payment_intent_id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="bg-card/50 border-border/40">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-border/40 last:border-0 last:pb-0">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted border border-border/40">
                        <Image
                          src={item.product_image || "/placeholder.svg"}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-sm">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-xs font-medium">£{(item.price / 100).toFixed(2)} each</p>
                      </div>
                      <p className="font-semibold text-sm">£{((item.price * item.quantity) / 100).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formattedTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-border/40">
                    <span>Total</span>
                    <span>{formattedTotal}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            {order.tracking_events && order.tracking_events.length > 0 && (
              <Card className="bg-card/50 border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Tracking History</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrackingTimeline events={order.tracking_events} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Tracking Form */}
          <div className="lg:col-span-1">
            <TrackingForm order={order} />
          </div>
        </div>
      </div>
    </div>
  )
}
