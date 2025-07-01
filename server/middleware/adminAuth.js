import User from '../models/User.js';

/**
 * Middleware to check if the user is an admin
 * This should be used after the auth middleware
 */
export const isAdmin = async (req, res, next) => {
  try {
    // req.user should be set by the auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user from database to check admin status
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during admin authorization'
    });
  }
};

export default isAdmin;
