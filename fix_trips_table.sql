-- Drop existing tables and dependencies
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    is_driver BOOLEAN DEFAULT false,
    id_number TEXT,
    driver_license TEXT,
    id_verified BOOLEAN DEFAULT false,
    license_verified BOOLEAN DEFAULT false,
    travel_preferences JSONB,
    verification_status TEXT DEFAULT 'unverified'
);

-- Create trips table
CREATE TABLE trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    driver_id UUID REFERENCES profiles(id) NOT NULL,
    from_city TEXT NOT NULL,
    to_city TEXT NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    from_coordinates JSONB,
    to_coordinates JSONB,
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_date DATE NOT NULL,
    arrival_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    seats INTEGER NOT NULL,
    status TEXT DEFAULT 'scheduled',
    stopovers JSONB,
    route_details JSONB
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    trip_id UUID REFERENCES trips(id) NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    status TEXT DEFAULT 'pending',
    seats INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    notes TEXT
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for trips
CREATE POLICY "Anyone can view trips"
    ON trips FOR SELECT
    USING (true);

CREATE POLICY "Drivers can create trips"
    ON trips FOR INSERT
    WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own trips"
    ON trips FOR UPDATE
    USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can delete their own trips"
    ON trips FOR DELETE
    USING (auth.uid() = driver_id);

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
    ON bookings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
    ON bookings FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_trips_departure_date ON trips(departure_date);
CREATE INDEX idx_trips_from_city ON trips(from_city);
CREATE INDEX idx_trips_to_city ON trips(to_city);
CREATE INDEX idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status); 