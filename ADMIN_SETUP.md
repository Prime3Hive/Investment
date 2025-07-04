# Admin Dashboard Setup Guide

**Note**: This document contains instructions for the previous Supabase implementation. The platform has been migrated to use Node.js/Express with MongoDB. These instructions need to be updated for the new backend.

## Current Setup (MongoDB Backend)

### Step 1: Create Admin Account

1. Go to `/register` and create a new account with:
   - **Email**: `admin@profitra.com` (or any email you prefer)
   - **Name**: `Admin User`
   - **Password**: Choose a secure password
   - **BTC Wallet**: Any valid BTC address
   - **USDT Wallet**: Any valid USDT address

2. Complete the registration process

### Step 2: Set Admin Privileges

You need to manually update the MongoDB database to grant admin privileges:

1. Connect to your MongoDB database
2. Find the user document in the `users` collection
3. Update the `isAdmin` field to `true`:

```javascript
db.users.updateOne(
  { email: "admin@profitra.com" },
  { $set: { isAdmin: true } }
)
```

### Step 3: Access Admin Dashboard

1. **Log out** if currently logged in
2. **Log back in** with your admin account
3. Navigate to `/admin` or use the "Admin" link in the navigation

## Admin Dashboard Features

Once you have admin access, you can:

- ✅ **View Overview**: See total users, deposits, investments, and pending requests
- ✅ **Manage Users**: View all registered users and their details
- ✅ **Process Deposits**: Approve or reject deposit requests
- ✅ **Handle Withdrawals**: Approve, complete, or reject withdrawal requests
- ✅ **Manage Investment Plans**: Create, edit, or delete investment plans

## Verification

To verify admin access is working:

1. Check that the navigation shows an "Admin" link
2. Visit `/admin` - you should see the admin dashboard
3. If you see "Access Denied" or get redirected, the admin flag isn't set correctly

## Troubleshooting

**Problem**: Can't access `/admin` route
**Solution**: 
- Verify `isAdmin` is set to `true` in the users collection
- Log out and log back in to refresh the user session
- Check browser console for any errors

**Problem**: Admin link doesn't appear in navigation
**Solution**:
- The admin link only appears when `user.isAdmin` is `true`
- Verify the database update was successful
- Clear browser cache and refresh

## Security Notes

- Only grant admin privileges to trusted users
- Use strong passwords for admin accounts
- Consider using a dedicated admin email domain
- Regularly audit admin access and remove when no longer needed

---

## Legacy Supabase Instructions (Deprecated)

The following instructions were for the previous Supabase implementation and are kept for reference only:

### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **profiles**
3. Find your user record
4. Edit the `is_admin` column and set it to `true`
5. Save the changes

### Option B: Using SQL Query
Run this SQL query in the Supabase SQL Editor:

```sql
-- Replace 'admin@profitra.com' with your actual admin email
UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'admin@profitra.com'
);
```