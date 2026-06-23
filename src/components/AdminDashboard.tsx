import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Car, DollarSign, Image as ImageIcon, MapPin, 
  Users, Settings, Trash2, Check, RefreshCw, AlertCircle, Save, Plus, Star, Phone, Mail, Edit2, X
} from 'lucide-react';
import { collection, query, getDocs, orderBy, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import Logo from './Logo';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'payments' | 'services' | 'fleet' | 'drivers'>('bookings');
  const [bookingsFilter, setBookingsFilter] = useState<'all' | 'rides' | 'rentals'>('all');
  const [trips, setTrips] = useState<any[]>([]);
  const [fleetData, setFleetData] = useState<any[]>([]);
  const [driversData, setDriversData] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Editing and Creation States for full CRUD
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [editingDriver, setEditingDriver] = useState<any | null>(null);
  const [editingTrip, setEditingTrip] = useState<any | null>(null);
  const [isAddingTrip, setIsAddingTrip] = useState(false);

  // Service Configuration State
  const [platformStatus, setPlatformStatus] = useState("All systems operating normally. Average wait 4 mins.");
  const [supportEmail, setSupportEmail] = useState("support@wheez.com");
  const [termsUrl, setTermsUrl] = useState("https://wheez.com/terms");

  // Form states for new records
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    price: 120000,
    plateNumber: '',
    category: 'SUV',
    status: 'available'
  });

  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    rating: 4.9,
    vehicleId: ''
  });

  const [newTrip, setNewTrip] = useState({
    userId: 'manual_admin',
    date: new Date().toISOString(),
    pickup: '',
    destination: '',
    distance: '15 km',
    duration: '0.8 Hrs',
    totalCost: 150000,
    category: 'SUV',
    status: 'pending',
    assignedDriverId: ''
  });

  async function fetchTrips() {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'trips'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedTrips: any[] = [];
      querySnapshot.forEach((doc) => {
        fetchedTrips.push({ id: doc.id, ...doc.data() });
      });
      setTrips(fetchedTrips);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'trips');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchFleet() {
    try {
      const q = collection(db, 'fleet');
      const snapshot = await getDocs(q);
      let fetched: any[] = [];
      snapshot.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() });
      });

      // If empty, seed live with defaults
      if (fetched.length === 0) {
        const seedCars = [
          { name: 'Lexus GX 460', price: 120000, plateNumber: 'LAG-GX-460', category: 'SUV', status: 'available' },
          { name: 'Range Rover', price: 180000, plateNumber: 'LAG-RR-108', category: 'Luxury', status: 'available' },
          { name: 'Mercedes-Benz', price: 150000, plateNumber: 'LAG-MB-350', category: 'Sedan', status: 'available' },
          { name: 'G-Wagon', price: 250000, plateNumber: 'LAG-GW-63', category: 'Luxury', status: 'available' }
        ];
        const seedPromises = seedCars.map(async (car) => {
          const docRef = await addDoc(collection(db, 'fleet'), car);
          return { id: docRef.id, ...car };
        });
        fetched = await Promise.all(seedPromises);
        console.log("Fleet seeded on Firestore!");
      }
      setFleetData(fetched);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'fleet');
    }
  }

  async function fetchDrivers() {
    try {
      const q = collection(db, 'drivers');
      const snapshot = await getDocs(q);
      let fetched: any[] = [];
      snapshot.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() });
      });

      // If empty, seed live with defaults
      if (fetched.length === 0) {
        const seedDrivers = [
          { name: 'Emeka Okafor', email: 'emeka@wheez.com', phone: '+234 803 111 2222', status: 'active', rating: 4.9, vehicleId: '' },
          { name: 'Babajide Balogun', email: 'jide@wheez.com', phone: '+234 812 333 4444', status: 'active', rating: 4.8, vehicleId: '' },
          { name: 'Chinedu Okeke', email: 'chinedu@wheez.com', phone: '+234 905 555 6666', status: 'inactive', rating: 4.7, vehicleId: '' }
        ];
        const seedPromises = seedDrivers.map(async (driver) => {
          const docRef = await addDoc(collection(db, 'drivers'), driver);
          return { id: docRef.id, ...driver };
        });
        fetched = await Promise.all(seedPromises);
        console.log("Drivers seeded on Firestore!");
      }
      setDriversData(fetched);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'drivers');
    }
  }

  useEffect(() => {
    fetchTrips();
    fetchFleet();
    fetchDrivers();
  }, [activeTab]);

  const handleUpdateStatus = async (tripId: string, event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = event.target.value;
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, { status: nextStatus });
      setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: nextStatus } : t));
      triggerFeedback('Trip status updated to: ' + nextStatus);
    } catch (err) {
      console.error("Failed to update status in Firestore:", err);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm("Are you sure you want to delete this trip booking from Firestore?")) return;
    try {
      await deleteDoc(doc(db, 'trips', tripId));
      setTrips(prev => prev.filter(t => t.id !== tripId));
      triggerFeedback('Trip booking removed successfully!');
    } catch (err) {
      console.error("Failed to delete trip:", err);
    }
  };

  const saveServices = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      triggerFeedback('Service configuration saved successfully!');
    }, 800);
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.plateNumber) {
      alert("Please enter a valid vehicle name and plate number!");
      return;
    }
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'fleet'), newVehicle);
      setFleetData(prev => [...prev, { id: docRef.id, ...newVehicle }]);
      setNewVehicle({ name: '', price: 120000, plateNumber: '', category: 'SUV', status: 'available' });
      triggerFeedback('Added vehicle to live fleet!');
    } catch (err) {
      console.error("Error adding vehicle:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm("Remove this vehicle from fleet?")) return;
    try {
      await deleteDoc(doc(db, 'fleet', id));
      setFleetData(prev => prev.filter(c => c.id !== id));
      triggerFeedback('Vehicle removed from fleet database.');
    } catch (err) {
      console.error("Error deleting vehicle:", err);
    }
  };

  const handleUpdateVehicleField = async (id: string, field: string, value: any) => {
    try {
      await updateDoc(doc(db, 'fleet', id), { [field]: value });
      setFleetData(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
      triggerFeedback('Updated vehicle attributes!');
    } catch (err) {
      console.error("Error updating vehicle:", err);
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.email || !newDriver.phone) {
      alert("Please fill out all required driver profile details!");
      return;
    }
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'drivers'), newDriver);
      setDriversData(prev => [...prev, { id: docRef.id, ...newDriver }]);
      setNewDriver({ name: '', email: '', phone: '', status: 'active', rating: 4.9, vehicleId: '' });
      triggerFeedback('Onboarded professional driver!');
    } catch (err) {
      console.error("Error adding driver:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!window.confirm("Archive this driver's profile?")) return;
    try {
      await deleteDoc(doc(db, 'drivers', id));
      setDriversData(prev => prev.filter(d => d.id !== id));
      triggerFeedback('Driver profile archived.');
    } catch (err) {
      console.error("Error deleting driver:", err);
    }
  };

  const handleUpdateDriverField = async (id: string, field: string, value: any) => {
    try {
      await updateDoc(doc(db, 'drivers', id), { [field]: value });
      setDriversData(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
      triggerFeedback('Updated driver profile!');
    } catch (err) {
      console.error("Error updating driver:", err);
    }
  };

  const handleSaveVehicleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle || !editingVehicle.name || !editingVehicle.plateNumber) {
      alert("Please ensure the vehicle name and plate number are filled out!");
      return;
    }
    setIsSaving(true);
    try {
      const { id, ...vehicleFields } = editingVehicle;
      await updateDoc(doc(db, 'fleet', id), vehicleFields);
      setFleetData(prev => prev.map(c => c.id === id ? { ...c, ...vehicleFields } : c));
      setEditingVehicle(null);
      triggerFeedback('Vehicle updated successfully!');
    } catch (err) {
      console.error("Error updating vehicle in db:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDriverEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver || !editingDriver.name || !editingDriver.email || !editingDriver.phone) {
      alert("Please fill out all required fields!");
      return;
    }
    setIsSaving(true);
    try {
      const { id, ...driverFields } = editingDriver;
      await updateDoc(doc(db, 'drivers', id), driverFields);
      setDriversData(prev => prev.map(d => d.id === id ? { ...d, ...driverFields } : d));
      setEditingDriver(null);
      triggerFeedback('Driver updated successfully!');
    } catch (err) {
      console.error("Error updating driver in db:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTripEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip || !editingTrip.pickup || !editingTrip.totalCost) {
      alert("Please check that the pickup address and total fare are provided!");
      return;
    }
    setIsSaving(true);
    try {
      const { id, ...tripFields } = editingTrip;
      await updateDoc(doc(db, 'trips', id), tripFields);
      setTrips(prev => prev.map(t => t.id === id ? { ...t, ...tripFields } : t));
      setEditingTrip(null);
      triggerFeedback('Booking updated successfully!');
    } catch (err) {
      console.error("Error updating booking in db:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrip.pickup || !newTrip.totalCost) {
      alert("Please specify a valid pickup address and fare!");
      return;
    }
    setIsSaving(true);
    try {
      const parsedTrip = {
        ...newTrip,
        date: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'trips'), parsedTrip);
      setTrips(prev => [{ id: docRef.id, ...parsedTrip }, ...prev]);
      setIsAddingTrip(false);
      setNewTrip({
        userId: 'manual_admin',
        date: new Date().toISOString(),
        pickup: '',
        destination: '',
        distance: '15 km',
        duration: '0.8 Hrs',
        totalCost: 150000,
        category: 'SUV',
        status: 'pending',
        assignedDriverId: ''
      });
      triggerFeedback('Manual booking added to database!');
    } catch (err) {
      console.error("Error creating manual trip in db:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerFeedback = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Compute stats metrics dynamically
  const totalRevenue = trips.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);

  return (
    <div className="min-h-screen bg-brand-base flex flex-col font-sans relative">
      <nav className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center border-b border-black/5">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full transition-colors group">
            <ArrowLeft className="w-5 h-5 text-brand-text group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity" onClick={onBack}>
            <Logo size={20} className="text-brand-text" />
            <span className="text-xl font-display font-medium tracking-tight mt-1">Admin Panel</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-green-500/10 text-green-700 px-3 py-1 rounded-full border border-green-500/20 font-bold uppercase tracking-wider">Database Connected</span>
        </div>
      </nav>

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'bookings' ? 'bg-[#191814] text-white shadow-md' : 'hover:bg-black/5 text-brand-text'}`}
          >
            <MapPin size={18} />
            <span className="font-medium text-sm">Bookings & Trips</span>
          </button>
          <button 
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'drivers' ? 'bg-[#191814] text-white shadow-md' : 'hover:bg-black/5 text-brand-text'}`}
          >
            <Users size={18} />
            <span className="font-medium text-sm">Driver Management</span>
          </button>
          <button 
            onClick={() => setActiveTab('fleet')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'fleet' ? 'bg-[#191814] text-white shadow-md' : 'hover:bg-black/5 text-brand-text'}`}
          >
            <Car size={18} />
            <span className="font-medium text-sm">Fleet Setup & Pricing</span>
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'payments' ? 'bg-[#191814] text-white shadow-md' : 'hover:bg-black/5 text-brand-text'}`}
          >
            <DollarSign size={18} />
            <span className="font-medium text-sm">Payments & Revenue</span>
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'services' ? 'bg-[#191814] text-white shadow-md' : 'hover:bg-black/5 text-brand-text'}`}
          >
            <Settings size={18} />
            <span className="font-medium text-sm">Service Config</span>
          </button>
        </aside>

        {/* Dynamic Action Notifications */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed bottom-6 right-6 bg-[#191814] text-[#FAF9F6] px-5 py-4 border border-white/10 rounded-2xl z-50 flex items-center gap-3 shadow-2xl"
            >
              <div className="w-5 h-5 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent">
                <Check size={12} />
              </div>
              <span className="text-xs font-semibold">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Panel Area */}
        <main className="flex-1 bg-brand-surface rounded-3xl border border-black/5 p-6 md:p-10 shadow-sm min-h-[600px] flex flex-col justify-start">
           
           {/* BOOKINGS TAB */}
           {activeTab === 'bookings' && (
             <div className="flex flex-col gap-6 w-full">
                <div className="flex justify-between items-center pb-4 border-b border-black/5 w-full">
                  <div>
                    <h2 className="text-2xl font-display text-brand-text">Active Bookings DB</h2>
                    <p className="text-xs text-brand-muted mt-1 leading-relaxed">Direct view of active customer documents stored inside Firestore database.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsAddingTrip(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#191814] text-white hover:bg-black text-xs font-semibold rounded-xl transition-all shadow-sm"
                    >
                      <Plus size={14} /> Add Manual Booking
                    </button>
                    <button 
                      onClick={fetchTrips}
                      className="p-2.5 bg-black/5 hover:bg-black/10 rounded-full text-brand-muted hover:text-brand-text transition-all self-center"
                      title="Refresh from Database"
                    >
                      <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                    </button>
                  </div>
                </div>

                {/* Bookings Sub-Tabs Filter Bar */}
                <div className="flex border-b border-black/5 gap-6 text-xs font-semibold uppercase tracking-wider pb-1 mt-2">
                  <button 
                    onClick={() => setBookingsFilter('all')}
                    className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer ${bookingsFilter === 'all' ? 'border-[#191814] text-[#191814] font-bold' : 'border-transparent text-brand-muted hover:text-[#191814]'}`}
                  >
                    All Bookings ({trips.length})
                  </button>
                  <button 
                    onClick={() => setBookingsFilter('rides')}
                    className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer ${bookingsFilter === 'rides' ? 'border-[#191814] text-[#191814] font-bold' : 'border-transparent text-brand-muted hover:text-[#191814]'}`}
                  >
                    Standard Rides ({trips.filter(t => !t.category?.toLowerCase().includes('standby')).length})
                  </button>
                  <button 
                    onClick={() => setBookingsFilter('rentals')}
                    className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer ${bookingsFilter === 'rentals' ? 'border-emerald-500 text-emerald-800 font-bold' : 'border-transparent text-brand-muted hover:text-[#191814]'}`}
                  >
                    Luxury Rentals ({trips.filter(t => t.category?.toLowerCase().includes('standby')).length})
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-brand-text border-t-transparent animate-spin mb-4" />
                    <p className="text-sm text-brand-muted">Fetching real-time bookings...</p>
                  </div>
                ) : trips.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-brand-muted">
                    <AlertCircle className="w-10 h-10 text-brand-muted/40 mb-3" />
                     <p className="font-semibold text-sm">No Database Records Found</p>
                     <p className="text-xs max-w-xs mt-1 leading-relaxed">Book a ride from the user landing/booking workspace, and they will populate instantly here.</p>
                  </div>
                ) : (() => {
                  const filteredTrips = trips.filter(trip => {
                    if (bookingsFilter === 'rides') return !trip.category?.toLowerCase().includes('standby');
                    if (bookingsFilter === 'rentals') return trip.category?.toLowerCase().includes('standby');
                    return true;
                  });

                  if (filteredTrips.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 text-center text-brand-muted bg-brand-base border border-dashed border-black/10 rounded-2xl">
                        <AlertCircle className="w-8 h-8 text-brand-muted/40 mb-2" />
                        <p className="font-semibold text-sm">No bookings match this filter</p>
                        <p className="text-xs mt-1">Try selecting another filter above.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-4">
                      {filteredTrips.map(trip => {
                        const assignedDriver = driversData.find(d => d.id === trip.assignedDriverId);
                        const isLuxuryRental = trip.category?.toLowerCase().includes('standby');
                        return (
                          <div 
                            key={trip.id} 
                            className={`border rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-base transition-all hover:shadow-sm ${
                              isLuxuryRental 
                                ? 'border-emerald-500/10 hover:border-emerald-500/20 shadow-xs' 
                                : 'border-black/5 hover:border-black/10'
                            }`}
                          >
                            
                            {/* Primary info block */}
                            <div className="space-y-2 flex-grow min-w-0 w-full md:w-auto">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs font-mono text-brand-muted truncate">#{trip.id.substring(0, 10)}</span>
                                {isLuxuryRental ? (
                                  <span className="bg-emerald-500/10 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    LUXURY RENTAL Standby
                                  </span>
                                ) : (
                                  <span className="bg-black/5 text-[10px] font-mono uppercase tracking-widest text-brand-text px-2.5 py-0.5 rounded-full">
                                    {trip.category || 'Ride'}
                                  </span>
                                )}
                                <span className="text-xs text-brand-muted">{new Date(trip.date).toLocaleDateString()}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-brand-text">
                                <MapPin size={14} className="text-brand-muted" />
                                <span className="truncate"><b>Pickup:</b> {trip.pickup || 'N/A'}</span>
                              </div>
                              {trip.destination && (
                                <div className="flex items-center gap-2 text-xs text-brand-muted pl-1">
                                  <span>→ <b>Dropoff:</b> {trip.destination}</span>
                                </div>
                              )}
                              
                              {/* Rented Luxury Client Detail Row */}
                              {trip.clientName && (
                                <div className="text-xs bg-black/[0.02] border border-black/5 rounded-xl p-3 mt-2 space-y-1.5 max-w-lg">
                                  <div className="font-semibold text-[#191814] flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Chauffeur Lease Client Contact Details:
                                  </div>
                                  <p className="text-brand-text">🧑 <b>Name:</b> {trip.clientName} | 📞 <b>Phone:</b> {trip.clientPhone || 'N/A'}</p>
                                  {trip.notes && <p className="text-brand-muted italic font-sans">📝 "Notes: {trip.notes}"</p>}
                                </div>
                              )}

                              <div className="text-xs text-brand-muted mt-1 uppercase font-mono tracking-wider pl-1">
                                👤 User ID: {trip.userId?.substring(0, 8)}...
                              </div>
                              {assignedDriver && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-750 text-xs rounded-full mt-1.5 font-semibold">
                                  <Users size={12} className="text-green-700" />
                                  <span>Driver: {assignedDriver.name}</span>
                                </div>
                              )}
                            </div>

                          {/* Dropdown status flow and price card */}
                          <div className="flex flex-col items-end gap-3 self-stretch md:self-auto border-t md:border-t-0 border-black/5 pt-4 md:pt-0 justify-between">
                            <div className="text-right">
                              <div className="text-lg font-display text-brand-text">₦{trip.totalCost?.toLocaleString()}</div>
                              <div className="text-[10px] font-mono text-brand-muted mt-1 uppercase tracking-widest">{trip.duration || 'Flexible'}</div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                              <div className="flex flex-col gap-1 items-end">
                                <span className="text-[9px] uppercase font-mono tracking-wider text-brand-muted">Assign Driver</span>
                                <select 
                                  value={trip.assignedDriverId || ''} 
                                  onChange={async (e) => {
                                    const drvId = e.target.value;
                                    try {
                                      await updateDoc(doc(db, 'trips', trip.id), { assignedDriverId: drvId, status: drvId ? 'arriving' : 'pending' });
                                      setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, assignedDriverId: drvId, status: drvId ? 'arriving' : 'pending' } : t));
                                      triggerFeedback('Driver assignment registered!');
                                    } catch (err) {
                                      console.error("Assign driver error:", err);
                                    }
                                  }}
                                  className="bg-brand-surface border border-black/10 text-xs font-semibold rounded-xl px-2 py-1.5 focus:border-brand-accent focus:outline-none w-36"
                                >
                                  <option value="">No Driver</option>
                                  {driversData.filter(d => d.status === 'active').map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex flex-col gap-1 items-end">
                                <span className="text-[9px] uppercase font-mono tracking-wider text-brand-muted font-bold">Status</span>
                                <select 
                                  value={trip.status || 'pending'} 
                                  onChange={(e) => handleUpdateStatus(trip.id, e)}
                                  className="bg-brand-surface border border-black/10 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:border-brand-accent focus:outline-none transition-colors"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="assigned">Driver Assigned</option>
                                  <option value="arriving">Driver Arrived/Arriving</option>
                                  <option value="in_progress">Trip in Progress</option>
                                  <option value="completed">Trip Completed</option>
                                </select>
                              </div>
                              
                              <button 
                                onClick={() => setEditingTrip(trip)} 
                                className="text-brand-muted hover:text-brand-text p-2 rounded-lg hover:bg-black/5 transition-all shrink-0 mt-3"
                                title="Edit Booking detailed fields"
                              >
                                <Edit2 size={14} />
                              </button>

                              <button 
                                onClick={() => handleDeleteTrip(trip.id)} 
                                className="text-brand-muted hover:text-red-600 p-2 rounded-lg hover:bg-black/5 transition-all shrink-0 mt-3"
                                title="Delete Booking document"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                      })}
                    </div>
                  );
                })()}
             </div>
           )}

           {/* PAYMENTS TAB */}
           {activeTab === 'payments' && (
             <div className="flex flex-col gap-6 w-full">
                  <div>
                    <h2 className="text-2xl font-display text-brand-text">Payments & Revenue</h2>
                    <p className="text-xs text-brand-muted mt-1">Simulated processing ledger built in accordance with active Firestore bookings.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="bg-brand-base border border-black/5 rounded-2xl p-6 shadow-sm">
                      <p className="text-xs font-mono text-brand-muted uppercase tracking-widest mb-2">Total System Volume</p>
                      <p className="text-3xl font-display text-brand-text">₦{totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-brand-base border border-black/5 rounded-2xl p-6 shadow-sm">
                      <p className="text-xs font-mono text-brand-muted uppercase tracking-widest mb-2">Paid Transactions</p>
                      <p className="text-3xl font-display text-brand-text">{trips.length}</p>
                    </div>
                    <div className="bg-brand-base border border-black/5 rounded-2xl p-6 shadow-sm bg-[#191814] text-[#FAF9F6]">
                      <p className="text-xs font-mono text-white/50 uppercase tracking-widest mb-2">Pending Payouts</p>
                      <p className="text-3xl font-display text-[#ceaf8d]">₦{(totalRevenue * 0.15).toLocaleString()}</p>
                      <button 
                        onClick={() => triggerFeedback('All payouts processed for system drivers! ✨')}
                        className="mt-4 px-4 py-2 border border-white/20 rounded-lg text-xs hover:bg-white/10 transition-colors w-full font-semibold uppercase tracking-wider"
                      >
                        Process Payouts
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-medium border-b border-black/5 pb-4 mt-4">Transaction Ledger</h3>
                  <div className="flex flex-col gap-4">
                    {trips.slice(0, 6).map((trip, idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 bg-brand-base border border-black/5 rounded-2xl">
                         <div className="flex flex-col min-w-0">
                            <span className="font-mono text-xs font-semibold text-brand-text truncate font-bold">TRX-{trip.id.substring(0, 8).toUpperCase()}</span>
                            <span className="text-[10px] text-brand-muted uppercase tracking-widest font-semibold mt-1">Payment Completed • {new Date(trip.date).toLocaleDateString()}</span>
                         </div>
                         <div className="text-right">
                            <span className="font-display font-medium text-brand-text font-semibold">₦{trip.totalCost?.toLocaleString()}</span>
                            <div className="text-[10px] text-[#22c55e] font-semibold uppercase tracking-wider mt-1">Verified</div>
                         </div>
                       </div>
                    ))}
                  </div>
             </div>
           )}

           {/* SERVICES CONFIG TAB */}
           {activeTab === 'services' && (
             <div className="flex flex-col gap-6 w-full">
                  <div>
                    <h2 className="text-2xl font-display text-brand-text font-medium">Service Configuration</h2>
                    <p className="text-xs text-brand-muted mt-1 leading-relaxed">Update worldwide platform availability, client status alerts, and global coordinates.</p>
                  </div>

                  <div className="bg-brand-base border border-black/5 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
                     <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest font-mono text-brand-muted font-semibold">Platform status message</label>
                        <input 
                          type="text" 
                          value={platformStatus}
                          onChange={(e) => setPlatformStatus(e.target.value)}
                          className="w-full bg-brand-surface border border-black/10 rounded-xl px-4 py-3 font-medium outline-none focus:border-brand-accent text-sm" 
                        />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="flex flex-col gap-2">
                          <label className="text-xs uppercase tracking-widest font-mono text-brand-muted font-semibold">Support Contact Email</label>
                          <input 
                            type="email" 
                            value={supportEmail}
                            onChange={(e) => setSupportEmail(e.target.value)}
                            className="w-full bg-brand-surface border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-brand-accent text-sm text-brand-text" 
                          />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-xs uppercase tracking-widest font-mono text-brand-muted font-semibold">Terms of Usage Link</label>
                          <input 
                            type="url" 
                            value={termsUrl}
                            onChange={(e) => setTermsUrl(e.target.value)}
                            className="w-full bg-brand-surface border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-brand-accent text-sm text-brand-text" 
                          />
                       </div>
                     </div>
                     
                     <button 
                       onClick={saveServices}
                       disabled={isSaving}
                       className="bg-[#191814] text-white rounded-xl px-6 py-4 font-semibold hover:bg-black transition-colors md:w-[220px] mt-4 flex items-center justify-center gap-2 text-sm disabled:opacity-50 shadow-md"
                     >
                        <Save size={16} />
                        {isSaving ? 'Processing...' : 'Save Configuration'}
                     </button>
                  </div>
             </div>
           )}

           {/* FLEET SETUP & PRICING TAB */}
           {activeTab === 'fleet' && (
             <div className="flex flex-col gap-6 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-black/5 gap-4">
                  <div>
                    <h2 className="text-2xl font-display text-brand-text font-medium">Fleet Setup & Pricing</h2>
                    <p className="text-xs text-brand-muted mt-1">Register, edit, and update active vehicles, plate numbers, luxury categories, and daily rates.</p>
                  </div>
                  <button 
                     onClick={fetchFleet}
                     className="p-3 bg-black/5 hover:bg-black/10 rounded-full text-brand-muted hover:text-brand-text transition-all self-center"
                     title="Reload Fleet data"
                  >
                     <RefreshCw size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Left block - Register vehicle */}
                  <div className="xl:col-span-1 bg-brand-base border border-black/5 rounded-3xl p-6 h-fit">
                    <h3 className="text-lg font-display text-brand-text mb-4 font-semibold">Register Fleet Vehicle</h3>
                    <form onSubmit={handleAddVehicle} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest font-mono text-brand-muted font-semibold">Vehicle Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Lexus GX 460"
                          value={newVehicle.name}
                          onChange={(e) => setNewVehicle(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-accent transition-colors text-brand-text" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest font-mono text-brand-muted font-semibold">Plate Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. LAG-GX-460"
                          value={newVehicle.plateNumber}
                          onChange={(e) => setNewVehicle(prev => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))}
                          className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-accent transition-colors text-brand-text" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs uppercase tracking-widest font-mono text-brand-muted font-semibold">Category</label>
                          <select 
                            value={newVehicle.category}
                            onChange={(e) => setNewVehicle(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full bg-white border border-black/10 rounded-xl px-3 py-3 text-sm outline-none focus:border-brand-accent transition-colors text-brand-text font-medium"
                          >
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Luxury">Luxury</option>
                            <option value="Airport">Airport</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs uppercase tracking-widest font-mono text-brand-muted font-semibold">Daily Rate (₦)</label>
                          <input 
                            type="number" 
                            value={newVehicle.price}
                            onChange={(e) => setNewVehicle(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-brand-accent transition-colors text-brand-text" 
                          />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="mt-2 w-full py-4.5 bg-[#191814] text-white rounded-xl font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
                      >
                        <Plus size={16} /> Add Vehicle to Fleet
                      </button>
                    </form>
                  </div>

                  {/* Right block - Fleet listing */}
                  <div className="xl:col-span-2 flex flex-col gap-4">
                    <h3 className="text-lg font-display text-brand-text font-semibold">Active Fleet ({fleetData.length})</h3>
                    {fleetData.length === 0 ? (
                      <div className="text-center py-20 bg-brand-base border border-dashed border-black/10 rounded-2xl text-brand-muted">
                        No vehicles registered in fleet. Seed or add custom one!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fleetData.map((car) => {
                          const activeRental = trips.find(t => 
                            t.category?.toLowerCase().includes('standby') &&
                            t.category?.toLowerCase().includes(car.name.toLowerCase()) &&
                            t.status !== 'completed' &&
                            t.status !== 'cancelled'
                          );
                          const activeRentalChauffeur = activeRental ? driversData.find(d => d.id === activeRental.assignedDriverId) : null;
                          return (
                            <div key={car.id} className={`bg-brand-base border rounded-3xl p-5 flex flex-col justify-between gap-4 relative hover:border-black/10 transition-all shadow-xs ${activeRental ? 'border-emerald-500/20 shadow-xs' : 'border-black/5'}`}>
                              <div className="absolute top-4 right-4 flex gap-1">
                                <button 
                                  onClick={() => setEditingVehicle(car)}
                                  className="p-2 text-brand-muted hover:text-brand-text rounded-lg hover:bg-black/5 transition-colors"
                                  title="Edit Vehicle Info"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteVehicle(car.id)}
                                  className="p-2 text-brand-muted hover:text-red-500 rounded-lg hover:bg-black/5 transition-colors"
                                  title="Delete Vehicle"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#191814]/5 flex items-center justify-center text-[#191814]">
                                  <Car size={22} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-brand-text leading-tight truncate">{car.name}</h4>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-mono tracking-wider text-brand-muted bg-black/5 px-2 py-0.5 rounded-full uppercase mt-1 inline-block">{car.plateNumber}</span>
                                    {activeRental && (
                                      <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-500/15 px-2 py-0.5 rounded-full uppercase mt-1">Rented / Active</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Active lease matching profile banner */}
                              {activeRental && (
                                <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl p-3.5 space-y-1.5 text-xs">
                                  <p className="font-bold text-emerald-850 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    Active Firestore Lease Match
                                  </p>
                                  <p className="text-brand-text">👤 <b>Client:</b> {activeRental.clientName}</p>
                                  <p className="text-brand-muted">📞 <b>Phone:</b> {activeRental.clientPhone || 'N/A'}</p>
                                  {activeRentalChauffeur ? (
                                    <p className="text-emerald-800 font-semibold mt-1">📯 <b>Chauffeur:</b> {activeRentalChauffeur.name}</p>
                                  ) : (
                                    <p className="text-amber-700 italic mt-1">⚠️ Awaiting Chauffeur Assignment</p>
                                  )}
                                </div>
                              )}

                              <div className="border-t border-black/[0.05] pt-4 grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-brand-muted uppercase font-mono text-[9px] font-semibold">Daily Rate</span>
                                <div className="mt-1 font-semibold text-brand-text font-mono">
                                  ₦{(car.price || 0).toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <span className="text-brand-muted uppercase font-mono text-[9px] font-semibold">Class & Status</span>
                                <div className="mt-1 flex gap-2 items-center">
                                  <span className="font-medium text-brand-text">{car.category}</span>
                                  <span className={`w-2 h-2 rounded-full ${car.status === 'available' ? 'bg-green-500' : car.status === 'maintenance' ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-2">
                              <select 
                                value={car.status || 'available'} 
                                onChange={(e) => handleUpdateVehicleField(car.id, 'status', e.target.value)}
                                className="flex-1 bg-white border border-black/10 text-xs rounded-xl px-2.5 py-2 font-medium focus:border-brand-accent focus:outline-none transition-colors text-brand-text"
                              >
                                <option value="available">Available</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="rented">Rented</option>
                              </select>
                              <input 
                                type="number"
                                placeholder="Edit Rate"
                                className="w-24 bg-white border border-black/10 text-xs rounded-xl px-2 py-2 font-mono text-center outline-none focus:border-brand-accent text-brand-text"
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (val && val !== car.price) {
                                    handleUpdateVehicleField(car.id, 'price', val);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = parseInt((e.target as HTMLInputElement).value);
                                    if (val && val !== car.price) {
                                      handleUpdateVehicleField(car.id, 'price', val);
                                      (e.target as HTMLInputElement).blur();
                                    }
                                  }
                                }}
                                defaultValue={car.price}
                              />
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DRIVER MANAGEMENT TAB */}
            {activeTab === 'drivers' && (
              <div className="flex flex-col gap-6 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-black/5 gap-4">
                  <div>
                    <h2 className="text-2xl font-display text-brand-text font-medium">Driver Network</h2>
                    <p className="text-xs text-brand-muted mt-1">Manage, register, status check, and vehicle assignation for premium network chauffeurs.</p>
                  </div>
                  <button 
                     onClick={fetchDrivers}
                     className="p-3 bg-black/5 hover:bg-black/10 rounded-full text-brand-muted hover:text-brand-text transition-all self-center"
                     title="Reload Drivers list"
                  >
                     <RefreshCw size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Left component - Add Driver */}
                  <div className="xl:col-span-1 bg-brand-base border border-black/5 rounded-3xl p-6 h-fit">
                    <h3 className="text-lg font-display text-brand-text mb-4 font-semibold">Onboard New Driver</h3>
                    <form onSubmit={handleAddDriver} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest font-mono text-brand-muted font-semibold">Driver Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Victor Anichebe"
                          value={newDriver.name}
                          onChange={(e) => setNewDriver(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-accent transition-colors text-brand-text" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest font-mono text-brand-muted font-semibold">Email address</label>
                        <input 
                          type="email" 
                          placeholder="e.g. victor@wheez.com"
                          value={newDriver.email}
                          onChange={(e) => setNewDriver(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-accent transition-colors text-brand-text" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest font-mono text-brand-muted font-semibold">Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. +234 803 123 4567"
                          value={newDriver.phone}
                          onChange={(e) => setNewDriver(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-accent transition-colors text-brand-text" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs uppercase tracking-widest font-mono text-brand-muted font-semibold">Status</label>
                          <select 
                            value={newDriver.status}
                            onChange={(e) => setNewDriver(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full bg-white border border-black/10 rounded-xl px-3 py-3 text-sm outline-none focus:border-brand-accent transition-colors text-brand-text font-semibold"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on_trip">On Trip</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs uppercase tracking-widest font-mono text-brand-muted font-semibold">Assign Vehicle</label>
                          <select 
                            value={newDriver.vehicleId}
                            onChange={(e) => setNewDriver(prev => ({ ...prev, vehicleId: e.target.value }))}
                            className="w-full bg-white border border-black/10 rounded-xl px-3 py-3 text-sm outline-none focus:border-brand-accent transition-colors text-brand-text font-semibold"
                          >
                            <option value="">No vehicle</option>
                            {fleetData.map(car => (
                              <option key={car.id} value={car.id}>{car.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="mt-2 w-full py-4.5 bg-[#191814] text-white rounded-xl font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
                      >
                        <Users size={16} /> Onboard Professional Driver
                      </button>
                    </form>
                  </div>

                  {/* Right Component - Driver Listings */}
                  <div className="xl:col-span-2 flex flex-col gap-6">
                    {/* 1. Pending Onboarding Applications */}
                    <div>
                      {(() => {
                        const pendingDrivers = driversData.filter(d => d.status === 'pending');
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-3">
                              <h3 className="text-lg font-display text-brand-text font-semibold">
                                Pending Onboarding Applications ({pendingDrivers.length})
                              </h3>
                              {pendingDrivers.length > 0 && (
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                              )}
                            </div>
                            {pendingDrivers.length === 0 ? (
                              <div className="text-center py-8 bg-brand-base border border-dashed border-black/10 rounded-2xl text-brand-muted text-xs">
                                No pending onboarding applications at this time.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-4">
                                {pendingDrivers.map((driver) => (
                                  <div key={driver.id} className="bg-brand-base border border-[#986D43]/30 rounded-3xl p-5 flex flex-col gap-4 relative shadow-xs hover:shadow-md transition-all">
                                    <div className="absolute top-4 right-4">
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-700">
                                        Pending Review
                                      </span>
                                    </div>

                                    {/* Primary candidate info */}
                                    <div className="flex items-start gap-3">
                                      <div className="w-12 h-12 rounded-2xl bg-[#986D43]/10 text-[#986D43] flex items-center justify-center font-display font-semibold text-sm shrink-0 uppercase">
                                        {driver.name ? driver.name.split(' ').map((n: string) => n[0]).join('') : 'D'}
                                      </div>
                                      <div className="min-w-0 pr-24">
                                        <h4 className="font-semibold text-brand-text text-base leading-snug">{driver.name}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1 text-xs text-brand-muted">
                                          <p className="truncate flex items-center gap-1"><Mail size={12}/> {driver.email}</p>
                                          <p className="truncate flex items-center gap-1"><Phone size={12}/> {driver.phone}</p>
                                          <p className="truncate mt-0.5">DOB: {driver.dob || 'Not provided'}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Security credentials detailed section */}
                                    <div className="bg-white/40 border border-black/[0.03] rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                      <div>
                                        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-muted font-bold mb-1">Driver's License</p>
                                        <p className="font-semibold text-brand-text truncate">N° {driver.licenseNum || 'DL-PENDING'}</p>
                                        <p className="text-[10px] text-brand-muted mt-0.5">Exp: {driver.licenseExpiry || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-muted font-bold mb-1">Professional Experience</p>
                                        <p className="font-semibold text-[#986D43]">{driver.experience || '3'} Years Professional</p>
                                        <p className="text-[10px] text-brand-muted mt-0.5">Pref: {driver.transmission || 'Automatic'}</p>
                                      </div>
                                      <div>
                                        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-muted font-bold mb-1">Payout Account Details</p>
                                        <p className="font-semibold text-brand-text truncate">{driver.bankHolder || driver.name}</p>
                                        <p className="text-[10px] text-brand-muted font-mono mt-0.5">{driver.bankRouting || 'GTB'} · {driver.bankAccount || '0000000000'}</p>
                                      </div>
                                    </div>

                                    {/* Decision Actions */}
                                    <div className="flex gap-2 justify-end pt-1">
                                      <button
                                        onClick={() => handleDeleteDriver(driver.id)}
                                        className="px-4 py-2 border border-red-500/10 hover:bg-red-500/10 text-red-650 rounded-xl text-xs font-semibold tracking-wide transition-all uppercase"
                                      >
                                        Decline Candidate
                                      </button>
                                      <button
                                        onClick={() => handleUpdateDriverField(driver.id, 'status', 'active')}
                                        className="px-5 py-2 bg-[#986D43] hover:bg-[#835b34] text-white rounded-xl text-xs font-semibold tracking-wide transition-all uppercase shadow-xs flex items-center gap-1"
                                      >
                                        Approve & Verify Chauffeur
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* 2. Active Chauffeur Section */}
                    <div className="pt-4 border-t border-black/[0.05]">
                      {(() => {
                        const verifiedDrivers = driversData.filter(d => d.status !== 'pending');
                        return (
                          <div className="space-y-4">
                            <h3 className="text-lg font-display text-brand-text font-semibold">
                              Verified Custom Chauffeurs ({verifiedDrivers.length})
                            </h3>
                            {verifiedDrivers.length === 0 ? (
                              <div className="text-center py-10 bg-brand-base border border-dashed border-black/10 rounded-2xl text-brand-muted text-xs">
                                No active/verified network drivers available. Add drivers or approve applications above.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {verifiedDrivers.map((driver) => {
                                  const assignedCar = fleetData.find(c => c.id === driver.vehicleId);
                                  return (
                                    <div key={driver.id} className="bg-brand-base border border-black/5 rounded-3xl p-5 flex flex-col justify-between gap-4 relative hover:border-black/10 transition-all shadow-xs">
                                      <div className="absolute top-4 right-4 flex gap-1">
                                        <button 
                                          onClick={() => setEditingDriver(driver)}
                                          className="p-2 text-brand-muted hover:text-brand-text rounded-lg hover:bg-black/5 transition-all text-xs"
                                          title="Edit Driver Profile"
                                        >
                                          <Edit2 size={13} />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteDriver(driver.id)}
                                          className="p-2 text-brand-muted hover:text-red-500 rounded-lg hover:bg-black/5 transition-all"
                                          title="Delete/Archive Driver Profile"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                      
                                      <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-[#191814]/5 flex flex-col items-center justify-center font-display text-brand-text font-semibold text-sm shrink-0 uppercase tracking-tight">
                                          {driver.name ? driver.name.split(' ').map((n: string) => n[0]).join('') : 'D'}
                                        </div>
                                        <div className="min-w-0 pr-12">
                                          <h4 className="font-semibold text-brand-text truncate leading-tight">{driver.name}</h4>
                                          <p className="text-xs text-brand-muted truncate mt-1 flex items-center gap-1"><Mail size={12}/> {driver.email}</p>
                                          <p className="text-xs text-brand-muted truncate mt-0.5 flex items-center gap-1"><Phone size={12}/> {driver.phone}</p>
                                        </div>
                                      </div>

                                      <div className="border-t border-black/[0.05] pt-3 flex flex-col gap-2">
                                        <div className="flex justify-between text-xs items-center">
                                          <span className="text-brand-muted uppercase font-mono text-[9px] font-semibold">Status</span>
                                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                                            driver.status === 'active' ? 'bg-green-500/10 text-green-700' :
                                            driver.status === 'on_trip' ? 'bg-orange-500/10 text-orange-700' :
                                            'bg-gray-500/10 text-gray-700'
                                          }`}>
                                            <span className={`w-1 h-1 rounded-full ${
                                              driver.status === 'active' ? 'bg-green-500' :
                                              driver.status === 'on_trip' ? 'bg-orange-500' :
                                              'bg-gray-500'
                                            }`}></span>
                                            {driver.status}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-xs items-center">
                                          <span className="text-brand-muted uppercase font-mono text-[9px] font-semibold">Assigned Car</span>
                                          <span className="text-brand-text font-semibold truncate max-w-[150px]">{assignedCar ? assignedCar.name : "None"}</span>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2 mt-2 pt-1 border-t border-black/[0.03]">
                                        <select 
                                          value={driver.status || 'inactive'} 
                                          onChange={(e) => handleUpdateDriverField(driver.id, 'status', e.target.value)}
                                          className="bg-white border border-black/10 text-xs rounded-xl px-2 py-1.5 focus:border-brand-accent focus:outline-none font-medium text-brand-text"
                                        >
                                          <option value="active">Active</option>
                                          <option value="inactive">Inactive</option>
                                          <option value="on_trip">On Trip</option>
                                        </select>
                                        <select 
                                          value={driver.vehicleId || ''} 
                                          onChange={(e) => handleUpdateDriverField(driver.id, 'vehicleId', e.target.value)}
                                          className="bg-white border border-black/10 text-xs rounded-xl px-1.5 py-1.5 focus:border-brand-accent focus:outline-none font-medium text-brand-text"
                                        >
                                          <option value="">No car</option>
                                          {fleetData.map(car => (
                                            <option key={car.id} value={car.id}>{car.name}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                        </div>
                      </div>
                </div>
              </div>
            )}

         </main>
      </div>

      {/* EDIT VEHICLE MODAL */}
      <AnimatePresence>
        {editingVehicle && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-surface border border-black/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingVehicle(null)} 
                className="absolute top-4 right-4 p-2.5 bg-black/5 hover:bg-black/10 text-brand-muted hover:text-brand-text rounded-full transition-all"
              >
                <X size={15} />
              </button>
              <h3 className="text-xl font-display text-brand-text mb-2 font-bold flex items-center gap-2">
                <Car className="text-brand-accent w-5 h-5" /> Edit Fleet Vehicle
              </h3>
              <p className="text-xs text-brand-muted mb-6 leading-relaxed">Modify pricing parameters, luxury class alignments, and status indicators.</p>

              <form onSubmit={handleSaveVehicleEdit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Vehicle Model / Name</label>
                  <input 
                    type="text" 
                    value={editingVehicle.name || ''} 
                    onChange={(e) => setEditingVehicle((prev: any) => ({ ...prev, name: e.target.value }))}
                    className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Plate Registration Number</label>
                  <input 
                    type="text" 
                    value={editingVehicle.plateNumber || ''} 
                    onChange={(e) => setEditingVehicle((prev: any) => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))}
                    className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full font-mono uppercase"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Luxury Category</label>
                    <select 
                      value={editingVehicle.category || 'SUV'} 
                      onChange={(e) => setEditingVehicle((prev: any) => ({ ...prev, category: e.target.value }))}
                      className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-3 py-3 focus:outline-none focus:border-brand-accent transition-colors font-medium"
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Airport">Airport</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Daily Rental Rate (₦)</label>
                    <input 
                      type="number" 
                      value={editingVehicle.price || 0} 
                      onChange={(e) => setEditingVehicle((prev: any) => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Operational Status</label>
                  <select 
                    value={editingVehicle.status || 'available'} 
                    onChange={(e) => setEditingVehicle((prev: any) => ({ ...prev, status: e.target.value }))}
                    className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-3 py-3 focus:outline-none focus:border-brand-accent transition-colors font-medium"
                  >
                    <option value="available">Available (Active On-Platform)</option>
                    <option value="maintenance">Maintenance/Repair</option>
                    <option value="rented">Rented/On-Trip</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={() => setEditingVehicle(null)}
                    className="px-5 py-3 border border-black/10 text-brand-text text-xs rounded-xl hover:bg-black/5 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-[#191814] text-white text-xs rounded-xl hover:bg-black font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Save size={14} /> {isSaving ? 'Saving...' : 'Save Vehicle'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT DRIVER MODAL */}
      <AnimatePresence>
        {editingDriver && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-surface border border-black/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingDriver(null)} 
                className="absolute top-4 right-4 p-2.5 bg-black/5 hover:bg-black/10 text-brand-muted hover:text-brand-text rounded-full transition-all"
              >
                <X size={15} />
              </button>
              <h3 className="text-xl font-display text-brand-text mb-2 font-bold flex items-center gap-2">
                <Users className="text-brand-accent w-5 h-5" /> Edit Driver Profile
              </h3>
              <p className="text-xs text-brand-muted mb-6 leading-relaxed">Adjust contact records, operational routing state, and vehicle assignments.</p>

              <form onSubmit={handleSaveDriverEdit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Driver Name</label>
                  <input 
                    type="text" 
                    value={editingDriver.name || ''} 
                    onChange={(e) => setEditingDriver((prev: any) => ({ ...prev, name: e.target.value }))}
                    className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Email Address</label>
                  <input 
                    type="email" 
                    value={editingDriver.email || ''} 
                    onChange={(e) => setEditingDriver((prev: any) => ({ ...prev, email: e.target.value }))}
                    className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Phone Number</label>
                  <input 
                    type="text" 
                    value={editingDriver.phone || ''} 
                    onChange={(e) => setEditingDriver((prev: any) => ({ ...prev, phone: e.target.value }))}
                    className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Rating (0 - 5.0)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="1"
                      max="5"
                      value={editingDriver.rating || 4.9} 
                      onChange={(e) => setEditingDriver((prev: any) => ({ ...prev, rating: parseFloat(e.target.value) || 4.9 }))}
                      className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full font-mono"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Assign Vehicle</label>
                    <select 
                      value={editingDriver.vehicleId || ''} 
                      onChange={(e) => setEditingDriver((prev: any) => ({ ...prev, vehicleId: e.target.value }))}
                      className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-3 py-3 focus:outline-none focus:border-brand-accent transition-colors font-medium"
                    >
                      <option value="">No Vehicle</option>
                      {fleetData.map(car => (
                        <option key={car.id} value={car.id}>{car.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Duty Status</label>
                  <select 
                    value={editingDriver.status || 'inactive'} 
                    onChange={(e) => setEditingDriver((prev: any) => ({ ...prev, status: e.target.value }))}
                    className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-3 py-3 focus:outline-none focus:border-brand-accent transition-colors font-semibold"
                  >
                    <option value="active">Active (Online & Available)</option>
                    <option value="inactive">Inactive (Off-duty)</option>
                    <option value="on_trip">On Trip (Currently driving)</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={() => setEditingDriver(null)}
                    className="px-5 py-3 border border-black/10 text-brand-text text-xs rounded-xl hover:bg-black/5 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-[#191814] text-white text-xs rounded-xl hover:bg-black font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Save size={14} /> {isSaving ? 'Saving...' : 'Save Driver'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT BOOKING MODAL */}
      <AnimatePresence>
        {editingTrip && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-surface border border-black/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingTrip(null)} 
                className="absolute top-4 right-4 p-2.5 bg-black/5 hover:bg-black/10 text-brand-muted hover:text-brand-text rounded-full transition-all"
              >
                <X size={15} />
              </button>
              <h3 className="text-xl font-display text-brand-text mb-2 font-bold flex items-center gap-2">
                <MapPin className="text-brand-accent w-5 h-5" /> Edit Trip Booking
              </h3>
              <p className="text-xs text-brand-muted mb-6 leading-relaxed">Alter locations, fees, vehicles, drivers, and tracking records inside DB.</p>

              <form onSubmit={handleSaveTripEdit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Pickup Address</label>
                  <input 
                    type="text" 
                    value={editingTrip.pickup || ''} 
                    onChange={(e) => setEditingTrip((prev: any) => ({ ...prev, pickup: e.target.value }))}
                    className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Destination Address (Optional)</label>
                  <input 
                    type="text" 
                    value={editingTrip.destination || ''} 
                    onChange={(e) => setEditingTrip((prev: any) => ({ ...prev, destination: e.target.value }))}
                    className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Total Fare Price (₦)</label>
                    <input 
                      type="number" 
                      value={editingTrip.totalCost || 0} 
                      onChange={(e) => setEditingTrip((prev: any) => ({ ...prev, totalCost: parseInt(e.target.value) || 0 }))}
                      className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full font-mono"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Distance Alignment</label>
                    <input 
                      type="text" 
                      value={editingTrip.distance || ''} 
                      onChange={(e) => setEditingTrip((prev: any) => ({ ...prev, distance: e.target.value }))}
                      className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Travel Category</label>
                    <select 
                      value={editingTrip.category || 'SUV'} 
                      onChange={(e) => setEditingTrip((prev: any) => ({ ...prev, category: e.target.value }))}
                      className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-3 py-3 focus:outline-none focus:border-brand-accent transition-colors font-medium"
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Airport">Airport</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Assign Driver</label>
                    <select 
                      value={editingTrip.assignedDriverId || ''} 
                      onChange={(e) => setEditingTrip((prev: any) => ({ ...prev, assignedDriverId: e.target.value }))}
                      className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-3 py-3 focus:outline-none focus:border-brand-accent transition-colors font-medium"
                    >
                      <option value="">No Driver Assigned</option>
                      {driversData.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Booking Status</label>
                  <select 
                    value={editingTrip.status || 'pending'} 
                    onChange={(e) => setEditingTrip((prev: any) => ({ ...prev, status: e.target.value }))}
                    className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-3 py-3 focus:outline-none focus:border-brand-accent transition-colors font-semibold"
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Driver Assigned</option>
                    <option value="arriving">Driver Arrived/Arriving</option>
                    <option value="in_progress">Trip in Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={() => setEditingTrip(null)}
                    className="px-5 py-3 border border-black/10 text-brand-text text-xs rounded-xl hover:bg-black/5 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-[#191814] text-white text-xs rounded-xl hover:bg-black font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Save size={14} /> {isSaving ? 'Saving...' : 'Save Booking'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD MANUAL TRIP/BOOKING MODAL */}
      <AnimatePresence>
        {isAddingTrip && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-surface border border-black/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setIsAddingTrip(false)} 
                className="absolute top-4 right-4 p-2.5 bg-black/5 hover:bg-black/10 text-brand-muted hover:text-brand-text rounded-full transition-all"
              >
                <X size={15} />
              </button>
              <h3 className="text-xl font-display text-brand-text mb-2 font-bold flex items-center gap-2">
                <Plus className="text-brand-accent w-5 h-5" /> Back-Office Manual Booking
              </h3>
              <p className="text-xs text-brand-muted mb-6 leading-relaxed">Manually bypass the user app to create and dispatch booking requests directly within Firestore.</p>

              <form onSubmit={handleAddTrip} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Pickup Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 10 Admiralty Way, Lekki"
                    value={newTrip.pickup} 
                    onChange={(e) => setNewTrip((prev: any) => ({ ...prev, pickup: e.target.value }))}
                    className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Destination Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Murtala Muhammed International Airport"
                    value={newTrip.destination} 
                    onChange={(e) => setNewTrip((prev: any) => ({ ...prev, destination: e.target.value }))}
                    className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Estimated Cost (₦)</label>
                    <input 
                      type="number" 
                      value={newTrip.totalCost} 
                      onChange={(e) => setNewTrip((prev: any) => ({ ...prev, totalCost: parseInt(e.target.value) || 0 }))}
                      className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full font-mono"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Distance</label>
                    <input 
                      type="text" 
                      value={newTrip.distance} 
                      onChange={(e) => setNewTrip((prev: any) => ({ ...prev, distance: e.target.value }))}
                      className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-colors w-full"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Category</label>
                    <select 
                      value={newTrip.category} 
                      onChange={(e) => setNewTrip((prev: any) => ({ ...prev, category: e.target.value }))}
                      className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-3 py-3 focus:outline-none focus:border-brand-accent transition-colors font-medium"
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Airport">Airport</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-brand-muted font-bold">Dispatch Driver</label>
                    <select 
                      value={newTrip.assignedDriverId} 
                      onChange={(e) => setNewTrip((prev: any) => ({ ...prev, assignedDriverId: e.target.value, status: e.target.value ? 'arriving' : 'pending' }))}
                      className="bg-white border border-black/10 text-brand-text text-sm rounded-xl px-3 py-3 focus:outline-none focus:border-brand-accent transition-colors font-medium"
                    >
                      <option value="">No Driver Assigned</option>
                      {driversData.filter(d => d.status === 'active').map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingTrip(false)}
                    className="px-5 py-3 border border-black/10 text-brand-text text-xs rounded-xl hover:bg-black/5 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-[#191814] text-white text-xs rounded-xl hover:bg-black font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Create Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
