import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Mail } from "lucide-react"

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; success?: string }>
}) {
  const params = await searchParams
  const email = params.email
  const success = params.success === "true"

  async function handleUnsubscribe(formData: FormData) {
    "use server"

    const email = formData.get("email") as string

    if (!email) {
      return
    }

    try {
      await sql`
        INSERT INTO email_preferences (email, marketing_emails, order_updates, unsubscribed_at, updated_at)
        VALUES (${email}, false, true, NOW(), NOW())
        ON CONFLICT (email)
        DO UPDATE SET
          marketing_emails = false,
          unsubscribed_at = NOW(),
          updated_at = NOW()
      `
    } catch (error) {
      console.error("[v0] Unsubscribe error:", error)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-serif">Successfully Unsubscribed</CardTitle>
            <CardDescription>You've been removed from our marketing emails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              You will no longer receive marketing emails from reknur. You'll still receive important order updates and
              transactional emails.
            </p>
            <p className="text-sm text-muted-foreground">
              You can update your email preferences anytime from your account settings.
            </p>
            <Button asChild className="w-full">
              <a href="/">Return to Homepage</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-serif">Unsubscribe from Emails</CardTitle>
          <CardDescription>We're sorry to see you go</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUnsubscribe} className="space-y-4">
            <input type="hidden" name="email" value={email || ""} />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Clicking unsubscribe will remove you from our marketing emails. You'll still receive important order
                updates.
              </p>
              {email && (
                <p className="text-sm font-medium">
                  Email: <span className="text-muted-foreground">{email}</span>
                </p>
              )}
            </div>
            <Button type="submit" variant="destructive" className="w-full" formAction={`?email=${email}&success=true`}>
              Unsubscribe from Marketing Emails
            </Button>
            <Button type="button" variant="outline" className="w-full bg-transparent" asChild>
              <a href="/">Cancel</a>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
