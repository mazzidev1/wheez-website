import { useState } from 'react';
import { motion } from 'motion/react';
import { AppState, RideParams, ContentPageId } from '../types';
import { Plus, Search, Navigation, ShieldCheck, MapPin, CreditCard, Star } from 'lucide-react';
import blackDriver1 from '../assets/images/black_driver_1_1782130997869.jpg';
import blackDriver2 from '../assets/images/black_driver_2_1782131017319.jpg';
import blackDriver3 from '../assets/images/black_driver_3_1782131034891.jpg';
import blackDriver4 from '../assets/images/black_driver_4_1782131114685.jpg';
import blackDriver5 from '../assets/images/black_driver_5_1782131156760.jpg';
import blackDriver6 from '../assets/images/black_driver_6_1782131171987.jpg';
import blackPeople1 from '../assets/images/black_people_1_1782131223276.jpg';
import blackPeople2 from '../assets/images/black_people_2_1782131238647.jpg';
import blackPeople3 from '../assets/images/black_people_3_1782131253086.jpg';
import blackPeople4 from '../assets/images/black_people_4_1782131272734.jpg';
import heroArriving from '../assets/images/hero_arriving_driver_1782131826572.jpg';
import driverMaleCasual from '../assets/images/black_driver_male_casual_1782131849326.jpg';
import driverFemaleCorporate from '../assets/images/black_driver_female_corporate_1782131862029.jpg';
import luxurySuv from '../assets/images/luxury_suv_1782136584014.jpg';
import luxurySedan from '../assets/images/luxury_sedan_1782136599120.jpg';
import luxuryVan from '../assets/images/luxury_van_1782136613155.jpg';
import yellowUrus from '../assets/images/yellow_urus_1782141995181.jpg';
import Logo from './Logo';

interface Props {
  setView: (view: AppState) => void;
  onStartRide?: (params: RideParams) => void;
  navigateToPage?: (pageId: ContentPageId) => void;
  onBookCar?: (carId: string) => void;
}

