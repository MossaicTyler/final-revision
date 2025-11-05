export default function ArtisansPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6 text-balance">Our Artisans</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Behind every product in our collection is a skilled artisan dedicated to their craft. We partner with
              makers who share our commitment to quality, sustainability, and ethical production.
            </p>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Master Craftspeople</h2>
            <p>
              Our leather goods are handcrafted by third-generation Italian artisans using traditional techniques passed
              down through generations. Each piece is made to order, ensuring exceptional attention to detail.
            </p>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Sustainable Practices</h2>
            <p>
              We work exclusively with artisans who prioritize sustainable materials and ethical labor practices. From
              responsibly sourced wood to organic textiles, every material is chosen with care.
            </p>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Fair Partnerships</h2>
            <p>
              We believe in fair compensation and long-term partnerships. Our artisans receive fair wages and work in
              safe, respectful environments. When you purchase from reknur, you're supporting skilled craftspeople and
              their communities.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
