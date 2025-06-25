import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Wallet, Edit3, Save, X, CheckCircle } from 'lucide-react';
import Skeleton from '../components/SkeletonLoader';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    btcWallet: user?.btcWallet || '',
    usdtWallet: user?.usdtWallet || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Simulate progressive loading
  useEffect(() => {
    // Add a small delay to show skeleton even if data loads quickly
    // This prevents UI flickering for fast loads
    const timer = setTimeout(() => {
      setPageLoading(isLoading);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        btcWallet: user.btcWallet || '',
        usdtWallet: user.usdtWallet || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateProfile(formData);
    setIsEditing(false);
    setIsSaving(false);
    setSaved(true);
    
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      btcWallet: user?.btcWallet || '',
      usdtWallet: user?.usdtWallet || ''
    });
    setIsEditing(false);
  };

  // Profile Page Skeleton UI
  const ProfilePageSkeleton = () => (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton height="2rem" width="40%" className="mb-2" rounded />
          <Skeleton height="1rem" width="60%" rounded />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
              <Skeleton height="5rem" width="5rem" circle className="mx-auto mb-4" />
              <Skeleton height="1.5rem" width="70%" className="mx-auto mb-1" rounded />
              <Skeleton height="1rem" width="50%" className="mx-auto mb-4" rounded />
              <div className="bg-slate-700 rounded-lg p-4">
                <Skeleton height="1.5rem" width="60%" className="mx-auto mb-1" rounded />
                <Skeleton height="1rem" width="40%" className="mx-auto" rounded />
              </div>
            </div>
          </div>

          {/* Profile Form Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <Skeleton height="1.5rem" width="40%" rounded />
                <Skeleton height="2.5rem" width="5rem" rounded />
              </div>

              <div className="space-y-6">
                <div>
                  <Skeleton height="1.2rem" width="30%" className="mb-4" rounded />
                  <div className="space-y-4">
                    {Array(2).fill(0).map((_, i) => (
                      <div key={i}>
                        <Skeleton height="1rem" width="40%" className="mb-2" rounded />
                        <Skeleton height="3rem" width="100%" rounded />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Skeleton height="1.2rem" width="30%" className="mb-4" rounded />
                  <div className="space-y-4">
                    {Array(2).fill(0).map((_, i) => (
                      <div key={i}>
                        <Skeleton height="1rem" width="40%" className="mb-2" rounded />
                        <Skeleton height="3rem" width="100%" rounded />
                      </div>
                    ))}
                  </div>
                </div>

                <Skeleton height="5rem" width="100%" rounded />
              </div>
            </div>
          </div>
        </div>

        {/* Account Stats Skeleton */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
              <Skeleton height="1.5rem" width="60%" className="mx-auto mb-2" rounded />
              <Skeleton height="1rem" width="40%" className="mx-auto" rounded />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  if (pageLoading) {
    return <ProfilePageSkeleton />;
  }
  
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-slate-400">Manage your account information and wallet addresses</p>
        </div>

        {saved && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 text-sm">Profile updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-slate-900" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">{user?.name}</h2>
              <p className="text-slate-400 text-sm mb-4">{user?.email}</p>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  ${user?.balance?.toLocaleString() || '0'}
                </div>
                <div className="text-slate-400 text-sm">Current Balance</div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Account Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-white mb-4">Wallet Addresses</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Bitcoin (BTC) Wallet Address
                      </label>
                      <div className="relative">
                        <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="text"
                          name="btcWallet"
                          value={formData.btcWallet}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="Enter your BTC wallet address"
                          className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        USDT Wallet Address
                      </label>
                      <div className="relative">
                        <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="text"
                          name="usdtWallet"
                          value={formData.usdtWallet}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="Enter your USDT wallet address"
                          className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {!isEditing && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-400 text-sm">
                      <strong>Note:</strong> Your wallet addresses are used for withdrawals and profit distributions. 
                      Make sure they are correct to avoid loss of funds.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </div>
            <div className="text-slate-400 text-sm">Member Since</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">Active</div>
            <div className="text-slate-400 text-sm">Account Status</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">Standard</div>
            <div className="text-slate-400 text-sm">Account Type</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;