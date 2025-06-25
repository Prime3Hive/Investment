import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { TrendingUp, User, LogOut, Menu, X } from 'lucide-react';
import Skeleton from './SkeletonLoader';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { isLoading: dataLoading } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [layoutLoading, setLayoutLoading] = useState(true);
  
  // Control loading state with a delay to prevent flickering
  useEffect(() => {
    // Only show skeleton for initial app load, not for subsequent data fetches
    if (layoutLoading) {
      const timer = setTimeout(() => {
        setLayoutLoading(false);
      }, 800); // Slightly longer delay for layout to ensure a smooth initial experience
      
      return () => clearTimeout(timer);
    }
  }, [layoutLoading]);
  
  // Update layout loading state based on auth loading state
  useEffect(() => {
    // If auth is done loading but layout is still showing as loading,
    // we can safely end the layout loading state
    if (!authLoading && layoutLoading) {
      setLayoutLoading(false);
    }
  }, [authLoading, layoutLoading]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  // Fixed homepage navigation for logged-in users
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const publicNavItems = [
    { path: '/', label: 'Home', onClick: handleHomeClick },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
    { path: '/terms', label: 'Terms' },
  ];

  const userNavItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/invest', label: 'Invest' },
    { path: '/deposit', label: 'Deposit' },
    { path: '/withdraw', label: 'Withdraw' },
    { path: '/profile', label: 'Profile' },
  ];

  // Layout Skeleton UI
  const LayoutSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation Skeleton */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Skeleton */}
            <div className="flex items-center space-x-2">
              <Skeleton height="2rem" width="2rem" rounded />
              <Skeleton height="1.5rem" width="6rem" rounded />
            </div>

            {/* Desktop Navigation Skeleton */}
            <div className="hidden md:flex items-center space-x-8">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} height="1rem" width="4rem" rounded />
              ))}
            </div>

            {/* User Menu Skeleton */}
            <div className="flex items-center space-x-4">
              <Skeleton height="2rem" width="6rem" rounded />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Skeleton - Just a container for children */}
      <main className="flex-1">
        {/* Children will have their own skeleton loaders */}
        {children}
      </main>

      {/* Footer Skeleton */}
      <footer className="bg-slate-900 border-t border-slate-700/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {Array(4).fill(0).map((_, i) => (
              <div key={i}>
                <Skeleton height="1.5rem" width="8rem" className="mb-4" rounded />
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, j) => (
                    <Skeleton key={j} height="1rem" width="80%" rounded />
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-slate-700/50 mt-8 pt-8 text-center">
            <Skeleton height="1rem" width="60%" className="mx-auto" rounded />
          </div>
        </div>
      </footer>
    </div>
  );
  
  // Show skeleton during initial load only
  if (layoutLoading) {
    return <LayoutSkeleton />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button 
              onClick={handleHomeClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-900" />
              </div>
              <span className="text-xl font-bold text-white">Profitra</span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {!user && publicNavItems.map(item => (
                <button
                  key={item.path}
                  onClick={item.onClick || (() => navigate(item.path))}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-yellow-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {user && !user.isAdmin && userNavItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-yellow-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'text-yellow-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/profile" className="hidden md:flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-700/50 py-4">
              <div className="space-y-2">
                {!user && publicNavItems.map(item => (
                  <button
                    key={item.path}
                    onClick={(e) => {
                      if (item.onClick) item.onClick(e);
                      else navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'text-yellow-400'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                {user && !user.isAdmin && userNavItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-4 py-2 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'text-yellow-400'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className={`block px-4 py-2 text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'text-yellow-400'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-slate-900" />
                </div>
                <span className="text-xl font-bold text-white">Profitra</span>
              </div>
              <p className="text-slate-400 text-sm">
                Your trusted partner in cryptocurrency investment and wealth building.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Investment</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/invest" className="hover:text-white transition-colors">Investment Plans</Link></li>
                <li><Link to="/deposit" className="hover:text-white transition-colors">Make Deposit</Link></li>
                <li><Link to="/withdraw" className="hover:text-white transition-colors">Withdraw Funds</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Email: support@profitra.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>24/7 Customer Support</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700/50 mt-8 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 Profitra. All rights reserved. Investment involves risk.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;