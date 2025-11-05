export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6 text-balance">Contact Us</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>
              We're here to help with any questions about our products, orders, or services. Our customer support team
              typically responds within 24 hours.
            </p>

            <div className="bg-muted/30 p-6 rounded-lg space-y-4 not-prose">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Email</h3>
                <a href="mailto:hello@reknur.com" className="text-primary hover:underline">
                  hello@reknur.com
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                <a href="tel:+1-555-REKNUR" className="text-primary hover:underline">
                  +1 (555) REKNUR
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Hours</h3>
                <p className="text-sm">Monday - Friday: 9am - 6pm EST</p>
                <p className="text-sm">Saturday - Sunday: 10am - 4pm EST</p>
              </div>
            </div>

            <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Frequently Asked Questions</h2>
            <p>
              Before reaching out, you may find answers to common questions in our FAQ section. We cover topics like
              shipping times, returns, product care, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
