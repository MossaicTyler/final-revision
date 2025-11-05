"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateEmailPreferences } from "@/app/actions/account"

interface EmailPreferencesProps {
  preferences: {
    marketing_emails: boolean
    order_updates: boolean
  }
}

export function EmailPreferences({ preferences }: EmailPreferencesProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [marketingEmails, setMarketingEmails] = useState(preferences.marketing_emails)
  const [orderUpdates, setOrderUpdates] = useState(preferences.order_updates)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append("marketingEmails", marketingEmails.toString())
    formData.append("orderUpdates", orderUpdates.toString())

    const result = await updateEmailPreferences(formData)

    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: "Email preferences updated successfully" })
    }

    setLoading(false)
  }

  return (
    <div className="border border-border/50 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-serif">Email Preferences</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing">Marketing Emails</Label>
            <p className="text-sm text-muted-foreground">Receive updates about new products and special offers</p>
          </div>
          <Switch id="marketing" checked={marketingEmails} onCheckedChange={setMarketingEmails} disabled={loading} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="orders">Order Updates</Label>
            <p className="text-sm text-muted-foreground">Receive notifications about your order status</p>
          </div>
          <Switch id="orders" checked={orderUpdates} onCheckedChange={setOrderUpdates} disabled={loading} />
        </div>

        {message && (
          <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>{message.text}</p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </form>
    </div>
  )
}
