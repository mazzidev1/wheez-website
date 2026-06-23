import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { AppState, CarDetail } from '../types';
import { ArrowLeft, Check, Calendar, Clock, MapPin, User, Phone, FileText, Compass, HelpCircle, Star, Shield, Car, Heart } from 'lucide-react';
import Logo from './Logo';

// Let's import the exact images so we can display them perfectly in our booking page
import luxurySuv from '../assets/images/luxury_suv_1782136584014.jpg';
import luxurySedan from '../assets/images/luxury_sedan_1782136599120.jpg';
import luxuryVan from '../assets/images/luxury_van_1782136613155.jpg';
import yellowUrus from '../assets/images/yellow_urus_1782141995181.jpg';

interface Props {
  setView: (view: AppState) => void;
  selectedCar: CarDetail;
}

export default function LuxuryBookFlow({ setView, selectedCar }: Props) {
  // Booking Form State
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [days, setDays] = useState(1);
  const [pickupAddr, setPickupAddr] = useState('');
  const [destinationAddr, setDestinationAddr] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  // Extra Amenities
  const [englishDriver, setEnglishDriver] = useState(false);
  const [refreshments, setRefreshments] = useState(false);
  const [childSeat, setChildSeat] = useState(false);
  
  // Checkout flow state
  const [isBooked, setIsBooked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic cost calculations
  const priceStats = useMemo(() => {
    const base = selectedCar.pricePerDay * days;
    const driverPremium = englishDriver ? 12000 * days : 0;
    const refreshmentsPremium = refreshments ? 5000 * days : 0;
    const childSeatPremium = childSeat ? 8000 : 0;
    
    const subtotal = base + driverPremium + refreshmentsPremium + childSeatPremium;
    const handling = Math.round(subtotal * 0.05); // 5% handling service charge
    const total = subtotal + handling;
    
    return {
      base,
      driverPremium,
      refreshmentsPremium,
      childSeatPremium,
      subtotal,
      handling,
      total
    };
  }, [selectedCar, days, englishDriver, refreshments, childSeat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDate || !pickupTime || !pickupAddr || !fullName || !phone) {
      alert('Please fill out all required fields marked with an asterisk (*).');
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsBooked(true);
    }, 1500);
  };

  // Assign a professional vetted chauffeur profile mock for the ticket
  const mockChauffeur = useMemo(() => {
    const names = ['Michael Alabi', 'Chinedu Eze', 'Babajide Cole', 'Grace Danjuma', 'Tunde Bello'];
    const ratings = ['4.95', '4.98', '4.94', '4.99', '4.92'];
    const index = Math.abs(selectedCar.name.charCodeAt(0) + selectedCar.name.charCodeAt(1)) % names.length;
    return {
      name: names[index],
      rating: ratings[index],
      trips: 120 + (index * 45),
      license: `LA-CH-${3982 + index}`
    };
  }, [selectedCar]);

  if (isBooked) {
    return (
      <div className="min-h-screen bg-brand-base flex flex-col justify-center items-center py-16 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-brand-surface border border-black/10 rounded-none p-8 md:p-10 shadow-xl relative z-10"
        >
          {/* Ticket Header */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-dashed border-black/20">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-none flex items-center justify-center mb-4 border border-emerald-200">
              <Check className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <span className="font-mono text-[10px] tracking-widest text-emerald-600 uppercase font-bold bg-emerald-50 px-3 py-1 border border-emerald-100">
              BOOKING SECURED
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-brand-text mt-3 font-semibold">Executive Itinerary</h2>
            <p className="font-mono text-[11px] text-brand-muted mt-1 uppercase tracking-wider">REF ID: WZ-{Math.floor(100000 + Math.random() * 900000)}</p>
          </div>

          {/* Ticket Body */}
          <div className="py-6 space-y-4 font-sans text-sm text-brand-text">
            <div className="flex justify-between py-1 border-b border-black/5">
              <span className="text-brand-muted font-medium">Vehicle Selected</span>
              <span className="font-semibold text-brand-text">{selectedCar.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-black/5">
              <span className="text-brand-muted font-medium">Client Name</span>
              <span className="font-medium text-brand-text">{fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-black/5">
              <span className="text-brand-muted font-medium">Schedule</span>
              <span className="font-medium text-brand-text">{pickupDate} at {pickupTime}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-black/5">
              <span className="text-brand-muted font-medium">Duration</span>
              <span className="font-medium text-brand-text">{days} Day{days > 1 ? 's' : ''} rental</span>
            </div>
            <div className="flex flex-col py-1 border-b border-black/5">
              <span className="text-brand-muted font-medium mb-1">Pickup Address</span>
              <span className="font-medium text-brand-text flex items-start gap-1">
                <MapPin className="w-4 h-4 text-brand-accent mt-0.5 flex-shrink-0" />
                {pickupAddr}
              </span>
            </div>
            {destinationAddr && (
              <div className="flex flex-col py-1 border-b border-black/5">
                <span className="text-brand-muted font-medium mb-1">Destination</span>
                <span className="font-medium text-brand-text flex items-start gap-1">
                  <Compass className="w-4 h-4 text-brand-muted mt-0.5 flex-shrink-0" />
                  {destinationAddr}
                </span>
              </div>
            )}
            
            {/* Vetted Driver Assigned section */}
            <div className="p-4 bg-black/[0.02] border border-black/5 rounded-none mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-accent flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Chauffeur Assigned
                </span>
                <span className="text-xs bg-black/10 px-2 py-0.5 font-mono">VETTED</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black/5 flex items-center justify-center font-display font-medium text-lg border border-black/10">
                  {mockChauffeur.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-medium text-brand-text">{mockChauffeur.name}</h4>
                  <p className="text-[11px] text-brand-muted">License: {mockChauffeur.license} • Rating: ★ {mockChauffeur.rating}</p>
                </div>
              </div>
            </div>

            {/* Financial Ledger Details */}
            <div className="pt-4 border-t border-dashed border-black/20">
              <div className="flex justify-between text-xs text-brand-muted mb-1">
                <span>Daily rate x {days} days</span>
                <span>₦{priceStats.base.toLocaleString()}</span>
              </div>
              {(englishDriver || refreshments || childSeat) && (
                <div className="flex justify-between text-xs text-brand-muted mb-1">
                  <span>Selected add-ons</span>
                  <span>₦{(priceStats.driverPremium + priceStats.refreshmentsPremium + priceStats.childSeatPremium).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-brand-muted mb-2">
                <span>Wheez handling fee (5%)</span>
                <span>₦{priceStats.handling.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-black/10 pt-2 text-brand-text">
                <span>Total amount charged</span>
                <span>₦{priceStats.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Ticket Footer print alert */}
          <p className="text-[11px] text-brand-muted text-center mt-6">
            Wheez Chauffeur network supplemental insurance has been activated for this driver on your behalf. Standard receipts have been emailed to your private portal.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setView('landing')}
              className="flex-1 py-4 bg-[#191814] text-[#FAF9F6] font-[#FAF9F6] font-medium text-sm hover:bg-black hover:scale-[1.01] active:scale-95 transition-all rounded-none text-center"
            >
              Back to Home
            </button>
            <button 
              onClick={() => window.print()}
              className="flex-1 py-4 bg-transparent text-brand-text border border-black/10 font-medium text-sm hover:bg-black/5 hover:scale-[1.01] active:scale-95 transition-all rounded-none text-center"
            >
              Print Confirmation
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-base flex flex-col items-center">
      
      {/* HEADER NAV */}
      <nav className="w-full max-w-[1440px] mx-auto px-6 py-6 flex justify-between items-center border-b border-black/5 bg-transparent">
        <button 
          onClick={() => setView('landing')}
          className="flex items-center gap-2 hover:bg-black/5 px-4 py-2 rounded-none transition-colors font-medium text-sm border border-black/10"
        >
          <ArrowLeft size={16} /> Exit Booking
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
          <Logo size={20} className="text-brand-text hover:rotate-12 transition-transform duration-300" />
          <span className="font-sans text-lg tracking-[0.15em] uppercase font-medium">Wheez</span>
        </div>
      </nav>

      {/* RENDER DYNAMIC CAR CONTENT */}
      <div className="w-full max-w-[1440px] mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 z-10 relative">
        
        {/* LEFT COLUMN: VEHICLE DETAILS */}
        <div className="lg:col-span-7 flex flex-col space-y-8">
          <div>
            <span className="font-mono text-xs text-brand-muted tracking-widest uppercase block mb-2">LUXURY HIRE FLEET</span>
            <h1 className="font-display text-4xl md:text-5xl text-brand-text font-bold leading-tight">{selectedCar.name}</h1>
            <p className="font-mono text-sm text-brand-muted mt-2 tracking-wide block uppercase border-b border-black/5 pb-6">
              starting at ₦{selectedCar.pricePerDay.toLocaleString()} / day
            </p>
          </div>

          {/* Large Picture display */}
          <div className="w-full aspect-[16/10] bg-black/5 overflow-hidden border border-black/10 rounded-none relative">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${selectedCar.image})` }}
            ></div>
          </div>

          {/* Specifications / Amenities list */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-b border-black/5">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-brand-muted block mb-1">Capacity</span>
              <span className="font-medium text-brand-text">{selectedCar.specs.passengers} Passengers</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-brand-muted block mb-1">Luggage Space</span>
              <span className="font-medium text-brand-text">{selectedCar.specs.luggage} Lg Bags</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-brand-muted block mb-1">Drive Package</span>
              <span className="font-medium text-brand-text">{selectedCar.specs.transmission}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-brand-muted block mb-1">Fueling Option</span>
              <span className="font-medium text-brand-text">{selectedCar.specs.fuelType}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-xl text-brand-text font-semibold">Vehicle Premium Elements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedCar.specs.comfort.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-brand-muted font-sans font-medium">
                  <div className="w-1.5 h-1.5 bg-brand-accent rounded-none flex-shrink-0"></div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-black/[0.01] border border-black/10 rounded-none space-y-4">
            <h4 className="font-display text-base font-semibold text-brand-text flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-muted" /> Vetted Chauffeur Commitment
            </h4>
            <p className="text-xs text-brand-muted leading-relaxed font-sans">
              All bookings made under our luxury tier fleet are paired exclusively with highly rated, vetted executive drivers. Drivers undergo advanced route training, background validation, and on-board courtesy training to ensure total discretion and absolute peace of mind during your travel.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: BOOKING INTERACTIVE FORM */}
        <div className="lg:col-span-5">
          <form 
            onSubmit={handleSubmit}
            className="w-full bg-brand-base border border-black/10 rounded-none p-6 md:p-8 space-y-6 shadow-sm relative"
          >
            <h3 className="font-display text-2xl text-brand-text font-semibold">Request Reservation</h3>
            <p className="text-xs text-brand-muted -mt-4 border-b border-black/5 pb-4">
              Reserve with executive chauffeur standby included.
            </p>

            {/* Form Fields container */}
            <div className="space-y-5">
              {/* DATE AND TIME */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider text-brand-muted block mb-1">
                    Pickup Date *
                  </label>
                  <div className="relative">
                    <input 
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full bg-transparent border border-black/10 rounded-none p-3 text-xs md:text-sm font-medium outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider text-brand-muted block mb-1">
                    Pickup Time *
                  </label>
                  <input 
                    type="time"
                    required
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-transparent border border-black/10 rounded-none p-3 text-xs md:text-sm font-medium outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              {/* RENTAL DAYS */}
              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-brand-muted flex justify-between mb-1">
                  <span>Rental Period *</span>
                  <span className="font-semibold text-brand-text">{days} Day{days > 1 ? 's' : ''} standby</span>
                </label>
                <div className="flex items-center">
                  <button 
                    type="button"
                    onClick={() => setDays(Math.max(1, days - 1))}
                    className="w-12 h-12 bg-transparent text-brand-text border border-black/10 rounded-none font-semibold hover:bg-black/5 active:bg-black/10"
                  >
                    -
                  </button>
                  <div className="flex-1 h-12 flex items-center justify-center border-t border-b border-black/10 text-sm font-medium font-mono">
                    {days} Day{days > 1 ? 's' : ''}
                  </div>
                  <button 
                    type="button"
                    onClick={() => setDays(days + 1)}
                    className="w-12 h-12 bg-transparent text-brand-text border border-black/10 rounded-none font-semibold hover:bg-black/5 active:bg-black/10"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* PICKUP AND DESTINATION ADDR */}
              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-brand-muted block mb-1">
                  Pickup Location & Address *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-brand-muted">
                    <MapPin size={16} />
                  </span>
                  <input 
                    type="text"
                    required
                    value={pickupAddr}
                    onChange={(e) => setPickupAddr(e.target.value)}
                    placeholder="Enter pickup address, airport, hotel"
                    className="w-full bg-transparent border border-black/10 rounded-none pl-10 pr-4 py-3 text-xs md:text-sm font-medium outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-brand-muted block mb-1">
                  Destination Address (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-brand-muted">
                    <Compass size={16} />
                  </span>
                  <input 
                    type="text"
                    value={destinationAddr}
                    onChange={(e) => setDestinationAddr(e.target.value)}
                    placeholder="Enter final dropoff address if known"
                    className="w-full bg-transparent border border-black/10 rounded-none pl-10 pr-4 py-3 text-xs md:text-sm font-medium outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              {/* COMMITTED CLIENT DETAILS */}
              <div className="border-t border-black/5 pt-4 space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-wider text-brand-muted text-left block">
                  Passenger / Client Credentials
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input 
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Passenger Name *"
                      className="w-full bg-transparent border border-black/10 rounded-none p-3 text-xs md:text-sm font-medium outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div>
                    <input 
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Contact *"
                      className="w-full bg-transparent border border-black/10 rounded-none p-3 text-xs md:text-sm font-medium outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>

                <div>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Extra travel details or driver comments (optional)"
                    rows={2}
                    className="w-full bg-transparent border border-black/10 rounded-none p-3 text-xs md:text-sm font-medium outline-none focus:border-brand-accent resize-none"
                  />
                </div>
              </div>

              {/* AMENITIES ADD-ONS */}
              <div className="border-t border-black/5 pt-4 space-y-3">
                <span className="text-[10px] uppercase font-mono tracking-wider text-brand-muted text-left block">
                  Luxury Standing Accessories (Select Optional)
                </span>
                
                <label className="flex items-center justify-between cursor-pointer group py-1">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-brand-text group-hover:text-black">
                      Dual-Lingual English Chauffeur
                    </span>
                    <span className="text-[10px] text-brand-muted">
                      ₦12,000 / day
                    </span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={englishDriver}
                    onChange={(e) => setEnglishDriver(e.target.checked)}
                    className="w-4 h-4 accent-black"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer group py-1">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-brand-text group-hover:text-black">
                      Premium Chilled Refreshments Pack
                    </span>
                    <span className="text-[10px] text-brand-muted">
                      Snacks, water, juice, soda • ₦5,000 / day
                    </span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={refreshments}
                    onChange={(e) => setRefreshments(e.target.checked)}
                    className="w-4 h-4 accent-black"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer group py-1">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-brand-text group-hover:text-black">
                      Premium Grade Child Safety Seat
                    </span>
                    <span className="text-[10px] text-brand-muted">
                      Installed on backup • ₦8,000 flat
                    </span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={childSeat}
                    onChange={(e) => setChildSeat(e.target.checked)}
                    className="w-4 h-4 accent-black"
                  />
                </label>
              </div>

              {/* FINANCIAL AUDIT LEDGER */}
              <div className="border-t border-black/10 pt-4 bg-black/[0.01] p-4 text-left space-y-2">
                <div className="flex justify-between text-xs text-brand-muted">
                  <span> Standby {selectedCar.name} ✕ {days}</span>
                  <span>₦{priceStats.base.toLocaleString()}</span>
                </div>
                {englishDriver && (
                  <div className="flex justify-between text-xs text-brand-muted">
                    <span>English Standing Chauffeur Premium</span>
                    <span>₦{priceStats.driverPremium.toLocaleString()}</span>
                  </div>
                )}
                {refreshments && (
                  <div className="flex justify-between text-xs text-brand-muted">
                    <span>Premium Refreshments Accessory</span>
                    <span>₦{priceStats.refreshmentsPremium.toLocaleString()}</span>
                  </div>
                )}
                {childSeat && (
                  <div className="flex justify-between text-xs text-brand-muted">
                    <span>Child Seat Accessory</span>
                    <span>₦{priceStats.childSeatPremium.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-brand-muted pt-1 border-t border-black/5">
                  <span>Convenience & Handling Fee (5%)</span>
                  <span>₦{priceStats.handling.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-black/10 text-brand-text">
                  <span>Grand Total</span>
                  <span>₦{priceStats.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 bg-[#191814] text-[#FAF9F6] font-[#FAF9F6] font-medium text-sm hover:bg-black hover:scale-[1.01] active:scale-95 transition-all shadow-md rounded-none text-center ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isSubmitting ? 'Securing Chauffeur Standby...' : 'Secure Chauffeur Standby'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
