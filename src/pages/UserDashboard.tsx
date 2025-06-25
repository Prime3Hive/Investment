import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Plus,
  Eye,
  RefreshCw,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Skeleton from '../components/SkeletonLoader';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserInvestments, getUserTransactions, refreshData, isLoading, error } = useData();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  
  // Load essential data first when component mounts
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboardLoading(true);
        // Only load the data we need for the initial dashboard view
        await refreshData(['investments', 'transactions']);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setDashboardLoading(false);
      }
    };
    
    loadDashboardData();
  }, [refreshData]);

  // Memoize expensive calculations
  const { investments, transactions, stats } = useMemo(() => {
    if (!user) return { investments: [], transactions: [], stats: null };

    const userInvestments = getUserInvestments(user.id);
    const userTransactions = getUserTransactions(user.id).slice(0, 5); // Latest 5 only
    
    const activeInvestments = userInvestments.filter(inv => inv.status === 'active').length;
    const totalProfit = userInvestments
      .filter(inv => inv.status === 'completed')
      .reduce((sum, inv) => sum + (inv.amount * (inv.roi / 100)), 0);
    
    const pendingTransactions = userTransactions.filter(t => t.status === 'pending').length;

    const calculatedStats = [
      {
        title: 'Total Balance',
        value: `$${user.balance?.toLocaleString() || '0'}`,
        icon: Wallet,
        color: 'from-green-400 to-green-600',
        change: '+2.5%'
      },
      {
        title: 'Active Investments',
        value: activeInvestments.toString(),
        icon: TrendingUp,
        color: 'from-blue-400 to-blue-600',
        change: '+1'
      },
      {
        title: 'Total Profit',
        value: `$${totalProfit.toLocaleString()}`,
        icon: DollarSign,
        color: 'from-yellow-400 to-yellow-600',
        change: '+15.3%'
      },
      {
        title: 'Pending Transactions',
        value: pendingTransactions.toString(),
        icon: Clock,
        color: 'from-purple-400 to-purple-600',
        change: '0'
      }
    ];

    return {
      investments: userInvestments,
      transactions: userTransactions,
      stats: calculatedStats
    };
  }, [user, getUserInvestments, getUserTransactions]);

  const handleRefresh = async (section?: string) => {
    try {
      setDashboardLoading(true);
      if (section === 'investments') {
        await refreshData(['investments']);
      } else if (section === 'transactions') {
        await refreshData(['transactions']);
      } else {
        await refreshData(['investments', 'transactions']);
      }
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const formatTimeLeft = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Completed';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Show skeleton UI while loading instead of a spinner
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading user data...</p>
        </div>
      </div>
    );
  }
  
  // Dashboard skeleton UI
  const DashboardSkeleton = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton height="2rem" width="60%" className="mb-2" rounded />
        <Skeleton height="1rem" width="40%" rounded />
      </div>
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <Skeleton height="1.5rem" width="60%" rounded />
              <Skeleton height="2rem" width="2rem" circle />
            </div>
            <Skeleton height="2rem" width="40%" className="mb-2" rounded />
            <Skeleton height="1rem" width="30%" rounded />
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Investments Skeleton */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <Skeleton height="1.5rem" width="60%" rounded />
            <Skeleton height="1.5rem" width="1.5rem" circle />
          </div>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4 bg-slate-700 rounded-lg">
                <div className="flex justify-between mb-2">
                  <Skeleton height="1.2rem" width="40%" rounded />
                  <Skeleton height="1.2rem" width="20%" rounded />
                </div>
                <div className="mb-4">
                  <Skeleton height="1rem" width="60%" rounded />
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <Skeleton height="0.5rem" width="60%" rounded />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Transactions Skeleton */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <Skeleton height="1.5rem" width="60%" rounded />
            <Skeleton height="1.5rem" width="1.5rem" circle />
          </div>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton height="2.5rem" width="2.5rem" circle />
                  <div>
                    <Skeleton height="1rem" width="8rem" className="mb-1" rounded />
                    <Skeleton height="0.8rem" width="5rem" rounded />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton height="1rem" width="5rem" className="mb-1" rounded />
                  <Skeleton height="0.8rem" width="3rem" rounded />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  if (dashboardLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user.name}
              </h1>
              <p className="text-slate-400">
                Track your investments and monitor your portfolio performance
              </p>
            </div>
            <button
              onClick={() => handleRefresh()}
              disabled={isLoading || dashboardLoading}
              className="flex items-center space-x-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${dashboardLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {/* User Info Card */}
        <div className="mb-8 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-600">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-slate-900" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">{user.name}</h2>
              <p className="text-slate-300">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${user.emailConfirmed ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>{user.emailConfirmed ? 'Verified' : 'Unverified'}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">${user.balance.toLocaleString()}</div>
              <div className="text-slate-400 text-sm">Available Balance</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-green-400 text-sm mt-1 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/deposit"
            className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-center hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-1">Make Deposit</h3>
            <p className="text-green-100 text-sm">Add funds to your account</p>
          </Link>

          <Link
            to="/invest"
            className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-center hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
          >
            <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-1">Start Investing</h3>
            <p className="text-blue-100 text-sm">Choose an investment plan</p>
          </Link>

          <Link
            to="/profile"
            className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-center hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105"
          >
            <Eye className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-1">View Profile</h3>
            <p className="text-purple-100 text-sm">Manage your account</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Investments */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Active Investments</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRefresh('investments')}
                  disabled={isLoading || dashboardLoading}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <RefreshCw className={`w-4 h-4 ${dashboardLoading ? 'animate-spin' : ''}`} />
                </button>
                <Link
                  to="/invest"
                  className="flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Investment</span>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {investments.filter(inv => inv.status === 'active').slice(0, 3).map((investment) => (
                <div key={investment.id} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{investment.plan.name}</h3>
                    <span className="text-green-400 text-sm font-medium">
                      {investment.roi}% ROI
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Amount: ${investment.amount.toLocaleString()}</span>
                    <span>Time left: {formatTimeLeft(investment.endDate)}</span>
                  </div>
                  <div className="mt-2 bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, 
                          ((new Date().getTime() - new Date(investment.startDate).getTime()) / 
                          (new Date(investment.endDate).getTime() - new Date(investment.startDate).getTime())) * 100
                        ))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {investments.filter(inv => inv.status === 'active').length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">No active investments</p>
                  <Link
                    to="/invest"
                    className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                  >
                    Start investing now
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
              <button 
                onClick={() => handleRefresh('transactions')}
                className="text-yellow-400 hover:text-yellow-300"
                disabled={isLoading || dashboardLoading}
              >
                <RefreshCw className={`w-5 h-5 ${dashboardLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' ? 'bg-green-500/20' :
                      transaction.type === 'investment' ? 'bg-blue-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      {transaction.type === 'deposit' ? (
                        <ArrowDownRight className="w-5 h-5 text-green-400" />
                      ) : transaction.type === 'investment' ? (
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                      ) : (
                        <DollarSign className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{transaction.description}</p>
                      <p className="text-slate-400 text-sm">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'deposit' ? 'text-green-400' : 
                      transaction.type === 'investment' ? 'text-red-400' : 
                      'text-yellow-400'
                    }`}>
                      {transaction.type === 'investment' ? '-' : '+'}${transaction.amount.toLocaleString()}
                    </p>
                    <p className={`text-xs ${
                      transaction.status === 'completed' ? 'text-green-400' :
                      transaction.status === 'pending' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
              
              {transactions.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;