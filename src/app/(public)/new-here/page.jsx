import Image from 'next/image';
import { Clock, MapPin, Coffee, Car, ShieldCheck, Users } from 'lucide-react';
import FaqAccordion from '@/components/newhere/FaqAccordion';
import PlanVisitForm from '@/components/newhere/PlanVisitForm';

// ISR Configuration: Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400;

export const metadata = {
  title: 'New Here? | Welcome to Grace Community',
  description: 'Plan your first visit. We are a community where you can belong before you believe.',
};

export default function NewHerePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-red-100 selection:text-red-900">
      
      {/* HERO SECTION */}
      <section className="relative w-full py-20 lg:py-32 bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              Welcome Home. <br />
              <span className="text-red-600">You Belong Here.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              Walking into a new place can be intimidating, but we want you to feel comfortable. No pressure, no judgment, just a community of people learning to follow Jesus together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#plan-visit" 
                className="inline-flex justify-center items-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Plan Your Visit
              </a>
              <a 
                href="#what-to-expect" 
                className="inline-flex justify-center items-center px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors duration-200"
              >
                What to Expect
              </a>
            </div>
          </div>
          
          <div className="relative h-[400px] lg:h-[500px] w-full rounded-2xl overflow-hidden shadow-sm">
            <Image
              src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop"
              alt="Diverse group of people smiling and talking in a church lobby"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* SNAPSHOT SECTION */}
      <section className="py-16 border-y border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <SnapshotCard icon={Clock} title="75 Minutes" subtitle="Service Length" />
            <SnapshotCard icon={Users} title="Casual" subtitle="Dress Code" />
            <SnapshotCard icon={ShieldCheck} title="Safe Check-in" subtitle="For Kids" />
            <SnapshotCard icon={Car} title="Easy Parking" subtitle="On-site" />
            <SnapshotCard icon={Coffee} title="Coffee" subtitle="Free & Hot" />
          </div>
        </div>
      </section>

      {/* WHAT TO EXPECT (JOURNEY) */}
      <section id="what-to-expect" className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Your Sunday Experience</h2>
            <p className="text-slate-600 dark:text-slate-400">
              We have designed our Sunday mornings to be simple and meaningful. Here is a step-by-step of what your visit will look like.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <JourneyCard 
              step="01"
              title="Arrival & Parking"
              description="Our parking team will direct you to a spot. Look for the 'Guest Parking' signs near the front entrance."
              image="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"
            />
            <JourneyCard 
              step="02"
              title="The Service"
              description="Services last about 75 minutes. We sing modern songs, hear a practical message, and there is never any pressure to participate."
              image="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=2070&auto=format&fit=crop"
            />
            <JourneyCard 
              step="03"
              title="After Service"
              description="Stop by the 'New Here' desk in the lobby. We have a small gift for you and would love to answer any questions."
              image="https://images.unsplash.com/photo-1561089489-f13d5e730d72?q=80&w=1974&auto=format&fit=crop"
            />
          </div>
        </div>
      </section>

      {/* KIDS & YOUTH */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative h-[400px] w-full rounded-2xl overflow-hidden">
               <Image
                src="https://images.unsplash.com/photo-1502086223501-60190740b379?q=80&w=2056&auto=format&fit=crop"
                alt="Children playing and learning in a safe classroom environment"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold mb-6">Safe, Fun & Clean for Kids</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Your children are a priority to us. We have created a secure environment where kids can have fun, make friends, and learn about God at their own level.
              </p>
              
              <div className="space-y-6">
                <FeatureRow 
                  title="Secure Check-in" 
                  desc="We use a secure printed tag system for drop-off and pick-up to ensure safety." 
                />
                <FeatureRow 
                  title="Vetted Team" 
                  desc="Every volunteer undergoes a strict background check and safety training." 
                />
                <FeatureRow 
                  title="Age Appropriate" 
                  desc="Separate environments for Nursery, Preschool, and Elementary ages." 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEET THE TEAM */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Faces You Will See</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <TeamCard 
              name="Pastor Mark" 
              role="Lead Pastor" 
              image="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
            />
            <TeamCard 
              name="Sarah Jenkins" 
              role="Family Ministry" 
              image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
            />
            <TeamCard 
              name="David Chen" 
              role="Worship Leader" 
              image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"
            />
            <TeamCard 
              name="Michelle Ross" 
              role="Guest Services" 
              image="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
            />
          </div>
        </div>
      </section>

      {/* PLAN VISIT FORM */}
      <section id="plan-visit" className="py-24 bg-white dark:bg-slate-950 relative">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 h-1/2 w-full" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold mb-4">Plan Your Visit</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Let us know you are coming, and we will have a team member ready to greet you, show you around, and help you get your kids checked in.
            </p>
          </div>
          
          <PlanVisitForm />
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>
          <FaqAccordion items={[
            {
              question: "What should I wear?",
              answer: "We are casual here. You will see jeans, t-shirts, and maybe a few button-downs. Please wear whatever makes you feel comfortable."
            },
            {
              question: "Will I be asked for money?",
              answer: "Absolutely not. Giving is for our regular members. As a guest, your presence is the only gift we want. Please do not feel obligated to contribute."
            },
            {
              question: "Do I have to participate in the singing?",
              answer: "No. You are welcome to just listen and observe. We want you to engage at your own pace."
            },
            {
              question: "Is the building accessible?",
              answer: "Yes, our entire facility is wheelchair accessible, and we have reserved parking spots near the main entrance."
            },
            {
              question: "How long is the service?",
              answer: "Our services typically run about 75 minutes from start to finish."
            }
          ]} />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-red-600 dark:bg-red-700 text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">See You This Sunday?</h2>
          <p className="text-red-100 text-lg mb-10 max-w-2xl mx-auto">
            We can't wait to meet you. If you have any other questions, feel free to contact us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-slate-100 transition-colors">
              Get Directions
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-red-500 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* INTERNAL HELPER COMPONENTS                        */
/* -------------------------------------------------------------------------- */

function SnapshotCard({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-red-600 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6" />
      </div>
      <span className="font-bold text-slate-900 dark:text-white block">{title}</span>
      <span className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</span>
    </div>
  );
}

function JourneyCard({ step, title, description, image }) {
  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-48 relative w-full">
        <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <div className="p-8">
        <span className="text-red-600 font-bold text-sm tracking-wider mb-2 block">STEP {step}</span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FeatureRow({ title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1">
        <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
          <div className="w-2 h-2 bg-red-600 rounded-full" />
        </div>
      </div>
      <div>
        <h4 className="font-bold text-slate-900 dark:text-white">{title}</h4>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{desc}</p>
      </div>
    </div>
  );
}

function TeamCard({ name, role, image }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 border-2 border-slate-100 dark:border-slate-800">
        <Image src={image} alt={name} fill className="object-cover" sizes="128px" />
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white">{name}</h3>
      <p className="text-sm text-red-600">{role}</p>
    </div>
  );
}