# Profitra - Investment Platform

A complete cryptocurrency investment platform built with React, TypeScript, TailwindCSS, and Node.js/Express with MongoDB.

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
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT tokens
- **Routing**: React Router v6
- **Notifications**: React Toastify
- **Icons**: Lucide React

## Environment Setup

### Frontend (.env)
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (server/.env)
Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/profitra
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

4. Set up your environment variables (see above)

5. Start MongoDB (make sure MongoDB is running on your system)

6. Seed the database with default investment plans:
   ```bash
   cd server
   npm run seed
   ```

7. Start the backend server:
   ```bash
   cd server
   npm start
   ```

8. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Database Schema

### Collections

- **users**: User profiles with wallet addresses and balances
- **investmentplans**: Available investment plans
- **investments**: User investments with ROI tracking
- **depositrequests**: Deposit requests awaiting admin confirmation
- **transactions**: All financial transactions

### Default Investment Plans

1. **Starter**: $50-$1,000, 5% ROI in 24 hours
2. **Silver**: $1,000-$4,990, 10% ROI in 48 hours
3. **Gold**: $5,000-$10,000, 15% ROI in 72 hours
4. **Platinum**: $10,000+, 20% ROI in 7 days

## Admin Setup

1. Register a new account through the frontend
2. In your MongoDB database, find the user document and set `isAdmin` to `true`
3. Log out and log back in
4. Access admin panel at `/admin`

## Routes

- `/` - Homepage
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/dashboard` - User dashboard (protected)
- `/admin` - Admin panel (admin only)

## Deployment

### Frontend
1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider

3. Set up environment variables on your hosting platform

### Backend
1. Deploy to your preferred hosting service (Heroku, DigitalOcean, etc.)
2. Set up environment variables
3. Ensure MongoDB is accessible from your hosting environment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.