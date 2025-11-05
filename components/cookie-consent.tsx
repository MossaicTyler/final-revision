"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Cookie } from "lucide-react"

export function CookieConsent() {
  const [mounted, setMounted] = useState(false)
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (consent) {
      setShowBanner(false)
    }
    setMounted(true)
  }, [])

  if (!mounted) return null

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setShowBanner(false)
  }

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined")
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none">
      <Card className="max-w-4xl mx-auto p-4 sm:p-6 shadow-2xl border-border/50 pointer-events-auto bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-semibold text-base sm:text-lg">We value your privacy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use essential cookies to ensure our website functions properly and to provide you with the best
                shopping experience. These cookies are necessary for cart functionality, secure checkout, and
                remembering your preferences.
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto sm:flex-shrink-0">
            <Button variant="outline" onClick={declineCookies} className="flex-1 sm:flex-none bg-transparent">
              Decline
            </Button>
            <Button onClick={acceptCookies} className="flex-1 sm:flex-none">
              Accept
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
