import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-serif text-muted-foreground">404</h1>
          <h2 className="text-2xl font-serif">Product Not Found</h2>
          <p className="text-muted-foreground">
            We couldn't find the product you're looking for. It may have been removed or is currently unavailable.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Search className="h-4 w-4 mr-2" />
              Browse Collection
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
