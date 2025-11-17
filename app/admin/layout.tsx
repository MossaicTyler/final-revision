import type React from "react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from 'next/navigation'
import Link from "next/link"
import { Package, ShoppingCart, Globe } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin?redirect=/admin")
  }

  // Check if user is admin
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
  if (!adminEmails.includes(user.email)) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navigation */}
      <nav className="border-b border-border/40 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-6 h-14">
            <Link
              href="/admin/orders"
              className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Orders
            </Link>
            <Link
              href="/admin/inventory"
              className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
            >
              <Package className="h-4 w-4" />
              Inventory
            </Link>
            <Link
              href="/admin/regions"
              className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              Regions
            </Link>
          </div>
        </div>
      </nav>

      {children}
    </div>
  )
}
