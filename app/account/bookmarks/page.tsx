import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getBookmarkedProducts } from "@/app/actions/bookmarks"
import { getProductById } from "@/lib/products"
import { ProductCard } from "@/components/product-card"

export const metadata = {
  title: "Saved Products | reknur",
  description: "View your saved products and wishlist",
}

export default async function BookmarksPage() {
  const session = await getSession()

  if (!session?.userId) {
    redirect("/")
  }

  const { products: bookmarkedIds } = await getBookmarkedProducts()
  const bookmarkedProducts = bookmarkedIds
    .map((id) => getProductById(id as string))
    .filter((product) => product !== undefined)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif mb-2">Saved Products</h1>
        <p className="text-muted-foreground">Your collection of favorite items</p>
      </div>

      {bookmarkedProducts.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="text-6xl opacity-20">💝</div>
          <h2 className="text-2xl font-serif">No saved products yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start exploring our collection and save your favorites for later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
