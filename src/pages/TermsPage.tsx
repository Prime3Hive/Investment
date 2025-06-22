import React from 'react';
import { Shield, AlertTriangle, FileText, Scale } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Terms & Conditions</h1>
          <p className="text-lg text-slate-300">
            Please read these terms carefully before using our investment platform
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Last updated: January 1, 2024
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Investment Risk Warning</h3>
              <p className="text-red-300 text-sm">
                Cryptocurrency investments carry significant risk. Past performance does not guarantee future results. 
                Only invest what you can afford to lose. Please read all terms and conditions carefully.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Section 1: Acceptance of Terms */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
              </div>
              <div className="text-slate-300 space-y-3">
                <p>
                  By accessing and using Profitra's services, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms and Conditions. If you do not agree to these terms, 
                  please do not use our services.
                </p>
                <p>
                  These terms constitute a legally binding agreement between you and Profitra. We reserve 
                  the right to modify these terms at any time, and such modifications will be effective 
                  immediately upon posting.
                </p>
              </div>
            </section>

            {/* Section 2: Investment Services */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">2. Investment Services</h2>
              </div>
              <div className="text-slate-300 space-y-3">
                <p>
                  Profitra provides cryptocurrency investment services through various investment plans. 
                  Our services include:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Multiple investment plans with different risk levels and returns</li>
                  <li>Secure deposit and withdrawal processing</li>
                  <li>24/7 customer support</li>
                  <li>Real-time portfolio tracking and reporting</li>
                </ul>
                <p>
                  All investment returns are subject to market conditions and are not guaranteed. 
                  Past performance does not indicate future results.
                </p>
              </div>
            </section>

            {/* Section 3: User Responsibilities */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">3. User Responsibilities</h2>
              </div>
              <div className="text-slate-300 space-y-3">
                <p>As a user of our platform, you agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide accurate and truthful information during registration</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not use the platform for illegal activities</li>
                  <li>Report any suspicious activities or security breaches immediately</li>
                </ul>
                <p>
                  You are solely responsible for all activities that occur under your account. 
                  Profitra is not liable for any losses resulting from unauthorized use of your account.
                </p>
              </div>
            </section>

            {/* Section 4: Investment Risks */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Investment Risks</h2>
              <div className="text-slate-300 space-y-3">
                <p>
                  Cryptocurrency investments involve substantial risk and may not be suitable for all investors. 
                  Key risks include:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Market volatility and price fluctuations</li>
                  <li>Regulatory changes affecting cryptocurrency markets</li>
                  <li>Technology risks and potential system failures</li>
                  <li>Liquidity risks in certain market conditions</li>
                  <li>Potential total loss of invested capital</li>
                </ul>
                <p>
                  By investing through our platform, you acknowledge these risks and confirm that you 
                  can afford to lose your entire investment.
                </p>
              </div>
            </section>

            {/* Section 5: Deposits and Withdrawals */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Deposits and Withdrawals</h2>
              <div className="text-slate-300 space-y-3">
                <p>
                  All deposits and withdrawals are processed according to our standard procedures:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Deposits are manually verified and credited within 24 hours</li>
                  <li>Minimum deposit amounts apply as specified in each investment plan</li>
                  <li>Withdrawals are processed to your registered wallet addresses</li>
                  <li>We reserve the right to request additional verification for large transactions</li>
                  <li>Processing fees may apply to certain transactions</li>
                </ul>
              </div>
            </section>

            {/* Section 6: Privacy and Data Protection */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Privacy and Data Protection</h2>
              <div className="text-slate-300 space-y-3">
                <p>
                  We are committed to protecting your privacy and personal information. Our data practices include:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Secure storage of personal and financial information</li>
                  <li>Limited sharing of data only as necessary for service provision</li>
                  <li>Compliance with applicable data protection regulations</li>
                  <li>Regular security audits and updates</li>
                </ul>
                <p>
                  For detailed information about our data practices, please refer to our Privacy Policy.
                </p>
              </div>
            </section>

            {/* Section 7: Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
              <div className="text-slate-300 space-y-3">
                <p>
                  Profitra's liability is limited to the maximum extent permitted by law. We are not liable for:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Investment losses due to market conditions</li>
                  <li>Technical issues or system downtime</li>
                  <li>Third-party actions or services</li>
                  <li>Force majeure events beyond our control</li>
                  <li>Indirect, consequential, or punitive damages</li>
                </ul>
              </div>
            </section>

            {/* Section 8: Termination */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Account Termination</h2>
              <div className="text-slate-300 space-y-3">
                <p>
                  Either party may terminate the service agreement at any time. Profitra reserves the right to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Suspend or terminate accounts for violations of these terms</li>
                  <li>Close accounts for suspicious or illegal activities</li>
                  <li>Require additional verification before processing withdrawals</li>
                </ul>
                <p>
                  Upon termination, you remain liable for all outstanding obligations, and we will process 
                  any pending withdrawals according to our standard procedures.
                </p>
              </div>
            </section>

            {/* Section 9: Governing Law */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Governing Law</h2>
              <div className="text-slate-300 space-y-3">
                <p>
                  These Terms and Conditions are governed by and construed in accordance with the laws 
                  of the jurisdiction where Profitra is incorporated. Any disputes arising from these 
                  terms will be resolved through binding arbitration.
                </p>
              </div>
            </section>

            {/* Section 10: Contact Information */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. Contact Information</h2>
              <div className="text-slate-300 space-y-3">
                <p>
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <ul className="list-none space-y-1 ml-4">
                  <li>Email: legal@profitra.com</li>
                  <li>Phone: +1 (555) 123-4567</li>
                  <li>Address: 123 Financial District, New York, NY 10004</li>
                </ul>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            By continuing to use Profitra, you acknowledge that you have read and understood these terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;