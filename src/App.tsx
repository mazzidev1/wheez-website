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
import { AppState, RideParams, ContentPageId, CarDetail } from './types';

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

export default function App() {
  const [view, setView] = useState<AppState>('landing');
  const [rideParams, setRideParams] = useState<RideParams | undefined>();
  const [contentPageId, setContentPageId] = useState<ContentPageId>('company-about');
  const [selectedCar, setSelectedCar] = useState<CarDetail | undefined>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && view === 'landing') {
        setView('dashboard');
      }
    });
    return () => unsubscribe();
  }, [view]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setView('dashboard');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('landing');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleStartRide = (params: RideParams) => {
    setRideParams(params);
    setView('customer');
  };

  const navigateToPage = (pageId: ContentPageId) => {
    setContentPageId(pageId);
    setView('content');
  };

  const handleBookCar = (carId: string) => {
    const car = CAR_FLEET_DATA[carId];
    if (car) {
      setSelectedCar(car);
      setView('luxury-book');
    }
  };

  return (
    <div className="min-h-screen bg-brand-base text-brand-text font-sans selection:bg-brand-accent selection:text-white bg-grain flex flex-col">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col">
            <Landing setView={setView} onStartRide={handleStartRide} navigateToPage={navigateToPage} onBookCar={handleBookCar} onLogin={handleLogin} />
          </motion.div>
        )}
        {view === 'customer' && (
          <motion.div key="customer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col">
            <CustomerFlow setView={setView} initialParams={rideParams} />
          </motion.div>
        )}
        {view === 'driver' && (
          <motion.div key="driver" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col">
            <DriverFlow setView={setView} />
          </motion.div>
        )}
        {view === 'content' && (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col">
            <ContentPage setView={setView} pageId={contentPageId} />
          </motion.div>
        )}
        {view === 'luxury-book' && selectedCar && (
          <motion.div key="luxury-book" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col">
            <LuxuryBookFlow setView={setView} selectedCar={selectedCar} />
          </motion.div>
        )}
        {view === 'dashboard' && user && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col">
            <UserDashboard user={user} onLogout={handleLogout} onBack={() => setView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
