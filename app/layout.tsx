import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Header } from "@/components/header"
import { getCurrentUser } from "@/lib/auth"
import { getCartItemCount, getCart } from "@/app/actions/cart"
import { PRODUCTS } from "@/lib/products"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { CookieConsent } from "@/components/cookie-consent"
import { RegionProvider } from "@/contexts/region-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

export const metadata: Metadata = {
  ...(baseUrl && baseUrl !== "http://localhost:3000" ? { metadataBase: new URL(baseUrl) } : {}),
  title: {
    default: "reknur - Curated Excellence in Luxury Goods",
    template: "%s | reknur",
  },
  description:
    "Discover exceptional, handcrafted luxury items curated for those who appreciate quality and craftsmanship. Shop premium home goods, accessories, and artisan products.",
  keywords: [
    "luxury goods",
    "handcrafted items",
    "artisan products",
    "premium home goods",
    "curated shopping",
    "quality craftsmanship",
  ],
  authors: [{ name: "reknur" }],
  creator: "reknur",
  publisher: "reknur",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "reknur",
    title: "reknur - Curated Excellence in Luxury Goods",
    description:
      "Discover exceptional, handcrafted luxury items curated for those who appreciate quality and craftsmanship.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "reknur - Curated Excellence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "reknur - Curated Excellence in Luxury Goods",
    description:
      "Discover exceptional, handcrafted luxury items curated for those who appreciate quality and craftsmanship.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  generator: 'v0.app'
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner size="large" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()
  const cartItemCount = await getCartItemCount()
  const cartItems = await getCart()
  const enrichedCartItems = cartItems.map((item) => {
    const product = PRODUCTS.find((p) => p.id === item.product_id)
    return {
      ...item,
      product,
    }
  })

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (systemDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <RegionProvider>
            <Suspense fallback={<PageLoader />}>
              <Header user={user} cartItemCount={cartItemCount} cartItems={enrichedCartItems} />
            </Suspense>
            {children}
            <CookieConsent />
            <Analytics />
          </RegionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
