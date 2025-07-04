# Profitra - Investment Platform

A modern cryptocurrency investment platform built with React, TypeScript, TailwindCSS, and Supabase.

## Features

### User Authentication
- Registration with email verification
- Login/logout functionality
- Profile management with wallet addresses
- Password reset flow

### Investment System
- 4 investment plans (Starter, Silver, Gold, Platinum)
- Manual deposit system with admin confirmation
- Investment tracking with countdown timers
- Reinvestment capabilities
- Transaction history

### Admin Panel
- User management
- Deposit confirmation system
- Investment plan management
- Transaction monitoring

### Security
- JWT-based authentication
- Protected routes
- Admin-only access controls
- Secure authentication flow

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Backend**: Supabase (Database, Authentication, Real-time)
- **Routing**: React Router v6
- **Notifications**: React Toastify
- **Icons**: Lucide React

## Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables (see above)

4. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

The application uses Supabase for backend services including:

- **users**: User profiles with wallet addresses and balances
- **investment_plans**: Available investment plans
- **investments**: User investments with ROI tracking
- **deposit_requests**: Deposit requests awaiting admin confirmation
- **transactions**: All financial transactions

### Default Investment Plans

1. **Starter**: $50-$1,000, 5% ROI in 24 hours
2. **Silver**: $1,000-$4,990, 10% ROI in 48 hours
3. **Gold**: $5,000-$10,000, 15% ROI in 72 hours
4. **Platinum**: $10,000+, 20% ROI in 7 days

## Admin Setup

1. Register a new account through the frontend
2. In your Supabase dashboard, find the user record and set `is_admin` to `true`
3. Log out and log back in
4. Access admin panel at `/admin`

## Routes

- `/` - Homepage
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/dashboard` - User dashboard (protected)
- `/admin` - Admin panel (admin only)

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider (Netlify, Vercel, etc.)

3. Set up environment variables on your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.