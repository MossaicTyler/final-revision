"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Trash2 } from "lucide-react"
import { deleteAccount } from "@/app/actions/account"
import { useRouter } from "next/navigation"

export function AccountDeletion({ hasOAuthProvider }: { hasOAuthProvider: boolean }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await deleteAccount(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/?deleted=true")
    }
  }

  return (
    <div className="border border-red-200 rounded-lg p-6 space-y-4 bg-red-50/50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-xl font-serif text-red-900">Delete Account</h3>
          <p className="text-sm text-red-700 mt-1">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our
              servers. Your order history will be anonymized but preserved for record-keeping.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> All your personal information, addresses, and preferences will be permanently
                deleted.
              </AlertDescription>
            </Alert>

            {!hasOAuthProvider && (
              <div className="space-y-2">
                <Label htmlFor="password">Confirm your password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={loading}
                  placeholder="Enter your password"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirmation">Type DELETE to confirm</Label>
              <Input
                id="confirmation"
                name="confirmation"
                type="text"
                required
                disabled={loading}
                placeholder="DELETE"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="confirm" checked={confirmed} onCheckedChange={(checked) => setConfirmed(!!checked)} />
              <label
                htmlFor="confirm"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand this action is permanent and cannot be undone
              </label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={loading || !confirmed}>
                {loading ? "Deleting..." : "Delete Account Permanently"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
