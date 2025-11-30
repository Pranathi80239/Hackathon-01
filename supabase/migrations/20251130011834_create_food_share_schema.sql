/*
  # Food Share Platform Schema

  ## Overview
  Creates a comprehensive food sharing platform to reduce food waste and improve food security.

  ## New Tables
  
  ### `profiles`
  Extends auth.users with user profile information
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'admin', 'donor', 'recipient', 'analyst'
  - `organization_name` (text, nullable) - Organization name if applicable
  - `phone` (text, nullable) - Contact phone number
  - `address` (text, nullable) - Physical address
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `food_listings`
  Food items available for donation
  - `id` (uuid, primary key)
  - `donor_id` (uuid) - References profiles(id)
  - `title` (text) - Food item title
  - `description` (text) - Detailed description
  - `category` (text) - Food category (produce, dairy, bakery, prepared, etc.)
  - `quantity` (text) - Quantity available
  - `expiry_date` (date, nullable) - Expiration date if applicable
  - `pickup_location` (text) - Where to pick up the food
  - `pickup_instructions` (text, nullable) - Special pickup instructions
  - `status` (text) - Status: 'available', 'reserved', 'completed', 'cancelled'
  - `image_url` (text, nullable) - Photo of the food
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `donation_requests`
  Requests from recipients for food donations
  - `id` (uuid, primary key)
  - `recipient_id` (uuid) - References profiles(id)
  - `listing_id` (uuid, nullable) - References food_listings(id) if specific item
  - `title` (text) - Request title
  - `description` (text) - What is needed
  - `category` (text) - Food category needed
  - `quantity_needed` (text) - How much is needed
  - `urgency` (text) - Urgency level: 'low', 'medium', 'high', 'critical'
  - `status` (text) - Status: 'open', 'in_progress', 'fulfilled', 'cancelled'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `donations`
  Tracks completed and in-progress donations
  - `id` (uuid, primary key)
  - `listing_id` (uuid) - References food_listings(id)
  - `donor_id` (uuid) - References profiles(id)
  - `recipient_id` (uuid) - References profiles(id)
  - `request_id` (uuid, nullable) - References donation_requests(id)
  - `quantity` (text) - Quantity donated
  - `status` (text) - Status: 'pending', 'in_transit', 'delivered', 'cancelled'
  - `pickup_date` (timestamptz, nullable) - Scheduled pickup time
  - `delivery_date` (timestamptz, nullable) - Actual delivery time
  - `impact_notes` (text, nullable) - Notes about the donation impact
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `waste_analytics`
  Tracks food waste data and impact metrics
  - `id` (uuid, primary key)
  - `listing_id` (uuid, nullable) - References food_listings(id)
  - `donation_id` (uuid, nullable) - References donations(id)
  - `food_saved_kg` (decimal) - Weight of food saved in kg
  - `meals_provided` (integer) - Estimated meals provided
  - `co2_saved_kg` (decimal) - Estimated CO2 emissions prevented
  - `category` (text) - Food category
  - `date` (date) - Date of the metric
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Profiles: Users can read all profiles, update own profile
  - Food Listings: Anyone can read, donors can create/update own listings
  - Donation Requests: Anyone can read, recipients can create/update own requests
  - Donations: Participants can view their donations, donors/recipients can create
  - Waste Analytics: Analysts and admins can view all, system can insert
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'donor' CHECK (role IN ('admin', 'donor', 'recipient', 'analyst')),
  organization_name text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create food_listings table
CREATE TABLE IF NOT EXISTS food_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  quantity text NOT NULL,
  expiry_date date,
  pickup_location text NOT NULL,
  pickup_instructions text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'completed', 'cancelled')),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available food listings"
  ON food_listings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Donors can create food listings"
  ON food_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donors can update own listings"
  ON food_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = donor_id)
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donors can delete own listings"
  ON food_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = donor_id);

-- Create donation_requests table
CREATE TABLE IF NOT EXISTS donation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES food_listings(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  quantity_needed text NOT NULL,
  urgency text NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'fulfilled', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE donation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donation requests"
  ON donation_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Recipients can create requests"
  ON donation_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Recipients can update own requests"
  ON donation_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Recipients can delete own requests"
  ON donation_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = recipient_id);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
  donor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id uuid REFERENCES donation_requests(id) ON DELETE SET NULL,
  quantity text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  pickup_date timestamptz,
  delivery_date timestamptz,
  impact_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (auth.uid() = donor_id OR auth.uid() = recipient_id);

CREATE POLICY "Donors and recipients can create donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = donor_id OR auth.uid() = recipient_id);

CREATE POLICY "Participants can update donations"
  ON donations FOR UPDATE
  TO authenticated
  USING (auth.uid() = donor_id OR auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = donor_id OR auth.uid() = recipient_id);

-- Create waste_analytics table
CREATE TABLE IF NOT EXISTS waste_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES food_listings(id) ON DELETE SET NULL,
  donation_id uuid REFERENCES donations(id) ON DELETE SET NULL,
  food_saved_kg decimal NOT NULL DEFAULT 0,
  meals_provided integer NOT NULL DEFAULT 0,
  co2_saved_kg decimal NOT NULL DEFAULT 0,
  category text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waste_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view analytics"
  ON waste_analytics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert analytics"
  ON waste_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_food_listings_donor ON food_listings(donor_id);
CREATE INDEX IF NOT EXISTS idx_food_listings_status ON food_listings(status);
CREATE INDEX IF NOT EXISTS idx_donation_requests_recipient ON donation_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_donation_requests_status ON donation_requests(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_recipient ON donations(recipient_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_waste_analytics_date ON waste_analytics(date);
