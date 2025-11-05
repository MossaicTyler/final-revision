import { getOrderById, getOrderTracking } from "@/app/actions/orders"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Clock } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderById(Number.parseInt(id))

  if (!order) {
    notFound()
  }

  const tracking = await getOrderTracking(Number.parseInt(id))

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: order.currency,
  }).format(order.total_amount / 100)

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const statusConfig = {
    pending: { icon: Clock, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/20" },
    processing: {
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
    shipped: {
      icon: Truck,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/20",
    },
    delivered: {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/20",
    },
    cancelled: { icon: Package, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/20" },
  }

  const currentStatus = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = currentStatus.icon

  return (
    <div className="space-y-6">
      <Link href="/account/orders">
        <Button variant="ghost" size="sm" className="hover:bg-muted">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-serif mb-2">Order #{order.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">{formattedDate}</p>
                </div>
                <Badge variant="outline" className={`${currentStatus.bg} border-0 px-3 py-1.5`}>
                  <StatusIcon className={`h-4 w-4 mr-2 ${currentStatus.color}`} />
                  <span className={currentStatus.color}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted border border-border/50">
                        <Image
                          src={item.product_image || "/placeholder.svg"}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        <p className="text-sm font-medium">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(item.price / 100)}{" "}
                          each
                        </p>
                      </div>
                      <p className="font-semibold">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format((item.price * item.quantity) / 100)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formattedTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border/50">
                  <span>Total</span>
                  <span>{formattedTotal}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{order.shipping_name}</p>
                <p className="text-sm text-muted-foreground">{order.shipping_address_line1}</p>
                {order.shipping_address_line2 && (
                  <p className="text-sm text-muted-foreground">{order.shipping_address_line2}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                </p>
                <p className="text-sm text-muted-foreground">{order.shipping_country}</p>
                {order.shipping_phone && <p className="text-sm text-muted-foreground">{order.shipping_phone}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tracking Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tracking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tracking?.tracking_number ? (
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-mono text-sm font-semibold">{tracking.tracking_number}</p>
                  </div>
                  {tracking.carrier && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Carrier</p>
                      <p className="font-medium">{tracking.carrier}</p>
                    </div>
                  )}
                  {tracking.estimated_delivery && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                      <p className="font-medium">
                        {new Date(tracking.estimated_delivery).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Tracking information will be available once your order ships
                  </p>
                </div>
              )}

              {tracking?.events && tracking.events.length > 0 && (
                <div className="pt-4 border-t border-border/50">
                  <h4 className="font-semibold mb-3 text-sm">Tracking History</h4>
                  <div className="space-y-3">
                    {tracking.events.map((event: any, index: number) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="rounded-full bg-primary/10 p-1.5">
                            <MapPin className="h-3 w-3 text-primary" />
                          </div>
                          {index < tracking.events.length - 1 && <div className="w-px h-full bg-border/50 my-1" />}
                        </div>
                        <div className="flex-1 pb-3">
                          <p className="text-sm font-medium">{event.status}</p>
                          {event.location && <p className="text-xs text-muted-foreground">{event.location}</p>}
                          {event.description && (
                            <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.event_time).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {order.stripe_payment_intent_id && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Payment ID: <span className="font-mono">{order.stripe_payment_intent_id}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
