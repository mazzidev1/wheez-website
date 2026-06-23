export type AppState = 'landing' | 'customer' | 'driver' | 'content' | 'luxury-book';

export type CustomerStep = 'estimate' | 'login' | 'home' | 'matching' | 'trip' | 'payment' | 'done' | 'dashboard';

export type DriverStep = 'login' | 'vetting' | 'pending' | 'dashboard';

export interface RideParams {
  pickup: string;
  duration?: string;
  category: string;
}

export interface CarDetail {
  id: string;
  name: string;
  pricePerDay: number;
  image: string;
  specs: {
    passengers: number;
    luggage: number;
    transmission: string;
    fuelType: string;
    comfort: string[];
  };
}

export type ContentPageId = 
  | 'ride-airport' | 'ride-long' | 'ride-events' | 'ride-hospital' | 'service-luxury'
  | 'drive-become' | 'drive-requirements' | 'drive-earnings' | 'drive-payouts'
  | 'company-about' | 'company-trust' | 'company-careers' | 'company-terms';

