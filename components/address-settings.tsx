"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addAddress, updateAddress, deleteAddress } from "@/app/actions/account"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Address } from "@/lib/db"

interface AddressSettingsProps {
  addresses: Address[]
}

export function AddressSettings({ addresses }: AddressSettingsProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  function handleAddNew() {
    setEditingAddress(null)
    setDialogOpen(true)
  }

  function handleEdit(address: Address) {
    setEditingAddress(address)
    setDialogOpen(true)
  }

  return (
    <div className="border border-border/50 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-serif">Saved Addresses</h3>
        <Button onClick={handleAddNew} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No saved addresses yet</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div key={address.id} className="border border-border/50 rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium uppercase text-muted-foreground">{address.type}</span>
                    {address.is_default && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                    )}
                  </div>
                  <p className="font-medium">{address.full_name}</p>
                  <p className="text-sm text-muted-foreground">{address.address_line1}</p>
                  {address.address_line2 && <p className="text-sm text-muted-foreground">{address.address_line2}</p>}
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p className="text-sm text-muted-foreground">{address.country}</p>
                  {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(address)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this address?")) {
                        await deleteAddress(address.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressDialog open={dialogOpen} onOpenChange={setDialogOpen} address={editingAddress} />
    </div>
  )
}

function AddressDialog({
  open,
  onOpenChange,
  address,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: Address | null
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = address ? await updateAddress(address.id, formData) : await addAddress(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onOpenChange(false)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">{address ? "Edit Address" : "Add New Address"}</DialogTitle>
          <DialogDescription>Fill in the address details below</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Address Type</Label>
            <Select name="type" defaultValue={address?.type || "shipping"} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shipping">Shipping</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={address?.full_name || ""}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              type="text"
              defaultValue={address?.address_line1 || ""}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
            <Input
              id="addressLine2"
              name="addressLine2"
              type="text"
              defaultValue={address?.address_line2 || ""}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" type="text" defaultValue={address?.city || ""} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                type="text"
                defaultValue={address?.state || ""}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                type="text"
                defaultValue={address?.postal_code || ""}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                type="text"
                defaultValue={address?.country || "US"}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={address?.phone || ""} disabled={loading} />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              value="true"
              defaultChecked={address?.is_default || false}
              disabled={loading}
              className="rounded border-border"
            />
            <Label htmlFor="isDefault" className="cursor-pointer">
              Set as default address
            </Label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : address ? "Update Address" : "Add Address"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
