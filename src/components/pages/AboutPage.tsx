import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GraduationCap, Award, Users, BookOpen } from "lucide-react";

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="heading-warm text-4xl md:text-5xl font-bold">
            Meet Our Expert Team
          </h1>
          <p className="text-gentle text-lg max-w-3xl mx-auto">
            Our AI parenting coach is trained by leading child development experts who bring decades of 
            real-world experience to help guide your family journey.
          </p>
        </section>

        {/* Team Section */}
        <section className="space-y-12">
          <h2 className="heading-warm text-3xl font-bold text-center">
            The Experts Behind Our AI
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Dr. Carol Morecki-Oberg */}
            <Card className="bg-white/80 backdrop-blur shadow-warm border-0">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-32 h-32 mx-auto bg-gradient-warm rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">CM</span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-primary">Dr. Carol Moreck-Oberg, Ed.D.</h3>
                  <p className="text-accent font-medium">Educational Psychologist & Parenting Advisor</p>
                </div>

                <div className="flex justify-center space-x-4 text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="w-4 h-4" />
                    <span className="text-sm">Ed.D. Education</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span className="text-sm">40+ Years Experience</span>
                  </div>
                </div>

                <p className="text-gentle text-sm leading-relaxed text-left">
                  Dr. Carol Moreck-Oberg is a highly respected educator and parenting advisor with over 40 years of experience helping families navigate childhood development, learning challenges, and emotional growth. As the daughter of Holocaust survivors, Dr. Moreck-Oberg brings an extraordinary depth of empathy, wisdom, and resilience to her work.
                </p>

                <p className="text-gentle text-sm leading-relaxed text-left">
                  Holding a Doctorate in Education, she has guided countless parents, teachers, and children through real-world challenges with clarity and compassion. Her approach blends evidence-based developmental theory with practical, emotionally intelligent strategies for the modern family.
                </p>

                <p className="text-gentle text-sm leading-relaxed text-left font-medium text-primary">
                  As a senior advisor to BetterParent AI, Dr. Moreck-Oberg helps ensure that every response is grounded in real human understanding, not just clinical theory — supporting parents in the moments that matter most.
                </p>

                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Expertise Areas:</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">Educational Psychology</span>
                    <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">Learning Challenges</span>
                    <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">Emotional Growth</span>
                    <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">Family Systems</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dr. Sofia Doyle */}
            <Card className="bg-white/80 backdrop-blur shadow-warm border-0">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-32 h-32 mx-auto bg-gradient-accent rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">SD</span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-primary">Dr. Sofia Doyle, Ed.D.</h3>
                  <p className="text-accent font-medium">Child Development Specialist & Educational Consultant</p>
                </div>

                <div className="flex justify-center space-x-4 text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="w-4 h-4" />
                    <span className="text-sm">Ed.D. Education</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">15+ Years Experience</span>
                  </div>
                </div>

                <p className="text-gentle text-sm leading-relaxed text-left">
                  Dr. Sofia Doyle is a dedicated child development expert with a Doctorate in Education and a background in early childhood learning and behavior. With over 15 years of experience in schools, research, and family systems, she specializes in helping parents respond effectively to their children's developmental and emotional needs.
                </p>

                <p className="text-gentle text-sm leading-relaxed text-left">
                  Her work focuses on bridging the gap between academic theory and real-world parenting — offering grounded, empathetic tools that work in daily life. Whether guiding teachers through classroom challenges or supporting parents through bedtime battles, Dr. Doyle brings a calm, research-informed voice to every situation.
                </p>

                <p className="text-gentle text-sm leading-relaxed text-left font-medium text-primary">
                  At BetterParent AI, Dr. Doyle plays a key role in shaping our child development framework, ensuring each recommendation reflects both the latest educational science and the lived reality of family life.
                </p>

                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Expertise Areas:</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">Child Development</span>
                    <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">Early Childhood Learning</span>
                    <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">Educational Consulting</span>
                    <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">Family Systems</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Our Approach */}
        <section className="bg-white/60 backdrop-blur rounded-2xl p-8 md:p-12 shadow-soft">
          <div className="text-center space-y-8">
            <h2 className="heading-warm text-3xl font-bold">Our Training Methodology</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-warm rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary">Evidence-Based</h3>
                <p className="text-gentle text-sm">
                  Our AI is trained on the latest research in child development, positive psychology, 
                  and family therapy techniques.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-accent rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary">Real-World Tested</h3>
                <p className="text-gentle text-sm">
                  Every response is based on real scenarios from our experts' combined 40+ years 
                  of working with families.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-warm rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary">Continuously Updated</h3>
                <p className="text-gentle text-sm">
                  Our team regularly reviews and updates the AI training to incorporate the latest 
                  developments in parenting research.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="text-center space-y-6">
          <h2 className="heading-warm text-3xl font-bold">Our Mission</h2>
          <p className="text-gentle text-lg max-w-3xl mx-auto leading-relaxed">
            We believe every parent deserves access to expert guidance when they need it most. 
            By combining cutting-edge AI technology with decades of child development expertise, 
            we're making professional parenting support accessible, affordable, and available 24/7.
          </p>
          <p className="text-accent font-medium">
            "Supporting families, one conversation at a time."
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};