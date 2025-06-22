import React from 'react';
import { Shield, TrendingUp, Users, Award, Target, Globe } from 'lucide-react';

const AboutPage: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Bank-level security with advanced encryption to protect your investments and personal data.'
    },
    {
      icon: TrendingUp,
      title: 'Proven Returns',
      description: 'Consistent performance with transparent reporting and guaranteed returns on all investment plans.'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Led by experienced professionals with decades of combined experience in cryptocurrency trading.'
    },
    {
      icon: Award,
      title: 'Industry Recognition',
      description: 'Award-winning platform recognized for innovation and excellence in cryptocurrency investment.'
    },
    {
      icon: Target,
      title: 'Goal-Oriented',
      description: 'Tailored investment strategies designed to help you achieve your specific financial goals.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Serving investors worldwide with 24/7 support and multi-currency capabilities.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      experience: '15+ years in FinTech',
      image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      experience: '12+ years in Blockchain',
      image: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'Emma Davis',
      role: 'Head of Trading',
      experience: '10+ years in Crypto Trading',
      image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Profitra</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            We're revolutionizing cryptocurrency investment with secure, transparent, and profitable solutions 
            for investors of all levels. Join thousands who trust us with their financial future.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                To democratize cryptocurrency investment by providing secure, accessible, and profitable 
                investment opportunities for everyone, regardless of their experience level.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">5,000+</div>
                <div className="text-slate-300">Active Investors</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">$2.5M+</div>
                <div className="text-slate-300">Total Investments</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">99.9%</div>
                <div className="text-slate-300">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Profitra?</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              We combine cutting-edge technology with proven investment strategies to deliver exceptional results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-slate-900" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Our experienced leadership team brings together decades of expertise in finance, technology, and cryptocurrency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-yellow-400 text-sm mb-2">{member.role}</p>
                <p className="text-slate-400 text-sm">{member.experience}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="bg-slate-800 rounded-2xl p-8 md:p-12 border border-slate-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Our Values</h2>
              <p className="text-lg text-slate-300">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Transparency</h3>
                <p className="text-slate-400">
                  We believe in complete transparency in all our operations. Every investment, 
                  return, and fee is clearly documented and accessible to our investors.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Security</h3>
                <p className="text-slate-400">
                  Your security is our top priority. We employ the latest security measures 
                  and best practices to protect your investments and personal information.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Innovation</h3>
                <p className="text-slate-400">
                  We continuously innovate and adapt to the evolving cryptocurrency landscape 
                  to provide you with the best investment opportunities.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Customer Success</h3>
                <p className="text-slate-400">
                  Your success is our success. We're committed to helping you achieve your 
                  financial goals through personalized support and guidance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Investment Journey?</h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied investors who have chosen Profitra as their trusted investment partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105"
            >
              Get Started Today
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-600"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;