export default function Landing({ setView, onStartRide, navigateToPage, onBookCar }: Props) {
  const [duration, setDuration] = useState('6 hours');
  const [pickup, setPickup] = useState('');
  const [category, setCategory] = useState('Airport Runs');

  const handleSearch = () => {
    if (onStartRide) {
      onStartRide({ pickup, duration, category });
    } else {
      setView('customer');
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-brand-text bg-brand-base relative overflow-hidden font-sans">
      
      {/* NAVBAR */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 w-full max-w-[1440px] mx-auto">
        <div className="flex items-center gap-3">
          <Logo size={24} className="text-brand-accent hover:rotate-12 transition-transform duration-300" />
          <span className="font-sans text-xl tracking-[0.15em] uppercase font-medium">Wheez</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-muted">
          <span className="text-brand-text cursor-pointer">Ride</span>
          <span className="hover:text-brand-text transition-colors cursor-pointer" onClick={() => setView('driver')}>Drive</span>
          <span className="hover:text-brand-text transition-colors cursor-pointer">Stories</span>
        </div>

        <div className="flex items-center gap-6 text-[11px] font-mono tracking-widest flex-shrink-0">
          <span className="hidden sm:block text-brand-muted uppercase">USD · EN</span>
          <button 
            onClick={() => setView('customer')}
            className="bg-[#191814] text-white px-6 py-2.5 rounded-none font-sans text-sm font-medium hover:bg-black transition-colors"
          >
            Log in
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="px-4 sm:px-6 w-full max-w-[1440px] mx-auto z-10 relative mb-32 md:mb-40">
        <div className="relative rounded-none bg-gradient-to-tr from-[#302113] via-[#4a3522] to-[#604830] min-h-[500px] md:min-h-[580px] flex flex-col justify-center items-center pt-10 pb-32 shadow-sm">
          
          <div className="absolute inset-0 rounded-none overflow-hidden pointer-events-none">
             <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay scale-105" style={{ backgroundImage: `url(${heroArriving})` }}></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
             <div className="absolute inset-0 bg-grain opacity-40 mix-blend-overlay"></div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-20 text-center px-4 mt-8"
          >
            <h1 className="font-display text-[56px] md:text-[80px] lg:text-[100px] leading-[1.05] tracking-tight text-[#FAF9F6]">
              Effortless journeys —<br />
              your <span className="italic text-[#ceaf8d]">car,</span> our <span className="italic text-[#ceaf8d]">driver.</span>
            </h1>
            <p className="mt-8 text-[#FAF9F6]/80 text-lg md:text-xl max-w-2xl mx-auto font-sans leading-relaxed">
              A professional comes to you and drives your own car — the airport run, the late night, the long haul. Always cashless.
            </p>
          </motion.div>

          {/* FLOATING BOOKING BAR */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="absolute -bottom-[80px] md:-bottom-[64px] left-1/2 -translate-x-1/2 w-[92%] max-w-[1000px] bg-brand-base border border-black/10 rounded-none shadow-sm z-30 flex flex-col p-2"
          >
            {/* TABS */}
            <div className="flex items-center gap-1 md:gap-2 px-4 md:px-6 pt-3 pb-2 md:pt-4">
               <div className="px-4 py-2 rounded-none text-xs md:text-sm font-medium bg-[#191814] text-[#FAF9F6]">
                 By the hour
               </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between relative w-full">
              <div className="flex-1 w-full flex items-center px-6 md:px-8 border-b md:border-b-0 md:border-r border-black/5 focus-within:bg-black/[0.02] transition-colors rounded-none h-[4.5rem] md:h-[5.5rem] hover:bg-black/[0.02] cursor-text">
                <div className="flex flex-col text-left w-full h-full justify-center">
                  <label className="text-[10px] md:text-[11px] font-mono text-brand-muted uppercase tracking-widest mb-1">Pickup</label>
                  <input 
                    type="text" 
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Where are you now?"
                    className="font-medium text-base md:text-lg text-brand-text bg-transparent outline-none w-full placeholder:text-brand-text/30"
                  />
                </div>
              </div>
            
              <div className="flex-1 w-full flex items-center px-6 md:px-8 border-b md:border-b-0 md:border-r border-black/5 focus-within:bg-black/[0.02] transition-colors h-[4.5rem] md:h-[5.5rem] hover:bg-black/[0.02] cursor-text">
                <div className="flex flex-col text-left w-full h-full justify-center">
                  <label className="text-[10px] md:text-[11px] font-mono text-brand-muted uppercase tracking-widest mb-1">Duration</label>
                  <select 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="font-medium text-base md:text-lg text-brand-text bg-transparent outline-none w-full cursor-pointer appearance-none"
                  >
                    <option value="6 Hours">6 Hours Standby</option>
                    <option value="12 Hours">12 Hours Standby</option>
                    <option value="24 Hours">24 Hours Standby</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 w-full flex items-center px-6 md:px-8 focus-within:bg-black/[0.02] transition-colors h-[4.5rem] md:h-[5.5rem] hover:bg-black/[0.02] cursor-pointer">
                <div className="flex flex-col text-left w-full h-full justify-center">
                  <label className="text-[10px] md:text-[11px] font-mono text-brand-muted uppercase tracking-widest mb-1">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="font-medium text-base md:text-lg text-brand-text bg-transparent outline-none w-full cursor-pointer appearance-none"
                  >
                    <option value="Airport Runs">Airport Runs</option>
                    <option value="Night Out">Night Out</option>
                    <option value="Long Drive">Long Drive</option>
                    <option value="Hospital">Hospital Standby</option>
                    <option value="School & Care">School & Care</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleSearch}
                className="w-full md:w-auto h-[4.5rem] px-8 md:h-[4.5rem] md:px-10 rounded-none bg-[#1e2311] text-[#d4ff63] text-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md md:mr-2 flex-shrink-0 group mt-2 md:mt-0 gap-3"
              >
                 <div className="w-8 h-8 rounded-none border-[2.5px] border-[#d4ff63] flex items-center justify-center text-[#d4ff63] group-hover:scale-110 transition-transform">
                    <Logo size={14} className="text-[#d4ff63]" />
                 </div>
                 <span className="font-semibold text-base transition-transform">Confirm</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* WHEREVER YOU'RE HEADED */}
      <div className="w-full max-w-[1440px] mx-auto px-6 py-24 md:py-32 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 relative z-20">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-[#191814] font-bold tracking-tight max-w-xl"
          >
            Wherever you're headed.
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-md mt-6 md:mt-0"
          >
             <p className="font-sans text-brand-muted text-base leading-relaxed">
                Rent reliable private travel in the drivers of the Wheez network. Tap, match, and relax in the back of your own luxury or casual seat. 
             </p>
          </motion.div>
        </div>

        {/* ARCH CARDS */}
        <div className="flex flex-row justify-between items-end gap-4 h-[400px] md:h-[500px] w-full overflow-x-auto pb-8 snap-x">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="min-w-[260px] md:min-w-0 flex-1 h-[90%] rounded-none bg-gradient-to-tr from-[#58412B] to-[#785E46] relative overflow-hidden group cursor-pointer snap-center shadow-md"
          >
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-80" style={{ backgroundImage: `url(${blackPeople1})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-full p-8 text-white z-10">
              <h3 className="font-display text-2xl md:text-3xl mb-1">Airport runs</h3>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/70">from ₦20,000</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="min-w-[260px] md:min-w-0 flex-1 h-[100%] rounded-none bg-gradient-to-tr from-[#2A3F4A] to-[#39505F] relative overflow-hidden group cursor-pointer snap-center shadow-md"
          >
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-80" style={{ backgroundImage: `url(${blackPeople2})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-full p-8 text-white z-10">
               <h3 className="font-display text-2xl md:text-3xl mb-1">The long drive</h3>
               <p className="font-mono text-[10px] uppercase tracking-widest text-white/70">city to coast</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="min-w-[260px] md:min-w-0 flex-1 h-[90%] rounded-none bg-gradient-to-tr from-[#1B1826] to-[#282436] relative overflow-hidden group cursor-pointer snap-center shadow-md"
          >
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-80" style={{ backgroundImage: `url(${blackPeople3})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-full p-8 text-white z-10">
              <h3 className="font-display text-2xl md:text-3xl mb-1">Night out</h3>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/70">get home safe</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="min-w-[260px] md:min-w-0 flex-1 h-[95%] rounded-none bg-gradient-to-tr from-[#31432A] to-[#435939] relative overflow-hidden group cursor-pointer snap-center shadow-md"
          >
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-80" style={{ backgroundImage: `url(${blackPeople4})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-full p-8 text-white z-10">
              <h3 className="font-display text-2xl md:text-3xl mb-1">School & care</h3>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/70">trusted hands</p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* FOR DRIVERS SECTION */}
      <div className="w-full max-w-[1440px] mx-auto px-6 py-24 mb-10 relative z-10">
		<div className="bg-[#191814] rounded-none p-12 md:p-24 bg-grain relative overflow-hidden flex flex-col md:flex-row justify-between">
           {/* Text Content */}
		   <div className="z-20 max-w-lg">
              <div className="text-[10px] font-mono tracking-widest text-[#ceaf8d] uppercase mb-8">For Drivers</div>
			  <h2 className="font-display text-[48px] md:text-[64px] leading-[1.05] tracking-tight text-[#FAF9F6] mb-8">
                 Drive their car.<br /> Keep your <span className="italic text-[#ceaf8d]">schedule.</span>
              </h2>
			  <p className="text-[#FAF9F6]/80 text-base md:text-lg mb-12 leading-relaxed font-sans">
                 Get matched to trips that fit your day. Flip <span className="text-[#FAF9F6] font-medium">Ready for Work</span> on when you want jobs, off when you don't. Weekly payouts, straight to your account.
              </p>
			  <button onClick={() => setView('driver')} className="bg-[#FAF9F6] text-[#191814] px-8 py-4 rounded-none font-sans font-medium text-sm hover:bg-white transition-colors flex items-center gap-2 mb-16">
                 Start vetting <span className="text-xl leading-none font-light">→</span>
              </button>
              
              <div className="flex flex-wrap items-center gap-8 md:gap-12 text-[#FAF9F6]">
                 <div>
                    <div className="font-display text-3xl md:text-4xl mb-2 text-[#ceaf8d]">₦15,000<span className="text-lg text-[#ceaf8d]/70">/hr</span></div>
                    <div className="text-[10px] uppercase font-mono tracking-widest text-[#FAF9F6]/50">Avg Earnings</div>
                 </div>
                 <div>
                    <div className="font-display text-3xl md:text-4xl mb-2 text-[#ceaf8d]">2 days</div>
                    <div className="text-[10px] uppercase font-mono tracking-widest text-[#FAF9F6]/50">Vetting Time</div>
                 </div>
                 <div>
                    <div className="font-display text-3xl md:text-4xl mb-2 text-[#ceaf8d]">Weekly</div>
                    <div className="text-[10px] uppercase font-mono tracking-widest text-[#FAF9F6]/50">Payouts</div>
                 </div>
              </div>
		   </div>
           
           {/* Floating Photos */}
           <div className="absolute right-0 top-0 w-1/2 h-full hidden md:block">
               {/* Female driver corporate (Top-left, small) */}
               <div className="absolute right-[55%] top-[12%] w-32 h-32 rounded-full overflow-hidden bg-[#2A3F4A] opacity-30 z-10 blur-[1px]">
                   <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${blackDriver6})` }}></div>
               </div>

               {/* Chinedu Male Driver (Center-Left, Large) */}
               <div className="absolute right-[40%] top-[40%] w-[240px] h-[240px] rounded-full overflow-hidden bg-[#2C291C] z-20 shadow-2xl mix-blend-luminosity hover:mix-blend-normal transition-all duration-500 hover:scale-[1.03] border-[6px] border-[#191814]">
                   <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${blackDriver1})` }}></div>
               </div>

               {/* Grace driver corporate (Bottom-right, small) */}
               <div className="absolute right-[12%] top-[15%] w-[160px] h-[160px] rounded-full overflow-hidden bg-[#31432A] opacity-40 z-10">
                   <div className="w-full h-full bg-cover bg-center animate-pulse" style={{ backgroundImage: `url(${blackDriver2})` }}></div>
               </div>

               {/* Male Casual Driver profile circle */}
               <div className="absolute right-[25%] top-[70%] w-36 h-36 rounded-full overflow-hidden bg-[#58412B] z-30 shadow-2xl hover:scale-105 transition-transform">
                   <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${driverMaleCasual})` }}></div>
               </div>

               {/* Female Corporate (Medium-Large) */}
               <div className="absolute right-[8%] top-[60%] w-48 h-48 rounded-full overflow-hidden bg-[#58412B] opacity-90 z-30 shadow-2xl mix-blend-luminosity hover:mix-blend-normal transition-all duration-500 hover:scale-105">
                   <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${driverFemaleCorporate})` }}></div>
               </div>
           </div>
        </div>

        {/* Feature Cards below Driver */}
        <div className="grid grid-cols-1 md:grid-cols-4 mt-12 gap-0 border border-black/10 rounded-none overflow-hidden">
            <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-black/10 bg-transparent flex flex-col items-start hover:bg-black/[0.02] transition-colors">
               <ShieldCheck className="w-6 h-6 text-[#986D43] mb-6" strokeWidth={1} />
               <h4 className="font-display text-xl mb-3 text-brand-text">Background-checked</h4>
               <p className="font-sans text-brand-muted text-[13px] leading-relaxed">License, ID and record verified before activation.</p>
            </div>
            <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-black/10 bg-transparent flex flex-col items-start hover:bg-black/[0.02] transition-colors">
               <MapPin className="w-6 h-6 text-[#986D43] mb-6" strokeWidth={1} />
               <h4 className="font-display text-xl mb-3 text-brand-text">Live tracking</h4>
               <p className="font-sans text-brand-muted text-[13px] leading-relaxed">Follow your car's exact location the whole way.</p>
            </div>
            <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-black/10 bg-transparent flex flex-col items-start hover:bg-black/[0.02] transition-colors">
               <CreditCard className="w-6 h-6 text-[#986D43] mb-6" strokeWidth={1} />
               <h4 className="font-display text-xl mb-3 text-brand-text">Cashless, always</h4>
               <p className="font-sans text-brand-muted text-[13px] leading-relaxed">Card or wallet only. No money changes hands.</p>
            </div>
            <div className="p-8 md:p-10 bg-transparent flex flex-col items-start hover:bg-black/[0.02] transition-colors">
               <Star className="w-6 h-6 text-[#986D43] mb-6" strokeWidth={1} />
               <h4 className="font-display text-xl mb-3 text-brand-text">Two-way ratings</h4>
               <p className="font-sans text-brand-muted text-[13px] leading-relaxed">Accountability runs both ways, every trip.</p>
            </div>
        </div>
      </div>

      {/* LUXURY FLEET */}
      <div className="w-full max-w-[1440px] mx-auto px-6 py-12 md:py-16 relative z-10 text-left">
          <div className="mb-12">
             <div className="text-[10px] font-mono tracking-widest text-[#986D43] uppercase mb-4">Elite fleet</div>
             <h2 className="font-display text-4xl md:text-5xl text-brand-text mb-4">Experience Luxury</h2>
             <p className="font-sans text-brand-muted text-base max-w-2xl leading-relaxed">
               Arrive in style and complete peace of mind. Hire our premium fleet vehicles, each meticulously curated and accompanied by a highly trained, professional driver.
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border-t border-b md:border-l md:border-r border-black/10 bg-transparent rounded-none">
              {/* 1. Lexus GX 460 */}
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 flex flex-col group hover:bg-black/[0.01] transition-colors rounded-none">
                  <div className="w-full aspect-[4/3] relative overflow-hidden bg-black/5 mb-6 rounded-none">
                      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-[1200ms]" style={{ backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkQD1ASO7djBpXEm-AeF_BSOCJiiAKRyKPYRna8YxliQ&s=10')` }}></div>
                  </div>
                  <div className="flex flex-col flex-1 rounded-none">
                      <h3 className="font-display text-xl mb-1 text-brand-text font-semibold">Lexus GX 460</h3>
                      <p className="font-sans text-brand-muted text-[13px] mb-6">Starting from ₦120,000 / day</p>
                      <button 
                          onClick={() => onBookCar?.('lexus-gx')}
                          className="mt-auto w-full py-3.5 flex items-center justify-center gap-2 rounded-none bg-[#191814] text-[#FAF9F6] font-[#FAF9F6] font-medium text-sm hover:bg-black hover:scale-[1.01] active:scale-95 transition-all shadow-sm"
                      >
                          Book this car <span className="text-lg leading-none font-light">→</span>
                      </button>
                  </div>
              </div>

              {/* 2. Range Rover */}
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 flex flex-col group hover:bg-black/[0.01] transition-colors rounded-none">
                  <div className="w-full aspect-[4/3] relative overflow-hidden bg-black/5 mb-6 rounded-none">
                      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-[1200ms]" style={{ backgroundImage: `url(${luxurySuv})` }}></div>
                  </div>
                  <div className="flex flex-col flex-1 rounded-none">
                      <h3 className="font-display text-xl mb-1 text-brand-text font-semibold">Range Rover</h3>
                      <p className="font-sans text-brand-muted text-[13px] mb-6">Starting from ₦180,000 / day</p>
                      <button 
                          onClick={() => onBookCar?.('range-rover')}
                          className="mt-auto w-full py-3.5 flex items-center justify-center gap-2 rounded-none bg-[#191814] text-[#FAF9F6] font-[#FAF9F6] font-medium text-sm hover:bg-black hover:scale-[1.01] active:scale-95 transition-all shadow-sm"
                      >
                          Book this car <span className="text-lg leading-none font-light">→</span>
                      </button>
                  </div>
              </div>

              {/* 3. Mercedes-Benz */}
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 flex flex-col group hover:bg-black/[0.01] transition-colors rounded-none">
                  <div className="w-full aspect-[4/3] relative overflow-hidden bg-black/5 mb-6 rounded-none">
                      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-[1200ms]" style={{ backgroundImage: `url(${luxurySedan})` }}></div>
                  </div>
                  <div className="flex flex-col flex-1 rounded-none">
                      <h3 className="font-display text-xl mb-1 text-brand-text font-semibold">Mercedes-Benz</h3>
                      <p className="font-sans text-brand-muted text-[13px] mb-6">Starting from ₦150,000 / day</p>
                      <button 
                          onClick={() => onBookCar?.('mercedes-benz')}
                          className="mt-auto w-full py-3.5 flex items-center justify-center gap-2 rounded-none bg-[#191814] text-[#FAF9F6] font-[#FAF9F6] font-medium text-sm hover:bg-black hover:scale-[1.01] active:scale-95 transition-all shadow-sm"
                      >
                          Book this car <span className="text-lg leading-none font-light">→</span>
                      </button>
                  </div>
              </div>

              {/* 4. Mercedes-Benz G-Wagon */}
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 flex flex-col group hover:bg-black/[0.01] transition-colors rounded-none">
                  <div className="w-full aspect-[4/3] relative overflow-hidden bg-black/5 mb-6 rounded-none">
                      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-[1200ms]" style={{ backgroundImage: `url(${yellowUrus})` }}></div>
                  </div>
                  <div className="flex flex-col flex-1 rounded-none">
                      <h3 className="font-display text-xl mb-1 text-brand-text font-semibold">G-Wagon</h3>
                      <p className="font-sans text-brand-muted text-[13px] mb-6">Starting from ₦250,000 / day</p>
                      <button 
                          onClick={() => onBookCar?.('g-wagon')}
                          className="mt-auto w-full py-3.5 flex items-center justify-center gap-2 rounded-none bg-[#191814] text-[#FAF9F6] font-[#FAF9F6] font-medium text-sm hover:bg-black hover:scale-[1.01] active:scale-95 transition-all shadow-sm"
                      >
                          Book this car <span className="text-lg leading-none font-light">→</span>
                      </button>
                  </div>
              </div>

              {/* 5. Luxury Van */}
              <div className="p-6 md:p-8 flex flex-col group hover:bg-black/[0.01] transition-colors rounded-none">
                  <div className="w-full aspect-[4/3] relative overflow-hidden bg-black/5 mb-6 rounded-none">
                      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-[1200ms]" style={{ backgroundImage: `url(${luxuryVan})` }}></div>
                  </div>
                  <div className="flex flex-col flex-1 rounded-none">
                      <h3 className="font-display text-xl mb-1 text-brand-text font-semibold">Luxury Van</h3>
                      <p className="font-sans text-brand-muted text-[13px] mb-6">Starting from ₦160,000 / day</p>
                      <button 
                          onClick={() => onBookCar?.('luxury-van')}
                          className="mt-auto w-full py-3.5 flex items-center justify-center gap-2 rounded-none bg-[#191814] text-[#FAF9F6] font-[#FAF9F6] font-medium text-sm hover:bg-black hover:scale-[1.01] active:scale-95 transition-all shadow-sm"
                      >
                          Book this car <span className="text-lg leading-none font-light">→</span>
                      </button>
                  </div>
              </div>
          </div>
      </div>

      {/* STAY TUNED */}
      <div className="w-full max-w-[1440px] mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="bg-transparent border border-black/10 rounded-none p-12 md:p-24 flex flex-col items-center justify-center text-center shadow-sm">
             <h2 className="font-display text-4xl md:text-[56px] text-brand-text mb-6">Stay tuned</h2>
             <p className="font-sans text-brand-muted text-base md:text-lg mb-10 max-w-md">New cities, new drivers, the occasional story. No noise.</p>
             <div className="w-full max-w-md bg-transparent border border-black/10 rounded-none p-2 flex items-center justify-between shadow-sm">
                <input type="email" placeholder="Your email" className="bg-transparent border-none outline-none px-6 text-brand-text w-full font-sans text-sm placeholder:text-brand-muted" />
                <button className="w-10 h-10 md:w-12 md:h-12 rounded-none bg-[#191814] text-white flex items-center justify-center flex-shrink-0 hover:bg-black transition-colors">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
             </div>
          </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-[1440px] mx-auto px-6 pt-24 pb-12 border-t border-black/5 mt-16 text-[#191814]">
          <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-8 mb-24">
             <div className="max-w-xs">
                <div className="flex items-center gap-3 mb-6">
                   <Logo size={24} className="text-[#191814]" />
                   <span className="font-sans text-xl tracking-[0.15em] uppercase font-medium">Wheez</span>
                </div>
                <p className="font-sans text-[#191814]/60 text-sm leading-relaxed">Your car. Our driver. A calmer way to get where you're going.</p>
             </div>

             <div className="flex flex-wrap lg:flex-nowrap gap-16 md:gap-24">
                 <div className="min-w-[120px]">
                    <h5 className="font-mono text-[10px] uppercase tracking-widest text-[#191814]/40 mb-6">Ride</h5>
                    <ul className="space-y-4 font-sans text-[#191814]/80 text-[15px]">
                       <li><button onClick={() => navigateToPage?.('ride-airport')} className="hover:text-[#986D43] transition-colors">Airport</button></li>
                       <li><button onClick={() => navigateToPage?.('ride-long')} className="hover:text-[#986D43] transition-colors">Long Trip</button></li>
                       <li><button onClick={() => navigateToPage?.('ride-events')} className="hover:text-[#986D43] transition-colors">Events</button></li>
                       <li><button onClick={() => navigateToPage?.('ride-hospital')} className="hover:text-[#986D43] transition-colors">Hospital</button></li>
                    </ul>
                 </div>
                 <div className="min-w-[120px]">
                    <h5 className="font-mono text-[10px] uppercase tracking-widest text-[#191814]/40 mb-6">Drive</h5>
                    <ul className="space-y-4 font-sans text-[#191814]/80 text-[15px]">
                       <li><button onClick={() => navigateToPage?.('drive-become')} className="hover:text-[#986D43] transition-colors">Become a driver</button></li>
                       <li><button onClick={() => navigateToPage?.('drive-requirements')} className="hover:text-[#986D43] transition-colors">Requirements</button></li>
                       <li><button onClick={() => navigateToPage?.('drive-earnings')} className="hover:text-[#986D43] transition-colors">Earnings</button></li>
                       <li><button onClick={() => navigateToPage?.('drive-payouts')} className="hover:text-[#986D43] transition-colors">Payouts</button></li>
                    </ul>
                 </div>
                 <div className="min-w-[120px]">
                    <h5 className="font-mono text-[10px] uppercase tracking-widest text-[#191814]/40 mb-6">Company</h5>
                    <ul className="space-y-4 font-sans text-[#191814]/80 text-[15px]">
                       <li><button onClick={() => navigateToPage?.('company-about')} className="hover:text-[#986D43] transition-colors">About</button></li>
                       <li><button onClick={() => navigateToPage?.('company-trust')} className="hover:text-[#986D43] transition-colors">Trust & safety</button></li>
                       <li><button onClick={() => navigateToPage?.('company-careers')} className="hover:text-[#986D43] transition-colors">Careers</button></li>
                       <li><button onClick={() => navigateToPage?.('company-terms')} className="hover:text-[#986D43] transition-colors">Terms</button></li>
                    </ul>
                 </div>
             </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-black/5 text-[10px] font-mono tracking-widest text-[#191814]/40 uppercase gap-4">
             <div>© 2026 Wheez by Sendrail</div>
             <div>Built for the journey</div>
          </div>
      </footer>

    </div>
  );
}
