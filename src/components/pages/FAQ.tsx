import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Frequently Asked Questions</h1>
        
        <div className="text-muted-foreground mb-8">
          <p>Find answers to common questions about BetterParenting's AI-powered parenting advice and support.</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="how-it-works">
            <AccordionTrigger className="text-left">How does the AI parenting advice work?</AccordionTrigger>
            <AccordionContent>
              Our AI has been trained on extensive parenting research, child development principles, and expert guidance. 
              When you ask a question, the AI analyzes your situation and provides personalized advice based on 
              evidence-based parenting practices. The AI considers factors like your child's age, the specific challenge 
              you're facing, and established child psychology principles to offer relevant, actionable guidance.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="safety-reliability">
            <AccordionTrigger className="text-left">Is the AI advice safe and reliable?</AccordionTrigger>
            <AccordionContent>
              Our AI provides general parenting guidance based on established research and best practices. However, 
              it's important to remember that every child and family situation is unique. The AI is designed to 
              complement, not replace, professional advice from pediatricians, child psychologists, or other qualified 
              experts. For serious behavioral, health, or developmental concerns, always consult with appropriate professionals.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="age-ranges">
            <AccordionTrigger className="text-left">What age ranges does BetterParenting support?</AccordionTrigger>
            <AccordionContent>
              BetterParenting provides guidance for children from infancy through the teenage years (0-18 years). 
              Our AI is trained on developmental milestones, age-appropriate strategies, and stage-specific challenges 
              for each age group. Whether you're dealing with toddler tantrums, school-age behavioral issues, or 
              teenage communication challenges, our AI can provide relevant advice.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pricing">
            <AccordionTrigger className="text-left">What are the pricing options?</AccordionTrigger>
            <AccordionContent>
              We offer both free and premium options:
              <br /><br />
              <strong>Free Account:</strong> Includes 5 conversations per month with basic AI advice.
              <br /><br />
              <strong>Premium Subscription ($19.99/month):</strong> Unlimited conversations, priority support, 
              advanced features, and access to specialized content like developmental milestone tracking and 
              parenting resource libraries.
              <br /><br />
              All subscriptions come with a 30-day money-back guarantee.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="billing">
            <AccordionTrigger className="text-left">How does billing work?</AccordionTrigger>
            <AccordionContent>
              Premium subscriptions are billed monthly or annually, depending on your choice. All payments are 
              processed securely through our payment partners. You can update your payment method, view billing 
              history, and manage your subscription from your account settings. Billing occurs on the same date 
              each month that you initially subscribed.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cancellation">
            <AccordionTrigger className="text-left">Can I cancel my subscription anytime?</AccordionTrigger>
            <AccordionContent>
              Yes, you can cancel your subscription at any time through your account settings. Cancellations 
              take effect at the end of your current billing period, so you'll retain access to premium features 
              until then. There are no cancellation fees, and you can resubscribe at any time if you change your mind.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="privacy">
            <AccordionTrigger className="text-left">How is my family's privacy protected?</AccordionTrigger>
            <AccordionContent>
              We take privacy very seriously, especially when it comes to families and children. All conversations 
              are encrypted and stored securely. We don't share personal information with third parties, and we're 
              fully COPPA compliant for children's privacy protection. You can request deletion of your data at 
              any time. We recommend avoiding sharing specific identifying details about your children in conversations.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="emergency">
            <AccordionTrigger className="text-left">What if I have an emergency or urgent situation?</AccordionTrigger>
            <AccordionContent>
              BetterParenting is not designed for emergency situations. If you have an immediate safety concern, 
              medical emergency, or urgent mental health crisis involving your child, please contact:
              <br /><br />
              • Emergency services (911)
              <br />
              • Your child's pediatrician
              <br />
              • Local crisis hotlines
              <br />
              • Poison control (if applicable)
              <br /><br />
              Our AI is best suited for general parenting guidance, behavioral strategies, and developmental questions.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="technical-support">
            <AccordionTrigger className="text-left">What if I experience technical issues?</AccordionTrigger>
            <AccordionContent>
              If you encounter technical problems, try these steps first:
              <br /><br />
              1. Refresh your browser or restart the app
              <br />
              2. Check your internet connection
              <br />
              3. Clear your browser cache
              <br /><br />
              If the issue persists, contact our support team at support@betterparenting.com. Include details 
              about the problem, your device/browser information, and any error messages you're seeing. 
              We typically respond within 24 hours.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="conversation-history">
            <AccordionTrigger className="text-left">Can I access my previous conversations?</AccordionTrigger>
            <AccordionContent>
              Yes, all your conversations with the AI are saved in your account and can be accessed anytime. 
              This allows you to reference previous advice, track your progress with different strategies, 
              and maintain continuity in your parenting approach. Premium users have unlimited conversation 
              history, while free users can access their last 10 conversations.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="multiple-children">
            <AccordionTrigger className="text-left">Can I get advice for multiple children?</AccordionTrigger>
            <AccordionContent>
              Absolutely! You can ask questions about different children in the same account. We recommend 
              mentioning which child you're asking about (e.g., "my 5-year-old" or "my teenager") to help 
              the AI provide age-appropriate advice. The AI can help you navigate the unique challenges and 
              dynamics of families with multiple children, including sibling relationships and different developmental stages.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="languages">
            <AccordionTrigger className="text-left">Is BetterParenting available in languages other than English?</AccordionTrigger>
            <AccordionContent>
              Currently, BetterParenting is available in English only. We're working on expanding to additional 
              languages in the future. Our AI can understand and respond to basic questions in several languages, 
              but for the most accurate and comprehensive advice, we recommend using English.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="refunds">
            <AccordionTrigger className="text-left">What is your refund policy?</AccordionTrigger>
            <AccordionContent>
              We offer a 30-day money-back guarantee for new premium subscriptions. If you're not satisfied 
              with the service within your first 30 days, contact support@betterparenting.com for a full refund. 
              Refunds are processed to your original payment method within 5-7 business days. After the initial 
              30-day period, we don't offer refunds for partial billing periods, but you can cancel to avoid future charges.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            If you can't find the answer you're looking for, we're here to help.
          </p>
          <p className="text-sm">
            Email us at <a href="mailto:support@betterparenting.com" className="text-primary hover:underline">support@betterparenting.com</a> or 
            call us Monday-Friday, 9 AM - 5 PM PST.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};