import Image from 'next/image';
import Link from 'next/link';
import { 
  Clock, 
  MapPin, 
  Coffee, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Heart, 
  Music, 
  CheckCircle2 
} from 'lucide-react';

// Assuming these components exist in your project based on your upload
import FaqAccordion from '@/components/newhere/FaqAccordion';
import PlanVisitForm from '@/components/newhere/PlanVisitForm';

// ISR Configuration
export const revalidate = 86400;

export const metadata = {
  title: 'Welcome Home | Busia House of Transformation',
  description: 'Join us this Sunday. A place to belong, a place to become.',
};

export default function NewHerePage() {
  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 selection:bg-rose-900 selection:text-white">
      
      {/* 1. CINEMATIC HERO SECTION 
          Uses a solid overlay for text readability without gradients. 
      */}
      <section className="relative h-[85vh] w-full overflow-hidden flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop"
            alt="Worship atmosphere at Busia House of Transformation"
            fill
            priority
            className="object-cover"
          />
          {/* Solid Dark Overlay for contrast - No Gradient */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-full">
            <span className="inline-block py-1 px-3 mt-6 rounded-full bg-rose-600/90 text-white text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
              Welcome to Busia House of Transformation
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-8">
              Belong before <br/> 
              you <span className="text-rose-500">believe.</span>
            </h1>
            <p className="text-xl text-stone-200 leading-relaxed max-w-2xl mb-10 font-light">
              Whether you have been following Jesus for years or are just curious about faith, 
              you have a place here. We are a community dedicated to transformation, 
              authenticity, and doing life together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="#plan-visit" 
                className="inline-flex justify-center items-center px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-none transition-all duration-300"
              >
                Plan Your Visit
              </Link>
              <Link 
                href="#our-values" 
                className="inline-flex justify-center items-center px-8 py-4 bg-transparent border border-white text-white hover:bg-white hover:text-stone-900 font-semibold rounded-none transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE VIBE (Bento Grid Style)
          Modern, card-based layout to explain the culture.
      */}
      <section id="our-values" className="py-24 bg-white dark:bg-stone-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
                What to expect this Sunday
              </h2>
              <ul className="text-stone-600 dark:text-stone-400 bullet-list text-lg">              
                <li>A warm welcome at the front doors from our amazing ushering team.</li>
                <li>Spirit-led praise and worship songs by our worship team.</li>               
                <li>An opportunity to listen to the sermon from our lead pastor.</li>
                <li>An opportunity for any kids to participate in our kids ministry for a portion of the worship service</li>
                <li>A social space to chat and hang out as family and community.</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-8 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 h-full flex flex-col justify-between group hover:border-rose-200 transition-colors duration-300">
              <div className="w-12 h-12 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-rose-600 mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">SERVICE TIME</h3>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  We respect your time. Our services are designed to be impactful and concise, typically lasting one hour and fifteen minutes.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 h-full flex flex-col justify-between group hover:border-rose-200 transition-colors duration-300">
              <div className="w-12 h-12 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-rose-600 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">Come As You Are</h3>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  Jeans? Suits? Traditional wear? You will see it all. We care about your heart, not your wardrobe.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 h-full flex flex-col justify-between group hover:border-rose-200 transition-colors duration-300">
              <div className="w-12 h-12 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-rose-600 mb-6">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">Connection</h3>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  Arrive a few minutes early for hot coffee and conversation in our lobby. We love connecting with new faces.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PASTOR'S WELCOME 
          Adds a personal, human element (High trust factor).
      */}
      <section className="py-24 bg-stone-100 dark:bg-stone-950/50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] w-full bg-stone-200 dark:bg-stone-900">
               {/* Placeholder for Pastor's Image */}
               <Image
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
                alt="Lead Pastor"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="lg:pl-10">
              <h2 className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-4">A Note from Pastor Mark</h2>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mb-6">
                "We are not perfect people, but we serve a perfect God."
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-lg leading-relaxed mb-6">
                At Busia House of Transformation, we believe church isn't a museum for saints, but a hospital for the broken. 
                My hope is that when you walk through our doors, you feel an overwhelming sense of peace and acceptance.
              </p>
              <p className="text-stone-600 dark:text-stone-400 text-lg leading-relaxed mb-8">
                I can't wait to meet you personally after the service.
              </p>
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-stone-300 dark:bg-stone-700"></div>
                <span className="font-bold text-stone-900 dark:text-white">Mark & Sarah Jenkins</span>
                <span className="text-stone-500 text-sm">Lead Pastors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KIDS & FAMILY
          Clean, safe, and professional layout.
      */}
      <section className="py-24 bg-white dark:bg-stone-900">
        <div className="container mx-auto px-6 text-center max-w-3xl mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-6">
            Your Kids Are Safe Here
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-lg">
            We take the responsibility of caring for your children seriously. Our specialized kids' wing is secure, clean, and staffed by background-checked professionals.
          </p>
        </div>

        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
               <Image
                src="https://images.unsplash.com/photo-1502086223501-60190740b379?q=80&w=2056&auto=format&fit=crop"
                alt="Kids Ministry"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-stone-900/20" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Kids Transformation</h3>
                <p className="text-white/90">Ages 0 - 5th Grade</p>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
               <Image
                src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2069&auto=format&fit=crop"
                alt="Youth Ministry"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-stone-900/20" />
               <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Youth Culture</h3>
                <p className="text-white/90">Middle & High School</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-stone-100 dark:border-stone-800 pt-12">
            <FeatureItem icon={ShieldCheck} title="Secure Check-In" desc="Electronic tagging system for every child." />
            <FeatureItem icon={Heart} title="Loving Care" desc="Trained volunteers who love the next generation." />
            <FeatureItem icon={CheckCircle2} title="Background Checks" desc="Strict safety protocols for all staff." />
          </div>
        </div>
      </section>

      {/* 5. PLAN YOUR VISIT (Interactive)
          Split layout: Text on left, Form on right. 
      */}
      <section id="plan-visit" className="py-24 bg-stone-900 text-white relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-stone-800/30 transform skew-x-12 translate-x-32" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16">
            
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Let us roll out the red carpet.
              </h2>
              <p className="text-stone-300 text-lg mb-8 leading-relaxed">
                Planning a visit allows us to prepare a specialized welcome for you. 
                When you sign up, here is what happens:
              </p>
              
              <ul className="space-y-6 mb-10">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center shrink-0 mt-1">
                    <span className="font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">VIP Parking</h4>
                    <p className="text-stone-400 text-sm">We reserve a spot right up front for you.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center shrink-0 mt-1">
                    <span className="font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Personal Guide</h4>
                    <p className="text-stone-400 text-sm">Someone to show you around and help check in kids.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center shrink-0 mt-1">
                    <span className="font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Free Gift</h4>
                    <p className="text-stone-400 text-sm">A small token of our appreciation for coming.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-stone-950 p-2 rounded-lg">
                {/* Wrapping your existing form component to fit the design */}
                <PlanVisitForm />
            </div>

          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION
          Clean, minimalist accordion.
      */}
      <section className="py-24 bg-stone-50 dark:bg-stone-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">Common Questions</h2>
            <p className="text-stone-600 dark:text-stone-400">Everything you need to know before you arrive.</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
             <FaqAccordion items={[
                {
                  question: "Where are you located?",
                  answer: "We are located in the heart of Busia. [Insert Address Here]. Look for the Transformation House signs on the main road."
                },
                {
                  question: "What about my kids?",
                  answer: "We have a safe, clean, and fun environment for kids of all ages. Check-in opens 15 minutes before service starts."
                },
                {
                  question: "Do I have to dress up?",
                  answer: "No. We believe God cares about your heart, not your clothes. Wear what makes you comfortable."
                },
                {
                    question: "How can I get connected?",
                    answer: "The best way is to fill out a Connection Card during service or attend our 'Next Steps' class held every first Sunday of the month."
                }
              ]} />
          </div>
        </div>
      </section>

      {/* 7. FOOTER / DIRECTIONS
          Map placeholder and final CTA.
      */}
      <section className="h-[400px] w-full relative bg-stone-200">
         {/* Replaced generic map image with a placeholder for your actual Google Map embed */}
         <div className="absolute inset-0 bg-stone-300 flex items-center justify-center">
            <p className="text-stone-500 font-bold flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Google Maps Embed Goes Here
            </p>
         </div>
         
         <div className="absolute bottom-0 left-0 w-full bg-stone-900/90 text-white backdrop-blur-sm border-t border-stone-700">
            <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="text-2xl font-bold mb-1">Busia House of Transformation</h3>
                    <p className="text-stone-400">Sundays at 9:00AM & 11:00AM</p>
                </div>
                <a 
                    href="https://maps.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-white text-stone-900 font-bold hover:bg-rose-500 hover:text-white transition-colors"
                >
                    Get Directions <ArrowRight className="w-4 h-4" />
                </a>
            </div>
         </div>
      </section>

    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* HELPER COMPONENTS (Styled for this page)                                   */
/* -------------------------------------------------------------------------- */

function FeatureItem({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center md:items-start md:text-left">
      <div className="mb-4 text-rose-600">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="font-bold text-stone-900 dark:text-white text-lg mb-2">{title}</h4>
      <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed max-w-xs">{desc}</p>
    </div>
  );
}