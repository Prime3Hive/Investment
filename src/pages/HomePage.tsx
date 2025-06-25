import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Shield, Clock, Users, ArrowRight, Star } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  // Redirect if user is logged in
  if (user) {
    window.location.href = '/dashboard';
    return null;
  }

  const plans = [
    {
      name: 'Starter',
      minAmount: 50,
      maxAmount: 1000,
      roi: 5,
      duration: 24,
      popular: false,
    },
    {
      name: 'Silver',
      minAmount: 1000,
      maxAmount: 4990,
      roi: 10,
      duration: 48,
      popular: false,
    },
    {
      name: 'Gold',
      minAmount: 5000,
      maxAmount: 10000,
      roi: 15,
      duration: 72,
      popular: true,
    },
    {
      name: 'Platinum',
      minAmount: 10000,
      maxAmount: 100000,
      roi: 20,
      duration: 168, // 7 days
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Grow Your Wealth with
            <span className="block text-yellow-400">Smart Investments</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Join thousands of investors earning consistent returns with our secure cryptocurrency investment platform. 
            Start building your financial future today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-yellow-400 text-slate-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Start Investing
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/signin"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-slate-600 text-white font-semibold rounded-lg hover:border-slate-500 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">$2.5M+</div>
              <div className="text-slate-300">Total Invested</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">5,000+</div>
              <div className="text-slate-300">Active Investors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">99.9%</div>
              <div className="text-slate-300">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-slate-300">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Investment Plans</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Choose from our carefully designed investment plans to maximize your returns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 border-yellow-400'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{plan.roi}%</div>
                  <div className="text-slate-300 mb-4">
                    in {plan.duration > 24 ? `${plan.duration / 24} days` : `${plan.duration} hours`}
                  </div>
                  <div className="text-slate-400 mb-6">
                    ${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()}
                  </div>
                  
                  <Link
                    to="/signup"
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors block text-center ${
                      plan.popular
                        ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-500'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Profitra?</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              We provide the security, returns, and support you need for successful investing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure & Safe',
                description: 'Bank-level security for all transactions and investments'
              },
              {
                icon: TrendingUp,
                title: 'High Returns',
                description: 'Earn up to 20% ROI with our proven investment strategies'
              },
              {
                icon: Clock,
                title: 'Quick Processing',
                description: 'Fast deposits and instant investment activation'
              },
              {
                icon: Users,
                title: '24/7 Support',
                description: 'Round-the-clock customer service and assistance'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-slate-900" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Investment Journey?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied investors who trust Profitra with their financial future
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 bg-yellow-400 text-slate-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Create Account Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;