import { getInventoryOverview } from "@/app/actions/inventory"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryTable } from "@/components/admin/inventory-table"
import { Package, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminInventoryPage() {
  const { inventory, error } = await getInventoryOverview()

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

  // Calculate stats
  const totalProducts = inventory.length
  const totalStock = inventory.reduce((sum, item) => sum + item.currentStock, 0)
  const totalSold = inventory.reduce((sum, item) => sum + item.soldQuantity, 0)
  const lowStockItems = inventory.filter((item) => item.currentStock <= 10 && item.currentStock > 0).length
  const outOfStock = inventory.filter((item) => item.currentStock === 0).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-6 py-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Inventory Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor and adjust stock levels across all products</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-card/50 border-border/40">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-blue-500" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Products</p>
                </div>
                <p className="text-2xl font-semibold tabular-nums">{totalProducts}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/40">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Available Stock</p>
                </div>
                <p className="text-2xl font-semibold tabular-nums">{totalStock}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/40">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-3.5 w-3.5 text-purple-500" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Sold</p>
                </div>
                <p className="text-2xl font-semibold tabular-nums">{totalSold}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/10 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">Low Stock</p>
                </div>
                <p className="text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {lowStockItems}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  <p className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider">Out of Stock</p>
                </div>
                <p className="text-2xl font-semibold tabular-nums text-red-600 dark:text-red-400">{outOfStock}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Product Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <InventoryTable inventory={inventory} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
