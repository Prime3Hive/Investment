import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    balance: user.balance,
    isAdmin: user.isAdmin,
    btcWallet: user.btcWallet,
    usdtWallet: user.usdtWallet,
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData,
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, btcWallet, usdtWallet } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      btcWallet,
      usdtWallet,
    });

    // Create welcome transaction
    await Transaction.create({
      userId: user._id,
      type: 'deposit',
      amount: 0,
      status: 'completed',
      description: 'Welcome to Profitra! Account created successfully.',
      balanceBefore: 0,
      balanceAfter: 0,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

export const login = async (req, res) => {
  try {
    // Validate request body
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    console.log(`Login attempt for email: ${email}`);

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log(`Inactive account: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`Invalid password for: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    try {
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
      console.log(`Successful login for: ${email}`);
    } catch (saveError) {
      console.error(`Error updating last login for ${email}:`, saveError);
      // Continue with login even if saving last login fails
    }
    
    // Send token response
    return sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    // Ensure we always return a JSON response even if there's an error
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      isAdmin: user.isAdmin,
      btcWallet: user.btcWallet,
      usdtWallet: user.usdtWallet,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, btcWallet, usdtWallet } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, btcWallet, usdtWallet },
      { new: true, runValidators: true }
    );

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      isAdmin: user.isAdmin,
      btcWallet: user.btcWallet,
      usdtWallet: user.usdtWallet,
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};