import { getAllOrders, getOrderStats } from "@/app/actions/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Truck, CheckCircle, Clock } from "lucide-react"
import { AdminOrdersTable } from "@/components/admin/orders-table"
import { BulkUploadDialog } from "@/components/admin/bulk-upload-dialog"

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const params = await searchParams
  const { orders, error } = await getAllOrders({
    status: params.status,
    search: params.search,
  })

  const { stats } = await getOrderStats()

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Order Management</h1>
              <p className="text-sm text-muted-foreground mt-1">Track and manage order fulfillment and shipping</p>
            </div>
            <BulkUploadDialog />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card className="bg-card/50 border-border/40">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Orders</p>
                  <p className="text-2xl font-semibold tabular-nums">{stats.total_orders}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/40">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-yellow-500" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending</p>
                  </div>
                  <p className="text-2xl font-semibold tabular-nums">{stats.pending}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/40">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-blue-500" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Processing</p>
                  </div>
                  <p className="text-2xl font-semibold tabular-nums">{stats.processing}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/40">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-purple-500" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Shipped</p>
                  </div>
                  <p className="text-2xl font-semibold tabular-nums">{stats.shipped}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/40">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Delivered</p>
                  </div>
                  <p className="text-2xl font-semibold tabular-nums">{stats.delivered}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">Needs Tracking</p>
                  <p className="text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                    {stats.needs_tracking}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/40">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Revenue (30d)</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    ${((stats.total_revenue || 0) / 100).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Table */}
        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminOrdersTable orders={orders || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
