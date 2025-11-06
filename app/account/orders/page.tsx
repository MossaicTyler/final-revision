import { getUserOrders } from "@/app/actions/orders"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, ChevronRight } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default async function OrdersPage() {
  const orders = await getUserOrders()

  if (orders.length === 0) {
    return (
      <div className="text-center space-y-6 py-16">
        <div className="rounded-full bg-muted p-6 w-fit mx-auto">
          <Package className="h-16 w-16 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-serif">No Orders Yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start shopping to discover our curated collection of exceptional items
          </p>
        </div>
        <Link href="/">
          <Button size="lg" className="mt-4">
            Browse Products
          </Button>
        </Link>
      </div>
    )
  }

  const statusConfig = {
    pending: { color: "bg-yellow-500", label: "Pending", textColor: "text-yellow-700 dark:text-yellow-300" },
    processing: { color: "bg-blue-500", label: "Processing", textColor: "text-blue-700 dark:text-blue-300" },
    shipped: { color: "bg-purple-500", label: "Shipped", textColor: "text-purple-700 dark:text-purple-300" },
    delivered: { color: "bg-green-500", label: "Delivered", textColor: "text-green-700 dark:text-green-300" },
    cancelled: { color: "bg-red-500", label: "Cancelled", textColor: "text-red-700 dark:text-red-300" },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif mb-1">Order History</h2>
          <p className="text-muted-foreground">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => {
          const formattedTotal = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: order.currency,
          }).format(order.total_amount / 100)

          const formattedDate = new Date(order.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })

          const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending

          return (
            <Link key={order.id} href={`/account/orders/${order.id}`}>
              <div className="border border-border/50 rounded-lg p-6 hover:border-primary/30 transition-all duration-200 hover:shadow-md group">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-sm font-semibold">Order #{order.id}</p>
                      <Badge variant="outline" className="font-normal">
                        <div className={`w-2 h-2 rounded-full ${status.color} mr-2`} />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{formattedDate}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 2).map((item: any) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-muted border border-border/50">
                        <Image
                          src={item.product_image || "/placeholder.svg"}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Intl.NumberFormat("en-GB", {
                            style: "currency",
                            currency: order.currency,
                          }).format(item.price / 100)}{" "}
                          each
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {new Intl.NumberFormat("en-GB", {
                          style: "currency",
                          currency: order.currency,
                        }).format((item.price * item.quantity) / 100)}
                      </p>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-muted-foreground pl-[62px]">
                      +{order.items.length - 2} more {order.items.length - 2 === 1 ? "item" : "items"}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-serif font-semibold">{formattedTotal}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
