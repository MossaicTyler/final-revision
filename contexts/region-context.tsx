"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { detectUserRegion, getRegionByCode, type Region } from "@/lib/regions"
import type { Product } from "@/lib/products"

interface RegionContextType {
  region: Region
  setRegion: (regionCode: string) => void
  getLocalizedProduct: (product: Product) => Product
}

const RegionContext = createContext<RegionContextType | undefined>(undefined)

export function RegionProvider({ children }: { children: ReactNode }) {
  const [regionCode, setRegionCode] = useState<string>("GB")
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check for saved region in localStorage
    const savedRegion = localStorage.getItem("selectedRegion")
    if (savedRegion) {
      setRegionCode(savedRegion)
    } else {
      // Auto-detect region
      const detectedRegion = detectUserRegion()
      setRegionCode(detectedRegion)
    }
    setIsInitialized(true)
  }, [])

  const region = getRegionByCode(regionCode) || getRegionByCode("GB")!

  const setRegion = (newRegionCode: string) => {
    setRegionCode(newRegionCode)
    localStorage.setItem("selectedRegion", newRegionCode)
    window.dispatchEvent(new CustomEvent("regionChanged"))
    // Refresh the page to apply new region
    window.location.reload()
  }

  const getLocalizedProduct = (product: Product): Product => {
    if (!product.regionalPricing || !product.regionalPricing[regionCode]) {
      return product
    }

    const regionalData = product.regionalPricing[regionCode]
    return {
      ...product,
      name: regionalData.name || product.name,
      description: regionalData.description || product.description,
      details: regionalData.details || product.details,
      priceInCents: regionalData.price,
      originalPriceInCents: regionalData.originalPrice || product.originalPriceInCents,
    }
  }

  if (!isInitialized) {
    return null
  }

  return (
    <RegionContext.Provider value={{ region, setRegion, getLocalizedProduct }}>{children}</RegionContext.Provider>
  )
}

export function useRegion() {
  const context = useContext(RegionContext)
  if (!context) {
    throw new Error("useRegion must be used within a RegionProvider")
  }
  return context
}
