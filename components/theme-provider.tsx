"use client"

import type React from "react"
import { useEffect, useState } from "react"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }

    // Use addEventListener for better browser compatibility
    mediaQuery.addEventListener("change", handleThemeChange)

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange)
    }
  }, [])

  if (!mounted) return <>{children}</>

  return <>{children}</>
}
