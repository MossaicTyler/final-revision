import { getCart } from "@/app/actions/cart"
import { PRODUCTS } from "@/lib/products"
import { redirect } from "next/navigation"
import { CartCheckout } from "@/components/cart-checkout"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function CheckoutPage() {
  const cartItems = await getCart()
  const user = await getCurrentUser()

  if (cartItems.length === 0) {
    redirect("/cart")
  }

  // Enrich cart items with product data
  const enrichedItems = cartItems.map((item) => {
    const product = PRODUCTS.find((p) => p.id === item.product_id)
    return {
      ...item,
      product,
    }
  })

  const subtotal = enrichedItems.reduce((sum, item) => {
    return sum + (item.product?.priceInCents || 0) * item.quantity
  }, 0)

  const shippingCost = subtotal < 1500 ? 500 : 0
  const total = subtotal + shippingCost

  const serializedUser = user
    ? {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif mb-8">Checkout</h1>
          <CartCheckout
            items={enrichedItems}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            user={serializedUser}
          />
        </div>
      </div>
    </div>
  )
}
