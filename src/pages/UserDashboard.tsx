import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Activity
} from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserInvestments, getUserTransactions, refreshData, isLoading } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const investments = user ? getUserInvestments(user.id) : [];
  const transactions = user ? getUserTransactions(user.id).slice(0, 5) : [];

  const activeInvestments = investments.filter(inv => inv.status === 'active');
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalProfit = investments
    .filter(inv => inv.status === 'completed')
    .reduce((sum, inv) => sum + (inv.amount * (inv.roi / 100)), 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData(['investments', 'transactions']);
    } finally {
      setRefreshing(false);
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="w-5 h-5 text-green-400" />;
      case 'investment':
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      default:
        return <DollarSign className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-400';
      case 'investment':
        return 'text-red-400';
      case 'withdrawal':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {user.name}</h1>
            <p className="text-slate-400">Here's your investment overview</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-yellow-400 text-slate-900 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Balance</p>
                <p className="text-2xl font-bold text-white">${user.balance.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Invested</p>
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
                <p className="text-slate-400 text-sm">Total Profit</p>
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
                <p className="text-slate-400 text-sm">Active Plans</p>
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
            className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-center hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105"
          >
            <Plus className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-1">Add Funds</h3>
            <p className="text-green-100 text-sm">Deposit money to start investing</p>
          </Link>

          <Link
            to="/invest"
            className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-center hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
          >
            <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-1">Invest Now</h3>
            <p className="text-blue-100 text-sm">Choose an investment plan</p>
          </Link>

          <Link
            to="/withdraw"
            className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-center hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105"
          >
            <ArrowUpRight className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-1">Withdraw</h3>
            <p className="text-purple-100 text-sm">Cash out your profits</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Investments */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Active Investments</h2>
              <Link to="/invest" className="text-yellow-400 hover:text-yellow-300 text-sm">
                + New Investment
              </Link>
            </div>

            <div className="space-y-4">
              {activeInvestments.length > 0 ? (
                activeInvestments.slice(0, 3).map((investment) => (
                  <div key={investment.id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{investment.plan.name}</h3>
                      <span className="text-green-400 text-sm font-medium">
                        {investment.roi}% ROI
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                      <span>Amount: ${investment.amount.toLocaleString()}</span>
                      <span>Time left: {formatTimeLeft(investment.endDate)}</span>
                    </div>
                    <div className="bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.max(0, Math.min(100, 
                            ((new Date().getTime() - new Date(investment.startDate).getTime()) / 
                            (new Date(investment.endDate).getTime() - new Date(investment.startDate).getTime())) * 100
                          ))}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">No active investments</p>
                  <Link to="/invest" className="text-yellow-400 hover:text-yellow-300 text-sm">
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
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{transaction.description}</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'investment' ? '-' : '+'}${transaction.amount.toLocaleString()}
                      </p>
                      <p className={`text-xs ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
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