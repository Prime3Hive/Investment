import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useInvestment } from '../contexts/InvestmentContext';
import { apiClient } from '../lib/api';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Plus,
  ArrowDownRight,
  Activity,
  Users,
  BarChart3,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  createdAt: string;
}

interface Investment {
  _id: string;
  user: { email: string };
  plan: { name: string };
  amount: number;
  roi: number;
  status: string;
  createdAt: string;
  endDate: string;
}

interface Deposit {
  _id: string;
  user: { email: string };
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface Withdrawal {
  _id: string;
  user: { email: string };
  amount: number;
  currency: string;
  wallet: string;
  status: string;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    investments, 
    deposits, 
    transactions, 
    fetchUserData, 
    isLoading 
  } = useInvestment();
  
  // Admin state
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allInvestments, setAllInvestments] = useState<Investment[]>([]);
  const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'users' | 'investments' | 'deposits' | 'withdrawals'>('users');

  // Function to fetch admin data
  const fetchAdminData = async () => {
    if (!user?.isAdmin) return;
    
    setAdminLoading(true);
    try {
      // Fetch all users
      const usersResponse = await apiClient.getAllUsers();
      if (usersResponse.success) {
        setAllUsers(usersResponse.data);
      }
      
      // Fetch all investments
      const investmentsResponse = await apiClient.getAllInvestments();
      if (investmentsResponse.success) {
        setAllInvestments(investmentsResponse.data);
      }
      
      // Fetch all deposits
      const depositsResponse = await apiClient.getAllDepositRequests();
      if (depositsResponse.success) {
        setAllDeposits(depositsResponse.data);
      }
      
      // Fetch all withdrawals
      const withdrawalsResponse = await apiClient.getAllWithdrawals();
      if (withdrawalsResponse.success) {
        setAllWithdrawals(withdrawalsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setAdminLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserData();
    
    // Fetch admin data if user is admin
    if (user?.isAdmin) {
      fetchAdminData();
    }
  }, [fetchUserData, user]);
  

  const activeInvestments = investments.filter(inv => inv.status === 'active');
  const completedInvestments = investments.filter(inv => inv.status === 'completed');
  const pendingDeposits = deposits.filter(dep => dep.status === 'pending');

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalProfit = completedInvestments.reduce((sum, inv) => sum + (inv.amount * inv.roi / 100), 0);

  const formatTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
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
                      {investment.roi}% ROI
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                    <span>Amount: ${investment.amount.toLocaleString()}</span>
                    <span>Time left: {formatTimeLeft(investment.endDate)}</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
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
                      transaction.type === 'investment' || transaction.type === 'reinvestment' ? 'bg-blue-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      {transaction.type === 'deposit' ? (
                        <ArrowDownRight className="w-5 h-5 text-green-400" />
                      ) : transaction.type === 'investment' || transaction.type === 'reinvestment' ? (
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
        
        {/* Admin Panel */}
        {user?.isAdmin && (
          <div className="mt-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Admin Panel</h2>
              <p className="text-slate-400">Manage users, investments, deposits, and withdrawals</p>
            </div>
            
            {/* Admin Navigation Tabs */}
            <div className="flex border-b border-slate-700 mb-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-3 px-6 font-medium ${activeTab === 'users' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-slate-400 hover:text-white'}`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('investments')}
                className={`py-3 px-6 font-medium ${activeTab === 'investments' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-slate-400 hover:text-white'}`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Investments</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('deposits')}
                className={`py-3 px-6 font-medium ${activeTab === 'deposits' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-slate-400 hover:text-white'}`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Deposits</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`py-3 px-6 font-medium ${activeTab === 'withdrawals' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-slate-400 hover:text-white'}`}
              >
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span>Withdrawals</span>
                </div>
              </button>
            </div>
            
            {/* Admin Content */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              {adminLoading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading admin data...</p>
                </div>
              ) : (
                <>
                  {/* Users Tab */}
                  {activeTab === 'users' && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">All Users</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-700 text-slate-300 text-sm">
                            <tr>
                              <th className="px-4 py-3 rounded-tl-lg">Name</th>
                              <th className="px-4 py-3">Email</th>
                              <th className="px-4 py-3">Balance</th>
                              <th className="px-4 py-3">Role</th>
                              <th className="px-4 py-3 rounded-tr-lg">Joined</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-300">
                            {allUsers.length > 0 ? (
                              allUsers.map((user, index) => (
                                <tr key={user._id} className={index % 2 === 0 ? 'bg-slate-700/30' : 'bg-slate-700/10'}>
                                  <td className="px-4 py-3">{user.name}</td>
                                  <td className="px-4 py-3">{user.email}</td>
                                  <td className="px-4 py-3">${user.balance?.toLocaleString() || '0'}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.isAdmin ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                      {user.isAdmin ? 'Admin' : 'User'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No users found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Investments Tab */}
                  {activeTab === 'investments' && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">All Investments</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-700 text-slate-300 text-sm">
                            <tr>
                              <th className="px-4 py-3 rounded-tl-lg">User</th>
                              <th className="px-4 py-3">Plan</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">ROI</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 rounded-tr-lg">Date</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-300">
                            {allInvestments.length > 0 ? (
                              allInvestments.map((investment, index) => (
                                <tr key={investment._id} className={index % 2 === 0 ? 'bg-slate-700/30' : 'bg-slate-700/10'}>
                                  <td className="px-4 py-3">{investment.user?.email || 'Unknown'}</td>
                                  <td className="px-4 py-3">{investment.plan?.name || 'Unknown'}</td>
                                  <td className="px-4 py-3">${investment.amount?.toLocaleString() || '0'}</td>
                                  <td className="px-4 py-3">{investment.roi}%</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      investment.status === 'active' ? 'bg-green-500/20 text-green-300' : 
                                      investment.status === 'completed' ? 'bg-blue-500/20 text-blue-300' : 
                                      'bg-yellow-500/20 text-yellow-300'
                                    }`}>
                                      {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">{new Date(investment.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No investments found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Deposits Tab */}
                  {activeTab === 'deposits' && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">All Deposits</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-700 text-slate-300 text-sm">
                            <tr>
                              <th className="px-4 py-3 rounded-tl-lg">User</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Currency</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-300">
                            {allDeposits.length > 0 ? (
                              allDeposits.map((deposit, index) => (
                                <tr key={deposit._id} className={index % 2 === 0 ? 'bg-slate-700/30' : 'bg-slate-700/10'}>
                                  <td className="px-4 py-3">{deposit.user?.email || 'Unknown'}</td>
                                  <td className="px-4 py-3">{deposit.amount}</td>
                                  <td className="px-4 py-3">{deposit.currency}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      deposit.status === 'confirmed' ? 'bg-green-500/20 text-green-300' : 
                                      deposit.status === 'rejected' ? 'bg-red-500/20 text-red-300' : 
                                      'bg-yellow-500/20 text-yellow-300'
                                    }`}>
                                      {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">{new Date(deposit.createdAt).toLocaleDateString()}</td>
                                  <td className="px-4 py-3">
                                    {deposit.status === 'pending' && (
                                      <div className="flex space-x-2">
                                        <button 
                                          onClick={() => {
                                            if (window.confirm(`Confirm deposit of ${deposit.amount} ${deposit.currency}?`)) {
                                              apiClient.processDepositRequest(deposit._id, {
                                                status: 'confirmed',
                                                adminNotes: 'Approved by admin'
                                              }).then(() => fetchAdminData());
                                            }
                                          }}
                                          className="p-1 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            if (window.confirm(`Reject deposit of ${deposit.amount} ${deposit.currency}?`)) {
                                              apiClient.processDepositRequest(deposit._id, {
                                                status: 'rejected',
                                                adminNotes: 'Rejected by admin'
                                              }).then(() => fetchAdminData());
                                            }
                                          }}
                                          className="p-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
                                        >
                                          <XCircle className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No deposits found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Withdrawals Tab */}
                  {activeTab === 'withdrawals' && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">All Withdrawals</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-700 text-slate-300 text-sm">
                            <tr>
                              <th className="px-4 py-3 rounded-tl-lg">User</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Currency</th>
                              <th className="px-4 py-3">Wallet</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-300">
                            {allWithdrawals.length > 0 ? (
                              allWithdrawals.map((withdrawal, index) => (
                                <tr key={withdrawal._id} className={index % 2 === 0 ? 'bg-slate-700/30' : 'bg-slate-700/10'}>
                                  <td className="px-4 py-3">{withdrawal.user?.email || 'Unknown'}</td>
                                  <td className="px-4 py-3">{withdrawal.amount}</td>
                                  <td className="px-4 py-3">{withdrawal.currency}</td>
                                  <td className="px-4 py-3">
                                    <span className="text-xs font-mono">{withdrawal.wallet?.substring(0, 10)}...</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      withdrawal.status === 'confirmed' ? 'bg-green-500/20 text-green-300' : 
                                      withdrawal.status === 'rejected' ? 'bg-red-500/20 text-red-300' : 
                                      'bg-yellow-500/20 text-yellow-300'
                                    }`}>
                                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">{new Date(withdrawal.createdAt).toLocaleDateString()}</td>
                                  <td className="px-4 py-3">
                                    {withdrawal.status === 'pending' && (
                                      <div className="flex space-x-2">
                                        <button 
                                          onClick={() => {
                                            if (window.confirm(`Confirm withdrawal of ${withdrawal.amount} ${withdrawal.currency}?`)) {
                                              const hash = prompt('Enter transaction hash (optional):');
                                              apiClient.processWithdrawalRequest(withdrawal._id, {
                                                status: 'confirmed',
                                                adminNotes: 'Approved by admin',
                                                transactionHash: hash || undefined
                                              }).then(() => fetchAdminData());
                                            }
                                          }}
                                          className="p-1 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            if (window.confirm(`Reject withdrawal of ${withdrawal.amount} ${withdrawal.currency}?`)) {
                                              apiClient.processWithdrawalRequest(withdrawal._id, {
                                                status: 'rejected',
                                                adminNotes: 'Rejected by admin'
                                              }).then(() => fetchAdminData());
                                            }
                                          }}
                                          className="p-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
                                        >
                                          <XCircle className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No withdrawals found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;