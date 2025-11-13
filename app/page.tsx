"use client"

import { PRODUCTS, getAllCategories } from "@/lib/products"
import { ProductCard } from "@/components/product-card"
import { useState, useRef, useEffect, Suspense } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminAccessError } from "@/components/admin-access-error"

const PRODUCTS_PER_PAGE = 6

export default function Home() {
  const categories = getAllCategories()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const heroRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const filteredProducts = selectedCategory
    ? selectedCategory === "Sale"
      ? PRODUCTS.filter((product) => product.onSale)
      : PRODUCTS.filter((product) => product.category === selectedCategory)
    : PRODUCTS

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const endIndex = startIndex + PRODUCTS_PER_PAGE
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "reknur",
    description:
      "Discover exceptional, handcrafted plushies curated for those who appreciate quality and limited-edition collectibles",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://www.rezzyfrier.vercel.app",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.rezzyfrier.vercel.app"}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  useEffect(() => {
    const animateHeroText = () => {
      // Title appears first
      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.style.opacity = "1"
          titleRef.current.style.transform = "translateY(0)"
        }
      }, 300)

      // Subtitle appears second
      setTimeout(() => {
        if (subtitleRef.current) {
          subtitleRef.current.style.opacity = "1"
          subtitleRef.current.style.transform = "translateY(0)"
        }
      }, 900)

      // Button appears last
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.style.opacity = "1"
          buttonRef.current.style.transform = "translateY(0)"
        }
      }, 1500)
    }

    animateHeroText()
  }, [])

  const scrollToProducts = () => {
    const productsSection = document.getElementById("products-section")
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="min-h-screen bg-background">
        {/* Admin Access Error Message */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Suspense fallback={null}>
            <AdminAccessError />
          </Suspense>
        </div>

        {/* Hero Banner */}
        <section
          ref={heroRef}
          className="border-b border-border/50 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 text-center relative z-10">
            <h2
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-7xl font-serif mb-6 sm:mb-8 text-balance leading-tight transition-all duration-700 ease-out"
              style={{ opacity: 0, transform: "translateY(30px)" }}
            >
              Collectible Plushies, Crafted with Care
            </h2>
            <p
              ref={subtitleRef}
              className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8 transition-all duration-700 ease-out"
              style={{ opacity: 0, transform: "translateY(30px)" }}
            >
              A carefully curated collection of limited-edition plushies, each handcrafted for collectors who appreciate
              quality, whimsy, and extraordinary design.
            </p>
            <button
              ref={buttonRef}
              onClick={scrollToProducts}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all duration-700 ease-out hover:scale-105"
              style={{ opacity: 0, transform: "translateY(30px)" }}
            >
              Explore Collection
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Decorative gradient orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        </section>

        {/* Categories Section */}
        <section className="border-b border-border/50 sticky top-[65px] z-50 bg-background/98 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-2">
            <div className="flex justify-center gap-2 sm:gap-3 lg:gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium tracking-wider uppercase whitespace-nowrap border rounded-full transition-all duration-300 ${
                  selectedCategory === null
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border/50 hover:border-primary/50 hover:bg-muted"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium tracking-wider uppercase whitespace-nowrap border rounded-full transition-all duration-300 ${
                    selectedCategory === category
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border/50 hover:border-primary/50 hover:bg-muted"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section id="products-section" className="py-12 sm:py-16 lg:py-20 scroll-mt-[145px]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {currentProducts.map((product, index) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 mt-16 sm:mt-20 lg:mt-24 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
              <div className="sm:col-span-2 lg:col-span-1">
                <h3 className="text-2xl sm:text-3xl font-serif mb-4">reknur</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
                  Curating exceptional limited-edition plushies for collectors who appreciate craftsmanship and unique
                  designs.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 tracking-wider uppercase text-sm">About</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="/about/story" className="hover:text-foreground transition-colors">
                      Our Story
                    </a>
                  </li>
                  <li>
                    <a href="/about/artisans" className="hover:text-foreground transition-colors">
                      Artisans
                    </a>
                  </li>
                  <li>
                    <a href="/about/sustainability" className="hover:text-foreground transition-colors">
                      Sustainability
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 tracking-wider uppercase text-sm">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="/support/contact" className="hover:text-foreground transition-colors">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="/support/shipping" className="hover:text-foreground transition-colors">
                      Shipping
                    </a>
                  </li>
                  <li>
                    <a href="/support/returns" className="hover:text-foreground transition-colors">
                      Returns
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
              <p>&copy; 2025 reknur. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
