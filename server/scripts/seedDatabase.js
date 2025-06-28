import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import InvestmentPlan from '../models/InvestmentPlan.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await InvestmentPlan.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@profitra.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      btcWallet: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      usdtWallet: '0x742D35Cc6634C0532925a3b8D49D6b5A0e65e8C6',
      isAdmin: true,
      balance: 10000,
      isEmailVerified: true,
    });

    console.log('Created admin user:', adminUser.email);

    // Create test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@profitra.com',
      password: 'test123',
      btcWallet: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      usdtWallet: '0x8ba1f109551bD432803012645Hac136c22C501e',
      balance: 1000,
      isEmailVerified: true,
    });

    console.log('Created test user:', testUser.email);

    // Create investment plans
    const plans = [
      {
        name: 'Starter',
        minAmount: 50,
        maxAmount: 1000,
        roi: 5,
        durationHours: 24,
        description: 'Perfect for beginners looking to start their investment journey with low risk and guaranteed returns.',
        features: ['24/7 Support', 'Instant Activation', 'Low Risk'],
      },
      {
        name: 'Silver',
        minAmount: 1000,
        maxAmount: 4990,
        roi: 10,
        durationHours: 48,
        description: 'Enhanced returns for intermediate investors seeking balanced growth over 48 hours.',
        features: ['Priority Support', 'Higher Returns', 'Medium Risk'],
      },
      {
        name: 'Gold',
        minAmount: 5000,
        maxAmount: 10000,
        roi: 15,
        durationHours: 72,
        description: 'Premium investment plan with excellent returns for serious investors over 3 days.',
        features: ['VIP Support', 'Premium Returns', 'Calculated Risk'],
        popularity: 1,
      },
      {
        name: 'Platinum',
        minAmount: 10000,
        maxAmount: 100000,
        roi: 20,
        durationHours: 168,
        description: 'Exclusive plan for high-value investors offering maximum returns over one week.',
        features: ['Dedicated Manager', 'Maximum Returns', 'Strategic Risk'],
      },
    ];

    const createdPlans = await InvestmentPlan.insertMany(plans);
    console.log(`Created ${createdPlans.length} investment plans`);

    console.log('\n=== Database Seeded Successfully ===');
    console.log('Admin Login:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('\nTest User Login:');
    console.log(`Email: ${testUser.email}`);
    console.log('Password: test123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();