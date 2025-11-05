"use client"

import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Shield } from "lucide-react"

export function AdminAccessError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const authRequired = searchParams.get("auth")
  const userEmail = searchParams.get("email")
  const adminEmails = searchParams.get("adminEmails")

  if (error === "unauthorized") {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Admin Access Denied</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>You don't have permission to access the admin dashboard.</p>

          {userEmail && (
            <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm">
              <p className="font-semibold mb-2">Current Status:</p>
              <div className="space-y-1 text-muted-foreground">
                <p>
                  <span className="font-medium">Your email:</span>{" "}
                  <code className="bg-background px-1 py-0.5 rounded">{userEmail}</code>
                </p>
                {adminEmails && (
                  <p>
                    <span className="font-medium">Configured admin emails:</span>{" "}
                    <code className="bg-background px-1 py-0.5 rounded">{adminEmails || "None"}</code>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm">
            <p className="font-semibold mb-1">To grant admin access:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>
                Go to the <strong>Vars</strong> section in the v0 sidebar
              </li>
              <li>
                Find or add: <code className="bg-background px-1 py-0.5 rounded">ADMIN_EMAILS</code>
              </li>
              <li>
                Set the value to:{" "}
                <code className="bg-background px-1 py-0.5 rounded">{userEmail || "your-email@example.com"}</code>
              </li>
              <li>Save and refresh the page</li>
            </ol>
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            💡 Tip: For multiple admins, separate emails with commas (e.g., admin1@example.com,admin2@example.com)
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  if (authRequired === "admin") {
    return (
      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertTitle>Admin Login Required</AlertTitle>
        <AlertDescription>Please log in with an admin account to access the admin dashboard.</AlertDescription>
      </Alert>
    )
  }

  return null
}
