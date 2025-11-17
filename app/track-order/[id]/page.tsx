import { getGuestOrder, getGuestOrderTracking } from "@/app/actions/orders"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { decryptData } from "@/lib/auth"
import { notFound, redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Clock, ShoppingBag } from 'lucide-react'
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function GuestOrderTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string }>
}) {
  const { id } = await params
  const { email } = await searchParams

  console.log("[v0] Order tracking - Order ID:", id, "Email:", email)

  if (!id) {
    console.log("[v0] No order ID provided")
    notFound()
  }

  const orderId = Number.parseInt(id)

  if (Number.isNaN(orderId) || orderId <= 0 || orderId < 10000000 || orderId > 99999999) {
    console.log("[v0] Invalid order ID format:", id)
    notFound()
  }

  const user = await getCurrentUser()
  let order = null
  let tracking = null

  if (user && email) {
    // Authenticated user tracking their order with email verification
    const normalizedEmail = email.toLowerCase().trim()
    console.log("[v0] Authenticated user tracking - Order ID:", orderId, "Email:", normalizedEmail, "User ID:", user.id)

    try {
      const userOrder = await sql`
        SELECT 
          o.*,
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', oi.product_name,
              'product_image', oi.product_image,
              'quantity', oi.quantity,
              'price', oi.price,
              'variant', oi.variant
            )
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = ${orderId} AND o.user_id = ${user.id}
        GROUP BY o.id
      `

      if (userOrder.length > 0) {
        // Verify email matches
        const fetchedOrder = userOrder[0]
        let emailMatches = false

        if (fetchedOrder.customer_email_encrypted) {
          try {
            const decryptedEmail = await decryptData(fetchedOrder.customer_email_encrypted)
            if (decryptedEmail.toLowerCase().trim() === normalizedEmail) {
              emailMatches = true
              console.log("[v0] Authenticated user email verified")
            }
          } catch (error) {
            console.error("[v0] Error decrypting customer email:", error)
          }
        }

        if (emailMatches) {
          order = fetchedOrder

          // Get tracking info
          const trackingData = await sql`
            SELECT tracking_number, carrier, estimated_delivery, status, shipped_at, delivered_at
            FROM orders
            WHERE id = ${orderId} AND user_id = ${user.id}
          `

          if (trackingData.length > 0) {
            const events = await sql`
              SELECT status, location, description, event_time
              FROM order_tracking_events
              WHERE order_id = ${orderId}
              ORDER BY event_time DESC
            `
            tracking = { ...trackingData[0], events }
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching authenticated user order:", error)
    }
  } else if (!user && email) {
    // Guest order tracking (existing logic)
    const normalizedEmail = email.toLowerCase().trim()
    console.log("[v0] Guest tracking - Order ID:", orderId, "Email:", normalizedEmail)

    order = await getGuestOrder(orderId, normalizedEmail)
    tracking = await getGuestOrderTracking(orderId, normalizedEmail)
  } else if (user) {
    // Authenticated user without email - redirect to orders page
    console.log("[v0] Authenticated user without email, redirecting to orders")
    redirect("/account/orders")
  } else {
    // No email provided for guest - redirect to track-order form
    console.log("[v0] No email provided, redirecting to track-order")
    redirect("/track-order")
  }

  if (!order) {
    console.log("[v0] Order not found - ID:", orderId, "Email:", email)
    notFound()
  }

  const formattedTotal = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: order.currency,
  }).format(order.total_amount / 100)

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-GB", {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link href="/track-order">
          <Button variant="ghost" size="sm" className="hover:bg-muted">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Track Another Order
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
                          {item.variant && <p className="text-sm text-muted-foreground">Variant: {item.variant}</p>}
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          <p className="text-sm font-medium">
                            {new Intl.NumberFormat("en-GB", {
                              style: "currency",
                              currency: order.currency.toUpperCase(),
                            }).format(item.price / 100)}{" "}
                            each
                          </p>
                        </div>
                        <p className="font-semibold">
                          {new Intl.NumberFormat("en-GB", {
                            style: "currency",
                            currency: order.currency.toUpperCase(),
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
          </div>

          {/* Tracking Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tracking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.status === "pending" || order.status === "processing" ? (
                  <div className="text-center py-6 space-y-2">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">Order {order.status === "pending" ? "Pending" : "Processing"}</p>
                    <p className="text-sm text-muted-foreground">
                      Your order is being prepared. Tracking information will be available once it ships.
                    </p>
                  </div>
                ) : tracking?.tracking_number ? (
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
                          {new Date(tracking.estimated_delivery).toLocaleDateString("en-GB", {
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
                    <Truck className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Tracking information will be updated once your order ships
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
                              {new Date(event.event_time).toLocaleString("en-GB", {
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
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <ShoppingBag className="h-10 w-10 mx-auto text-primary" />
                  <div>
                    <h4 className="font-semibold mb-1">Continue Shopping</h4>
                    <p className="text-sm text-muted-foreground mb-4">Browse more of our products</p>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
