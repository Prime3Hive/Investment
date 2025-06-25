import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import Skeleton from '../components/SkeletonLoader';

const AdminDashboard: React.FC = () => {
  const { 
    depositRequests,
    withdrawalRequests,
    getAllUsers, 
    updateDepositStatus,
    updateWithdrawalStatus,
    updateUserStatus,
    investmentPlans,
    updateInvestmentPlans,
    investments,
    isLoading
  } = useData();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [planForm, setPlanForm] = useState({
    name: '',
    minAmount: 0,
    maxAmount: 0,
    roi: 0,
    duration: 0,
    description: '',
    isActive: true
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setPageLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      
      // Add a small delay before hiding skeleton to prevent flickering
      setTimeout(() => {
        setPageLoading(false);
      }, 500);
    };
    fetchUsers();
  }, [getAllUsers]);
  
  // Update loading state when data context loading state changes
  useEffect(() => {
    if (isLoading) {
      setPageLoading(true);
    }
  }, [isLoading]);

  const handleDepositStatusChange = async (depositId: string, status: 'pending' | 'confirmed' | 'rejected', userId: string) => {
    await updateDepositStatus(depositId, status, userId);
    
    // Update local users state if deposit is confirmed
    if (status === 'confirmed') {
      const deposit = depositRequests.find(d => d.id === depositId);
      if (deposit) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, balance: user.balance + deposit.amount }
              : user
          )
        );
      }
    }
  };

  const handleWithdrawalStatusChange = async (withdrawalId: string, status: 'pending' | 'approved' | 'completed' | 'rejected', userId: string) => {
    await updateWithdrawalStatus(withdrawalId, status, userId);
    
    // Update local users state if withdrawal is approved
    if (status === 'approved') {
      const withdrawal = withdrawalRequests.find(w => w.id === withdrawalId);
      if (withdrawal) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, balance: user.balance - withdrawal.amount }
              : user
          )
        );
      }
    }
  };

  const handleEditPlan = (plan: any) => {
    setPlanForm(plan);
    setEditingPlanId(plan.id);
    setIsEditingPlan(true);
  };

  const handleSavePlan = () => {
    const updatedPlans = investmentPlans.map(plan =>
      plan.id === editingPlanId ? { ...planForm, id: editingPlanId } : plan
    );
    updateInvestmentPlans(updatedPlans);
    setIsEditingPlan(false);
    setEditingPlanId(null);
    setPlanForm({
      name: '',
      minAmount: 0,
      maxAmount: 0,
      roi: 0,
      duration: 0,
      description: '',
      isActive: true
    });
  };

  const handleAddPlan = () => {
    const newPlan = {
      ...planForm,
      id: Date.now().toString()
    };
    updateInvestmentPlans([...investmentPlans, newPlan]);
    setIsEditingPlan(false);
    setPlanForm({
      name: '',
      minAmount: 0,
      maxAmount: 0,
      roi: 0,
      duration: 0,
      description: '',
      isActive: true
    });
  };

  const handleDeletePlan = (planId: string) => {
    const updatedPlans = investmentPlans.filter(plan => plan.id !== planId);
    updateInvestmentPlans(updatedPlans);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingDeposits = depositRequests.filter(req => req.status === 'pending');
  const pendingWithdrawals = withdrawalRequests.filter(req => req.status === 'pending');
  const totalUsers = users.length;
  const totalDeposits = depositRequests.reduce((sum, req) => 
    req.status === 'confirmed' ? sum + req.amount : sum, 0
  );
  const totalInvestments = investments.reduce((sum, inv) => sum + inv.amount, 0);

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers.toString(),
      icon: Users,
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: 'Total Deposits',
      value: `$${totalDeposits.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-400 to-green-600'
    },
    {
      title: 'Total Investments',
      value: `$${totalInvestments.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-purple-400 to-purple-600'
    },
    {
      title: 'Pending Requests',
      value: (pendingDeposits.length + pendingWithdrawals.length).toString(),
      icon: Clock,
      color: 'from-yellow-400 to-yellow-600'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'deposits', label: 'Deposits' },
    { id: 'withdrawals', label: 'Withdrawals' },
    { id: 'plans', label: 'Investment Plans' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmed':
      case 'approved':
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      case 'banned':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  // Admin Dashboard Skeleton UI
  const AdminDashboardSkeleton = () => (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton height="2rem" width="30%" className="mb-2" rounded />
          <Skeleton height="1rem" width="50%" rounded />
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Skeleton height="1.5rem" width="40%" rounded />
                <Skeleton height="2.5rem" width="2.5rem" circle />
              </div>
              <Skeleton height="2rem" width="60%" className="mb-1" rounded />
              <Skeleton height="1rem" width="40%" rounded />
            </div>
          ))}
        </div>
        
        {/* Tabs Skeleton */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 mb-8">
          <div className="flex overflow-x-auto p-2 space-x-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} height="2.5rem" width="8rem" rounded />
            ))}
          </div>
        </div>
        
        {/* Content Skeleton - Table */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <Skeleton height="1.5rem" width="20%" rounded />
            <Skeleton height="2.5rem" width="15rem" rounded />
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="border-b border-slate-700 pb-4 grid grid-cols-5 gap-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} height="1.2rem" width="80%" rounded />
                ))}
              </div>
              
              {/* Table Rows */}
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="border-b border-slate-700 py-4 grid grid-cols-5 gap-4">
                  {Array(5).fill(0).map((_, j) => (
                    <Skeleton key={j} height="1.2rem" width={j === 4 ? "60%" : "80%"} rounded />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (pageLoading) {
    return <AdminDashboardSkeleton />;
  }
  
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage users, deposits, withdrawals, and investment plans</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-yellow-400 text-yellow-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pending Requests Alert */}
            {(pendingDeposits.length > 0 || pendingWithdrawals.length > 0) && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">
                    You have {pendingDeposits.length} pending deposits and {pendingWithdrawals.length} pending withdrawals requiring attention.
                  </span>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <ArrowUpRight className="w-5 h-5 mr-2 text-green-400" />
                  Recent Deposits
                </h3>
                <div className="space-y-3">
                  {depositRequests.slice(0, 5).map((deposit) => (
                    <div key={deposit.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{deposit.userName}</p>
                        <p className="text-slate-400 text-sm">
                          ${deposit.amount.toLocaleString()} {deposit.currency}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                        {deposit.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <ArrowDownLeft className="w-5 h-5 mr-2 text-red-400" />
                  Recent Withdrawals
                </h3>
                <div className="space-y-3">
                  {withdrawalRequests.slice(0, 5).map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{withdrawal.userName}</p>
                        <p className="text-slate-400 text-sm">
                          ${withdrawal.amount.toLocaleString()} {withdrawal.currency}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">User Management</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800 divide-y divide-slate-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{user.name}</div>
                            <div className="text-sm text-slate-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">${user.balance?.toLocaleString() || '0'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : user.status === 'deactivated' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-400 hover:text-blue-300" 
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {user.status === 'active' ? (
                              <>
                                <button 
                                  onClick={() => updateUserStatus(user.id, 'deactivated')}
                                  className="text-yellow-400 hover:text-yellow-300"
                                  title="Deactivate User"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => updateUserStatus(user.id, 'banned')}
                                  className="text-red-400 hover:text-red-300"
                                  title="Ban User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => updateUserStatus(user.id, 'active')}
                                className="text-green-400 hover:text-green-300"
                                title="Activate User"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Deposits Tab */}
        {activeTab === 'deposits' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Deposit Management
            </h3>
            
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800 divide-y divide-slate-700">
                    {depositRequests.map((deposit) => (
                      <tr key={deposit.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{deposit.userName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">${deposit.amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{deposit.currency}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={deposit.status}
                            onChange={(e) => handleDepositStatusChange(deposit.id, e.target.value as any, deposit.userId)}
                            className={`px-2 py-1 rounded-full text-xs font-medium bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-400">
                            {new Date(deposit.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDepositStatusChange(deposit.id, 'confirmed', deposit.userId)}
                              className="text-green-400 hover:text-green-300"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDepositStatusChange(deposit.id, 'rejected', deposit.userId)}
                              className="text-red-400 hover:text-red-300"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <ArrowDownLeft className="w-5 h-5 mr-2" />
              Withdrawal Management
            </h3>
            
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Wallet Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800 divide-y divide-slate-700">
                    {withdrawalRequests.map((withdrawal) => (
                      <tr key={withdrawal.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{withdrawal.userName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">${withdrawal.amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{withdrawal.currency}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-400 font-mono text-xs max-w-32 truncate" title={withdrawal.walletAddress}>
                            {withdrawal.walletAddress}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={withdrawal.status}
                            onChange={(e) => handleWithdrawalStatusChange(withdrawal.id, e.target.value as any, withdrawal.userId)}
                            className={`px-2 py-1 rounded-full text-xs font-medium bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-400">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleWithdrawalStatusChange(withdrawal.id, 'approved', withdrawal.userId)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleWithdrawalStatusChange(withdrawal.id, 'completed', withdrawal.userId)}
                              className="text-green-400 hover:text-green-300"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleWithdrawalStatusChange(withdrawal.id, 'rejected', withdrawal.userId)}
                              className="text-red-400 hover:text-red-300"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Investment Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Investment Plans</h3>
              <button
                onClick={() => {
                  setIsEditingPlan(true);
                  setEditingPlanId(null);
                }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 px-4 py-2 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Plan</span>
              </button>
            </div>

            {isEditingPlan && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h4 className="text-lg font-semibold text-white mb-4">
                  {editingPlanId ? 'Edit Plan' : 'Add New Plan'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Plan Name</label>
                    <input
                      type="text"
                      value={planForm.name}
                      onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">ROI (%)</label>
                    <input
                      type="number"
                      value={planForm.roi}
                      onChange={(e) => setPlanForm({...planForm, roi: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Min Amount ($)</label>
                    <input
                      type="number"
                      value={planForm.minAmount}
                      onChange={(e) => setPlanForm({...planForm, minAmount: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Amount ($)</label>
                    <input
                      type="number"
                      value={planForm.maxAmount}
                      onChange={(e) => setPlanForm({...planForm, maxAmount: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Duration (hours)</label>
                    <input
                      type="number"
                      value={planForm.duration}
                      onChange={(e) => setPlanForm({...planForm, duration: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                    <select
                      value={planForm.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setPlanForm({...planForm, isActive: e.target.value === 'active'})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                      value={planForm.description}
                      onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={editingPlanId ? handleSavePlan : handleAddPlan}
                    className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-500 hover:to-green-700 transition-all duration-300"
                  >
                    {editingPlanId ? 'Save Changes' : 'Add Plan'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingPlan(false);
                      setEditingPlanId(null);
                      setPlanForm({
                        name: '',
                        minAmount: 0,
                        maxAmount: 0,
                        roi: 0,
                        duration: 0,
                        description: '',
                        isActive: true
                      });
                    }}
                    className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investmentPlans.map((plan) => (
                <div key={plan.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      plan.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-slate-300">ROI: <span className="text-yellow-400 font-medium">{plan.roi}%</span></p>
                    <p className="text-slate-300">Duration: <span className="text-white">{plan.duration} hours</span></p>
                    <p className="text-slate-300">
                      Range: <span className="text-white">${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()}</span>
                    </p>
                    <p className="text-slate-400 text-sm">{plan.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;