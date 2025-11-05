# Admin Dashboard Access

## Overview

The admin dashboard is secured using the `ADMIN_EMAILS` environment variable. Only users whose email addresses are listed in this variable can access admin routes.

## How to Access the Admin Dashboard

### Step 1: Create Your Account

1. Go to the website homepage
2. Click "Sign Up" or "Login"
3. Create an account with your email and password
4. Verify your email address

### Step 2: Grant Admin Access

Add your email to the `ADMIN_EMAILS` environment variable:

1. Go to the **Vars** section in the v0 in-chat sidebar (left side of screen)
2. Add a new environment variable:
   - **Name**: `ADMIN_EMAILS`
   - **Value**: Your email address (e.g., `admin@reknur.com`)
   - For multiple admins: `admin@reknur.com,manager@reknur.com,owner@reknur.com`
3. Save the changes (the app will automatically reload)

**Important:** Email addresses are case-sensitive and must match exactly with your account email.

### Step 3: Access the Dashboard

1. Log in with your account
2. Navigate to `/admin/orders`
3. You should now see the admin dashboard

## Admin Dashboard Features

### Orders Management (`/admin/orders`)

- View all orders with search and filtering
- Filter by status: All, Pending, Processing, Shipped, Delivered, Cancelled
- Search by order ID, customer email, or tracking number
- Real-time order statistics
- Click on any order to view details and add tracking information

### Order Details (`/admin/orders/[id]`)

- View complete order information
- Add/update tracking information:
  - Tracking number
  - Carrier (USPS, FedEx, UPS, DHL, Other)
  - Estimated delivery date
  - Shipping notes
- Update order status
- View tracking timeline and status history
- See encrypted customer data (shipping address, contact info)

### Bulk Upload

- Upload CSV file with tracking information for multiple orders
- CSV format: `order_id,tracking_number,carrier,estimated_delivery,notes`
- Automatically updates multiple orders at once
- Validation and error reporting for each row

## Finding Your Account Email

If you forgot which email you used to sign up:

1. **Check your email inbox** for verification emails from `noreply@notifiers.reknur.com`
2. **Check the browser console** when you try to access `/admin/orders` - it will log your current email
3. **Query the database** (if you have access):
   \`\`\`sql
   SELECT email, name, created_at FROM users ORDER BY created_at DESC LIMIT 10;
   \`\`\`

## Environment Variables

Make sure these are set in the **Vars** section of the in-chat sidebar:

### Required:
- `RESEND_API_KEY` - For sending emails
- `NEON_NEON_DATABASE_URL` - Database connection
- `JWT_SECRET` - For session management
- `ENCRYPTION_KEY` - For encrypting sensitive data
- `ADMIN_EMAILS` - Comma-separated list of admin email addresses

### Optional:
- `RESEND_AUDIENCE_ID` - For syncing contacts to Resend audience (get this from your Resend dashboard under Audiences)
- `NEXT_PUBLIC_BASE_URL` - Base URL for email links (defaults to localhost in development)

## Resend Audience Integration

When `RESEND_AUDIENCE_ID` is set, the system automatically:
- Adds new users to your Resend audience when they sign up
- Syncs customer emails when orders are placed
- Respects unsubscribe preferences

To get your Audience ID:
1. Go to your Resend dashboard
2. Navigate to Audiences
3. Create or select an audience
4. Copy the Audience ID
5. Add it to your environment variables as `RESEND_AUDIENCE_ID`

## Security Notes

- Admin access is controlled by the `ADMIN_EMAILS` environment variable
- Only users with verified email addresses can access admin routes
- All admin actions are logged in the console for debugging
- Middleware validates admin status on every request to `/admin/*` routes
- Customer data is encrypted in the database for security

## Troubleshooting

### "Admin Access Denied" Error

If you see this error on the homepage after trying to access `/admin/orders`:

1. **Check the browser console** - It will show which email you're logged in with
2. **Verify ADMIN_EMAILS** - Make sure your email is in the environment variable (check the Vars section)
3. **Check for typos** - Email addresses must match exactly (case-sensitive)
4. **Log out and log back in** - Sometimes the session needs to refresh

### "Login Required" Message

If you see `/?auth=admin`:

1. You're not logged in
2. Click the login button and sign in with an admin account

### Emails Not Sending

1. Verify `RESEND_API_KEY` is set in environment variables
2. Confirm `notifiers.reknur.com` is verified in your Resend dashboard
3. Check the console logs for detailed Resend error messages

### Audience Sync Not Working

1. Verify `RESEND_AUDIENCE_ID` is set (optional feature)
2. Check that the Audience ID is correct in your Resend dashboard
3. Review console logs for sync errors (non-blocking, won't prevent emails)

### Database Migration Issues

If you see errors about missing columns (like `is_admin`):

1. The database migration scripts need to be run
2. In v0, SQL scripts in the `/scripts` folder should run automatically
3. If they don't, you can run them manually in your Neon database console
4. Run scripts in order: `001_create_tables.sql`, `002_create_users_table.sql`, etc.

## Quick Reference

**To grant admin access:**
1. Add email to `ADMIN_EMAILS` environment variable in Vars section
2. Format: `email1@example.com,email2@example.com`
3. Log in with that email
4. Navigate to `/admin/orders`

**To revoke admin access:**
1. Remove email from `ADMIN_EMAILS` environment variable
2. User will be denied access on next request
