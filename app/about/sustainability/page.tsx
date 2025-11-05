export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6 text-balance">Sustainability</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>
              At reknur, sustainability isn't an afterthought—it's fundamental to everything we do. We're committed to
              minimizing our environmental impact while maximizing the quality and longevity of our products.
            </p>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Responsible Materials</h2>
            <p>
              We source materials that are renewable, recycled, or responsibly harvested. Our leather comes from
              tanneries using vegetable-based processes, our wood is FSC-certified, and our textiles are organic or
              recycled.
            </p>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Built to Last</h2>
            <p>
              The most sustainable product is one that doesn't need to be replaced. Every item we offer is designed and
              crafted to last for years, if not generations. We believe in quality over quantity.
            </p>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Minimal Packaging</h2>
            <p>
              Our packaging is minimal, recyclable, and plastic-free. We use recycled cardboard, paper tape, and
              biodegradable materials to protect your items during shipping.
            </p>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Carbon Neutral Shipping</h2>
            <p>
              We offset 100% of our shipping emissions through verified carbon offset programs. Every order ships
              carbon-neutral at no additional cost to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
