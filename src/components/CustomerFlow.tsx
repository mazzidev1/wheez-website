import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, CustomerStep, RideParams } from '../types';
import { Plane, Plus, MoveRight, Wine, Backpack, ArrowLeft, Star, Navigation, CheckCircle2, ShieldCheck, CreditCard, LayoutDashboard, MapPin, Car, Settings2, Map as MapIcon } from 'lucide-react';
import CustomSelect from './CustomSelect';
import Logo from './Logo';
import { User, signInWithPopup } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import PaystackModal from './PaystackModal';

interface Props {
  setView: (view: AppState) => void;
  initialParams?: RideParams;
  user: User | null;
}

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';



function AddressAutocomplete({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) {
  return (
    <div className="relative w-full z-10">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-brand-base border border-black/5 rounded-2xl p-4 text-sm font-medium outline-none focus:border-brand-accent transition-colors text-brand-text placeholder-black/30"
      />
    </div>
  );
}


export default function CustomerFlow({ setView, initialParams, user }: Props) {
  const [step, setStep] = useState<CustomerStep>('home');
  const [category, setCategory] = useState<string>(initialParams?.category || 'Airport');
  const [pickup, setPickup] = useState<string>(initialParams?.pickup || '');
  const [destination, setDestination] = useState<string>('');
  const [duration, setDuration] = useState<string>(initialParams?.duration || '6 Hours');
  const [vehicleBrand, setVehicleBrand] = useState<string>('');
  const [vehicleClass, setVehicleClass] = useState<string>('Sedan');
  const [transmission, setTransmission] = useState<string>('Automatic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  
  // Real-time tracking and rating states
  const [latestTrip, setLatestTrip] = useState<any>(null);
  const [assignedDriverInfo, setAssignedDriverInfo] = useState<any>(null);
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);

  // Subscribe to real-time updates for user's latest trip
  useEffect(() => {
    if (!user) {
      setLatestTrip(null);
      return;
    }

    const q = query(
      collection(db, 'trips'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // Retrieve the first, most recent trip
        const doc = snapshot.docs[0];
        setLatestTrip({ id: doc.id, ...doc.data() });
      } else {
        setLatestTrip(null);
      }
    }, (err) => {
      console.error("Error subscribing to latest trip:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to real-time updates of the assigned driver once an ID becomes available
  useEffect(() => {
    if (!latestTrip || !latestTrip.assignedDriverId) {
      setAssignedDriverInfo(null);
      return;
    }

    const driverRef = doc(db, 'drivers', latestTrip.assignedDriverId);
    const unsubscribe = onSnapshot(driverRef, (docSnap) => {
      if (docSnap.exists()) {
        setAssignedDriverInfo({ id: docSnap.id, ...docSnap.data() });
      } else {
        setAssignedDriverInfo(null);
      }
    }, (err) => {
      console.error("Error tracking driver details:", err);
    });

    return () => unsubscribe();
  }, [latestTrip?.assignedDriverId]);

  const handleSubmitFeedback = async () => {
    if (!latestTrip) return;
    setIsSubmittingFeedback(true);
    try {
      await updateDoc(doc(db, 'trips', latestTrip.id), {
        rating,
        feedback: feedbackText,
        ratingSubmitted: true
      });
      
      if (latestTrip.assignedDriverId && assignedDriverInfo) {
        const currentRating = assignedDriverInfo.rating || 4.8;
        const newRating = Number(((currentRating * 4) + rating) / 5).toFixed(1);
        await updateDoc(doc(db, 'drivers', latestTrip.assignedDriverId), {
          rating: parseFloat(newRating)
        });
      }

      setFeedbackSubmitted(true);
      alert('Thank you for your premium driver feedback! We appreciate you riding with Wheez.');
    } catch (err) {
      console.error("Error submitting driver rating feedback:", err);
      alert('Could not record driver rating. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  
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
    else if (step === 'payment') {
      if (user) setStep('estimate');
      else setStep('login');
    }
    else if (step === 'dashboard') setView('landing');
    else setStep('home');
  };

  const handleEstimateNext = () => {
    if (user) setStep('payment');
    else setStep('login');
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setStep('payment');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handlePayment = () => {
    if (!user) return;
    setIsPaystackOpen(true);
  };

  const handlePaystackSuccess = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'trips'), {
        userId: user.uid,
        date: new Date().toISOString(),
        distance: 'N/A', // We can calculate this later if needed
        totalCost: estimatedFare + 1500,
        category,
        pickup,
        destination,
        duration,
        vehicleBrand,
        vehicleClass,
        transmission,
        status: 'pending'
      });
      setStep('dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'trips');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex-grow w-full flex flex-col items-center justify-start text-brand-text min-h-screen bg-brand-base relative py-12 px-4 md:px-8">
        
        {/* Main Centered Form Panel */}
        <div className="w-full max-w-xl bg-brand-surface p-6 md:p-8 flex flex-col border border-black/5 rounded-[2.5rem] shadow-xl justify-start relative z-20">
          
          {/* Header Back Button */}
          {step !== 'dashboard' && (
            <div className="flex items-center justify-between mb-8 max-w-lg mx-auto w-full">
              <button 
                onClick={handleBack}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 border border-black/10 text-brand-text hover:bg-black/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-xs font-semibold tracking-widest text-brand-muted uppercase">
                {step === 'home' ? 'Request Driver' : step === 'estimate' ? 'Estimate' : step === 'login' ? 'Sign In' : 'Payment'}
              </div>
              <div className="w-10"></div>
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* HOME STEP */}
            {step === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col flex-grow w-full max-w-lg mx-auto relative z-10">
            
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2 text-brand-accent cursor-pointer hover:opacity-85 transition-opacity" onClick={() => setView('landing')}>
                 <Logo size={20} className="text-brand-accent hover:rotate-12 transition-transform duration-300" />
                 <span className="font-mono text-[10px] tracking-widest uppercase font-semibold">Wheez Booking</span>
              </div>
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
                  <AddressAutocomplete value={pickup} onChange={setPickup} placeholder="Enter pickup location" />
                </div>
                
                <div className="relative flex items-center">
                  <div className="absolute left-[-24px] w-3 h-3 rounded-full border-2 border-brand-text bg-brand-surface z-10"></div>
                  <AddressAutocomplete value={destination} onChange={setDestination} placeholder="Enter dropoff location (optional)" />
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
          <motion.div key="estimate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col w-full max-w-lg mx-auto">
            <div className="flex items-center gap-2 mb-4 text-brand-accent cursor-pointer hover:opacity-85 transition-opacity" onClick={() => setView('landing')}>
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
                {destination && (
                  <div className="flex gap-4">
                    <div className="w-8 flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full border-2 border-brand-text bg-brand-surface"></div>
                      <div className="w-[2px] h-full bg-black/10 my-1"></div>
                    </div>
                    <div>
                      <h4 className="text-brand-muted text-xs font-semibold tracking-wide uppercase mb-1">Dropoff</h4>
                      <p className="font-medium">{destination}</p>
                    </div>
                  </div>
                )}
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
              onClick={handleEstimateNext}
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
            className="flex-1 flex flex-col items-center justify-center text-center mt-12 w-full max-w-lg mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-brand-surface border border-black/10 flex items-center justify-center mb-6 shadow-sm text-brand-accent cursor-pointer hover:scale-110 active:scale-95 transition-all" onClick={() => setView('landing')}>
              <Logo size={32} className="text-brand-accent animate-pulse" />
            </div>
            <h2 className="text-3xl font-display font-medium mb-3">Create an Account or Sign In</h2>
            <p className="text-brand-muted mb-10 max-w-sm">
              Sign up to complete your booking. We'll use your details for the ride and final payment.
            </p>
            
            <button 
              onClick={handleGoogleLogin}
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
          <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 w-full max-w-lg mx-auto">
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
              onClick={handlePayment}
              disabled={isProcessing}
              className="mt-auto w-full py-5 rounded-2xl bg-brand-text text-brand-base font-semibold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : <><CreditCard className="w-5 h-5"/> Confirm & Pay ₦{(estimatedFare + 1500).toLocaleString()}</>}
            </button>
            <p className="text-[10px] text-center text-brand-muted mt-4 uppercase tracking-widest flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Secured in-app
            </p>
          </motion.div>
        )}

        {/* DASHBOARD STEP */}
        {step === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col pt-8 w-full max-w-lg mx-auto pb-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-display font-medium text-brand-text">Live Ride Status</h2>
              <div 
                className="w-10 h-10 rounded-full bg-brand-surface border border-black/10 flex items-center justify-center cursor-pointer hover:bg-black/5" 
                onClick={() => setView('landing')}
              >
                <LayoutDashboard className="w-5 h-5 text-brand-text" />
              </div>
            </div>
            
            {/* If there is no latest trip document at all */}
            {!latestTrip ? (
              <div className="bg-brand-surface border border-black/5 shadow-sm rounded-3xl p-8 text-center my-auto">
                <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Car className="w-8 h-8 text-brand-muted" />
                </div>
                <h3 className="text-xl font-display text-brand-text mb-2">No active book registered</h3>
                <p className="text-sm text-brand-muted max-w-sm mx-auto mb-6">Verify your network or find a professional chauffeur to launch an active standby ride track.</p>
                <button onClick={() => setStep('home')} className="px-6 py-3 bg-[#191814] text-white rounded-xl text-xs font-semibold uppercase hover:bg-black transition-colors">
                  Request Chauffeur
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6 flex-grow justify-start">
                
                {/* 1. COMPLETED REVIEW OVERLAY AND FORM */}
                {latestTrip.status === 'completed' && !latestTrip.ratingSubmitted && !feedbackSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-brand-surface border border-[#986D43]/30 rounded-3xl p-6 shadow-md"
                  >
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-700 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-display font-semibold text-brand-text">Trip Completed!</h3>
                      <p className="text-xs text-brand-muted mt-1 leading-normal">
                        Your professional chauffeur has successfully concluded the ride.
                      </p>
                    </div>

                    {/* Driver details */}
                    {assignedDriverInfo && (
                      <div className="bg-brand-base rounded-2xl p-4 border border-black/[0.05] flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#191814]/10 text-[#191814] flex items-center justify-center font-display font-medium uppercase text-sm">
                          {assignedDriverInfo.name ? assignedDriverInfo.name.split(' ').map((n: string) => n[0]).join('') : 'D'}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-brand-text">{assignedDriverInfo.name}</p>
                          <p className="text-[10px] text-brand-muted">Professionally Vetted Wheez Chauffeur</p>
                        </div>
                        <div className="ml-auto bg-amber-500/10 text-[#986D43] font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                          ★ {assignedDriverInfo.rating || '4.8'}
                        </div>
                      </div>
                    )}

                    {/* Rating feedback choice form */}
                    <div className="space-y-4">
                      <label className="block text-center text-xs uppercase tracking-widest font-mono text-brand-muted font-bold">
                        Choose Chauffeur Rating
                      </label>
                      <div className="flex items-center justify-center gap-2 py-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 text-[#986D43] hover:scale-110 active:scale-95 transition-all outline-none"
                          >
                            <Star 
                              className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                            />
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs uppercase tracking-widest font-mono text-brand-muted font-bold">
                          Provide Written Feedback
                        </label>
                        <textarea
                          rows={3}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="How was the journey? Share your experience with client safety, vehicle hygiene, or route efficiency..."
                          className="w-full bg-brand-base border border-black/5 rounded-2xl p-4 text-xs font-medium outline-none focus:border-[#986D43]/40 transition-colors"
                        />
                      </div>

                      <button
                        onClick={handleSubmitFeedback}
                        disabled={isSubmittingFeedback}
                        className="w-full py-4 bg-[#986D43] hover:bg-[#835b34] text-white text-sm font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md mt-2"
                      >
                        {isSubmittingFeedback ? 'Recording System Feedback...' : 'Submit Professional Review'}
                      </button>
                    </div>
                  </motion.div>
                ) : (feedbackSubmitted || latestTrip.ratingSubmitted) ? (
                  <div className="bg-brand-surface border border-green-500/20 rounded-3xl p-6 text-center shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-700 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-display font-semibold text-brand-text">Thank you for rating!</h4>
                    <p className="text-xs text-brand-muted mt-1 leading-normal">
                      Your feedback on this trip has been officially processed and synced. It helps maintain our premium luxury chauffeur standards.
                    </p>
                  </div>
                ) : null}

                {/* 2. REAL-TIME MULTI-STATE PROGRESS INDICATOR / VISUAL BAR */}
                <div className="bg-brand-surface border border-black/5 shadow-sm rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs uppercase tracking-wider font-mono text-brand-muted font-bold">Ride Progress</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#986D43] px-3 py-1 bg-[#986D43]/10 rounded-full">
                      {latestTrip.status || 'pending'}
                    </span>
                  </div>

                  {/* Horizontal progress track line and step indicators */}
                  <div className="relative py-8 px-2">
                    {/* Background line track */}
                    <div className="absolute top-[46px] left-[16px] right-[16px] h-[3px] bg-black/[0.06] rounded-full -translate-y-1/2" />
                    
                    {/* Active foreground indicator track */}
                    <div 
                      className="absolute top-[46px] left-[16px] h-[3px] bg-[#986D43] transition-all duration-700 ease-out rounded-full -translate-y-1/2" 
                      style={{ 
                        width: `calc((${(() => {
                          const status = latestTrip.status || 'pending';
                          if (status === 'completed') return 4;
                          if (status === 'in_progress') return 3;
                          if (status === 'arriving' || status === 'arrived') return 2;
                          if (status === 'assigned' || (status === 'pending' && latestTrip.assignedDriverId)) return 1;
                          return 0;
                        })()} / 4) * (100% - 32px))`
                      }}
                    />

                    {/* Checkpoints map */}
                    <div className="relative flex justify-between items-center w-full">
                      {[
                        { title: 'Requested', desc: 'Finding chauffeur', step: 0 },
                        { title: 'Assigned', desc: 'Chauffeur secured', step: 1 },
                        { title: 'Arrived', desc: 'At pickup location', step: 2 },
                        { title: 'En Route', desc: 'Standby standby', step: 3 },
                        { title: 'Completed', desc: 'Safe landing', step: 4 }
                      ].map((chkPoint) => {
                        const tripActiveIndex = (() => {
                          const status = latestTrip.status || 'pending';
                          if (status === 'completed') return 4;
                          if (status === 'in_progress') return 3;
                          if (status === 'arriving' || status === 'arrived') return 2;
                          if (status === 'assigned' || (status === 'pending' && latestTrip.assignedDriverId)) return 1;
                          return 0;
                        })();
                        const isDone = chkPoint.step < tripActiveIndex;
                        const isCurrent = chkPoint.step === tripActiveIndex;

                        return (
                          <div key={chkPoint.title} className="flex flex-col items-center flex-1">
                            <div 
                              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 ${
                                isCurrent ? 'bg-[#191814] border-[#986D43] text-[#986D43] scale-110 shadow-lg' :
                                isDone ? 'bg-[#986D43] border-[#986D43] text-white' :
                                'bg-white border-black/10 text-brand-muted'
                              }`}
                            >
                              {isDone ? (
                                <span className="text-xs font-bold leading-none font-sans">✓</span>
                              ) : (
                                <span className="text-xs font-bold leading-none font-sans">{chkPoint.step + 1}</span>
                              )}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider mt-2.5 text-center ${
                              isCurrent ? 'text-[#986D43]' : isDone ? 'text-brand-text' : 'text-brand-muted/70'
                            }`}>
                              {chkPoint.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. ASSIGNED CHAUFFEUR PROFILE */}
                {latestTrip.assignedDriverId && assignedDriverInfo && (
                  <div className="bg-brand-surface border border-black/5 shadow-sm rounded-3xl p-6">
                    <h4 className="text-brand-muted text-xs font-semibold tracking-wide uppercase mb-4 font-bold">Assigned Chauffeur Profile</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#191814]/5 flex items-center justify-center font-display text-lg font-bold">
                        {assignedDriverInfo.name ? assignedDriverInfo.name.split(' ').map((n: string) => n[0]).join('') : 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold truncate text-brand-text">{assignedDriverInfo.name}</h4>
                          <span className="bg-amber-500/10 text-amber-700 font-bold text-xs px-2 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0">
                            ★ {assignedDriverInfo.rating || '4.8'}
                          </span>
                        </div>
                        <p className="text-xs text-brand-muted mt-1 truncate">Email: {assignedDriverInfo.email}</p>
                        <p className="text-xs text-brand-muted mt-0.5">Phone: {assignedDriverInfo.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. ACTIVE TRIP DETAIL BILLINGS */}
                <div className="bg-brand-surface border border-black/5 shadow-sm rounded-3xl p-6">
                  <h4 className="text-brand-muted text-xs font-semibold tracking-wide uppercase mb-4 font-bold">Trip Information</h4>
                  <div className="space-y-3.5 text-xs text-brand-text">
                    <div className="flex justify-between pb-2 border-b border-black/[0.04]">
                      <span className="text-brand-muted">Pickup Location</span>
                      <span className="font-semibold text-right max-w-[200px] truncate">{latestTrip.pickup}</span>
                    </div>
                    {latestTrip.destination && (
                      <div className="flex justify-between pb-2 border-b border-black/[0.04]">
                        <span className="text-brand-muted">Dropoff Location</span>
                        <span className="font-semibold text-right max-w-[200px] truncate">{latestTrip.destination}</span>
                      </div>
                    )}
                    <div className="flex justify-between pb-2 border-b border-black/[0.04]">
                      <span className="text-brand-muted">Category Class</span>
                      <span className="font-semibold">{latestTrip.category || 'Executive'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted font-bold">Total Fare Paid</span>
                      <span className="font-mono font-bold text-sm text-[#986D43]">₦{latestTrip.totalCost?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setView('dashboard')} // Send them to user dashboard
                  className="mt-auto w-full py-5 rounded-2xl bg-[#191814] text-white font-medium hover:bg-black transition-all border border-black/10"
                >
                  Go to My Trips & Receipts
                </button>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>

      </div>
      
      <PaystackModal 
        isOpen={isPaystackOpen}
        onClose={() => setIsPaystackOpen(false)}
        onSuccess={handlePaystackSuccess}
        amount={estimatedFare + 1500}
        email={user?.email || 'luxury.client@wheez.com'}
        metadata={`${category} Ride Class`}
      />
    </>
  );
}

