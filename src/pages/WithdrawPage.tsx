import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  Wallet, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Bitcoin, 
  DollarSign,
  ArrowRight,
  Clock,
  Shield,
  ArrowDownLeft
} from 'lucide-react';

const WithdrawPage: React.FC = () => {
  const { user } = useAuth();
  const { createWithdrawalRequest } = useData();
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'USDT'>('BTC');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [step, setStep] = useState(1); // 1: Amount, 2: Wallet, 3: Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitWithdrawal = async () => {
    if (!user || !withdrawalAmount || !walletAddress) return;

    const amount = parseFloat(withdrawalAmount);

    if (amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > (user.balance || 0)) {
      setError('Insufficient balance');
      return;
    }

    if (amount < 10) {
      setError('Minimum withdrawal amount is $10');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await createWithdrawalRequest(
        user.id,
        amount,
        selectedCurrency,
        walletAddress,
        user.name
      );
      
      setStep(3);
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      setError('Failed to submit withdrawal request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currencies = [
    {
      id: 'BTC' as const,
      name: 'Bitcoin',
      symbol: 'BTC',
      icon: Bitcoin,
      color: 'from-orange-400 to-orange-600'
    },
    {
      id: 'USDT' as const,
      name: 'Tether',
      symbol: 'USDT',
      icon: DollarSign,
      color: 'from-green-400 to-green-600'
    }
  ];

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Withdrawal Request Submitted</h2>
          <p className="text-slate-400 mb-6">
            Your withdrawal request has been submitted successfully. Our team will review and process it within 24-48 hours.
          </p>
          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Amount:</span>
              <span className="text-white font-semibold">${parseFloat(withdrawalAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Currency:</span>
              <span className="text-white font-semibold">{selectedCurrency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Wallet:</span>
              <span className="text-white font-semibold text-xs">{walletAddress.slice(0, 10)}...{walletAddress.slice(-6)}</span>
            </div>
          </div>
          <div className="flex items-center justify-center text-blue-400 text-sm mb-6">
            <Clock className="w-4 h-4 mr-2" />
            Processing time: 24-48 hours
          </div>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Withdraw Funds</h1>
          <p className="text-slate-400">
            Request a withdrawal from your account balance
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-400'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-yellow-400' : 'bg-slate-700'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-400'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-yellow-400' : 'bg-slate-700'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 3 ? 'bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-400'
            }`}>
              3
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Content */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Select Currency & Amount</h2>
                
                {/* Currency Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Choose Currency
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {currencies.map((currency) => (
                      <button
                        key={currency.id}
                        onClick={() => setSelectedCurrency(currency.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                          selectedCurrency === currency.id
                            ? 'border-yellow-400 bg-yellow-400/10'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${currency.color} rounded-full flex items-center justify-center`}>
                            <currency.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-white font-medium">{currency.name}</div>
                            <div className="text-slate-400 text-sm">{currency.symbol}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Withdrawal Amount (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <p className="text-slate-400">Minimum withdrawal: $10</p>
                    <p className="text-slate-300">Available: ${user?.balance?.toLocaleString() || '0'}</p>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!withdrawalAmount || parseFloat(withdrawalAmount) < 10 || parseFloat(withdrawalAmount) > (user?.balance || 0)}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Wallet Address</h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-yellow-400 hover:text-yellow-300 text-sm"
                  >
                    ← Back
                  </button>
                </div>

                <div className="bg-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-white font-semibold text-lg">
                      ${parseFloat(withdrawalAmount).toLocaleString()} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Currency:</span>
                    <span className="text-white font-semibold">{selectedCurrency}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your {selectedCurrency} Wallet Address
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder={`Enter your ${selectedCurrency} wallet address`}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <p className="text-slate-400 text-sm mt-2">
                    Make sure this address is correct. Funds sent to wrong addresses cannot be recovered.
                  </p>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div className="text-red-400 text-sm">
                      <p className="font-medium mb-1">Important Warning:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Double-check your wallet address before submitting</li>
                        <li>• Use only {selectedCurrency} compatible addresses</li>
                        <li>• Withdrawals cannot be reversed once processed</li>
                        <li>• Processing may take 24-48 hours</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmitWithdrawal}
                  disabled={!walletAddress || isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting Request...
                    </div>
                  ) : (
                    <>
                      Submit Withdrawal Request
                      <ArrowDownLeft className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Balance */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Current Balance</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  ${user?.balance?.toLocaleString() || '0'}
                </div>
                <p className="text-slate-400 text-sm">Available for withdrawal</p>
              </div>
            </div>

            {/* Withdrawal Info */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Withdrawal Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Processing Time</p>
                    <p className="text-slate-400 text-xs">24-48 hours for review and processing</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Secure Process</p>
                    <p className="text-slate-400 text-xs">All withdrawals are manually verified</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Minimum Amount</p>
                    <p className="text-slate-400 text-xs">$10 minimum withdrawal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
              <p className="text-slate-400 text-sm mb-4">
                Our support team is available 24/7 to assist you with your withdrawals.
              </p>
              <button className="w-full py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;