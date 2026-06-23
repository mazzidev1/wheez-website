import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, DriverStep } from '../types';
import { ArrowLeft, ShieldCheck, UploadCloud, CheckCircle2 } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import Logo from './Logo';

interface Props {
  setView: (view: AppState) => void;
}

export default function DriverFlow({ setView }: Props) {
  // Check if they previously submitted an application on this browser
  const [step, setStep] = useState<DriverStep>(() => {
    const saved = localStorage.getItem('driverOnboardingSubmitted');
    return saved === 'true' ? 'pending' : 'login';
  });

  const [vIdx, setVIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Deeply bind form data to states for database saving
  const [formData, setFormData] = useState({
    name: '',
    email: auth.currentUser?.email || '',
    phone: '',
    dob: '',
    licenseNum: '',
    licenseExpiry: '',
    experience: '3',
    transmission: 'Automatic',
    bankHolder: '',
    bankRouting: '',
    bankAccount: '',
  });

  // Sync auth email if it changes
  useEffect(() => {
    if (auth.currentUser?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: auth.currentUser?.email || '' }));
    }
  }, [auth.currentUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const vettingSteps = [
    { title: 'Personal Info', detail: 'Tell us who you are.' },
    { title: "Driver's License", detail: 'We verify every license.' },
    { title: 'Driving Experience', detail: 'What can you drive?' },
    { title: 'Background Check', detail: 'Required before activation.' },
    { title: 'Document Uploads', detail: 'Upload clear photos or scans.' },
    { title: 'Payout Details', detail: 'So the platform can pay you.' },
    { title: 'Review & Submit', detail: 'Confirm everything looks right.' },
  ];

  // Simple validation to ensure nice flows
  const isStepValid = () => {
    if (vIdx === 0) {
      return formData.name.trim().length > 0 && formData.phone.trim().length > 0;
    }
    if (vIdx === 1) {
      return formData.licenseNum.trim().length > 0 && formData.licenseExpiry.trim().length > 0;
    }
    if (vIdx === 2) {
      return formData.experience.trim().length > 0;
    }
    if (vIdx === 5) {
      return formData.bankHolder.trim().length > 0 && formData.bankAccount.trim().length > 0;
    }
    return true; // Simple optional/click steps or review
  };

  const handleNext = async () => {
    if (vIdx === 6) {
      // Final submission! Save to Firestore
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const payload = {
          name: formData.name,
          email: formData.email || auth.currentUser?.email || 'driver-candidate@wheez.com',
          phone: formData.phone,
          dob: formData.dob,
          licenseNum: formData.licenseNum,
          licenseExpiry: formData.licenseExpiry,
          experience: Number(formData.experience) || 3,
          transmission: formData.transmission,
          bankHolder: formData.bankHolder,
          bankRouting: formData.bankRouting,
          bankAccount: formData.bankAccount,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        await addDoc(collection(db, 'drivers'), payload);
        
        // Save submission state to persist across page reloads
        localStorage.setItem('driverOnboardingSubmitted', 'true');
        setStep('pending');
      } catch (err: any) {
        console.error("Failed to submit driver application:", err);
        setSubmitError("Failed to submit. Please check your network and try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setVIdx(vIdx + 1);
    }
  };

  return (
    <div className="flex-1 w-full max-w-lg mx-auto flex flex-col relative px-4 sm:px-0 pt-6 pb-12 text-brand-text">
      
      {/* Header Navigation Block */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => {
            if (step === 'login') {
              setView('landing');
            } else if (step === 'vetting') {
              if (vIdx > 0) {
                setVIdx(vIdx - 1);
              } else {
                setStep('login');
              }
            } else if (step === 'pending') {
              // Custom behavior: allow going back to landing from pending view
              setView('landing');
            }
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 border border-black/10 text-brand-text hover:bg-black/10 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-xs font-semibold tracking-widest text-[#986D43] uppercase font-mono">
          {step === 'pending' ? 'ONBOARDING' : 'ONBOARDING'}
        </div>
        <div className="w-10"></div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* LOGIN STEP */}
        {step === 'login' && (
          <motion.div 
            key="login" 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }} 
            className="flex-1 flex flex-col items-center justify-center text-center mt-6"
          >
            <div className="w-16 h-16 rounded-full bg-brand-surface border border-black/10 flex items-center justify-center mb-6 shadow-sm text-brand-accent">
              <Logo size={28} className="text-[#986D43] animate-pulse" />
            </div>
            <h2 className="text-3xl font-display font-medium mb-3">Drive with Wheez</h2>
            <p className="text-brand-muted mb-10 max-w-sm text-sm leading-relaxed">
              Register as a premium chauffeur. Submit your information below to begin our elite security vetting process.
            </p>
            
            <button 
              onClick={() => setStep('vetting')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4.5 rounded-2xl bg-[#191814] text-white font-medium hover:scale-[1.01] active:scale-95 transition-all shadow-md text-sm"
            >
              Start Driver Application
            </button>
            <p className="text-xs text-brand-muted mt-6 font-mono tracking-tight">Full professional vetting is required before active driving.</p>
          </motion.div>
        )}

        {/* VETTING STEP */}
        {step === 'vetting' && (
          <motion.div 
            key="vetting" 
            initial={{ opacity: 0, x: 15 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -15 }} 
            className="flex-1 flex flex-col"
          >
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2.5 text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">
                <span>STEP {vIdx + 1} OF 7</span>
                <span className="text-[#986D43]">{Math.round(((vIdx + 1) / 7) * 100)}%</span>
              </div>
              <div className="h-1 w-full bg-black/[0.06] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#986D43]"
                  initial={{ width: `${(vIdx / 7) * 100}%` }}
                  animate={{ width: `${((vIdx + 1) / 7) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 text-[#986D43]">
               <ShieldCheck size={14} />
               <span className="font-mono text-[9px] tracking-widest uppercase font-bold">Wheez Security Vetting</span>
            </div>
            <h2 className="text-2.5xl font-display font-medium mb-1.5 text-brand-text">{vettingSteps[vIdx].title}</h2>
            <p className="text-brand-muted text-sm mb-8 leading-relaxed">{vettingSteps[vIdx].detail}</p>

            <div className="flex-1">
              {vIdx === 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted">Full Legal Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Victor Anichebe" 
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none transition-colors" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted">Email Address (Optional if logged out)</label>
                    <input 
                      type="email" 
                      placeholder="e.g. victor@gmail.com" 
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none transition-colors" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted">Date of Birth</label>
                      <input 
                        type="text" 
                        placeholder="DD/MM/YYYY" 
                        value={formData.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                        className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="e.g. +234 812 3456" 
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {vIdx === 1 && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted">Driver's License Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. DL-9843727" 
                      value={formData.licenseNum}
                      onChange={(e) => handleInputChange('licenseNum', e.target.value)}
                      className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YYYY" 
                      value={formData.licenseExpiry}
                      onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                      className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none" 
                    />
                  </div>
                </div>
              )}

              {vIdx === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-brand-muted mb-3 flex">Years of Professional Experience</label>
                    <input 
                      type="number" 
                      min="0"
                      max="50"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-brand-muted mb-3 flex">Preferred Transmission Comfort</label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => handleInputChange('transmission', 'Automatic')}
                        className={`flex-1 py-3.5 rounded-xl border font-medium text-sm transition-all ${formData.transmission === 'Automatic' ? 'bg-[#986D43]/15 border-[#986D43] text-brand-text font-bold' : 'bg-transparent border-black/10 text-brand-muted hover:bg-black/[0.02]'}`}
                      >
                        Automatic Only
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleInputChange('transmission', 'Manual & Automatic')}
                        className={`flex-1 py-3.5 rounded-xl border font-medium text-sm transition-all ${formData.transmission === 'Manual & Automatic' ? 'bg-[#986D43]/15 border-[#986D43] text-brand-text font-bold' : 'bg-transparent border-black/10 text-brand-muted hover:bg-black/[0.02]'}`}
                      >
                        Manual & Automatic
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {vIdx === 3 && (
                <div className="bg-brand-surface border border-black/10 rounded-2xl p-6 shadow-xs">
                  <p className="text-sm text-brand-muted leading-relaxed mb-6">
                    Wheez performs a background and professional conduct verification through certified security agencies. All candidate data remains private and highly encrypted.
                  </p>
                  <label className="flex items-start gap-4 p-4 rounded-xl border border-[#986D43]/30 bg-[#986D43]/5 cursor-pointer select-none">
                    <div className="w-5.5 h-5.5 rounded bg-[#986D43] flex items-center justify-center flex-shrink-0 mt-0.5 text-white">
                      <CheckCircle2 size={15} />
                    </div>
                    <span className="text-xs sm:text-sm text-brand-text font-medium leading-normal">
                      I consent to completing background checks for Wheez Chauffeur network.
                    </span>
                  </label>
                </div>
              )}

              {vIdx === 4 && (
                <div className="space-y-4">
                  <div className="border border-dashed border-black/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-black/5 hover:bg-black/[0.08] transition-colors cursor-pointer shadow-inner">
                    <UploadCloud className="w-9 h-9 text-[#986D43] mb-3 opacity-80" />
                    <span className="text-sm font-medium mb-1">Upload ID & Driver Credentials</span>
                    <span className="text-xs text-brand-muted">JPEG, PNG or PDF format scans</span>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/15 rounded-xl flex items-center justify-center gap-2 text-xs text-green-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Ready for submit (Simulated OK)
                  </div>
                </div>
              )}

              {vIdx === 5 && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted">Payout Account Holder Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Victor Anichebe" 
                      value={formData.bankHolder ? formData.bankHolder : formData.name}
                      onChange={(e) => handleInputChange('bankHolder', e.target.value)}
                      className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none shadow-xs" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted">Bank Routing Code / Bank Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. GTBank / Access" 
                        value={formData.bankRouting}
                        onChange={(e) => handleInputChange('bankRouting', e.target.value)}
                        className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none shadow-xs" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted">Bank Account Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 0122484392" 
                        value={formData.bankAccount}
                        onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                        className="w-full bg-brand-surface border border-black/10 rounded-xl p-4 text-brand-text focus:border-brand-accent outline-none shadow-xs" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {vIdx === 6 && (
                <div className="bg-brand-surface border border-black/10 rounded-2xl p-6 space-y-4 shadow-sm text-sm">
                  <div className="flex justify-between border-b border-black/[0.04] pb-3 text-xs uppercase font-mono tracking-widest text-brand-muted font-bold">
                    <span>Vetting Step</span>
                    <span>Candidate Detail</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Full Name:</span>
                    <span className="font-semibold text-brand-text">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Email:</span>
                    <span className="font-semibold text-brand-text">{formData.email || 'None Provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Phone Number:</span>
                    <span className="font-semibold text-brand-text">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">License Exp:</span>
                    <span className="font-semibold text-brand-text">{formData.licenseExpiry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Experience:</span>
                    <span className="font-semibold text-[#986D43]">{formData.experience} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Payout Account:</span>
                    <span className="font-mono text-xs">{formData.bankAccount || 'Not set'}</span>
                  </div>
                </div>
              )}
            </div>

            {submitError && (
              <p className="mt-4 text-xs text-red-600 font-semibold">{submitError}</p>
            )}

            <button 
              type="button"
              onClick={handleNext}
              disabled={isSubmitting || !isStepValid()}
              className={`mt-8 w-full py-5 rounded-2xl font-semibold text-lg hover:scale-[1.01] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 ${isStepValid() ? 'bg-[#191814] text-white hover:bg-black cursor-pointer' : 'bg-black/10 text-brand-muted cursor-not-allowed'}`}
            >
              {isSubmitting ? 'Submitting Application...' : vIdx === 6 ? 'Submit Application' : 'Continue'}
            </button>
          </motion.div>
        )}

        {/* PENDING STEP - CUSTOM RETUNED MATCHING IMAGE PRECISELY */}
        {step === 'pending' && (
          <motion.div 
            key="pending" 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex-1 flex flex-col items-center justify-center text-center px-4"
          >
             {/* Dynamic Custom Rotating Wheel / Circular Branding Frame */}
             <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
               {/* Accent circle light track */}
               <div className="absolute inset-0 rounded-full border border-[#986D43]/20"></div>
               {/* Moving Elegant luxury partial border stroke for classy spinning feedback */}
               <div className="absolute inset-0 rounded-full border border-transparent border-t-[#986D43] border-l-[#986D43]/40 animate-spin" style={{ animationDuration: '3s' }}></div>
               
               {/* Premium gold "W" Logo representing luxury Wheez */}
               <div className="w-24 h-24 rounded-full bg-brand-surface border border-[#986D43]/10 shadow-xs flex items-center justify-center text-brand-text">
                  <svg className="w-10 h-10 text-[#986D43]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l4 16 4-10 4 10 4-16" />
                  </svg>
               </div>
             </div>

             {/* Onboarding Pill */}
             <div className="inline-block px-4 py-1.5 rounded-full bg-[#986D43]/10 text-[#986D43] text-xs font-semibold tracking-widest uppercase mb-5">
               PENDING REVIEW
             </div>

             {/* High Display Serif Title */}
             <h2 className="text-3.5xl font-display font-medium tracking-tight mb-4 text-brand-text">
               Application Submitted
             </h2>

             {/* Classy description matching user screenshot */}
             <p className="text-brand-muted text-[15px] sm:text-base leading-relaxed max-w-sm mb-12">
               We are reviewing your details. You will be notified the moment you are approved.
             </p>

             {/* Simple back button */}
             <button
               type="button"
               onClick={() => setView('landing')}
               className="px-8 py-3.5 border border-[#191814]/10 rounded-full text-xs font-semibold uppercase tracking-wider text-brand-muted hover:text-brand-text hover:bg-black/5 transition-all active:scale-95"
             >
               Return to Landing Page
             </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
