"use client"

import Link from "next/link"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { AuthDialog } from "./auth-dialog"
import { CartDrawer } from "./cart-drawer"

interface HeaderProps {
  user: { id: string; email: string; name: string | null } | null
  cartItemCount: number
  cartItems: Array<{
    id: number
    product_id: string
    quantity: number
    product?: {
      id: string
      name: string
      priceInCents: number
      images?: string[]
    }
  }>
}

export function Header({ user, cartItemCount, cartItems }: HeaderProps) {
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  return (
    <>
      <header className="border-b border-border/40 bg-background/98 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            reknur
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            {!user && (
              <Link
                href="/track-order"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex"
              >
                Track Order
              </Link>
            )}

            <CartDrawer initialItems={cartItems} cartItemCount={cartItemCount} />

            {user ? (
              <Link href="/account">
                <Button variant="ghost" size="icon" className="hover:bg-muted">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAuthDialogOpen(true)}
                  className="sm:hidden hover:bg-muted"
                  aria-label="Sign In"
                >
                  <User className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setAuthDialogOpen(true)}
                  className="hidden sm:inline-flex hover:bg-muted"
                >
                  Sign In
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  )
}
