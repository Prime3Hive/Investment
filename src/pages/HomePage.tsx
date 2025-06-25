import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Shield, Clock, Users, ArrowRight, Star, CheckCircle } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  // If user is logged in, redirect to dashboard
  if (user) {
    window.location.href = '/dashboard';
    return null;
  }

  const plans = [
    {
      name: 'Starter',
      roi: 5,
      duration: 24,
      minAmount: 50,
      maxAmount: 500,
      description: 'Perfect for beginners'
    },
    {
      name: 'Professional',
      roi: 10,
      duration: 48,
      minAmount: 500,
      maxAmount: 2000,
      description: 'For experienced investors'
    },
    {
      name: 'Premium',
      roi: 15,
      duration: 72,
      minAmount: 2000,
      maxAmount: 10000,
      description: 'Maximum returns',
      popular: true
    },
    {
      name: 'VIP',
      roi: 20,
      duration: 168,
      minAmount: 10000,
      maxAmount: 50000,
      description: 'Exclusive high-yield plan'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Bank-level security for all transactions'
    },
    {
      icon: TrendingUp,
      title: 'High Returns',
      description: 'Up to 20% ROI on investments'
    },
    {
      icon: Clock,
      title: 'Quick Processing',
      description: 'Fast deposits and withdrawals'
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Round-the-clock customer service'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Grow Your Wealth with
            <span className="block text-yellow-400">Cryptocurrency</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of investors earning consistent returns with our secure and transparent investment platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-yellow-400 text-slate-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors inline-flex items-center justify-center"
            >
              Start Investing
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-transparent border-2 border-slate-600 text-white font-semibold rounded-lg hover:border-slate-500 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">$2.5M+</div>
              <div className="text-slate-300">Total Invested</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">5,000+</div>
              <div className="text-slate-300">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">99.9%</div>
              <div className="text-slate-300">Uptime</div>
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
              Choose the plan that fits your investment goals and risk tolerance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                  plan.popular
                    ? 'border-yellow-400 bg-yellow-400/5'
                    : 'border-slate-700 bg-slate-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{plan.roi}%</div>
                  <div className="text-slate-400 text-sm mb-4">in {plan.duration} hours</div>
                  <div className="text-slate-300 mb-4">
                    ${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()}
                  </div>
                  <p className="text-slate-400 text-sm mb-6">{plan.description}</p>
                  
                  <Link
                    to="/register"
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors block text-center ${
                      plan.popular
                        ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-500'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    Choose Plan
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
            {features.map((feature, index) => (
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Investing?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust Profitra with their financial future
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 bg-yellow-400 text-slate-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Get Started Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;