import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  RefreshCw,
  Search
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { 
    depositRequests,
    withdrawalRequests,
    getAllUsers, 
    updateDepositStatus,
    updateWithdrawalStatus,
    investments,
    refreshData,
    isLoading
  } = useData();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    };
    fetchUsers();
  }, [getAllUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDepositStatusChange = async (depositId: string, status: 'pending' | 'confirmed' | 'rejected', userId: string) => {
    await updateDepositStatus(depositId, status, userId);
  };

  const handleWithdrawalStatusChange = async (withdrawalId: string, status: 'pending' | 'approved' | 'completed' | 'rejected', userId: string) => {
    await updateWithdrawalStatus(withdrawalId, status, userId);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    { id: 'withdrawals', label: 'Withdrawals' }
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
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Manage users and platform operations</p>
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

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-700">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-yellow-400 text-yellow-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
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
                      <p className="text-slate-400 text-sm">{stat.title}</p>
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
                <h3 className="text-lg font-semibold text-white mb-4">Recent Deposits</h3>
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
                <h3 className="text-lg font-semibold text-white mb-4">Recent Withdrawals</h3>
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

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">${user.balance?.toLocaleString() || '0'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            Active
                          </span>
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
            <h3 className="text-lg font-semibold text-white">Deposit Management</h3>
            
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Currency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {depositRequests.map((deposit) => (
                      <tr key={deposit.id} className="hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{deposit.userName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">${deposit.amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{deposit.currency}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                            {deposit.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-400">
                            {new Date(deposit.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {deposit.status === 'pending' && (
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
                          )}
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
            <h3 className="text-lg font-semibold text-white">Withdrawal Management</h3>
            
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Currency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {withdrawalRequests.map((withdrawal) => (
                      <tr key={withdrawal.id} className="hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{withdrawal.userName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">${withdrawal.amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{withdrawal.currency}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                            {withdrawal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-400">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {withdrawal.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleWithdrawalStatusChange(withdrawal.id, 'approved', withdrawal.userId)}
                                className="text-blue-400 hover:text-blue-300"
                                title="Approve"
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
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;