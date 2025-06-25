import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useInvestment } from '../contexts/InvestmentContext';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { investments, deposits, transactions, fetchUserData, isLoading } = useInvestment();

  useEffect(() => {
    fetchUserData();
  }, []);

  const activeInvestments = investments.filter(inv => inv.status === 'active');
  const completedInvestments = investments.filter(inv => inv.status === 'completed');
  const pendingDeposits = deposits.filter(dep => dep.status === 'pending');

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalProfit = completedInvestments.reduce((sum, inv) => sum + (inv.amount * inv.roiPercent / 100), 0);

  const formatTimeLeft = (endsAt: string) => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Completed';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-400">
            Track your investments and manage your portfolio
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Balance</p>
                <p className="text-2xl font-bold text-white">${user?.balance.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Invested</p>
                <p className="text-2xl font-bold text-white">${totalInvested.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Profit</p>
                <p className="text-2xl font-bold text-white">${totalProfit.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Active Investments</p>
                <p className="text-2xl font-bold text-white">{activeInvestments.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
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
            <Wallet className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-1">Manage Profile</h3>
            <p className="text-purple-100 text-sm">Update your information</p>
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
                + New Investment
              </Link>
            </div>

            <div className="space-y-4">
              {activeInvestments.slice(0, 3).map((investment) => (
                <div key={investment.id} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{investment.plan?.name}</h3>
                    <span className="text-green-400 text-sm font-medium">
                      {investment.roiPercent}% ROI
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                    <span>Amount: ${investment.amount.toLocaleString()}</span>
                    <span>Time left: {formatTimeLeft(investment.endsAt)}</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, 
                          ((new Date().getTime() - new Date(investment.createdAt).getTime()) / 
                          (new Date(investment.endsAt).getTime() - new Date(investment.createdAt).getTime())) * 100
                        ))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {activeInvestments.length === 0 && (
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
            <h2 className="text-xl font-semibold text-white mb-6">Recent Transactions</h2>

            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' ? 'bg-green-500/20' :
                      transaction.type === 'invest' || transaction.type === 'reinvest' ? 'bg-blue-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      {transaction.type === 'deposit' ? (
                        <ArrowDownRight className="w-5 h-5 text-green-400" />
                      ) : transaction.type === 'invest' || transaction.type === 'reinvest' ? (
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
                      transaction.type === 'deposit' || transaction.type === 'profit' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'profit' ? '+' : '-'}${transaction.amount.toLocaleString()}
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

        {/* Pending Deposits Alert */}
        {pendingDeposits.length > 0 && (
          <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">
                You have {pendingDeposits.length} pending deposit{pendingDeposits.length > 1 ? 's' : ''} awaiting confirmation.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;