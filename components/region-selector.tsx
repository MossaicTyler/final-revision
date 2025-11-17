"use client"

import { useRegion } from "@/contexts/region-context"
import { REGIONS } from "@/lib/regions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from 'lucide-react'

export function RegionSelector() {
  const { region, setRegion } = useRegion()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{region.flag}</span>
          <span className="hidden md:inline">{region.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {REGIONS.map((r) => (
          <DropdownMenuItem
            key={r.code}
            onClick={() => setRegion(r.code)}
            className={`cursor-pointer ${region.code === r.code ? "bg-muted" : ""}`}
          >
            <span className="mr-2">{r.flag}</span>
            <span className="flex-1">{r.name}</span>
            <span className="text-xs text-muted-foreground">{r.currencySymbol}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
