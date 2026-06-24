import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from './lib/firebase';
import { User } from 'firebase/auth';
import Landing from './components/Landing';
import CustomerFlow from './components/CustomerFlow';
import DriverFlow from './components/DriverFlow';
import ContentPage from './components/ContentPage';
import LuxuryBookFlow from './components/LuxuryBookFlow';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import NotificationProvider from './components/NotificationProvider';
import { AppState, RideParams, ContentPageId, CarDetail } from './types';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';

import luxurySuv from './assets/images/luxury_suv_1782136584014.jpg';
import luxurySedan from './assets/images/luxury_sedan_1782136599120.jpg';
import luxuryVan from './assets/images/luxury_van_1782136613155.jpg';
import yellowUrus from './assets/images/yellow_urus_1782141995181.jpg';

const CAR_FLEET_DATA: Record<string, CarDetail> = {
  'lexus-gx': {
    id: 'lexus-gx',
    name: 'Lexus GX 460',
    pricePerDay: 120000,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkQD1ASO7djBpXEm-AeF_BSOCJiiAKRyKPYRna8YxliQ&s=10',
    specs: {
      passengers: 7,
      luggage: 4,
      transmission: 'Automatic 4WD',
      fuelType: 'Full tank included',
      comfort: ['Leather Captain Chairs', 'Triple-Zone Air Conditioning', 'Integrated Cooler box', 'Mark Levinson Surround Sound']
    }
  },
  'range-rover': {
    id: 'range-rover',
    name: 'Range Rover HSE',
    pricePerDay: 180000,
    image: luxurySuv,
    specs: {
      passengers: 5,
      luggage: 3,
      transmission: 'Air Suspension 4WD',
      fuelType: 'Full tank included',
      comfort: ['Panoramic Sunroof', 'Heated & Cooled Seats', 'Discreet Privacy Glass', 'Active Noise Cancellation']
    }
  },
  'mercedes-benz': {
    id: 'mercedes-benz',
    name: 'Mercedes-Benz S-Class',
    pricePerDay: 150000,
    image: luxurySedan,
    specs: {
      passengers: 4,
      luggage: 3,
      transmission: 'Comfort-Matic AWD',
      fuelType: 'Full tank included',
      comfort: ['Alcantara Pillows', 'Rear Seat Entertainment', 'Soft Close Doors', 'Ambient Cabin Aromatherapy']
    }
  },
  'g-wagon': {
    id: 'g-wagon',
    name: 'Mercedes-Benz G-Wagon',
    pricePerDay: 250000,
    image: yellowUrus,
    specs: {
      passengers: 5,
      luggage: 4,
      transmission: 'Triple Lock 4x4',
      fuelType: 'Full tank included',
      comfort: ['V8 Twin-Turbo Acoustics', 'Thermotronic Temp Control', 'Dynamic side bolsters', 'Satin gold luxury details']
    }
  },
  'luxury-van': {
    id: 'luxury-van',
    name: 'Luxury Jet Van',
    pricePerDay: 160000,
    image: luxuryVan,
    specs: {
      passengers: 9,
      luggage: 8,
      transmission: 'Extended Comfort Wheelbase',
      fuelType: 'Full tank included',
      comfort: ['Full Reclining Chauffeur Berths', 'Built-in workspace/LED Screen', 'Complimentary High-speed Wi-Fi', 'Premium espresso station']
    }
  },
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [rideParams, setRideParams] = useState<RideParams | undefined>();
  const [contentPageId, setContentPageId] = useState<ContentPageId>('company-about');
  const [selectedCar, setSelectedCar] = useState<CarDetail | undefined>();
  const [user, setUser] = useState<User | null>(null);

  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && !initialCheckDone && location.pathname === '/') {
        navigate('/dashboard');
      }
      setInitialCheckDone(true);
    });
    return () => unsubscribe();
  }, [navigate, location.pathname, initialCheckDone]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleStartRide = (params: RideParams) => {
    setRideParams(params);
    navigate('/customer');
  };

  const navigateToPage = (pageId: ContentPageId) => {
    setContentPageId(pageId);
    navigate('/content');
  };

  const handleBookCar = (carId: string) => {
    const car = CAR_FLEET_DATA[carId];
    if (car) {
      setSelectedCar(car);
      navigate('/luxury-book');
    }
  };

  const setViewProxy = (view: AppState) => {
    if (view === 'landing') navigate('/');
    else navigate(`/${view}`);
  };

  return (
    <div className="min-h-screen bg-brand-base text-brand-text font-sans selection:bg-brand-accent selection:text-white bg-grain flex flex-col">
      <NotificationProvider user={user} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col">
              <Landing setView={setViewProxy} onStartRide={handleStartRide} navigateToPage={navigateToPage} onBookCar={handleBookCar} onLogin={handleLogin} user={user} onAdmin={() => navigate('/admin')} />
            </motion.div>
          } />
          <Route path="/customer" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col">
              <CustomerFlow setView={setViewProxy} initialParams={rideParams} user={user} />
            </motion.div>
          } />
          <Route path="/driver" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col">
              <DriverFlow setView={setViewProxy} />
            </motion.div>
          } />
          <Route path="/content" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col">
              <ContentPage setView={setViewProxy} pageId={contentPageId} />
            </motion.div>
          } />
          <Route path="/luxury-book" element={
            selectedCar ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col">
                <LuxuryBookFlow setView={setViewProxy} selectedCar={selectedCar} />
              </motion.div>
            ) : <Navigate to="/" replace />
          } />
          <Route path="/dashboard" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col">
              <UserDashboard user={user} onLogout={handleLogout} onBack={() => navigate('/')} onAdmin={() => navigate('/admin')} onBookCar={handleBookCar} onFindDriver={() => navigate('/customer')} />
            </motion.div>
          } />
          <Route path="/admin" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col">
              <AdminDashboard onBack={() => navigate(user ? '/dashboard' : '/')} />
            </motion.div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {/* WhatsApp Floating Concierge Support */}
      <a 
        href="https://wa.me/2348031234567" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 right-6 z-[9999] bg-[#25D366] text-white p-3.5 sm:p-4 rounded-full shadow-2.5xl hover:scale-110 active:scale-95 hover:bg-[#128C7E] transition-all duration-300 flex items-center justify-center group border border-white/10"
        aria-label="Direct 24/7 Premium Concierge Chat"
        title="Concierge Premium Chauffeur Standby"
      >
        <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.023-5.102-2.884-6.964-1.859-1.861-4.329-2.885-6.961-2.886-5.443 0-9.863 4.42-9.866 9.865-.001 1.761.46 3.477 1.336 4.981L1.13 21.053l4.896-1.284-.621-.611zm12.185-5.21c-.33-.165-1.951-.963-2.251-1.072-.3-.109-.518-.165-.736.165-.218.329-.842 1.072-1.032 1.29-.19.218-.38.243-.71.078-1.04-.518-1.778-.756-2.486-1.372-.647-.562-1.127-1.242-1.336-1.571-.21-.329-.022-.507.143-.671.149-.148.33-.385.495-.578.165-.192.22-.329.33-.548.11-.219.055-.411-.027-.575-.083-.165-.736-1.771-.1-2.25-.295-.33-.615-.278-.842-.278-.206-.01-.444-.01-.682-.01-.239 0-.627.09-1.35.438-.329.158-.871.424-1.233.784-.183.182-1.185 1.157-1.185 2.821 0 1.664 1.213 3.27 1.378 3.49.165.218 2.388 3.647 5.786 5.115.808.35 1.439.559 1.932.716.811.258 1.551.222 2.136.136.651-.096 1.951-.798 2.227-1.57.275-.773.275-1.437.193-1.57-.083-.133-.3-.218-.63-.383z"/>
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2.5 transition-all duration-300 ease-out text-xs font-semibold tracking-wider whitespace-nowrap uppercase font-sans">
          Concierge Contact
        </span>
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
