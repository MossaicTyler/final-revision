export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6 text-balance">Shipping Information</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>
              We ship worldwide and offer several shipping options to meet your needs. All orders are carefully packaged
              to ensure your items arrive in perfect condition.
            </p>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Shipping Options</h2>

            <div className="bg-muted/30 p-6 rounded-lg space-y-4 not-prose">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Standard Shipping (5-7 business days)</h3>
                <p className="text-sm">Free on orders over £150</p>
                <p className="text-sm">£12 on orders under £150</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Express Shipping (2-3 business days)</h3>
                <p className="text-sm">£25 flat rate</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Overnight Shipping (1 business day)</h3>
                <p className="text-sm">£45 flat rate</p>
              </div>
            </div>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">International Shipping</h2>
            <p>
              We ship to most countries worldwide. International shipping times vary by destination but typically range
              from 7-14 business days. Customs duties and taxes may apply and are the responsibility of the recipient.
            </p>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Order Tracking</h2>
            <p>
              Once your order ships, you'll receive a tracking number via email. You can track your package in real-time
              through our shipping partners.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
