export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6 text-balance">Returns & Exchanges</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>
              We want you to love your purchase. If you're not completely satisfied, we offer a 30-day return policy for
              most items.
            </p>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Return Policy</h2>
            <p>
              Items must be returned within 30 days of delivery in their original condition with all tags and packaging
              intact. Custom or personalized items cannot be returned unless defective.
            </p>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">How to Return</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Contact our customer service team at hello@reknur.com to initiate a return</li>
              <li>We'll provide you with a prepaid return shipping label</li>
              <li>Pack the item securely in its original packaging</li>
              <li>Drop off the package at any authorized shipping location</li>
              <li>Once we receive and inspect the item, we'll process your refund within 5-7 business days</li>
            </ol>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Exchanges</h2>
            <p>
              If you'd like to exchange an item for a different size, color, or product, please contact us. We'll help
              facilitate the exchange and cover any price differences.
            </p>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Damaged or Defective Items</h2>
            <p>
              If your item arrives damaged or defective, please contact us immediately with photos. We'll arrange for a
              replacement or full refund at no cost to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
