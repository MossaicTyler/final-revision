import { getCurrentUser, getCurrentUserWithDetails } from "@/lib/auth"
import { getUserAddresses } from "@/app/actions/account"
import { ProfileSettings } from "@/components/profile-settings"
import { AddressSettings } from "@/components/address-settings"
import { AccountDeletion } from "@/components/account-deletion"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  const userDetails = await getCurrentUserWithDetails()
  const addresses = await getUserAddresses()

  if (!user) {
    return null
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif">Account Settings</h2>

      <ProfileSettings user={user} />
      <AddressSettings addresses={addresses} />
      <AccountDeletion hasOAuthProvider={!!userDetails?.oauth_provider} />
    </div>
  )
}
