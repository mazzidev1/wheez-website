import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, DriverStep } from '../types';
import { ArrowLeft, ShieldCheck, UploadCloud, CheckCircle2, Navigation, DollarSign, Star } from 'lucide-react';
import Logo from './Logo';

interface Props {
  setView: (view: AppState) => void;
}

export default function DriverFlow({ setView }: Props) {
  const [step, setStep] = useState<DriverStep>('login');
  const [vIdx, setVIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const [hasRequest, setHasRequest] = useState(false);
  const [activeTrip, setActiveTrip] = useState(false);
  const [earnings, setEarnings] = useState(0);

  const vettingSteps = [
    { title: 'Personal Info', detail: 'Tell us who you are.' },
    { title: 'Driver\'s License', detail: 'We verify every license.' },
    { title: 'Driving Experience', detail: 'What can you drive?' },
    { title: 'Background Check', detail: 'Required before activation.' },
    { title: 'Document Uploads', detail: 'Upload clear photos or scans.' },
    { title: 'Payout Details', detail: 'So the platform can pay you.' },
    { title: 'Review & Submit', detail: 'Confirm everything looks right.' },
  ];

  useEffect(() => {
    let timer: any;
    if (ready && !activeTrip && !hasRequest) {
      timer = setTimeout(() => {
        setHasRequest(true);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [ready, activeTrip, hasRequest]);

  return (
    <div className="flex-1 w-full max-w-lg mx-auto flex flex-col relative px-4 sm:px-0 pt-6 pb-12 text-brand-text">
      
      {/* Header Back Button */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => {
            if (step === 'login') setView('landing');
            else if (step === 'vetting' && vIdx > 0) setVIdx(vIdx - 1);
            else if (step === 'dashboard') {
              setReady(false);
              setHasRequest(false);
              setStep('login');
            }
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 border border-black/10 text-brand-text hover:bg-black/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-xs font-semibold tracking-widest text-brand-muted uppercase">
          {step === 'login' ? 'Drive with Wheez' : step === 'dashboard' ? 'Driver Dashboard' : 'Onboarding'}
        </div>
        <div className="w-10"></div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* LOGIN STEP */}
        {step === 'login' && (
          <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col items-center justify-center text-center mt-12">
            <div className="w-16 h-16 rounded-full bg-brand-surface border border-black/10 flex items-center justify-center mb-6 shadow-sm text-brand-accent">
              <Logo size={28} className="text-brand-accent animate-pulse" />
            </div>
            <h2 className="text-3xl font-display font-medium mb-3">Drive with Wheez</h2>
            <p className="text-brand-muted mb-10 max-w-sm">
              Sign up, complete vetting, and start earning on your own schedule.
            </p>
            
            <button 
              onClick={() => setStep('vetting')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-brand-surface border border-black/10 text-brand-text font-medium hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>
            <p className="text-xs text-brand-muted mt-6">Vetting is required before your dashboard unlocks.</p>
          </motion.div>
        )}

        {/* VETTING STEP */}
        {step === 'vetting' && (
          <motion.div key="vetting" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2 text-xs font-semibold tracking-widest text-brand-muted">
                <span>STEP {vIdx + 1} OF 7</span>
                <span className="text-brand-accent">{Math.round(((vIdx + 1) / 7) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-brand-accent"
                  initial={{ width: `${(vIdx / 7) * 100}%` }}
                  animate={{ width: `${((vIdx + 1) / 7) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3 text-brand-accent">
               <Logo size={18} className="text-brand-accent" />
               <span className="font-mono text-[10px] tracking-widest uppercase font-semibold">Wheez Security Vetting</span>
            </div>
            <h2 className="text-3xl font-display font-medium mb-1">{vettingSteps[vIdx].title}</h2>
            <p className="text-brand-muted mb-8">{vettingSteps[vIdx].detail}</p>

            <div className="flex-1">
              {vIdx === 0 && (
                <div className="space-y-4">
                  <input type="text" placeholder="Full legal name" className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none transition-colors" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Date of birth" className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none" />
                    <input type="text" placeholder="Phone" className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none" />
                  </div>
                </div>
              )}
              {vIdx === 1 && (
                <div className="space-y-4">
                  <input type="text" placeholder="License number" className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none" />
                  <input type="text" placeholder="Expiry date" className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none" />
                </div>
              )}
              {vIdx === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-brand-muted mb-3 flex">Years of Experience</label>
                    <input type="number" placeholder="e.g. 5" className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-brand-muted mb-3 flex">Comfortable Driving</label>
                    <div className="flex gap-2">
                       <button className="px-5 py-3 rounded-xl bg-brand-accent/20 border border-brand-accent text-brand-text font-medium">Automatic</button>
                       <button className="px-5 py-3 rounded-xl bg-black/5 border border-black/10 text-brand-muted">Manual</button>
                    </div>
                  </div>
                </div>
              )}
              {vIdx === 3 && (
                <div className="bg-brand-surface border border-black/10 rounded-2xl p-6 shadow-sm">
                  <p className="text-sm text-brand-muted leading-relaxed mb-6">
                    Wheez runs a criminal and motor-vehicle background check through a verified partner. Your data is encrypted and used only for vetting.
                  </p>
                  <label className="flex items-start gap-4 p-4 rounded-xl border border-brand-accent/50 bg-brand-accent/10 cursor-pointer">
                    <div className="w-6 h-6 rounded bg-brand-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">I consent to a background and driving-record check.</span>
                  </label>
                </div>
              )}
              {vIdx === 4 && (
                <div className="space-y-4">
                  <div className="border border-dashed border-black/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-black/5 cursor-pointer hover:bg-black/10 transition-colors shadow-inner">
                    <UploadCloud className="w-8 h-8 text-brand-muted mb-3" />
                    <span className="text-sm font-medium mb-1">Upload ID Document</span>
                    <span className="text-xs text-brand-muted">JPEG, PNG, or PDF</span>
                  </div>
                </div>
              )}
              {vIdx === 5 && (
                <div className="space-y-4">
                  <input type="text" placeholder="Account holder name" className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none shadow-sm" />
                  <input type="text" placeholder="Routing number" className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none shadow-sm" />
                  <input type="text" placeholder="Account number" className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none shadow-sm" />
                </div>
              )}
              {vIdx === 6 && (
                <div className="bg-brand-surface border border-black/10 rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between border-b border-black/5 pb-4">
                    <span className="text-brand-muted text-sm">Status</span>
                    <span className="text-brand-accent text-sm font-medium">Ready to submit</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-brand-muted text-sm">Background Check</span>
                    <span className="text-brand-text text-sm">Consented</span>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                if (vIdx === 6) setStep('pending');
                else setVIdx(vIdx + 1);
              }}
              className="mt-8 w-full py-5 rounded-2xl bg-brand-text text-brand-base font-semibold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-md"
            >
              {vIdx === 6 ? 'Submit Application' : 'Continue'}
            </button>
          </motion.div>
        )}

        {/* PENDING STEP */}
        {step === 'pending' && (
          <motion.div key="pending" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
               <div className="absolute inset-0 rounded-full border-2 border-brand-accent/20 border-t-brand-accent animate-spin text-brand-accent"></div>
               <Logo size={28} className="text-brand-accent" />
             </div>
             <div className="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-semibold tracking-widest mb-4">PENDING REVIEW</div>
             <h2 className="text-3xl font-display font-medium mb-3">Application Submitted</h2>
             <p className="text-brand-muted mb-12 max-w-sm">We are reviewing your details. You will be notified the moment you are approved.</p>
             
             {/* Developer Shortcut */}
             <button 
                onClick={() => setStep('dashboard')}
                className="w-full py-4 rounded-2xl bg-black/5 border border-black/10 text-brand-muted hover:text-brand-text hover:bg-black/10 transition-colors flex items-center justify-center gap-2"
             >
               Simulate Approval <ArrowLeft className="w-4 h-4 rotate-180" />
             </button>
             <p className="text-[10px] uppercase tracking-widest text-brand-muted mt-4 opacity-70">Demo Shortcut</p>
          </motion.div>
        )}

        {/* DASHBOARD STEP */}
        {step === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col flex-1">
             <div className="flex justify-between items-end mb-8">
               <div>
                 <div className="text-xs uppercase tracking-widest text-brand-muted mb-1">Welcome Back</div>
                 <h2 className="text-3xl font-display font-medium">Daniel Vega</h2>
               </div>
               <div className="w-12 h-12 rounded-full bg-brand-surface shadow-sm border border-black/5 flex items-center justify-center text-lg font-display font-medium">DV</div>
             </div>

             {/* Main Toggle */}
             <div 
               onClick={() => {
                  setReady(!ready);
                  setHasRequest(false);
               }}
               className={`relative overflow-hidden cursor-pointer rounded-3xl p-6 mb-6 transition-all duration-500 border ${ready ? 'bg-brand-accent border-brand-accent shadow-md text-white' : 'bg-brand-surface border-black/5 shadow-sm text-brand-text'}`}
             >
                <div className="flex justify-between items-center relative z-10">
                   <div>
                     <h3 className="text-xl font-display font-medium mb-1 transition-colors">
                       {ready ? "You're Ready to Work" : "Go Ready for Work"}
                     </h3>
                     <p className={`text-sm transition-colors ${ready ? 'text-white/80' : 'text-brand-muted'}`}>
                       {ready ? "Visible to nearby customers" : "Hidden — flip on to get trips"}
                     </p>
                   </div>
                   <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-500 flex items-center ${ready ? 'bg-brand-text justify-end' : 'bg-black/10 justify-start'}`}>
                      <motion.div layout className="w-6 h-6 rounded-full bg-brand-surface shadow-sm"></motion.div>
                   </div>
                </div>
             </div>

             {/* UI States based on 'ready' and incoming requests */}
             <div className="flex-1 flex flex-col pt-2 relative">
               <AnimatePresence mode="popLayout">
                 {!ready && (
                   <motion.div key="offline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-brand-surface border border-black/5 shadow-sm rounded-2xl p-5">
                           <div className="text-[10px] uppercase tracking-widest text-brand-muted mb-2">Today's Earnings</div>
                           <div className="text-2xl font-display font-medium text-brand-accent">${earnings.toFixed(2)}</div>
                        </div>
                        <div className="bg-brand-surface border border-black/5 shadow-sm rounded-2xl p-5">
                           <div className="text-[10px] uppercase tracking-widest text-brand-muted mb-2">Rating</div>
                           <div className="text-2xl font-display font-medium flex items-center gap-2">4.96 <Star className="w-4 h-4 text-brand-accent fill-brand-accent" /></div>
                        </div>
                      </div>
                      <div className="bg-brand-surface border border-black/5 shadow-sm rounded-2xl p-5 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-brand-accent/20 flex items-center justify-center"><DollarSign className="w-5 h-5 text-brand-accent" /></div>
                           <div>
                             <div className="text-sm font-medium">Next Payout</div>
                             <div className="text-xs text-brand-muted">•••• 8842</div>
                           </div>
                         </div>
                         <div className="text-sm font-medium text-brand-accent">Friday</div>
                      </div>
                   </motion.div>
                 )}

                 {ready && !hasRequest && !activeTrip && (
                   <motion.div key="searching" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 bg-brand-base rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                     <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                        <motion.div animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} className="absolute inset-0 rounded-full border-2 border-brand-accent"></motion.div>
                        <motion.div animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }} className="absolute inset-0 rounded-full border-2 border-brand-accent"></motion.div>
                        <div className="w-4 h-4 rounded-full bg-brand-accent shadow-[0_0_15px_rgba(182,255,60,1)]"></div>
                     </div>
                     <h3 className="text-lg font-medium mb-1">You're live</h3>
                     <p className="text-sm text-brand-muted">Listening for nearby requests...</p>
                   </motion.div>
                 )}

                 {ready && hasRequest && !activeTrip && (
                   <motion.div key="request" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-brand-surface border border-brand-accent/30 rounded-3xl p-6 shadow-xl">
                     <div className="flex justify-between items-start mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-semibold tracking-widest uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span> New Request
                        </div>
                        <div className="text-3xl font-display font-medium">$42.50</div>
                     </div>
                     <div className="flex items-center gap-4 mb-6 pb-6 border-b border-black/5">
                       <div className="w-12 h-12 rounded-full bg-brand-base flex items-center justify-center text-lg font-display">A</div>
                       <div>
                         <div className="font-medium text-lg">Alex</div>
                         <div className="text-sm text-brand-muted mt-1">Airport Run · 22 min · Audi A4</div>
                       </div>
                     </div>
                     <div className="flex gap-3">
                       <button onClick={() => setHasRequest(false)} className="flex-1 py-4 rounded-xl bg-brand-base border border-black/5 font-medium hover:bg-black/5 transition-colors">Decline</button>
                       <button onClick={() => { setHasRequest(false); setActiveTrip(true); }} className="flex-[2] py-4 rounded-xl bg-brand-text text-brand-base font-semibold hover:scale-[1.02] transition-colors shadow-md">Accept Trip</button>
                     </div>
                   </motion.div>
                 )}

                 {activeTrip && (
                   <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-brand-surface border border-brand-accent shadow-xl rounded-3xl overflow-hidden flex flex-col flex-1">
                     <div className="h-48 bg-grid-pattern relative opacity-50 flex items-center justify-center border-b border-black/5">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="w-32 h-32 rounded-full border border-dashed border-brand-accent flex items-center justify-center">
                          <Navigation className="w-8 h-8 text-brand-accent fill-brand-accent/20" />
                        </motion.div>
                     </div>
                     <div className="p-6 flex flex-col flex-1">
                        <div className="inline-flex items-center gap-2 text-brand-accent text-xs font-semibold tracking-widest uppercase mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span> Trip in Progress
                        </div>
                        <h3 className="text-xl font-medium mb-1">Alex → JFK Terminal 4</h3>
                        <p className="text-brand-muted text-sm mb-auto">Driving the Audi A4</p>
                        
                        <button 
                          onClick={() => { setActiveTrip(false); setEarnings(e => e + 42.50); }}
                          className="w-full py-5 rounded-2xl bg-brand-text text-brand-base font-semibold text-lg hover:scale-[1.02] transition-colors shadow-md mt-8"
                        >
                          Complete Trip (+$42.50)
                        </button>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
