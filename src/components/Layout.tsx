import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, LogOut, User } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-900" />
              </div>
              <span className="text-xl font-bold text-white">Profitra</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              {!user ? (
                <>
                  <Link
                    to="/about"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/about') ? 'text-yellow-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/contact') ? 'text-yellow-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Contact
                  </Link>
                  <Link
                    to="/signin"
                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-yellow-400 text-slate-900 rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/dashboard') ? 'text-yellow-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/invest"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/invest') ? 'text-yellow-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Invest
                  </Link>
                  <Link
                    to="/deposit"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/deposit') ? 'text-yellow-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Deposit
                  </Link>
                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      className={`text-sm font-medium transition-colors ${
                        isActive('/admin') ? 'text-yellow-400' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-300 text-sm">
                      Balance: <span className="text-yellow-400 font-semibold">${user.balance.toLocaleString()}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 text-sm">{user.name}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default Layout;