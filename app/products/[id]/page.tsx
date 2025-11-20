import { notFound } from "next/navigation"
import { getProductById, PRODUCTS, getProductsByCategory } from "@/lib/products"
import { ProductDetailClient } from "@/components/product-detail-client"
import { getCurrentUser } from "@/lib/auth"
import type { Metadata } from "next"

interface ProductPageProps {
  params: {
    id: string
  }
}

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = getProductById(params.id)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.reknur.com"
  const productUrl = `${baseUrl}/products/${product.id}`
  const firstImage = product.images?.[0] || "/placeholder.svg"

  return {
    title: `${product.name} | reknur`,
    description: product.details || product.description,
    openGraph: {
      title: `${product.name} | reknur`,
      description: product.details || product.description,
      url: productUrl,
      siteName: "reknur",
      images: [
        {
          url: `${baseUrl}${firstImage}`,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | reknur`,
      description: product.details || product.description,
      images: [`${baseUrl}${firstImage}`],
    },
    alternates: {
      canonical: productUrl,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = getProductById(params.id)

  if (!product) {
    notFound()
  }

  const user = await getCurrentUser()
  const isAuthenticated = !!user

  // Get related products from the same category
  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 3)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.details || product.description,
    image: product.images?.map((img) => `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.reknur.com"}${img}`),
    brand: {
      "@type": "Brand",
      name: "reknur",
    },
    offers: {
      "@type": "Offer",
      price: (product.priceInCents / 100).toFixed(2),
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.reknur.com"}/products/${product.id}`,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} isAuthenticated={isAuthenticated} />
    </>
  )
}
