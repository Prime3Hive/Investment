import React, { useEffect, useState } from 'react';
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
  Calendar
} from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserInvestments, getUserTransactions, investmentPlans, refreshData } = useData();
  const [investments, setInvestments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeInvestments, setActiveInvestments] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('📊 Loading dashboard data for user:', user.id);
      loadDashboardData();
    }
  }, [user, getUserInvestments, getUserTransactions]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Refreshing dashboard data...');
      await refreshData();
      
      const userInvestments = getUserInvestments(user.id);
      const userTransactions = getUserTransactions(user.id);
      
      console.log('📈 User investments:', userInvestments);
      console.log('💰 User transactions:', userTransactions);
      
      setInvestments(userInvestments);
      setTransactions(userTransactions.slice(0, 5)); // Show latest 5 transactions
      setActiveInvestments(userInvestments.filter(inv => inv.status === 'active').length);
      
      // Calculate total profit from completed investments
      const profit = userInvestments
        .filter(inv => inv.status === 'completed')
        .reduce((sum, inv) => sum + (inv.amount * (inv.roi / 100)), 0);
      setTotalProfit(profit);
      
      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
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

  const stats = [
    {
      title: 'Total Balance',
      value: `$${user?.balance?.toLocaleString() || '0'}`,
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
      value: transactions.filter(t => t.status === 'pending').length.toString(),
      icon: Clock,
      color: 'from-purple-400 to-purple-600',
      change: '0'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
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
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

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
              <Link
                to="/invest"
                className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
              >
                View All
              </Link>
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
                onClick={handleRefresh}
                className="text-yellow-400 hover:text-yellow-300"
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
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