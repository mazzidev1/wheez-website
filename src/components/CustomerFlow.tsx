import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, CustomerStep, RideParams } from '../types';
import { Plane, Plus, MoveRight, Wine, Backpack, ArrowLeft, Star, Navigation, CheckCircle2, ShieldCheck, CreditCard, LayoutDashboard, MapPin, Car, Settings2 } from 'lucide-react';
import CustomSelect from './CustomSelect';
import Logo from './Logo';

interface Props {
  setView: (view: AppState) => void;
  initialParams?: RideParams;
}

export default function CustomerFlow({ setView, initialParams }: Props) {
  const [step, setStep] = useState<CustomerStep>('home');
  const [category, setCategory] = useState<string>(initialParams?.category || 'Airport');
  const [tip, setTip] = useState<number>(0);
  const [pickup, setPickup] = useState<string>(initialParams?.pickup || '');
  const [duration, setDuration] = useState<string>(initialParams?.duration || '6 Hours');
  const [vehicleBrand, setVehicleBrand] = useState<string>('');
  const [vehicleClass, setVehicleClass] = useState<string>('Sedan');
  const [transmission, setTransmission] = useState<string>('Automatic');
  
  const estimatedFare = useMemo(() => {
    if (!pickup.trim()) return 0;
    const hours = parseInt(duration) || 6;
    const baseFare = category === 'Luxury' ? 50000 : category === 'Airport' ? 20000 : category === 'Nightlife' ? 12000 : category === 'Long Trip' ? 45000 : 15000;
    return baseFare + (hours * 2500);
  }, [pickup, duration, category]);

  const catIcons: Record<string, any> = {
    'Airport': Plane,
    'Hospital': Plus,
    'Nightlife': Wine,
    'School': Backpack,
    'Long Trip': Navigation,
  };

  const handleBack = () => {
    if (step === 'home') setView('landing');
    else if (step === 'estimate') setStep('home');
    else if (step === 'login') setStep('estimate');
    else if (step === 'payment') setStep('estimate');
    else if (step === 'dashboard') setView('landing');
    else setStep('home');
  };

  return (
    <div className="flex-1 w-full max-w-lg mx-auto flex flex-col relative px-4 sm:px-0 pt-6 pb-12 text-brand-text min-h-screen">
      
      {/* Header Back Button */}
      {step !== 'dashboard' && (
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 border border-black/10 text-brand-text hover:bg-black/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-xs font-semibold tracking-widest text-brand-muted uppercase">
            {step === 'home' ? 'Request Driver' : step === 'estimate' ? 'Estimate' : step === 'login' ? 'Sign In' : step === 'payment' ? 'Payment' : 'Dashboard'}
          </div>
          <div className="w-10"></div>
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* HOME STEP */}
        {step === 'home' && (
          <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-4 text-brand-accent">
               <Logo size={20} className="text-brand-accent hover:rotate-12 transition-transform duration-300" />
               <span className="font-mono text-[10px] tracking-widest uppercase font-semibold">Wheez Booking</span>
            </div>
            <h2 className="text-3xl font-display font-medium mb-8">Booking details</h2>
            
            <div className="bg-brand-surface border border-black/5 shadow-sm rounded-3xl p-6 mb-6">
              <label className="text-xs font-semibold text-brand-muted tracking-wide uppercase block mb-4">Trip Category</label>
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.keys(catIcons).map((cat) => {
                  const Icon = catIcons[cat];
                  const active = category === cat;
                  return (
                    <button 
                      key={cat} onClick={() => setCategory(cat)}
                      className={`flex-1 min-w-[70px] flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${active ? 'bg-brand-accent/10 border-brand-accent text-brand-accent' : 'bg-black/5 border-transparent text-brand-muted hover:bg-black/10'}`}
                    >
                      <Icon className="w-5 h-5 mb-2" />
                      <span className="text-[10px] font-medium tracking-wide uppercase">{cat}</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative pl-6 space-y-4">
                <div className="absolute top-3 bottom-5 left-[9px] w-[2px] bg-black/10 rounded-full"></div>
                <div className="relative flex items-center">
                  <div className="absolute left-[-24px] w-3 h-3 rounded-full bg-brand-text"></div>
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Enter pickup location"
                    className="w-full bg-brand-base border border-black/5 rounded-2xl p-4 text-sm font-medium outline-none focus:border-brand-accent transition-colors"
                  />
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-[-26px] w-4 h-4 rounded-full border-2 border-brand-accent bg-brand-surface z-10"></div>
                  <CustomSelect
                    value={duration}
                    onChange={setDuration}
                    className="w-full"
                    options={[
                      { value: "6 Hours", label: "6 Hours" },
                      { value: "12 Hours", label: "12 Hours" },
                      { value: "24 Hours", label: "24 Hours" }
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="bg-brand-surface border border-black/5 shadow-sm rounded-3xl p-6 mb-6">
              <label className="text-xs font-semibold text-brand-muted tracking-wide uppercase block mb-4">Your Vehicle Details</label>
              
              <div className="space-y-4">
                <div className="relative flex items-center">
                  <div className="absolute left-4 w-4 h-4 text-brand-muted z-10"><Car className="w-full h-full" /></div>
                  <input
                    type="text"
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    placeholder="E.g. Toyota Camry 2021"
                    className="w-full bg-brand-base border border-black/5 rounded-2xl p-4 pl-12 text-sm font-medium outline-none focus:border-brand-accent transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative flex items-center">
                  <CustomSelect
                      value={vehicleClass}
                      onChange={setVehicleClass}
                      className="w-full"
                      icon={<Car className="w-5 h-5 text-brand-muted" />}
                      options={[
                        { value: "Sedan", label: "Sedan" },
                        { value: "SUV", label: "SUV" },
                        { value: "Minivan", label: "Minivan" },
                        { value: "Pickup", label: "Pickup" },
                        { value: "Other", label: "Other" }
                      ]}
                    />
                  </div>
                  
                  <div className="relative flex items-center">
                  <CustomSelect
                      value={transmission}
                      onChange={setTransmission}
                      className="w-full"
                      icon={<Settings2 className="w-5 h-5 text-brand-muted" />}
                      options={[
                        { value: "Automatic", label: "Automatic" },
                        { value: "Manual", label: "Manual" }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep('estimate')}
              disabled={!pickup || !vehicleBrand}
              className="mt-auto w-full py-5 rounded-2xl bg-brand-text text-brand-base font-semibold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none"
            >
              Get Estimate
            </button>
          </motion.div>
        )}

        {/* ESTIMATE STEP */}
        {step === 'estimate' && (
          <motion.div key="estimate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-brand-accent">
               <Logo size={20} className="text-brand-accent hover:rotate-12 transition-transform duration-300" />
               <span className="font-mono text-[10px] tracking-widest uppercase font-semibold">Wheez Route Estimate</span>
            </div>
            <h2 className="text-3xl font-display font-medium mb-8">Ride details</h2>
            
            <div className="bg-brand-surface border border-black/5 shadow-sm rounded-3xl p-6 mb-8">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-black/5">
                <div>
                  <h4 className="text-brand-muted text-xs font-semibold tracking-wide uppercase mb-1">Category</h4>
                  <p className="font-medium text-lg">{category}</p>
                </div>
                {catIcons[category] && (() => {
                  const Icon = catIcons[category];
                  return <Icon className="w-6 h-6 text-brand-accent" />;
                })()}
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-brand-text mt-1"></div>
                    <div className="w-[2px] h-full bg-black/10 my-1"></div>
                  </div>
                  <div>
                    <h4 className="text-brand-muted text-xs font-semibold tracking-wide uppercase mb-1">Pickup</h4>
                    <p className="font-medium">{pickup || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full border-2 border-brand-accent bg-brand-surface"></div>
                  </div>
                  <div>
                    <h4 className="text-brand-muted text-xs font-semibold tracking-wide uppercase mb-1">Duration</h4>
                    <p className="font-medium">{duration || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-surface border border-black/5 shadow-sm rounded-3xl p-6 mb-8 mt-2">
              <h4 className="text-brand-muted text-xs font-semibold tracking-wide uppercase mb-4 pb-4 border-b border-black/5">Vehicle Configuration</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-brand-muted text-[10px] font-semibold tracking-wide uppercase mb-1">Model</h4>
                  <p className="font-medium text-sm">{vehicleBrand}</p>
                </div>
                <div>
                  <h4 className="text-brand-muted text-[10px] font-semibold tracking-wide uppercase mb-1">Type</h4>
                  <p className="font-medium text-sm">{vehicleClass}</p>
                </div>
                <div>
                  <h4 className="text-brand-muted text-[10px] font-semibold tracking-wide uppercase mb-1">Transmission</h4>
                  <p className="font-medium text-sm">{transmission}</p>
                </div>
              </div>
            </div>

            <div className="bg-brand-surface border border-black/5 shadow-sm rounded-3xl p-6 mb-8 flex justify-between items-center">
              <div>
                <h4 className="text-brand-muted text-xs font-semibold tracking-wide uppercase mb-1">Estimated Driver Fee</h4>
                <p className="text-xs text-brand-muted">Based on time & distance</p>
              </div>
              <div className="text-3xl font-display font-semibold">₦{estimatedFare.toLocaleString()}</div>
            </div>

            <button 
              onClick={() => setStep('login')}
              className="mt-auto w-full py-4 rounded-2xl bg-brand-text text-brand-base font-semibold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-3"
            >
            <div className="flex items-center justify-center w-6 h-6 border-2 border-brand-base/50 rounded">
                <Logo size={12} className="text-brand-base" />
            </div>
              Confirm Ride
            </button>
          </motion.div>
        )}

        {/* LOGIN STEP */}
        {step === 'login' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center text-center mt-12"
          >
            <div className="w-16 h-16 rounded-full bg-brand-surface border border-black/10 flex items-center justify-center mb-6 shadow-sm text-brand-accent text-brand-accent">
              <Logo size={32} className="text-brand-accent animate-pulse" />
            </div>
            <h2 className="text-3xl font-display font-medium mb-3">Create an Account or Sign In</h2>
            <p className="text-brand-muted mb-10 max-w-sm">
              Sign up to complete your booking. We'll use your details for the ride and final payment.
            </p>
            
            <button 
              onClick={() => setStep('payment')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-brand-surface border border-black/10 text-brand-text font-medium hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            <p className="text-xs text-brand-muted mt-6">By signing up, you agree to our Terms of Service.</p>
          </motion.div>
        )}

        {/* PAYMENT STEP */}
        {step === 'payment' && (
          <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col flex-1">
            <h2 className="text-3xl font-display font-medium mb-8">Secure your booking</h2>

            <div className="bg-brand-surface border border-black/5 shadow-sm rounded-3xl p-6 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-black/5 mb-4">
                <span className="text-brand-muted">Estimated Fare</span>
                <span className="font-medium">₦{estimatedFare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-brand-muted text-sm flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Trust & Safety Fee</span>
                <span className="font-medium text-sm">₦1,500</span>
              </div>
              <div className="flex justify-between items-center pt-5 border-t border-black/5">
                <span className="text-lg font-medium">Total due</span>
                <span className="text-2xl font-display font-semibold">₦{(estimatedFare + 1500).toLocaleString()}</span>
              </div>
            </div>

            <h4 className="text-brand-muted text-xs font-semibold tracking-wide uppercase mb-4 ml-2">Payment Method</h4>
            <div className="bg-brand-surface border border-black/5 shadow-sm rounded-2xl p-4 flex items-center gap-4 mb-8 cursor-pointer">
              <div className="w-10 h-7 bg-gradient-to-r from-blue-700 to-blue-500 rounded flex items-center justify-center text-[8px] font-bold tracking-widest text-white">VISA</div>
              <div className="flex-1 text-sm font-medium">•••• 4242</div>
              <div className="w-4 h-4 rounded-full border-4 border-brand-accent bg-brand-surface"></div>
            </div>

            <button 
              onClick={() => setStep('dashboard')}
              className="mt-auto w-full py-5 rounded-2xl bg-brand-text text-brand-base font-semibold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5"/> Confirm & Pay ₦{(estimatedFare + 1500).toLocaleString()}
            </button>
            <p className="text-[10px] text-center text-brand-muted mt-4 uppercase tracking-widest flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Secured in-app
            </p>
          </motion.div>
        )}

        {/* DASHBOARD STEP */}
        {step === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col pt-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-display font-medium">Dashboard</h2>
              <div className="w-10 h-10 rounded-full bg-brand-surface border border-black/10 flex items-center justify-center cursor-pointer hover:bg-black/5" onClick={() => setView('landing')}>
                <LayoutDashboard className="w-5 h-5 text-brand-text" />
              </div>
            </div>
            
            <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-3xl p-6 mb-8 text-center shrink-0">
              <div className="w-16 h-16 rounded-full bg-brand-accent/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-brand-accent" />
              </div>
              <h3 className="text-2xl font-display font-medium mb-2 text-brand-text">Booking Confirmed</h3>
              <p className="text-brand-muted">Your payment was successful. A driver has been assigned to your request.</p>
            </div>

            <h4 className="text-brand-muted text-xs font-semibold tracking-wide uppercase mb-4 ml-2 mt-4">Upcoming Ride</h4>
            <div className="bg-brand-surface border border-black/5 shadow-sm rounded-3xl p-6 mb-8 shrink-0">
               <div className="flex justify-between items-center mb-6">
                 <span className="font-semibold text-brand-text font-display text-lg">Daniel Vega</span>
                 <span className="text-brand-accent font-medium text-sm px-3 py-1 bg-brand-accent/10 rounded-full">Arriving soon</span>
               </div>
               <div className="flex items-center gap-4 text-sm text-brand-muted border-t border-black/5 pt-4">
                 <div className="flex-1 flex items-center gap-2">
                    <Navigation className="w-4 h-4 shrink-0 text-brand-accent"/> <span className="truncate">{pickup || "Home"}</span>
                 </div>
                 <div className="w-[1px] h-4 bg-black/10 shrink-0"></div>
                 <div className="flex-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0 text-brand-accent"/> <span className="truncate">{duration || "12"} Hrs</span>
                 </div>
               </div>
            </div>

            <button 
              onClick={() => setView('landing')}
              className="mt-auto w-full py-5 rounded-2xl bg-brand-base text-brand-text font-medium hover:bg-black/5 transition-all border border-black/10"
            >
              Return Home
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
