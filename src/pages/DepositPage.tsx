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
  Shield
} from 'lucide-react';

const DepositPage: React.FC = () => {
  const { user } = useAuth();
  const { walletAddresses, createDepositRequest } = useData();
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'USDT'>('BTC');
  const [depositAmount, setDepositAmount] = useState('');
  const [step, setStep] = useState(1); // 1: Amount, 2: Wallet, 3: Confirmation
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddresses[selectedCurrency]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDeposit = async () => {
    if (!user || !depositAmount) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      createDepositRequest(
        user.id,
        parseFloat(depositAmount),
        selectedCurrency,
        user.name
      );
      
      setStep(3);
    } catch (error) {
      console.error('Error creating deposit request:', error);
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
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Deposit Confirmation Received</h2>
          <p className="text-slate-400 mb-6">
            Thank you for confirming your deposit. Our team will verify your transaction and credit your account within 24 hours.
          </p>
          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Amount:</span>
              <span className="text-white font-semibold">${parseFloat(depositAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Currency:</span>
              <span className="text-white font-semibold">{selectedCurrency}</span>
            </div>
          </div>
          <div className="flex items-center justify-center text-yellow-400 text-sm mb-6">
            <Clock className="w-4 h-4 mr-2" />
            Processing time: Up to 24 hours
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
          <h1 className="text-3xl font-bold text-white mb-2">Make a Deposit</h1>
          <p className="text-slate-400">
            Add funds to your account to start investing
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
                    Deposit Amount (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <p className="text-slate-400 text-sm mt-2">
                    Minimum deposit: $50
                  </p>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!depositAmount || parseFloat(depositAmount) < 50}
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
                  <h2 className="text-xl font-semibold text-white">Send Payment</h2>
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
                      ${parseFloat(depositAmount).toLocaleString()} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Currency:</span>
                    <span className="text-white font-semibold">{selectedCurrency}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Send {selectedCurrency} to this address:
                  </label>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <code className="text-yellow-400 text-sm break-all">
                        {walletAddresses[selectedCurrency]}
                      </code>
                      <button
                        onClick={handleCopyAddress}
                        className="ml-4 p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">
                    {copied ? 'Address copied to clipboard!' : 'Click the copy button to copy the address'}
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div className="text-blue-400 text-sm">
                      <p className="font-medium mb-1">Important Instructions:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Send exactly the amount shown above</li>
                        <li>• Use only {selectedCurrency} network</li>
                        <li>• Double-check the wallet address</li>
                        <li>• Transaction may take 10-60 minutes to confirm</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmDeposit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-lg hover:from-green-500 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      I've Sent the Payment
                      <CheckCircle className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Deposit Info */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Deposit Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Instant Processing</p>
                    <p className="text-slate-400 text-xs">Deposits are processed within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Secure Transactions</p>
                    <p className="text-slate-400 text-xs">Bank-level security for all deposits</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Multiple Currencies</p>
                    <p className="text-slate-400 text-xs">Support for BTC and USDT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Balance */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Current Balance</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  ${user?.balance?.toLocaleString() || '0'}
                </div>
                <p className="text-slate-400 text-sm">Available for investment</p>
              </div>
            </div>

            {/* Support */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
              <p className="text-slate-400 text-sm mb-4">
                Our support team is available 24/7 to assist you with your deposits.
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

export default DepositPage;