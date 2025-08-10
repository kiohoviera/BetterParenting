import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none text-foreground">
          <p className="text-muted-foreground mb-6">
            <strong>Effective Date:</strong> January 1, 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Service Description</h2>
            <p className="mb-4">
              BetterParenting provides AI-powered parenting advice and support through our web application. 
              Our service offers personalized guidance on child development, behavior management, educational 
              support, and general parenting questions.
            </p>
            <p className="mb-4">
              <strong>Important:</strong> Our AI service is designed to provide general parenting guidance and 
              support. It is not a substitute for professional medical, psychological, or therapeutic advice. 
              Always consult with qualified healthcare providers for medical concerns.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate information when using our service</li>
              <li>Use the service only for lawful purposes</li>
              <li>Respect the privacy and safety of children</li>
              <li>Not share personal account access with others</li>
              <li>Report any technical issues or concerns promptly</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Prohibited Uses</h2>
            <p className="mb-4">You may not use our service to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Seek emergency medical or psychological intervention</li>
              <li>Share harmful, abusive, or inappropriate content about children</li>
              <li>Attempt to reverse engineer or misuse our AI technology</li>
              <li>Violate any local, state, or federal laws</li>
              <li>Impersonate others or provide false information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Children's Privacy (COPPA Compliance)</h2>
            <p className="mb-4">
              BetterParenting is committed to protecting children's privacy in accordance with the 
              Children's Online Privacy Protection Act (COPPA):
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>We do not knowingly collect personal information from children under 13</li>
              <li>Our service is intended for use by parents and guardians, not children directly</li>
              <li>If we discover we have collected information from a child under 13, we will delete it immediately</li>
              <li>Parents have the right to review, delete, or refuse further collection of their child's information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
            <p className="mb-4">
              BetterParenting offers both free and premium subscription services:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Free accounts include limited monthly conversations</li>
              <li>Premium subscriptions provide unlimited access and advanced features</li>
              <li>Subscription fees are billed monthly or annually as selected</li>
              <li>All payments are processed securely through our payment partners</li>
              <li>Refunds are available within 30 days of initial subscription purchase</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Cancellation Policy</h2>
            <p className="mb-4">
              You may cancel your subscription at any time:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Cancellations take effect at the end of the current billing period</li>
              <li>You retain access to premium features until the subscription expires</li>
              <li>No partial refunds for mid-cycle cancellations</li>
              <li>Account data is retained for 30 days after cancellation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="mb-4">
              BetterParenting provides information and guidance but cannot guarantee specific outcomes. 
              We are not liable for decisions made based on our AI advice. Users assume full 
              responsibility for parenting decisions and child welfare.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Modifications to Terms</h2>
            <p className="mb-4">
              We may update these terms periodically. Users will be notified of significant changes 
              via email or through the application. Continued use constitutes acceptance of updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms of Service, contact us at:
            </p>
            <p className="mb-4">
              Email: legal@betterparenting.com<br />
              Phone: Available Monday-Friday, 9 AM - 5 PM PST
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
            <p className="mb-4">
              These terms are governed by the laws of the State of California, United States. 
              Any disputes will be resolved through binding arbitration in accordance with the 
              rules of the American Arbitration Association.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};