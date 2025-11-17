import { REGIONS } from "@/lib/regions"
import { PRODUCTS } from "@/lib/products"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from 'lucide-react'

export default async function AdminRegionsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-6 py-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Regional Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage regional pricing and translations for products</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Regions Overview */}
        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Available Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {REGIONS.map((region) => (
                <div key={region.code} className="border border-border/40 rounded-lg p-4 space-y-2 bg-card/30">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{region.flag}</span>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{region.code}</span>
                  </div>
                  <h3 className="font-semibold">{region.name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Currency: {region.currency} ({region.currencySymbol})</p>
                    <p>Locale: {region.locale}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Products with Regional Pricing */}
        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Products with Regional Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {PRODUCTS.filter((p) => p.regionalPricing).map((product) => (
                <div key={product.id} className="border border-border/40 rounded-lg p-4 bg-card/30">
                  <h3 className="font-semibold mb-3">{product.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="text-sm p-3 bg-muted/50 rounded">
                      <div className="font-medium text-muted-foreground mb-1">🇬🇧 GB (Default)</div>
                      <div className="font-semibold">£{(product.priceInCents / 100).toFixed(2)}</div>
                    </div>
                    {Object.entries(product.regionalPricing || {}).map(([regionCode, data]) => {
                      const region = REGIONS.find((r) => r.code === regionCode)
                      return (
                        <div key={regionCode} className="text-sm p-3 bg-muted/50 rounded">
                          <div className="font-medium text-muted-foreground mb-1">
                            {region?.flag} {regionCode}
                          </div>
                          <div className="font-semibold">
                            {region?.currencySymbol}
                            {(data.price / 100).toFixed(2)}
                          </div>
                          {data.name && data.name !== product.name && (
                            <div className="text-xs text-muted-foreground mt-1">Name: {data.name}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-muted/30 border-border/40">
          <CardHeader>
            <CardTitle className="text-lg font-medium">How to Add Regional Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                To add regional pricing to a product, you can now edit it directly from the{" "}
                <span className="font-semibold text-foreground">Inventory Management</span> page, or edit the{" "}
                <code className="px-1 py-0.5 bg-muted rounded text-xs">lib/products.ts</code> file and add a{" "}
                <code className="px-1 py-0.5 bg-muted rounded text-xs">regionalPricing</code> object to the product:
              </p>
              <pre className="bg-background p-4 rounded-lg overflow-x-auto text-xs mt-3 border border-border/40">
                {`regionalPricing: {
  US: { price: 3200, name: "Product Name", description: "Description" },
  EU: { price: 2900, name: "Produktname", description: "Beschreibung" },
  // Add more regions as needed
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
