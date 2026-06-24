import React, { useEffect, useState, useRef } from 'react';
import { 
  ArrowLeft, LogOut, User as UserIcon, Calendar, Clock, MapPin, 
  Search, Car, X, Bell, ShieldCheck, CheckCircle2, ChevronRight, Navigation, Trash2,
  CreditCard, Download, FileText, Phone, Mail, Star, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { User } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import luxurySuv from '../assets/images/luxury_suv_1782136584014.jpg';
import luxurySedan from '../assets/images/luxury_sedan_1782136599120.jpg';
import luxuryVan from '../assets/images/luxury_van_1782136613155.jpg';
import yellowUrus from '../assets/images/yellow_urus_1782141995181.jpg';

interface Trip {
  id: string;
  userId: string;
  date: string;
  distance: string;
  totalCost: number;
  pickup?: string;
  destination?: string;
  category?: string;
  duration?: string;
  vehicleBrand?: string;
  vehicleClass?: string;
  transmission?: string;
  status?: string;
  assignedDriverId?: string;
  clientName?: string;
  clientPhone?: string;
  notes?: string;
}

interface Driver {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  rating?: number;
  experience?: string;
}

interface Props {
  user: User;
  onLogout: () => void;
  onBack: () => void;
  onAdmin?: () => void;
  onBookCar?: (carId: string) => void;
  onFindDriver?: () => void;
}



export default function UserDashboard({ user, onLogout, onBack, onAdmin, onBookCar, onFindDriver }: Props) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trips' | 'rentals' | 'financials'>('trips');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; message: string; date: string }[]>([]);

  const handleDownloadReceipt = (trip: Trip) => {
    const invoiceHTML = `
      <html>
        <head>
          <title>Digital Receipt - Wheez Client Chauffeur Services</title>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              background-color: #FAF9F6; 
              color: #191814; 
              padding: 50px 20px; 
              margin: 0;
            }
            .invoice-card { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff; 
              padding: 45px; 
              border-radius: 28px; 
              border: 1px solid rgba(0,0,0,0.05); 
              box-shadow: 0 4px 30px rgba(0,0,0,0.02);
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              border-bottom: 1px solid rgba(0,0,0,0.06); 
              padding-bottom: 25px; 
              margin-bottom: 30px; 
            }
            .logo { 
              font-size: 22px; 
              font-weight: 700; 
              letter-spacing: 3px; 
              text-transform: uppercase; 
              color: #191814;
            }
            .title-badge { 
              font-size: 11px; 
              text-transform: uppercase; 
              letter-spacing: 1.5px; 
              font-weight: 600; 
              background: rgba(152, 109, 67, 0.1); 
              color: #986D43; 
              padding: 6px 14px; 
              border-radius: 30px; 
              border: 1px solid rgba(152, 109, 67, 0.2);
            }
            .section-label { 
              font-size: 10px; 
              text-transform: uppercase; 
              letter-spacing: 1.5px; 
              color: #8c8c8c; 
              margin-bottom: 6px; 
              font-weight: bold;
            }
            .client-name { 
              font-size: 15px; 
              font-weight: 600; 
              margin-bottom: 25px; 
              color: #191814;
            }
            .grid-sheet {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 20px;
              margin-bottom: 25px;
            }
            .meta-item { 
              font-size: 13px; 
              line-height: 1.6;
            }
            .meta-item span { 
              display: block; 
              font-size: 10px; 
              text-transform: uppercase; 
              color: #8c8c8c; 
              margin-bottom: 2px;
              font-weight: bold;
            }
            .meta-item strong { 
              color: #191814; 
              font-weight: 500;
            }
            .address-box {
              background: #fcfbfa;
              border: 1px solid rgba(0,0,0,0.03);
              border-radius: 16px;
              padding: 20px;
              margin-bottom: 30px;
            }
            .address-row {
              display: flex;
              gap: 12px;
              margin-bottom: 12px;
              font-size: 13px;
            }
            .address-row:last-child {
              margin-bottom: 0;
            }
            .dot-indicator {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              margin-top: 6px;
              flex-shrink: 0;
            }
            .price-panel { 
              background: #191814; 
              color: #ffffff; 
              padding: 24px 30px; 
              border-radius: 20px; 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              margin-top: 35px;
            }
            .price-panel span { 
              font-size: 13px; 
              color: rgba(255,255,255,0.6); 
              font-weight: 500;
            }
            .price-panel strong { 
              font-size: 26px; 
              font-weight: 600; 
              color: #ceaf8d; 
            }
            .footer-note {
              text-align: center;
              font-size: 10px;
              color: #8c8c8c;
              margin-top: 35px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <div class="header">
              <span class="logo">WHEEZ</span>
              <span class="title-badge">Verified Receipt</span>
            </div>
            
            <div class="section-label">Billed To</div>
            <div class="client-name">${user.displayName || user.email || 'Premium Chauffeur Client'}</div>
            
            <div class="grid-sheet">
              <div class="meta-item">
                <span>Receipt Number</span>
                <strong>WHEEZ-${trip.id.substring(0, 8).toUpperCase()}</strong>
              </div>
              <div class="meta-item">
                <span>Transaction Date</span>
                <strong>${new Date(trip.date).toLocaleString()}</strong>
              </div>
              <div class="meta-item">
                <span>Service Type</span>
                <strong>${trip.category || 'Executive Standby'} Class</strong>
              </div>
              <div class="meta-item">
                <span>Payment Method</span>
                <strong>Secured Credit Card (v-App)</strong>
              </div>
            </div>

            <div class="address-box">
              <div class="address-row">
                <div class="dot-indicator" style="background: #191814;"></div>
                <div>
                  <div class="section-label" style="font-size:8px; margin-bottom: 0px;">Pickup Address</div>
                  <strong>${trip.pickup || 'Direct Dispatch Terminal'}</strong>
                </div>
              </div>
              <div class="address-row" style="margin-top: 15px;">
                <div class="dot-indicator" style="background: #986D43;"></div>
                <div>
                  <div class="section-label" style="font-size:8px; margin-bottom: 0px;">Destination Address</div>
                  <strong>${trip.destination || 'Executive Standby Dispatch'}</strong>
                </div>
              </div>
            </div>

            <div class="price-panel">
              <span>Total Gross Fare Paid</span>
              <strong>₦${trip.totalCost?.toLocaleString()}</strong>
            </div>

            <div class="footer-note">
              Thank you for riding with Wheez. Integrity • Exclusivity • Comfort
            </div>
          </div>
        </body>
      </html>
    `;
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WheezReceipt-${trip.id.substring(0, 8).toUpperCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Use real-time listener to load trips and trigger real-time updates when an administrator updates status classes
  useEffect(() => {
    const q = query(
      collection(db, 'trips'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    let isInitial = true;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTrips: Trip[] = [];
      snapshot.forEach((doc) => {
        fetchedTrips.push({ id: doc.id, ...doc.data() } as Trip);
      });

      if (!isInitial) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const upTrip = { id: change.doc.id, ...change.doc.data() } as Trip;
            let statusText = upTrip.status || 'updated';
            let notifyMsg = `Your trip booked for ${new Date(upTrip.date).toLocaleDateString()} status is now: ${statusText}`;
            
            if (upTrip.status === 'arriving') {
              notifyMsg = `⚡ Your driver is arriving shortly at ${upTrip.pickup || 'your location'}!`;
            } else if (upTrip.status === 'completed') {
              notifyMsg = `✨ Trip completed successfully! Thank you for ride with Wheez.`;
            }

            setNotifications(prev => [
              { id: Date.now().toString(), message: notifyMsg, date: new Date().toLocaleTimeString() },
              ...prev
            ]);

            // If selected trip is the updated one, sync state
            setSelectedTrip(prev => prev && prev.id === upTrip.id ? upTrip : prev);
          }
        });
      }

      setTrips(fetchedTrips);
      setIsLoading(false);
      isInitial = false;
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'trips');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    const q = collection(db, 'drivers');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDrivers: Driver[] = [];
      snapshot.forEach((doc) => {
        fetchedDrivers.push({ id: doc.id, ...doc.data() } as Driver);
      });
      setDrivers(fetchedDrivers);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'drivers');
    });
    return () => unsubscribe();
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-brand-base flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Real-time Notifications Toast Panel */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div 
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="pointer-events-auto bg-[#191814] text-white border border-white/10 rounded-2xl shadow-2xl p-4 flex gap-3 items-start relative overflow-hidden"
            >
              <div className="w-2 h-2 rounded-full bg-brand-accent animate-ping absolute top-5 left-5" />
              <div className="pl-4 flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#ceaf8d] uppercase font-semibold">Status Sync</span>
                  <span className="text-[9px] text-white/40">{n.date}</span>
                </div>
                <p className="text-xs text-white/90 font-medium leading-relaxed">{n.message}</p>
              </div>
              <button onClick={() => dismissNotification(n.id)} className="text-white/40 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <nav className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center border-b border-black/5 gap-4 sm:gap-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <Logo size={20} className="text-brand-text hover:rotate-12 transition-transform duration-300" />
            <span className="font-sans text-lg tracking-[0.15em] uppercase font-medium">Wheez</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 sm:gap-3 bg-black/5 px-3 sm:px-4 py-2 rounded-full flex-1 sm:flex-auto overflow-hidden">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full flex-shrink-0" />
            ) : (
              <UserIcon className="w-4 h-4 text-brand-muted flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-brand-text truncate">{user.displayName || user.email}</span>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center justify-center gap-2 bg-black/5 hover:bg-black/10 sm:bg-transparent sm:hover:bg-black/5 px-4 py-2 rounded-full transition-colors text-sm font-medium text-brand-muted hover:text-brand-text flex-shrink-0"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/3 flex flex-col gap-8">
          <div className="bg-brand-surface border border-black/5 rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
            <h2 className="text-2xl font-display text-brand-text">Overview</h2>
            
            {notifications.length > 0 && (
              <div className="bg-brand-accent/5 border border-brand-accent/10 rounded-2xl p-4 flex gap-3 items-center">
                <Bell size={18} className="text-brand-accent animate-bounce" />
                <div className="text-xs">
                  <span className="font-semibold">{notifications.length} unread updates</span>. Check alerts panel!
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center pb-4 border-b border-black/5">
                <span className="text-brand-muted text-sm uppercase tracking-widest font-mono">Total Trips</span>
                {isLoading ? (
                  <div className="h-6 w-8 bg-black/5 rounded-md animate-pulse" />
                ) : (
                  <span className="text-xl font-medium">{trips.length}</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              <button 
                onClick={onFindDriver || onBack}
                className="px-6 py-4 bg-[#191814] text-[#FAF9F6] rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 w-full"
              >
                <Search size={18} /> Find a driver
              </button>
              <button 
                onClick={() => setActiveTab('rentals')}
                className="px-6 py-4 bg-brand-surface border border-black/10 text-brand-text rounded-xl font-medium hover:bg-black/5 transition-colors flex items-center justify-center gap-2 w-full"
              >
                <Car size={18} /> Rent a car
              </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div className="flex items-center gap-6 mb-2 flex-wrap">
             <h2 onClick={() => setActiveTab('trips')} className={`text-2xl font-display cursor-pointer transition-colors ${activeTab === 'trips' ? 'text-brand-text font-semibold border-b-2 border-brand-text pb-1' : 'text-brand-muted hover:text-brand-text'}`}>My Trips</h2>
             <h2 onClick={() => setActiveTab('financials')} className={`text-2xl font-display cursor-pointer transition-colors ${activeTab === 'financials' ? 'text-brand-text font-semibold border-b-2 border-brand-text pb-1' : 'text-brand-muted hover:text-brand-text'}`}>Financials</h2>
             <h2 onClick={() => setActiveTab('rentals')} className={`text-2xl font-display cursor-pointer transition-colors ${activeTab === 'rentals' ? 'text-brand-text font-semibold border-b-2 border-brand-text pb-1' : 'text-brand-muted hover:text-brand-text'}`}>Rentals</h2>
          </div>
          
          {activeTab === 'trips' && (
            isLoading ? (
              <div className="flex flex-col gap-4 w-full">
                {[1, 2, 3].map((skeleton) => (
                  <div key={skeleton} className="bg-brand-surface border border-black/5 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm">
                    <div className="flex flex-col gap-4 flex-1 w-full">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-24 bg-black/5 rounded-full animate-pulse" />
                        <div className="h-4 w-16 bg-black/5 rounded-full animate-pulse" />
                      </div>
                      <div className="h-5 w-48 bg-black/5 rounded-md animate-pulse" />
                      <div className="h-4 w-32 bg-black/5 rounded-md animate-pulse" />
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto border-t sm:border-t-0 border-black/5 pt-4 sm:pt-0">
                      <div className="h-8 w-24 bg-black/5 rounded-md animate-pulse" />
                      <div className="h-4 w-20 bg-black/5 rounded-md animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-brand-surface border border-black/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[400px]">
                <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-6">
                  <Calendar className="w-8 h-8 text-brand-muted" />
                </div>
                <h3 className="text-xl font-display text-brand-text mb-2">No trips yet</h3>
                <p className="text-brand-muted max-w-sm mb-8">When you book your first ride, your history and receipts will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {trips.map((trip) => {
                  const assignedDriver = drivers.find(d => d.id === trip.assignedDriverId);
                  return (
                    <div 
                      key={trip.id} 
                      onClick={() => setSelectedTrip(trip)}
                      className="bg-brand-surface border border-black/5 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm hover:border-black/15 hover:shadow-md cursor-pointer transition-all group"
                    >
                      <div className="flex flex-col gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-3 text-sm font-medium">
                          <span className="bg-black/5 px-3 py-1 rounded-full text-brand-text">{new Date(trip.date).toLocaleDateString()}</span>
                          <span className="text-brand-muted font-mono uppercase tracking-widest text-[11px]">{trip.category || 'Ride'}</span>
                          {trip.status && (
                            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              trip.status === 'arriving' ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20' :
                              trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-50 text-yellow-700'
                            }`}>
                              {trip.status}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-brand-text min-w-0">
                          <MapPin size={16} className="text-brand-muted shrink-0" />
                          <span className="truncate">{trip.pickup || 'Pickup Location'}</span>
                        </div>
                        {trip.duration && (
                          <div className="flex items-center gap-2 text-brand-muted text-sm">
                            <Clock size={14} className="shrink-0" />
                            <span>For {trip.duration}</span>
                          </div>
                        )}
                        {assignedDriver && (
                          <div className="flex items-center gap-2 mt-1 text-xs px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/15 text-emerald-800 rounded-2xl w-fit font-semibold shadow-xs">
                            <Users size={12} className="text-emerald-700" />
                            <span>Chauffeur: {assignedDriver.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 border-black/5 pt-4 sm:pt-0">
                      <div className="flex flex-col items-start sm:items-end gap-1">
                        <span className="text-2xl font-display text-brand-text">₦{trip.totalCost?.toLocaleString()}</span>
                        <span className="text-xs text-brand-muted font-mono">{trip.distance !== 'N/A' ? trip.distance : 'Estimated Route'}</span>
                      </div>
                      <ChevronRight size={18} className="text-brand-muted group-hover:text-brand-text group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )
          )}

          {activeTab === 'financials' && (
            isLoading ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((skeleton) => (
                    <div key={skeleton} className="bg-brand-surface border border-black/5 rounded-3xl p-6 shadow-xs">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-3 w-24 bg-black/5 rounded-full animate-pulse" />
                        <div className="w-8 h-8 rounded-full bg-black/5 animate-pulse" />
                      </div>
                      <div className="h-8 w-32 bg-black/5 rounded-md animate-pulse mt-4" />
                      <div className="h-3 w-40 bg-black/5 rounded-md animate-pulse mt-2" />
                    </div>
                  ))}
                </div>
                <div className="bg-brand-surface border border-black/5 rounded-3xl p-6 md:p-8 shadow-sm justify-start">
                  <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((skeleton) => (
                      <div key={skeleton} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-brand-base border border-black/5 rounded-2xl gap-4">
                        <div className="flex flex-col gap-2 w-full">
                          <div className="h-4 w-32 bg-black/5 rounded-full animate-pulse" />
                          <div className="h-4 w-48 bg-black/5 rounded-md animate-pulse" />
                          <div className="h-3 w-64 bg-black/5 rounded-md animate-pulse" />
                        </div>
                        <div className="h-8 w-32 bg-black/5 rounded-xl animate-pulse shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
            <div className="flex flex-col gap-6">
              {/* Financial stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-brand-surface border border-black/5 rounded-3xl p-6 shadow-xs">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-brand-muted font-bold">Total Expenditure</span>
                    <div className="w-8 h-8 rounded-full bg-[#986D43]/10 text-[#986D43] flex items-center justify-center">
                      <CreditCard size={16} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-brand-text">
                    ₦{trips.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.totalCost || 0), 0).toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-green-700 font-medium mt-1">✓ Verified bookings payment</p>
                </div>

                <div className="bg-brand-surface border border-black/5 rounded-3xl p-6 shadow-xs">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-brand-muted font-bold">Completed Payments</span>
                    <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-700 flex items-center justify-center">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-brand-text">
                    {trips.filter(t => t.status === 'completed').length}
                  </h3>
                  <p className="text-[10px] text-brand-muted mt-1">Across all categories</p>
                </div>

                <div className="bg-brand-surface border border-black/5 rounded-3xl p-6 shadow-xs">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-brand-muted font-bold">Pending/En Route</span>
                    <div className="w-8 h-8 rounded-full bg-[#986D43]/15 text-[#986D43] flex items-center justify-center animate-pulse">
                      <Clock size={16} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-brand-text">
                    ₦{trips.filter(t => t.status !== 'completed' && t.status !== 'cancelled').reduce((sum, t) => sum + (t.totalCost || 0), 0).toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-brand-muted mt-1">Pending chauffeur handoff</p>
                </div>
              </div>

              {/* Verified Completed Payments details */}
              <div className="bg-brand-surface border border-black/5 rounded-3xl p-6 md:p-8 shadow-sm justify-start">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-display text-brand-text font-semibold">Payment History & Digital Receipts</h3>
                    <p className="text-xs text-brand-muted">Retrieve digital invoices of processed rides.</p>
                  </div>
                  <span className="text-[10px] uppercase font-mono bg-[#986D43]/10 border border-[#986D43]/20 font-semibold text-[#986D43] px-3 py-1 rounded-full">
                    Secured In-App
                  </span>
                </div>

                {trips.filter(t => t.status === 'completed').length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-5 h-5 text-brand-muted" />
                    </div>
                    <p className="text-xs text-brand-muted">No completed payments registered. Completed ride history receipts appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trips.filter(t => t.status === 'completed').map((trip) => (
                      <div 
                        key={trip.id} 
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-brand-base border border-black/5 hover:border-black/10 transition-colors rounded-2xl gap-4"
                      >
                        <div className="min-w-0 flex-grow">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-2xs font-bold uppercase tracking-wider bg-[#986D43]/10 text-[#986D43] px-2 py-0.5 rounded-full">
                              ₦{trip.totalCost?.toLocaleString()} Paid
                            </span>
                            <span className="text-[10px] text-brand-muted font-mono uppercase tracking-wider">
                              #{trip.id.substring(0,8).toUpperCase()} | {new Date(trip.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-brand-text leading-tight truncate">
                            {trip.category || 'Executive'} Ride Route:
                          </p>
                          <p className="text-[11px] text-brand-muted mt-1 truncate">
                            From: {trip.pickup} ➔ To: {trip.destination || 'Chauffeur Standby'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDownloadReceipt(trip)}
                          className="px-4 py-2 hover:bg-black hover:text-white border border-black/15 text-brand-text text-[10px] uppercase tracking-wider font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-end sm:self-auto cursor-pointer"
                        >
                          <Download size={13} /> Digital Receipt
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            )
          )}

          {activeTab === 'rentals' && (
            <div className="flex flex-col gap-6 w-full animate-fadeIn">
              {/* My Active Booked Rentals Section */}
              {(() => {
                if (isLoading) {
                  return (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-lg font-display text-[#191814] font-semibold flex items-center gap-2">
                        <div className="h-6 w-48 bg-black/5 rounded-md animate-pulse" />
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {[1, 2].map((skeleton) => (
                          <div key={skeleton} className="bg-brand-surface border-2 border-emerald-500/10 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
                            <div className="flex-1 min-w-0 space-y-3 w-full">
                              <div className="h-4 w-32 bg-black/5 rounded-full animate-pulse" />
                              <div className="h-6 w-48 bg-black/5 rounded-md animate-pulse" />
                              <div className="h-4 w-64 bg-black/5 rounded-md animate-pulse" />
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                              <div className="h-4 w-20 bg-black/5 rounded-md animate-pulse" />
                              <div className="h-8 w-24 bg-black/5 rounded-md animate-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                const userRentals = trips.filter(t => t.category?.toLowerCase().includes('standby'));
                if (userRentals.length === 0) return null;
                return (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-display text-[#191814] font-semibold flex items-center gap-2">
                      <Car size={18} className="text-[#986D43]" />
                      My Booked Vehicle Rentals ({userRentals.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {userRentals.map((rental) => {
                        const matchedChauffeur = drivers.find(d => d.id === rental.assignedDriverId);
                        return (
                          <div 
                            key={rental.id}
                            onClick={() => setSelectedTrip(rental)}
                            className="bg-brand-surface border-2 border-emerald-500/10 hover:border-emerald-500/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="bg-emerald-500/10 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                  {rental.status || 'Active'}
                                </span>
                                <span className="text-[10px] text-brand-muted font-mono uppercase">
                                  ID: #{rental.id.substring(0, 8)}
                                </span>
                                <span className="text-xs text-brand-muted">
                                  Booked for {new Date(rental.date).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="text-xl font-display text-brand-text font-bold leading-tight">
                                {rental.category?.replace('Standby (', '').replace(')', '') || 'Luxury Sedan Standby'}
                              </h4>
                              <div className="flex items-center gap-4 text-xs text-brand-muted flex-wrap">
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} /> Pickup: {rental.pickup || 'Chauffeur Standby Depot'}
                                </span>
                                {rental.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} /> Duration: {rental.duration}
                                  </span>
                                )}
                              </div>
                              
                              {matchedChauffeur ? (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/15 text-emerald-800 text-xs rounded-full font-semibold shadow-xs">
                                  <Users size={12} className="text-emerald-700 font-semibold" />
                                  <span>Assigned Chauffeur: {matchedChauffeur.name} ({matchedChauffeur.phone || 'No phone'})</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/5 border border-amber-500/10 text-amber-800 text-xs rounded-full font-medium">
                                  <Users size={12} className="text-amber-600" />
                                  <span>Awaiting Chauffeur Dispatch Allocation</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center self-stretch md:self-auto border-t md:border-t-0 border-black/5 pt-4 md:pt-0 gap-2 shrink-0">
                              <div className="text-left md:text-right">
                                <p className="text-xs text-brand-muted uppercase font-mono">Amount Paid</p>
                                <p className="text-xl font-display font-bold text-brand-text">₦{rental.totalCost?.toLocaleString()}</p>
                              </div>
                              <div className="text-brand-muted group-hover:text-brand-text group-hover:translate-x-1 transition-all flex items-center gap-1.5 text-xs font-semibold uppercase mt-1">
                                <span>Details</span>
                                <ChevronRight size={14} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="border-t border-black/10 pt-6">
                <h3 className="text-lg font-display text-brand-text font-semibold mb-4 flex items-center gap-2">
                  <Car size={18} className="text-brand-muted" />
                  Rent Another Luxury Vehicle (Available Fleet)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {/* 1. Lexus GX 460 */}
                   <div className="bg-brand-surface border border-black/5 p-4 md:p-6 flex flex-col group hover:border-black/10 transition-colors rounded-3xl">
                       <div className="w-full aspect-[4/3] relative overflow-hidden bg-black/5 mb-6 rounded-2xl">
                           <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-[1200ms]" style={{ backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkQD1ASO7djBpXEm-AeF_BSOCJiiAKRyKPYRna8YxliQ&s=10')` }}></div>
                       </div>
                       <div className="flex flex-col flex-1">
                           <h3 className="font-display text-xl mb-1 text-brand-text font-semibold">Lexus GX 460</h3>
                           <p className="font-sans text-brand-muted text-[13px] mb-6">Starting from ₦120,000 / day</p>
                           <button 
                               onClick={() => onBookCar?.('lexus-gx')}
                               className="mt-auto w-full py-3.5 flex items-center justify-center gap-2 rounded-xl bg-[#191814] text-[#FAF9F6] font-[#FAF9F6] font-medium text-sm hover:bg-black hover:scale-[1.01] active:scale-95 transition-all shadow-sm"
                           >
                               Book this car
                           </button>
                       </div>
                   </div>

                   {/* 2. Range Rover */}
                   <div className="bg-brand-surface border border-black/5 p-4 md:p-6 flex flex-col group hover:border-black/10 transition-colors rounded-3xl">
                       <div className="w-full aspect-[4/3] relative overflow-hidden bg-black/5 mb-6 rounded-2xl">
                           <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-[1200ms]" style={{ backgroundImage: `url(${luxurySuv})` }}></div>
                       </div>
                       <div className="flex flex-col flex-1">
                           <h3 className="font-display text-xl mb-1 text-brand-text font-semibold">Range Rover</h3>
                           <p className="font-sans text-brand-muted text-[13px] mb-6">Starting from ₦180,000 / day</p>
                           <button 
                               onClick={() => onBookCar?.('range-rover')}
                               className="mt-auto w-full py-3.5 flex items-center justify-center gap-2 rounded-xl bg-[#191814] text-[#FAF9F6] font-[#FAF9F6] font-medium text-sm hover:bg-black hover:scale-[1.01] active:scale-95 transition-all shadow-sm"
                           >
                               Book this car
                           </button>
                       </div>
                   </div>

                   {/* 3. Mercedes-Benz */}
                   <div className="bg-brand-surface border border-black/5 p-4 md:p-6 flex flex-col group hover:border-black/10 transition-colors rounded-3xl">
                       <div className="w-full aspect-[4/3] relative overflow-hidden bg-black/5 mb-6 rounded-2xl">
                           <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-[1200ms]" style={{ backgroundImage: `url(${luxurySedan})` }}></div>
                       </div>
                       <div className="flex flex-col flex-1">
                           <h3 className="font-display text-xl mb-1 text-brand-text font-semibold">Mercedes-Benz</h3>
                           <p className="font-sans text-brand-muted text-[13px] mb-6">Starting from ₦150,000 / day</p>
                           <button 
                               onClick={() => onBookCar?.('mercedes-benz')}
                               className="mt-auto w-full py-3.5 flex items-center justify-center gap-2 rounded-xl bg-[#191814] text-[#FAF9F6] font-[#FAF9F6] font-medium text-sm hover:bg-black hover:scale-[1.01] active:scale-95 transition-all shadow-sm"
                           >
                               Book this car
                           </button>
                       </div>
                   </div>

                   {/* 4. G-Wagon */}
                   <div className="bg-brand-surface border border-black/5 p-4 md:p-6 flex flex-col group hover:border-black/10 transition-colors rounded-3xl">
                       <div className="w-full aspect-[4/3] relative overflow-hidden bg-black/5 mb-6 rounded-2xl">
                           <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-[1200ms]" style={{ backgroundImage: `url(${yellowUrus})` }}></div>
                       </div>
                       <div className="flex flex-col flex-1">
                           <h3 className="font-display text-xl mb-1 text-brand-text font-semibold">G-Wagon</h3>
                           <p className="font-sans text-brand-muted text-[13px] mb-6">Starting from ₦250,000 / day</p>
                           <button 
                               onClick={() => onBookCar?.('g-wagon')}
                               className="mt-auto w-full py-3.5 flex items-center justify-center gap-2 rounded-xl bg-[#191814] text-[#FAF9F6] font-[#FAF9F6] font-medium text-sm hover:bg-black hover:scale-[1.01] active:scale-95 transition-all shadow-sm"
                           >
                               Book this car
                           </button>
                       </div>
                   </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Side Details Drawer with Map Route Integration */}
      <AnimatePresence>
        {selectedTrip && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrip(null)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Sliding Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] md:w-[560px] bg-brand-surface z-50 shadow-2xl border-l border-black/10 flex flex-col h-full overflow-hidden"
            >
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-black/5 flex justify-between items-center bg-brand-base">
                <div>
                  <h3 className="text-xl font-display font-semibold text-brand-text">Trip Details</h3>
                  <p className="text-xs text-brand-muted font-mono uppercase mt-1">ID: #{selectedTrip.id.substring(0, 8)}</p>
                </div>
                <button 
                  onClick={() => setSelectedTrip(null)}
                  className="w-10 h-10 rounded-full bg-black/5 border border-black/10 flex items-center justify-center hover:bg-black/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                
                {/* Route Visualizer Timeline Panel */}
                <div className="w-full rounded-2xl bg-brand-base p-6 border border-black/5 shadow-sm shrink-0 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-muted font-bold">
                    <Navigation className="w-4 h-4 text-brand-accent animate-pulse" />
                    <span>Route Track Timeline</span>
                  </div>
                  
                  <div className="relative pl-6 space-y-6 py-2">
                    {/* Visual Vertical line */}
                    <div className="absolute top-3 bottom-3 left-[9px] w-[2px] bg-black/10 rounded-full"></div>
                    
                    {/* Pickup Item */}
                    <div className="relative flex flex-col items-start">
                      <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-600/10 z-10 animate-pulse"></div>
                      <span className="text-[10px] text-brand-muted font-mono uppercase font-bold tracking-wider">Pickup Point</span>
                      <span className="text-sm font-semibold text-brand-text mt-0.5 text-left">{selectedTrip.pickup || 'Location standby'}</span>
                    </div>

                    {/* Destination Item */}
                    <div className="relative flex flex-col items-start">
                      <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#986D43] ring-4 ring-[#986D43]/10 z-10"></div>
                      <span className="text-[10px] text-brand-muted font-mono uppercase font-bold tracking-wider">Destination</span>
                      <span className="text-sm font-semibold text-brand-text mt-0.5 text-left">{selectedTrip.destination || 'Standby Chauffeur Service'}</span>
                    </div>
                  </div>
                </div>

                {/* Status Callout Banner */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm ${
                  selectedTrip.status === 'arriving' ? 'bg-brand-accent/5 border-brand-accent/20 text-[#191814]' :
                  selectedTrip.status === 'completed' ? 'bg-green-50 border-green-200 text-green-900' :
                  'bg-yellow-50 border-yellow-200 text-yellow-900'
                }`}>
                  <div className="flex gap-3 items-center">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      selectedTrip.status === 'arriving' ? 'bg-brand-accent' :
                      selectedTrip.status === 'completed' ? 'bg-green-600' :
                      'bg-yellow-500'
                    }`} />
                    <div>
                      <h4 className="text-xs uppercase tracking-widest font-mono text-brand-muted">Ride Status</h4>
                      <p className="text-sm font-semibold capitalize font-sans">{selectedTrip.status || 'pending'}</p>
                    </div>
                  </div>
                  {selectedTrip.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                </div>

                {/* Primary Info Sheet */}
                <div className="bg-brand-base border border-black/5 rounded-3xl p-6 flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-black/5">
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-wider text-brand-muted mb-1">Date Booked</h4>
                      <p className="text-sm font-semibold">{new Date(selectedTrip.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-wider text-brand-muted mb-1">Trip Category</h4>
                      <p className="text-sm font-semibold">{selectedTrip.category || 'Standard'}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-5 flex flex-col items-center mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-text"></div>
                      <div className="w-[1.5px] h-full bg-black/10 my-1"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[10px] font-mono uppercase tracking-wider text-brand-muted mb-1">Pickup Address</h4>
                      <p className="text-sm font-medium truncate text-brand-text">{selectedTrip.pickup || 'Not set'}</p>
                    </div>
                  </div>

                  {selectedTrip.destination && (
                    <div className="flex gap-4">
                      <div className="w-5 flex flex-col items-center mt-1">
                        <div className="w-2.5 h-2.5 rounded-full border border-brand-text bg-brand-surface"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-mono uppercase tracking-wider text-brand-muted mb-1">Destination Address</h4>
                        <p className="text-sm font-medium truncate text-brand-text">{selectedTrip.destination}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vehicle Specs Sheet */}
                {selectedTrip.vehicleClass && (
                  <div className="bg-brand-base border border-black/5 rounded-3xl p-6 flex flex-col gap-4">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-brand-muted pb-2 border-b border-black/5 font-semibold">Assigned Vehicle</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 bg-brand-surface rounded-2xl border border-black/5">
                        <p className="text-[9px] font-mono uppercase tracking-widest text-brand-muted mb-1">Brand</p>
                        <p className="text-xs font-semibold truncate">{selectedTrip.vehicleBrand || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-brand-surface rounded-2xl border border-black/5">
                        <p className="text-[9px] font-mono uppercase tracking-widest text-brand-muted mb-1">Class</p>
                        <p className="text-xs font-semibold truncate">{selectedTrip.vehicleClass || 'Sedan'}</p>
                      </div>
                      <div className="p-3 bg-brand-surface rounded-2xl border border-black/5">
                        <p className="text-[9px] font-mono uppercase tracking-widest text-brand-muted mb-1">Trans</p>
                        <p className="text-xs font-semibold truncate">{selectedTrip.transmission || 'Automatic'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned Chauffeur Details Sheet */}
                {(() => {
                  const assignedDriver = drivers.find(d => d.id === selectedTrip.assignedDriverId);
                  if (!assignedDriver) return null;
                  return (
                    <div className="bg-brand-base border border-black/5 rounded-3xl p-6 flex flex-col gap-4 shadow-xs">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-brand-muted pb-2 border-b border-black/5 font-semibold flex items-center justify-between">
                        <span>Assigned Chauffeur</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full capitalize font-semibold">{assignedDriver.status || 'Active'}</span>
                      </h4>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#191814] text-[#FAF9F6] flex items-center justify-center font-bold text-lg border border-black/5 shrink-0 shadow-sm">
                          {assignedDriver.name ? assignedDriver.name.split(' ').map((n) => n[0]).join('') : 'D'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#191814] truncate leading-snug">{assignedDriver.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Star size={13} className="text-amber-500 fill-amber-500 shrink-0" />
                            <span className="text-xs font-medium text-brand-muted">Professional Chauffeur Service Team</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-1 text-xs border-t border-black/[0.04] pt-3">
                        {assignedDriver.phone ? (
                          <a href={`tel:${assignedDriver.phone}`} className="flex items-center gap-2 p-2 bg-brand-surface border border-black/5 hover:border-black/10 rounded-xl text-[#191814] font-semibold transition-all">
                            <Phone size={13} className="text-brand-muted shrink-0" />
                            <span className="truncate">{assignedDriver.phone}</span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 p-2 bg-brand-surface border border-black/5 rounded-xl text-brand-muted">
                            <Phone size={13} className="shrink-0" />
                            <span>No phone</span>
                          </div>
                        )}
                        {assignedDriver.email ? (
                          <a href={`mailto:${assignedDriver.email}`} className="flex items-center gap-2 p-2 bg-brand-surface border border-black/5 hover:border-black/10 rounded-xl text-[#191814] font-semibold transition-all">
                            <Mail size={13} className="text-brand-muted shrink-0" />
                            <span className="truncate text-left">{assignedDriver.email}</span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 p-2 bg-brand-surface border border-black/5 rounded-xl text-brand-muted">
                            <Mail size={13} className="shrink-0" />
                            <span>No email</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Payment summary card */}
                <div className="border border-[#191814]/10 bg-[#191814] text-white rounded-3xl p-6 shadow-xl flex flex-col gap-4 mt-auto select-none">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#ceaf8d]">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider font-mono text-white/50">Receipt Verified</p>
                        <p className="text-sm font-semibold">Payment via Card</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-wider font-mono text-white/50">Amount Paid</p>
                      <p className="text-2xl font-display font-semibold text-[#ceaf8d]">₦{selectedTrip.totalCost?.toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedTrip.status === 'completed' && (
                    <button 
                      onClick={() => handleDownloadReceipt(selectedTrip)}
                      className="w-full py-3 bg-[#ceaf8d] text-[#191814] hover:bg-[#bda181] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} /> Download Digital Receipt
                    </button>
                  )}
                </div>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
