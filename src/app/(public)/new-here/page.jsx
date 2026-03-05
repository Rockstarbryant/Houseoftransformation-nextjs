'use client';

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
  CheckCircle2,
  Play,
  Video,
  Smile,
  Hand,
  Zap,
  MapPinned,
  Phone,
  Mail,
  Instagram,
  Facebook,
  MessageCircle
} from 'lucide-react';

import FaqAccordion from '@/components/newhere/FaqAccordion';
import PlanVisitForm from '@/components/newhere/PlanVisitForm';

// TESTIMONIAL DATA
const testimonials = [
  {
    name: "Sarah M.",
    role: "First-time visitor (Now member)",
    quote: "I came alone and nervous. Within 5 minutes, I felt like family. The welcome here is genuine, not forced.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "James & Lucy",
    role: "Young family",
    quote: "Our kids ask when church is every week now. That's how we know we found our people. Great kids ministry too!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "David K.",
    role: "Skeptical about church",
    quote: "I wasn't sure about faith, but Pastor's message met me where I was. No judgment, just truth and grace.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop"
  }
];

export default function NewHerePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 selection:bg-red-900 selection:text-white">
      
      {/* ========================================
          1. CINEMATIC HERO WITH MICRO-CTA
          ======================================== */}
      <section className="relative min-h-[90vh] w-full overflow-hidden flex items-center">
        {/* Background Image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop"
            alt="Worship atmosphere at Busia House of Transformation"
            fill
            priority
            className="object-cover"
          />
          {/* Gradient overlay (left to right for depth) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/40" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Micro-CTA Badge */}
            <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur-md hover:bg-white/15 transition-colors">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white">🎵 Join us this Sunday at 9:00 AM or 11:00 AM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 md:mb-8">
              You're welcome <br className="hidden md:block" />
              <span className="text-red-500">here</span>.
            </h1>

            {/* Subheading with warmth */}
            <p className="text-lg md:text-xl text-slate-100 leading-relaxed mb-10 max-w-2xl font-light">
              Whether you've been following Jesus your whole life or you're just exploring faith, you belong at H.O.T. 
              We're a real community of real people, no judgment, just grace.
            </p>

            {/* Primary CTA Section */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link 
                href="#plan-visit" 
                className="inline-flex justify-center items-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-300 shadow-xl shadow-red-900/30 hover:shadow-red-900/50 group"
              >
                <span>Plan Your Visit</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center px-8 py-4 bg-white/20 border border-white/40 text-white font-bold rounded-lg hover:bg-white/30 transition-all duration-300 backdrop-blur-sm group"
              >
                <Video className="w-5 h-5 mr-2" />
                <span>Watch Service Highlights</span>
              </a>
            </div>

            {/* Secondary info - Social proof */}
            <div className="flex flex-col md:flex-row gap-6 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-red-400" />
                <span>Hundreds join us every Sunday</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-red-400" />
                <span>All welcome • No pretense</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          2. QUICK WIN: WHAT TO EXPECT SECTION
          ======================================== */}
      <section className="py-16 md:py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                Your First Sunday at H.O.T
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Here's exactly what happens when you walk through our doors
              </p>
            </div>

            {/* Timeline / Step-by-step */}
            <div className="space-y-6">
              {[
                { icon: MapPin, time: "8:55 AM", title: "You Arrive", desc: "Find easy parking. No VIP spots needed—just come as you are. Coffee & welcome team waiting." },
                { icon: Hand, time: "9:00 AM", title: "Warm Welcome", desc: "Real people greet you. Tell them it's your first time. They'll show you around, no awkward tours." },
                { icon: Music, time: "9:10 AM", title: "Worship Begins", desc: "Live band leads us in authentic worship. Sing, stand, sit—do what feels right. Everyone's included." },
                { icon: Zap, time: "9:25 AM", title: "The Message", desc: "Pastor Johnstone teaches God's Word with power & grace. Expect to be challenged and encouraged." },
                { icon: Users, time: "10:15 AM", title: "Community Time", desc: "Stick around! Chat with people, grab coffee, let your kids play. This is where real connections happen." },
              ].map((step, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 flex-shrink-0">
                      <step.icon className="w-6 h-6" />
                    </div>
                    {i < 4 && <div className="w-1 h-12 bg-slate-200 dark:bg-slate-800 my-2" />}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-bold text-red-600 uppercase tracking-wide">{step.time}</p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          3. TESTIMONIALS CAROUSEL
          Trust builder - Real stories from real people
          ======================================== */}
      <section className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Real Stories from Real People
            </h2>
            <p className="text-slate-300 text-lg">See what others are saying about their experience at H.O.T</p>
          </div>

          {/* Testimonial Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div 
                key={i}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:border-red-500/50 transition-all duration-300 group"
              >
                {/* Quote mark */}
                <div className="text-5xl text-red-500/30 mb-4 group-hover:text-red-500/60 transition-colors">"</div>

                {/* Quote */}
                <p className="text-white text-lg leading-relaxed mb-8 italic font-light">
                  {testimonial.quote}
                </p>

                {/* Author info */}
                <div className="flex items-center gap-4 pt-8 border-t border-white/10">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-300">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof line */}
          <div className="text-center mt-16">
            <p className="text-slate-300 text-sm">Join hundreds of others finding community and faith at H.O.T</p>
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
              <span className="text-slate-400 ml-2">Trusted by our community</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          4. PASTOR'S VIDEO WELCOME
          Personal, humanizes the church
          ======================================== */}
      <section className="py-20 md:py-28 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Video Placeholder */}
            <div className="relative aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden group">
              <Image
                src="https://res.cloudinary.com/dcu8uuzrs/image/upload/v1770703875/church-gallery/castwqxhl9wzg97y6mz0.jpg"
                alt="Pastor Johnstone's Welcome"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors shadow-xl group-hover:shadow-2xl">
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div>
              <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4">
                💬 A Personal Message
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">
                Welcome from Pastor Johnstone
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                "We believe that every person is invited to experience the transforming power of God's grace. 
                Whether you're a longtime believer or exploring faith for the first time, there's a seat at the 
                table for you here at H.O.T. We can't wait to meet you and be part of your journey."
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Smile className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Genuine Community</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">We're not perfect, just real.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Powerful Teaching</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Gospel that transforms daily life.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Authentic Welcome</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">No judgment, just grace and truth.</p>
                  </div>
                </div>
              </div>

              <a 
                href="https://youtube.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-bold transition-colors"
              >
                Watch full message <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          5. WHAT ABOUT MY KIDS? (Major concern)
          ======================================== */}
      <section className="py-20 md:py-28 bg-slate-100 dark:bg-slate-800/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 text-center">
              What About My Kids?
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 text-lg mb-12">
              Your child's safety and spiritual growth matter to us. Here's how we take care of them.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">Safe & Secure</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  All staff & volunteers background-checked. Secure check-in system. 
                  Your kid's safety is our top priority.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mx-auto mb-6">
                  <Music className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">Age-Appropriate Teaching</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Nursery through youth group—each age group gets teaching that meets them where they are.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mx-auto mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">Trained Leaders</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Our kids ministry leaders are passionate about spiritual formation & fun.
                </p>
              </div>
            </div>

            {/* Additional features */}
            <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-6">What Your Kids Can Expect</h3>
              <div className="grid md:grid-cols-2 gap-4 text-slate-600 dark:text-slate-400">
                {[
                  "Check-in is 15 minutes before service",
                  "Age-divided classes: Nursery, Preschool, K-5, Middle School, High School",
                  "Bible lessons designed to be engaging & memorable",
                  "Games, crafts, worship & snacks",
                  "Parent pickup immediately after service",
                  "Secure ID badge system for pickup",
                  "Safe, clean, climate-controlled classrooms",
                  "Weekly Bible verse take-home sheet"
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p>{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          6. PLAN YOUR VISIT FORM (Main CTA)
          ======================================== */}
      <section id="plan-visit" className="py-20 md:py-28 bg-gradient-to-br from-slate-900 to-slate-950 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Benefits/Info */}
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl md:text-5xl font-black mb-8">
                Let us roll out the red carpet.
              </h2>
              <p className="text-slate-200 text-lg mb-10 leading-relaxed">
                Planning your visit helps us prepare a genuine welcome just for you. 
                Here's what happens when you sign up:
              </p>
              
              <div className="space-y-6 mb-10">
                {[
                  { num: "1", title: "We Prepare", desc: "We reserve a spot for you with our welcome team." },
                  { num: "2", title: "Personal Greeting", desc: "Someone meets you at the door to guide you through your first visit." },
                  { num: "3", title: "No Surprises", desc: "We'll let you know exactly what to expect with your kids." },
                  { num: "4", title: "Follow-Up", desc: "We send you info about next steps without being pushy." }
                ].map((item) => (
                  <div key={item.num} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-sm">
                      {item.num}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-slate-300 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <ShieldCheck className="w-5 h-5 text-red-500" />
                <span>We respect your privacy. No spam, promise.</span>
              </div>
            </div>

            {/* Right: Form */}
            <div className="order-1 lg:order-2">
              <PlanVisitForm />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================
          7. PRACTICAL INFO SECTION
          Quick reference for practical needs
          ======================================== */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-12 text-center">
            Before You Come
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Location */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mb-6">
                <MapPinned className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">Where We Are</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Busia Main Campus<br/>
                [Insert Full Address]<br/>
                Busia County, Kenya
              </p>
              <a 
                href="https://maps.google.com/?q=Busia+House+of+Transformation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-bold text-sm"
              >
                Get directions <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Time */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">When We Meet</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                <strong>Sunday Services:</strong><br/>
                9:00 AM<br/>
                11:00 AM<br/>
                <br/>
                <strong>Midweek:</strong><br/>
                Wednesday 6:00 PM
              </p>
            </div>

            {/* Contact */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-6">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">Get In Touch</h3>
              <div className="space-y-3 text-sm">
                <a href="tel:+254..." className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 transition-colors">
                  <Phone className="w-4 h-4" />
                  +254 [Phone]
                </a>
                <a href="mailto:hello@hotbusia.com" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 transition-colors">
                  <Mail className="w-4 h-4" />
                  hello@hotbusia.com
                </a>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 pt-2">
                  <span className="text-xs">Follow us:</span>
                </div>
                <div className="flex gap-3">
                  <a href="https://instagram.com/hotministrieske" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-red-600 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://facebook.com/hotministrieske" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-red-600 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          8. FAQ SECTION
          ======================================== */}
      <section className="py-20 md:py-28 bg-slate-100 dark:bg-slate-800/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Common Questions Answered
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Still have questions? Check out our FAQ
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <FaqAccordion items={[
              {
                question: "Is there a dress code?",
                answer: "No. Come exactly as you are. We have people in jeans, suits, traditional wear, athleisure—whatever. God cares about your heart, not your outfit."
              },
              {
                question: "How long is the service?",
                answer: "About 75 minutes total. We respect your time. Typical flow: 15 min worship, 30 min message, 10 min ministry time, 20 min community connection."
              },
              {
                question: "I'm nervous about coming alone. What if I don't know anyone?",
                answer: "We're intentional about making first-time visitors feel welcome. Tell someone at the door it's your first time, and they'll stick with you. Most people find 2-3 friends by the end of service."
              },
              {
                question: "What if I have a different faith background?",
                answer: "We welcome sincere questions and doubt. H.O.T is a safe place to explore faith, ask hard questions, and experience grace regardless of where you're coming from."
              },
              {
                question: "Can I attend online?",
                answer: "Yes! We live-stream all Sunday services on our YouTube channel (House of Transformation TV). You'll also find messages on all our social media @HOTMinistriesKe."
              },
              {
                question: "How do I get involved after visiting?",
                answer: "There are tons of ways to get connected: small groups, volunteer teams, discipleship classes, youth groups, outreach ministries. Fill out a connection card during service and we'll follow up."
              },
              {
                question: "Is there parking? How early should I arrive?",
                answer: "Yes, plenty of free parking. Arrive 10-15 minutes early to find a spot, grab coffee, and let your kids settle into their ministry room."
              },
              {
                question: "What's the best way to stay updated about events?",
                answer: "Follow us on Instagram, Facebook, or X @HOTMinistriesKe. You can also sign up for our weekly email newsletter during your visit."
              }
            ]} />
          </div>
        </div>
      </section>

      {/* ========================================
          9. FINAL CTA - Interactive Map Section
          ======================================== */}
      <section className="h-screen md:h-[600px] w-full relative bg-slate-200 dark:bg-slate-800">
        {/* Map Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 font-bold flex items-center gap-2 justify-center">
              Google Maps Embed Goes Here
            </p>
          </div>
        </div>

        {/* Overlay with final CTA */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/50 to-transparent flex items-end">
          <div className="w-full bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 p-6 md:p-10">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-1">
                  Ready to visit?
                </h3>
                <p className="text-slate-300">We can't wait to meet you on Sunday.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Link 
                  href="#plan-visit"
                  className="inline-flex justify-center items-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-300 shadow-xl"
                >
                  Plan Your Visit
                </Link>
                <a 
                  href="https://maps.google.com/?q=Busia+House+of+Transformation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center items-center px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}