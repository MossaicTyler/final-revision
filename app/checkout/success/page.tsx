import { getCheckoutSession, createOrderFromSession } from "@/app/actions/stripe"
import { clearCart } from "@/app/actions/cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react"
import { redirect } from "next/navigation"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    redirect("/")
  }

  const session = await getCheckoutSession(sessionId)

  if (!session) {
    redirect("/")
  }

  const result = await createOrderFromSession(sessionId)

  if (result.success) {
    await clearCart()
    console.log("[v0] Cart cleared after successful checkout")
  }

  if (result.error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-destructive/10 p-4">
                <Package className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl font-serif">Order Error</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formattedAmount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: session.currency || "gbp",
  }).format((session.amount_total || 0) / 100)

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500" />
            </div>
          </div>
          <CardTitle className="text-3xl font-serif mb-2">Order Confirmed!</CardTitle>
          <CardDescription className="text-base">
            Thank you for your purchase. Your order is being processed.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Details */}
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Order Details</h3>
            <div className="grid gap-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-mono text-sm font-semibold">#{result.orderId}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="text-xl font-serif font-semibold">{formattedAmount}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Email</span>
                <span className="text-sm">{session.customer_email}</span>
              </div>
            </div>
          </div>

          {/* Email Confirmation Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Receipt Sent</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                A confirmation email with your order details and receipt has been sent to{" "}
                <span className="font-medium">{session.customer_email}</span>
              </p>
            </div>
          </div>

          {/* What's Next */}
          <div className="space-y-3">
            <h3 className="font-semibold">What happens next?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>We'll send you a shipping confirmation email with tracking information once your order ships</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>You can track your order status anytime from your account dashboard</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>Questions? Contact our support team - we're here to help</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1" size="lg">
              <Link href={`/account/orders/${result.orderId}`}>
                <Package className="h-4 w-4 mr-2" />
                View Order Details
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent" size="lg">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
