import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInvestment } from '../contexts/InvestmentContext';
import { TrendingUp, Clock, Shield, ArrowRight, CheckCircle, AlertCircle, Star } from 'lucide-react';

const InvestPage: React.FC = () => {
  const { user } = useAuth();
  const { plans, createInvestment, isLoading } = useInvestment();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);
  const [error, setError] = useState('');

  const handleInvest = async () => {
    if (!selectedPlan || !investmentAmount || !user) return;

    const amount = parseFloat(investmentAmount);
    const plan = plans.find(p => p.id === selectedPlan);

    if (!plan) {
      setError('Invalid plan selected');
      return;
    }

    if (amount < plan.minAmount || amount > plan.maxAmount) {
      setError(`Amount must be between $${plan.minAmount.toLocaleString()} and $${plan.maxAmount.toLocaleString()}`);
      return;
    }

    if (amount > user.balance) {
      setError('Insufficient balance. Please make a deposit first.');
      return;
    }

    setIsInvesting(true);
    setError('');

    try {
      const result = await createInvestment(selectedPlan, amount);
      
      if (result) {
        // Reset form
        setSelectedPlan(null);
        setInvestmentAmount('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsInvesting(false);
    }
  };

  const calculateProfit = (amount: number, roi: number) => {
    return (amount * roi) / 100;
  };

  const calculateTotal = (amount: number, roi: number) => {
    return amount + calculateProfit(amount, roi);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading investment plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Investment Plans</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Choose the perfect investment plan that matches your financial goals
          </p>
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg inline-block">
            <p className="text-blue-400 text-sm">
              <Shield className="w-4 h-4 inline mr-1" />
              Your current balance: <span className="font-semibold">${user?.balance?.toLocaleString() || '0'}</span>
            </p>
          </div>
        </div>

        {/* Investment Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative bg-slate-800 rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                selectedPlan === plan.id
                  ? 'border-yellow-400 bg-yellow-400/5'
                  : index === 2
                  ? 'border-yellow-400/50 bg-gradient-to-br from-yellow-400/10 to-yellow-600/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {index === 2 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-yellow-400 mb-2">{plan.roi}%</div>
                <div className="text-slate-300 mb-4 flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-1" />
                  in {plan.durationHours > 24 ? `${plan.durationHours / 24} days` : `${plan.durationHours} hours`}
                </div>
                <div className="text-slate-400 mb-6">
                  ${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()}
                </div>
                <p className="text-slate-300 text-sm mb-6">{plan.description}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Guaranteed Returns
                  </div>
                  <div className="flex items-center justify-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    24/7 Support
                  </div>
                  <div className="flex items-center justify-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Instant Activation
                  </div>
                </div>

                <div className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                    : index === 2
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 hover:from-yellow-500 hover:to-yellow-700'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}>
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Investment Form */}
        {selectedPlan && (
          <div className="max-w-2xl mx-auto bg-slate-800 rounded-lg p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Make Investment</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Selected Plan
                </label>
                <div className="p-4 bg-slate-700 rounded-lg">
                  <p className="text-white font-semibold">
                    {plans.find(p => p.id === selectedPlan)?.name}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {plans.find(p => p.id === selectedPlan)?.roi}% ROI in{' '}
                    {plans.find(p => p.id === selectedPlan)?.durationHours} hours
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Investment Amount ($)
                </label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                {investmentAmount && selectedPlan && (
                  <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Investment:</span>
                      <span className="text-white">${parseFloat(investmentAmount || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Profit:</span>
                      <span className="text-green-400">
                        ${calculateProfit(parseFloat(investmentAmount || '0'), 
                          plans.find(p => p.id === selectedPlan)?.roi || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-slate-600 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 font-medium">Total Return:</span>
                        <span className="text-yellow-400 font-bold">
                          ${calculateTotal(parseFloat(investmentAmount || '0'), 
                            plans.find(p => p.id === selectedPlan)?.roi || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleInvest}
                disabled={!investmentAmount || isInvesting}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
              >
                {isInvesting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mr-2"></div>
                    Processing Investment...
                  </div>
                ) : (
                  <>
                    Invest Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-slate-400 text-sm">
                  Need more funds?{' '}
                  <a href="/deposit" className="text-yellow-400 hover:text-yellow-300 underline">
                    Make a deposit
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure Investment</h3>
            <p className="text-slate-400 text-sm">
              Your investments are protected with bank-level security measures
            </p>
          </div>

          <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Guaranteed Returns</h3>
            <p className="text-slate-400 text-sm">
              Earn fixed returns on your investments with our proven strategies
            </p>
          </div>

          <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Quick Turnaround</h3>
            <p className="text-slate-400 text-sm">
              Get your returns quickly with our fast-track investment plans
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestPage;