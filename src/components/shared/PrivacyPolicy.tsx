import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-foreground">
          <p className="text-muted-foreground mb-6">
            <strong>Effective Date:</strong> January 1, 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              BetterParenting collects information to provide personalized parenting advice and improve our service:
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Information You Provide:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Account information (email, name, payment details)</li>
              <li>Parenting questions and conversations with our AI</li>
              <li>Child age ranges and general family information</li>
              <li>Feedback and support communications</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Automatically Collected Information:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Usage patterns and feature interactions</li>
              <li>Device and browser information</li>
              <li>IP address and general location data</li>
              <li>Session duration and frequency of use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide personalized AI parenting advice and support</li>
              <li>Improve our AI models and service quality</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send important service updates and communications</li>
              <li>Ensure platform security and prevent abuse</li>
              <li>Analyze usage patterns to enhance user experience</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Children's Privacy (COPPA Compliance)</h2>
            <p className="mb-4">
              <strong>Protecting Children Under 13:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>We do not knowingly collect personal information from children under 13</li>
              <li>Our service is designed for parent and guardian use only</li>
              <li>We do not request specific identifying information about children</li>
              <li>Parents may request deletion of any information about their children</li>
              <li>We do not share children's information with third parties</li>
            </ul>
            
            <p className="mb-4">
              <strong>Parental Rights:</strong> Parents have the right to review, delete, or refuse 
              further collection of information relating to their children. Contact us at 
              privacy@betterparenting.com to exercise these rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
            <p className="mb-4">
              We do not sell or rent your personal information. We may share information only in these limited circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Service Providers:</strong> Trusted partners who help operate our service (payment processing, cloud hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect safety</li>
              <li><strong>Business Transfers:</strong> In the event of a merger or acquisition</li>
              <li><strong>Consent:</strong> When you explicitly authorize sharing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-4">
              We implement robust security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>End-to-end encryption for sensitive communications</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Secure cloud infrastructure with access controls</li>
              <li>Employee training on data protection best practices</li>
              <li>Incident response procedures for security breaches</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p className="mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Remember your preferences and login status</li>
              <li>Analyze website usage and performance</li>
              <li>Provide personalized content and recommendations</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
            <p className="mb-4">
              You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
            <p className="mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
            <p className="mb-4">
              We retain your information only as long as necessary:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Account data: Until account deletion or 3 years of inactivity</li>
              <li>Conversation history: 2 years for service improvement</li>
              <li>Payment information: As required by financial regulations</li>
              <li>Usage analytics: Aggregated and anonymized for research</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. International Users</h2>
            <p className="mb-4">
              BetterParenting operates from the United States. If you're accessing our service 
              from outside the US, your information may be transferred to and processed in the 
              United States, which may have different privacy laws than your country.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy periodically. Significant changes will be 
              communicated via email or through our application. Your continued use of 
              BetterParenting constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="mb-4">
              For privacy-related questions or to exercise your rights, contact us at:
            </p>
            <p className="mb-4">
              <strong>Privacy Team</strong><br />
              Email: privacy@betterparenting.com<br />
              Phone: Available Monday-Friday, 9 AM - 5 PM PST
            </p>
            <p className="mb-4">
              <strong>Mailing Address:</strong><br />
              BetterParenting Privacy Team<br />
              [Company Address]<br />
              [City, State, ZIP Code]
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};