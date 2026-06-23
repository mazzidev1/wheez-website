import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, CreditCard, Building2, Smartphone, Lock, 
  Check, Loader2, Copy, Shield, Sparkles 
} from 'lucide-react';

interface PaystackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  email: string;
  metadata?: string;
}

export default function PaystackModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  amount, 
  email,
  metadata = "Executive Dispatch Unit"
}: PaystackModalProps) {
  const [activeTab, setActiveTab] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'authorizing' | 'success'>('idle');
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [isPinRequired, setIsPinRequired] = useState(false);
  
  // Bank Transfer states
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [transferTimer, setTransferTimer] = useState(599); // 10 minutes

  // Handle Bank Transfer Countdown Timer
  useEffect(() => {
    if (!isOpen || activeTab !== 'transfer') return;
    const interval = setInterval(() => {
      setTransferTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    // Format with spaces
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCVV(value);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardPin(value);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('0124893704');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const triggerPaymentHandoff = () => {
    if (activeTab === 'card' && !isPinRequired) {
      // Prompt for PIN first to simulate realistic Paystack Nigerian debit card workflow
      setIsPinRequired(true);
      return;
    }

    setPaymentState('processing');
    
    // Step 1: Connecting/processing (1.2s)
    setTimeout(() => {
      setPaymentState('authorizing');
      
      // Step 2: Authorizing with securing handshake (1.2s)
      setTimeout(() => {
        setPaymentState('success');
        
        // Step 3: Success state then fire callback (1.8s)
        setTimeout(() => {
          onSuccess();
          resetForm();
          onClose();
        }, 1800);
      }, 1300);
    }, 1200);
  };

  const resetForm = () => {
    setPaymentState('idle');
    setActiveTab('card');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setCardPin('');
    setIsPinRequired(false);
    setTransferTimer(599);
  };

  const isFormValid = () => {
    if (activeTab === 'card') {
      if (isPinRequired) {
        return cardPin.length === 4;
      }
      return cardNumber.replace(/\s/g, '').length === 16 && cardExpiry.length === 5 && cardCVV.length === 3;
    }
    return true; // Bank transfer & USSD are pre-filled / simulated triggers
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Ambient Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (paymentState === 'idle') onClose();
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Paystack Window Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-[620px] bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-black/5 text-[#1a1c1e]"
          >
            {/* Close Button */}
            {paymentState === 'idle' && (
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors z-20 cursor-pointer"
              >
                <X size={18} />
              </button>
            )}

            {/* Paystack Checkout Layout */}
            {paymentState === 'idle' || paymentState === 'processing' || paymentState === 'authorizing' ? (
              <>
                {/* Left Panel: Sidebar channels (Desktop) / Top section on mobile */}
                <div className="w-full md:w-[220px] bg-[#f4f7f6] md:border-r border-gray-100 p-5 flex flex-col justify-between shrink-0">
                  <div className="space-y-6">
                    {/* Brand Banner */}
                    <div className="flex flex-col items-start gap-1 pb-4 md:border-b border-gray-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#3ebb8c] flex items-center justify-center text-white text-[10px] font-sans font-bold">p</span>
                        <span className="font-sans font-bold text-xs tracking-tight text-[#011b33]">paystack</span>
                        <span className="text-[8px] bg-sky-100 text-sky-800 font-bold uppercase tracking-wider px-1 py-0.5 rounded-sm">Secured</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5 truncate max-w-[180px]">
                        {email || 'client@wheez.luxury'}
                      </p>
                    </div>

                    {/* Pay channels */}
                    <div className="space-y-1.5 flex flex-row md:flex-col overflow-x-auto py-1 md:py-0 gap-2 md:gap-0">
                      <button 
                        disabled={paymentState !== 'idle'}
                        onClick={() => { setActiveTab('card'); setIsPinRequired(false); }}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold tracking-wide transition-all w-full shrink-0 md:shrink border ${
                          activeTab === 'card' 
                            ? 'bg-white border-gray-200/50 text-[#011b33] shadow-xs' 
                            : 'bg-transparent border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-200/40'
                        } cursor-pointer`}
                      >
                        <CreditCard size={15} className={activeTab === 'card' ? 'text-[#3ebb8c]' : ''} />
                        <span>Pay with Card</span>
                      </button>

                      <button 
                        disabled={paymentState !== 'idle'}
                        onClick={() => setActiveTab('transfer')}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold tracking-wide transition-all w-full shrink-0 md:shrink border ${
                          activeTab === 'transfer' 
                            ? 'bg-white border-gray-200/50 text-[#011b33] shadow-xs' 
                            : 'bg-transparent border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-200/40'
                        } cursor-pointer`}
                      >
                        <Building2 size={15} className={activeTab === 'transfer' ? 'text-[#3ebb8c]' : ''} />
                        <span>Pay with Transfer</span>
                      </button>

                      <button 
                        disabled={paymentState !== 'idle'}
                        onClick={() => setActiveTab('ussd')}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold tracking-wide transition-all w-full shrink-0 md:shrink border ${
                          activeTab === 'ussd' 
                            ? 'bg-white border-gray-200/50 text-[#011b33] shadow-xs' 
                            : 'bg-transparent border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-200/40'
                        } cursor-pointer`}
                      >
                        <Smartphone size={15} className={activeTab === 'ussd' ? 'text-[#3ebb8c]' : ''} />
                        <span>Pay with USSD</span>
                      </button>
                    </div>
                  </div>

                  {/* Merchant badge */}
                  <div className="hidden md:block pt-4 border-t border-gray-200/80">
                    <p className="text-[9px] uppercase font-mono tracking-wider text-gray-400 font-semibold leading-relaxed">Merchant</p>
                    <p className="text-xs font-bold text-[#011b33] truncate">WHEEZ LUXURY</p>
                  </div>
                </div>

                {/* Right Panel: Active interactive billing form */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between min-h-[360px] relative">
                  {/* Processing Overlays */}
                  {paymentState !== 'idle' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-6 text-center"
                    >
                      <Loader2 className="w-10 h-10 text-[#3ebb8c] animate-spin mb-4" />
                      <h3 className="font-semibold text-base text-[#011b33]">
                        {paymentState === 'processing' ? 'Connecting Secure Channel...' : 'Authorizing Payment...'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 max-w-[280px]">
                        Please do not refresh this page or close this dialog. Handshaking with verified bank nodes.
                      </p>
                    </motion.div>
                  )}

                  {/* Header detail */}
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="text-left">
                        <span className="text-[10px] font-mono tracking-widest text-[#3ebb8c] uppercase font-bold bg-[#3ebb8c]/10 px-2 py-0.5 rounded-sm">
                          Payment Request
                        </span>
                        <h2 className="text-lg font-bold text-[#011b33] mt-1.5">₦{amount.toLocaleString()}</h2>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-gray-400 block uppercase font-bold">Service Category</span>
                        <span className="text-xs font-bold text-[#011b33]">{metadata}</span>
                      </div>
                    </div>

                    {/* CHANNEL 1: CARD PAYMENTS */}
                    {activeTab === 'card' && (
                      <div className="space-y-4 text-left">
                        {!isPinRequired ? (
                          <>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                Card Number
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-3.5 text-gray-400">
                                  <CreditCard size={16} />
                                </span>
                                <input 
                                  type="text"
                                  value={cardNumber}
                                  onChange={handleCardNumberChange}
                                  placeholder="0000 0000 0000 0000"
                                  className="w-full bg-[#fcfbfa] border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold outline-none focus:border-[#3ebb8c] transition-colors font-mono tracking-wider"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                  Card Expiry
                                </label>
                                <input 
                                  type="text"
                                  value={cardExpiry}
                                  onChange={handleExpiryChange}
                                  placeholder="MM/YY"
                                  className="w-full bg-[#fcfbfa] border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#3ebb8c] transition-colors font-mono tracking-wider text-center"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                  CVV
                                </label>
                                <input 
                                  type="password"
                                  value={cardCVV}
                                  onChange={handleCVVChange}
                                  placeholder="123"
                                  className="w-full bg-[#fcfbfa] border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#3ebb8c] transition-colors font-mono tracking-widest text-center"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-500/10 text-center"
                          >
                            <Lock className="w-5 h-5 text-[#3ebb8c] mx-auto mb-2" />
                            <h4 className="text-sm font-bold text-[#011b33]">Authorize Transaction</h4>
                            <p className="text-2xs text-gray-500 max-w-[280px] mx-auto mt-1">
                              Please enter your secure 4-digit card PIN to authorize the payment of ₦{amount.toLocaleString()}.
                            </p>
                            
                            <input 
                              type="password"
                              value={cardPin}
                              onChange={handlePinChange}
                              maxLength={4}
                              placeholder="••••"
                              className="w-24 mt-4 bg-white border-2 border-gray-200 focus:border-[#3ebb8c] outline-none rounded-xl py-2 px-3 text-lg font-bold font-mono text-center tracking-widest"
                            />
                            
                            <button 
                              onClick={() => setIsPinRequired(false)}
                              className="text-2xs text-gray-500 underline block mx-auto mt-3 hover:text-[#011b33]"
                            >
                              Go back to card fields
                            </button>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* CHANNEL 2: BANK TRANSFER */}
                    {activeTab === 'transfer' && (
                      <div className="space-y-4 text-left">
                        <div className="bg-amber-500/[0.04] border border-amber-500/10 p-4 rounded-2xl">
                          <p className="text-2xs text-amber-800 leading-normal font-medium">
                            Transfer exactly <strong>₦{amount.toLocaleString()}</strong> to the simulated dynamic Wema Bank container below. This account expires shortly.
                          </p>
                        </div>

                        <div className="bg-[#fbfcff] border border-gray-100 rounded-2xl p-4 flex justify-between items-center">
                          <div>
                            <span className="text-[9px] uppercase font-mono text-gray-400 block tracking-wider font-semibold">Bank Name</span>
                            <span className="text-xs font-bold text-[#011b33]">Wema Bank (via Paystack)</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-mono text-gray-400 block tracking-wider font-semibold">Timer</span>
                            <span className="text-xs font-mono font-semibold text-red-600">{formatTimer(transferTimer)}</span>
                          </div>
                        </div>

                        <div className="bg-[#fbfcff] border border-gray-100 rounded-2xl p-4 flex justify-between items-center mt-3">
                          <div>
                            <span className="text-[9px] uppercase font-mono text-gray-400 block tracking-wider font-semibold">Account Number</span>
                            <span className="text-sm font-mono font-bold text-[#011b33] tracking-wide">0124893704</span>
                          </div>
                          <button 
                            type="button"
                            onClick={handleCopyAccount}
                            className={`px-3 py-1.5 text-2xs font-mono font-bold uppercase rounded-xl transition-all border cursor-pointer ${
                              copiedAccount 
                                ? 'bg-emerald-500 text-white border-emerald-500' 
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {copiedAccount ? 'Copied' : <span className="flex items-center gap-1"><Copy size={11}/> Copy</span>}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CHANNEL 3: USSD CODE METHOD */}
                    {activeTab === 'ussd' && (
                      <div className="space-y-4 text-left">
                        <div className="bg-sky-500/[0.04] border border-sky-500/10 p-4 rounded-2xl text-center">
                          <p className="text-2xs text-[#09a5db] uppercase font-mono font-bold tracking-widest mb-1">Dial USSD Code</p>
                          <h3 className="text-lg font-mono font-extrabold text-[#011b33] tracking-normal">*737*1*2*{amount}#</h3>
                          <p className="text-[11px] text-gray-500 max-w-[280px] mx-auto mt-2">
                            Dial this code on your registered GTBank phone line to process direct payment.
                          </p>
                        </div>

                        <div className="bg-[#fcfbfa] border border-gray-100 p-4 rounded-xl text-center text-xs text-gray-500">
                          Simply tap pay below to simulate dialing and receiving the banking SMS authorization hook.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission and Safety Area */}
                  <div className="mt-8 space-y-4 pt-4 border-t border-gray-100">
                    <button 
                      type="button"
                      disabled={!isFormValid()}
                      onClick={triggerPaymentHandoff}
                      className="w-full py-4 bg-[#3ebb8c] hover:bg-[#34a27a] text-white font-sans font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {activeTab === 'card' && isPinRequired ? (
                        'Submit Authorize'
                      ) : activeTab === 'transfer' ? (
                        "I've sent the transfer"
                      ) : (
                        `Pay ₦${amount.toLocaleString()}`
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-400 font-sans tracking-wide">
                      <Lock size={10} className="text-[#3ebb8c]" />
                      <span>Encrypted by Paystack PCI-DSS Layer • Verified Secure Payment</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Success Anim screen */
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="w-full py-16 px-8 flex flex-col items-center justify-center text-center bg-[#fafdfb]"
              >
                {/* Radial pulse background */}
                <span className="relative flex h-20 w-20 items-center justify-center mb-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-100 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-16 w-16 bg-emerald-500 text-white items-center justify-center border border-emerald-400">
                    <Check className="w-9 h-9" strokeWidth={3} />
                  </span>
                </span>

                <span className="font-mono text-3xs font-extrabold uppercase tracking-widest text-[#3ebb8c] bg-[#3ebb8c]/10 px-3 py-1 border border-[#3ebb8c]/20 rounded-full mb-3 flex items-center gap-1">
                  <Sparkles size={10} /> Verified Paystack Gateway
                </span>
                
                <h2 className="text-2xl font-bold font-sans text-[#011b33]">₦{amount.toLocaleString()} Paid</h2>
                <p className="text-xs text-gray-500 max-w-[340px] mt-2">
                  Transaction successful. Secure ledger registered, informing Wheez dispatch and active chauffeur standby servers.
                </p>

                <div className="flex items-center gap-1.5 text-[8.5px] text-gray-400 mt-10 font-mono tracking-wider uppercase">
                  <Shield size={12} className="text-[#3ebb8c]" /> Transaction Securely Finalized
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
