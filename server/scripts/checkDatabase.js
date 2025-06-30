import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Load environment variables directly from .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
} else {
  console.log(`No .env file found at ${envPath}`);
}

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;
console.log('MONGODB_URI:', MONGODB_URI || 'Not defined');

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const checkDatabase = async () => {
  try {
    // Connect to MongoDB directly
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB');

    // Define schemas directly for this script
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      isAdmin: Boolean,
      isActive: Boolean,
      btcWallet: String,
      usdtWallet: String,
      balance: Number
    });

    const investmentPlanSchema = new mongoose.Schema({
      name: String,
      minAmount: Number,
      maxAmount: Number,
      roi: Number,
      durationHours: Number,
      description: String,
      features: [String]
    });

    // Create models
    const User = mongoose.model('User', userSchema);
    const InvestmentPlan = mongoose.model('InvestmentPlan', investmentPlanSchema);

    // Check users
    console.log('\n=== Checking Users ===');
    const users = await User.find({}).select('-password');
    console.log(`Found ${users.length} users in the database`);
    
    if (users.length === 0) {
      console.log('WARNING: No users found in the database! Login will fail.');
      console.log('Try running the seed script: npm run seed');
    } else {
      console.log('\nUser details:');
      console.dir(users, { depth: null, colors: true });
    }

    // Check investment plans
    console.log('\n=== Checking Investment Plans ===');
    const plans = await InvestmentPlan.find({});
    console.log(`Found ${plans.length} investment plans in the database`);
    
    if (plans.length === 0) {
      console.log('WARNING: No investment plans found in the database!');
      console.log('Try running the seed script: npm run seed');
    } else {
      console.log('\nInvestment plan details:');
      console.dir(plans, { depth: null, colors: true });
    }

    // Check MongoDB connection status
    console.log('\n=== MongoDB Connection Status ===');
    console.log('Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    console.log('Database name:', mongoose.connection.name);

    console.log('\n=== Database Check Complete ===');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\nDatabase check error:', error);
    console.error('\nMake sure your MongoDB connection string is correct in the .env file');
    console.error('Current MONGODB_URI:', MONGODB_URI || 'Not defined');
    process.exit(1);
  }
};

checkDatabase();
