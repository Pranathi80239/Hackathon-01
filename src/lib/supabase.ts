import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'donor' | 'recipient' | 'analyst';
  organization_name?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
};

export type FoodListing = {
  id: string;
  donor_id: string;
  title: string;
  description: string;
  category: string;
  quantity: string;
  expiry_date?: string;
  pickup_location: string;
  pickup_instructions?: string;
  status: 'available' | 'reserved' | 'completed' | 'cancelled';
  image_url?: string;
  created_at: string;
  updated_at: string;
};

export type DonationRequest = {
  id: string;
  recipient_id: string;
  listing_id?: string;
  title: string;
  description: string;
  category: string;
  quantity_needed: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'fulfilled' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type Donation = {
  id: string;
  listing_id: string;
  donor_id: string;
  recipient_id: string;
  request_id?: string;
  quantity: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  pickup_date?: string;
  delivery_date?: string;
  impact_notes?: string;
  created_at: string;
  updated_at: string;
};

export type WasteAnalytic = {
  id: string;
  listing_id?: string;
  donation_id?: string;
  food_saved_kg: number;
  meals_provided: number;
  co2_saved_kg: number;
  category: string;
  date: string;
  created_at: string;
};
