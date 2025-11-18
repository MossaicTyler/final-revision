"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink, Package, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import Link from "next/link"
import { useRouter } from 'next/navigation'

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  processing: { icon: Package, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  delayed: { icon: AlertCircle, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  shipped: { icon: Truck, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  delivered: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  cancelled: { icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10 border-red-500/20" },
}

export function AdminOrdersTable({ orders }: { orders: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter !== "all") params.set("status", statusFilter)
    router.push(`/admin/orders?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, tracking number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 bg-background/50 border-border/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border/40 bg-background/50 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="delayed">Delayed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Button onClick={handleSearch} variant="secondary" size="sm">
          Apply Filters
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border/40">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Order ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Items
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tracking
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {orders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                const StatusIcon = status.icon

                return (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium">#{order.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{order.customer_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`${status.bg} border`}>
                        <StatusIcon className={`h-3 w-3 mr-1.5 ${status.color}`} />
                        <span className={status.color}>{order.status}</span>
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm tabular-nums">{order.item_count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium tabular-nums">£{(order.total_amount / 100).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {order.tracking_number ? (
                        <span className="font-mono text-xs text-muted-foreground">{order.tracking_number}</span>
                      ) : (
                        <span className="text-xs text-amber-600 dark:text-amber-400">No tracking</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="h-8">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}
    </div>
  )
}
