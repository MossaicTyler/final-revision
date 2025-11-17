import { REGIONS } from "@/lib/regions"
import { PRODUCTS } from "@/lib/products"

export default async function AdminRegionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold mb-2">Regional Settings</h1>
        <p className="text-muted-foreground">Manage regional pricing and translations for products</p>
      </div>

      {/* Regions Overview */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Available Regions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REGIONS.map((region) => (
            <div key={region.code} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{region.flag}</span>
                <span className="text-sm font-mono text-muted-foreground">{region.code}</span>
              </div>
              <h3 className="font-semibold">{region.name}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Currency: {region.currency} ({region.currencySymbol})</p>
                <p>Locale: {region.locale}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products with Regional Pricing */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Products with Regional Pricing</h2>
        <div className="space-y-6">
          {PRODUCTS.filter((p) => p.regionalPricing).map((product) => (
            <div key={product.id} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">{product.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="text-sm">
                  <div className="font-medium text-muted-foreground mb-1">GB (Default)</div>
                  <div>£{(product.priceInCents / 100).toFixed(2)}</div>
                </div>
                {Object.entries(product.regionalPricing || {}).map(([regionCode, data]) => {
                  const region = REGIONS.find((r) => r.code === regionCode)
                  return (
                    <div key={regionCode} className="text-sm">
                      <div className="font-medium text-muted-foreground mb-1">
                        {region?.flag} {regionCode}
                      </div>
                      <div>
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
      </div>

      {/* Instructions */}
      <div className="rounded-lg border bg-muted/50 p-6">
        <h2 className="text-lg font-semibold mb-2">How to Add Regional Pricing</h2>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            To add regional pricing to a product, edit the <code className="px-1 py-0.5 bg-muted rounded">lib/products.ts</code> file and add a <code className="px-1 py-0.5 bg-muted rounded">regionalPricing</code> object to the product:
          </p>
          <pre className="bg-background p-4 rounded-lg overflow-x-auto text-xs mt-3">
            {`regionalPricing: {
  US: { price: 3200, name: "Product Name", description: "Description" },
  EU: { price: 2900, name: "Produktname", description: "Beschreibung" },
  // Add more regions as needed
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
