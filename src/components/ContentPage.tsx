import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { AppState, ContentPageId } from '../types';
import { ArrowLeft, ShieldCheck, MapPin, CreditCard, Star, Users, CheckCircle, Navigation } from 'lucide-react';
import Logo from './Logo';

interface Props {
  setView: (view: AppState) => void;
  pageId: ContentPageId;
}

const pageData: Record<
  ContentPageId, 
  { 
    title: string; 
    subtitle: string; 
    icon: any; 
    content: ReactNode | ((setView: (view: AppState) => void) => ReactNode);
  }
> = {
  'ride-airport': {
    title: 'Airport Transfers',
    subtitle: 'Begin or end your journey with punctual, professional chauffeurs.',
    icon: Navigation,
    content: (
      <div className="space-y-6">
        <p>Wheez operates seamless airport transfers with a guaranteed wait time included. Your driver tracks your flight and arrives just when you need them.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Complimentary 60-minute wait time for airport pickups</li>
          <li>Flight tracking adjustments at no extra cost</li>
          <li>Curbside or Meet & Greet inside the terminal</li>
        </ul>
      </div>
    )
  },
  'ride-long': {
    title: 'Long Distance Trips',
    subtitle: 'The best alternative to short-haul flights and trains.',
    icon: MapPin,
    content: (
      <div className="space-y-6">
        <p>City-to-city transfers in the comfort of your own vehicle. Sit back, catch up on work, or simply relax while our professional driver navigates the highways.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Flat rates with no hidden tolls or surging</li>
          <li>Stop along the route whenever you wish</li>
          <li>Vetted drivers with long-distance experience</li>
        </ul>
      </div>
    )
  },
  'service-luxury': {
    title: 'Luxury Fleet',
    subtitle: 'Premium vehicles driven by professional chauffeurs.',
    icon: Star,
    content: (setView) => (
      <div className="space-y-6">
        <p>Book a premium vehicle from our curated luxury fleet. Whether for corporate events, special occasions, or simply traveling in exceptional comfort, our luxury service includes both the high-end vehicle and a professional Chauffeur.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Select from Executive SUVs, Premium Sedans, and Luxury Vans</li>
          <li>All vehicles arrive meticulously cleaned and maintained</li>
          <li>Service includes a highly-rated, professional driver</li>
          <li>Complimentary amenities included for long trips</li>
        </ul>
        <div className="pt-6 border-t border-black/10">
          <h4 className="font-display text-xl mb-4">Pricing starts at:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
             <div className="p-4 bg-black/5 rounded-xl">
                 <div className="font-semibold mb-1">Executive SUV</div>
                 <div className="text-brand-muted">₦100,000 / day</div>
             </div>
             <div className="p-4 bg-black/5 rounded-xl">
                 <div className="font-semibold mb-1">Premium Sedan</div>
                 <div className="text-brand-muted">₦120,000 / day</div>
             </div>
             <div className="p-4 bg-black/5 rounded-xl">
                 <div className="font-semibold mb-1">Luxury Van</div>
                 <div className="text-brand-muted">₦150,000 / day</div>
             </div>
          </div>
          <button 
             onClick={() => setView('customer')}
             className="px-8 py-4 bg-[#191814] text-[#FAF9F6] rounded-xl font-medium hover:bg-black transition-colors"
          >
            Start your booking
          </button>
        </div>
      </div>
    )
  },
  'ride-events': {
    title: 'Events & Nightlife',
    subtitle: 'Arrive in style. Return in safety.',
    icon: Star,
    content: (
      <div className="space-y-6">
        <p>From galas to weddings, or simply a night out in the city. Your driver remains on standby, waiting safely with your car.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Hourly booking with unlimited stops</li>
          <li>Discreet and professional evening service</li>
          <li>Wait & Return features ensure you never wait for a ride</li>
        </ul>
      </div>
    )
  },
  'ride-hospital': {
    title: 'Hospital & Medical',
    subtitle: 'Reliable transport when you need it most.',
    icon: ShieldCheck,
    content: (
      <div className="space-y-6">
        <p>A trusted professional to handle the driving for medical appointments, day surgeries, or hospital discharges using your own comfortable vehicle.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Door-to-door compassionate assistance</li>
          <li>Flexible wait times during appointments</li>
          <li>Clean and strictly smoke-free driver guarantees</li>
        </ul>
      </div>
    )
  },
  'drive-become': {
    title: 'Become a Driver',
    subtitle: 'Earn on your terms without the wear and tear.',
    icon: Users,
    content: (
      <div className="space-y-6">
        <p>Join our exclusive network of vetted chauffeurs. You bring the professionalism, the client brings the car. Enjoy higher hourly rates without depreciation costs.</p>
        <p>Our drivers are carefully selected, hospitality-trained professionals who understand that driving is just part of the service.</p>
      </div>
    )
  },
  'drive-requirements': {
    title: 'Driver Requirements',
    subtitle: 'Our standards of excellence.',
    icon: CheckCircle,
    content: (
      <div className="space-y-6">
        <p>To ensure passenger safety and comfort, all drivers must pass our rigorous 5-step vetting process.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Minimum 25 years old</li>
          <li>Clean driving record for a minimum of 5 years</li>
          <li>Comprehensive background check</li>
          <li>In-person driving assessment</li>
          <li>Professional reference checks</li>
        </ul>
      </div>
    )
  },
  'drive-earnings': {
    title: 'Earnings & Rates',
    subtitle: 'Transparent, reliable income.',
    icon: CreditCard,
    content: (
      <div className="space-y-6">
        <p>We believe in transparent compensation. Because you do not use your own vehicle, your gross earnings are much closer to your net profit.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Keep 70% of the total fare</li>
          <li>100% of all gratuities directly to you</li>
          <li>Guaranteed hourly minimums on designated shifts</li>
          <li>Higher base pay than standard rideshare platforms</li>
        </ul>
        <p>Our rate structure is designed to compensate you fairly for your time and professionalism, providing a stable income stream for dedicated drivers.</p>
      </div>
    )
  },
  'drive-payouts': {
    title: 'Weekly Payouts',
    subtitle: 'Fast and reliable disbursements.',
    icon: CreditCard,
    content: (
      <div className="space-y-6">
        <p>Earnings are calculated daily and deposited directly to your linked bank account every week. Instant payout options are available after 30 days of active service.</p>
        <p>We partner with leading financial institutions to ensure your earnings are secure and accessible. You can track your daily, weekly, and monthly earnings directly from the driver dashboard.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Standard ACH transfers clear every Wednesday</li>
          <li>Instant payout via debit card (small fee applies)</li>
          <li>Comprehensive tax documentation provided annually</li>
        </ul>
      </div>
    )
  },
  'company-about': {
    title: 'About Wheez',
    subtitle: 'The modern chauffeur experience.',
    icon: Star,
    content: (
      <div className="space-y-6">
        <p>Wheez was founded on a simple premise: people love their cars, but they don't always want to drive them.</p>
        <p>By disconnecting the driver from the vehicle, we've created a more sustainable, affordable, and luxurious way to travel, utilizing the millions of cars already on the road. We believe that your own vehicle is the most comfortable and personalized space you have.</p>
        <h3 className="font-display text-xl text-brand-text mt-8 mb-4">Our Mission</h3>
        <p>To provide safe, reliable, and professional driving services that give our customers their time back. Whether it's catching up on sleep after a long flight, preparing for a critical meeting, or safely returning from an event.</p>
      </div>
    )
  },
  'company-trust': {
    title: 'Trust & Safety',
    subtitle: 'Your peace of mind is our priority.',
    icon: ShieldCheck,
    content: (
      <div className="space-y-6">
        <p>We employ a dedicated safety monitoring team and comprehensive insurance policies that activate the moment our driver steps into your vehicle.</p>
        <h3 className="font-display text-xl text-brand-text mt-8 mb-4">Before the Ride</h3>
        <p>All drivers undergo continuous background checks, motor vehicle record reviews, and in-person interviews to ensure the highest standards.</p>
        <h3 className="font-display text-xl text-brand-text mt-8 mb-4">During the Ride</h3>
        <p>Every ride requires two-factor authentication, driver IDs, and real-time trip monitoring covering both driver and vehicle. We offer a 24/7 incident response line for any emergencies.</p>
        <h3 className="font-display text-xl text-brand-text mt-8 mb-4">Insurance Coverage</h3>
        <p>Wheez provides supplemental liability coverage up to $1,000,000 per incident during active trips, ensuring you and your vehicle are protected.</p>
      </div>
    )
  },
  'company-careers': {
    title: 'Careers at Wheez',
    subtitle: 'Build the future of mobility.',
    icon: Users,
    content: (
      <div className="space-y-6">
        <p>We are a remote-first team spread across 12 countries, unified by a mission to transform personal transportation. We're looking for engineers, designers, and operators to join us.</p>
        <p>At Wheez, we value autonomy, rigorous execution, and a strict focus on customer experience. We offer competitive compensation, comprehensive benefits, and the opportunity to shape a growing industry.</p>
        <div className="p-6 bg-brand-surface rounded-2xl border border-black/5 mt-6">
          <p className="text-base font-medium text-brand-text">No open corporate positions currently.</p>
          <p className="text-sm text-brand-muted mt-2">We are currently fully staffed, but we are always looking for exceptional talent. Reach out to careers@wheez.com with your resume.</p>
        </div>
      </div>
    )
  },
  'company-terms': {
    title: 'Terms of Service',
    subtitle: 'Legal information and agreements.',
    icon: Navigation,
    content: (
      <div className="space-y-6 text-sm text-brand-muted">
        <p>Last updated: June 2026</p>
        <p>Welcome to Wheez. By using our application, you agree to these terms...</p>
        <h3 className="font-medium text-brand-text mt-4">1. The Service</h3>
        <p>Wheez provides a platform matching users with professional drivers who operate the user's vehicle...</p>
        <h3 className="font-medium text-brand-text mt-4">2. Insurance & Liability</h3>
        <p>During a booked trip, Wheez provides supplemental liability coverage...</p>
      </div>
    )
  }
};

export default function ContentPage({ setView, pageId }: Props) {
  const data = pageData[pageId] || pageData['company-about'];
  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-brand-base flex flex-col items-center">
      <nav className="w-full max-w-[1440px] mx-auto px-6 py-6 flex justify-between items-center border-b border-black/5">
        <button 
          onClick={() => setView('landing')}
          className="flex items-center gap-2 hover:bg-black/5 px-4 py-2 rounded-full transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
          <Logo size={20} className="text-brand-text hover:rotate-12 transition-transform duration-300" />
          <span className="font-sans text-lg tracking-[0.15em] uppercase font-medium">Wheez</span>
        </div>
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto px-6 py-20"
      >
        <div className="w-16 h-16 bg-brand-surface border border-black/10 rounded-2xl flex items-center justify-center mb-8">
          <Icon className="w-8 h-8 text-brand-accent" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-display text-brand-text mb-4 leading-tight">{data.title}</h1>
        <p className="text-lg md:text-xl text-brand-muted mb-12 leading-relaxed">{data.subtitle}</p>

        <div className="prose prose-lg prose-slate text-brand-text">
          {typeof data.content === 'function' ? data.content(setView) : data.content}
        </div>
      </motion.div>
    </div>
  );
}
