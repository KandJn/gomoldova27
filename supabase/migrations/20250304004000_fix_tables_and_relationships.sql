-- Drop materialized views first
DROP MATERIALIZED VIEW IF EXISTS trip_seats;
DROP MATERIALIZED VIEW IF EXISTS available_seats;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS buses;

-- Create buses table
CREATE TABLE IF NOT EXISTS buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES bus_companies(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL,
  model TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  year INTEGER NOT NULL,
  last_maintenance DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES bus_companies(id) ON DELETE CASCADE,
  bus_id UUID REFERENCES buses(id) ON DELETE RESTRICT,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  arrival_date DATE NOT NULL,
  arrival_time TIME NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  available_seats INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES bus_companies(id) ON DELETE CASCADE,
  seats INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate materialized views
CREATE MATERIALIZED VIEW trip_seats AS
SELECT 
  t.id as trip_id,
  t.available_seats as total_seats,
  COALESCE(COUNT(b.id) FILTER (WHERE b.status = 'confirmed'), 0) as booked_seats,
  t.available_seats - COALESCE(COUNT(b.id) FILTER (WHERE b.status = 'confirmed'), 0) as available_seats
FROM trips t
LEFT JOIN bookings b ON b.trip_id = t.id
GROUP BY t.id, t.available_seats;

CREATE MATERIALIZED VIEW available_seats AS
SELECT 
  t.id as trip_id,
  t.available_seats as total_seats,
  COALESCE(COUNT(b.id) FILTER (WHERE b.status = 'confirmed'), 0) as booked_seats,
  t.available_seats - COALESCE(COUNT(b.id) FILTER (WHERE b.status = 'confirmed'), 0) as seats_left
FROM trips t
LEFT JOIN bookings b ON b.trip_id = t.id
GROUP BY t.id, t.available_seats;

-- Create unique index on trip_id for concurrent refresh
CREATE UNIQUE INDEX available_seats_trip_id_idx ON available_seats(trip_id);

-- Enable RLS
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for buses
CREATE POLICY "Bus companies can manage their own buses"
ON buses
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bus_companies
    WHERE id = buses.company_id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bus_companies
    WHERE id = buses.company_id
    AND user_id = auth.uid()
  )
);

-- Create policies for trips
CREATE POLICY "Bus companies can manage their own trips"
ON trips
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bus_companies
    WHERE id = trips.company_id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bus_companies
    WHERE id = trips.company_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Public can view scheduled and active trips"
ON trips
FOR SELECT
TO public
USING (status IN ('scheduled', 'active'));

-- Create policies for bookings
CREATE POLICY "Bus companies can view their bookings"
ON bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bus_companies
    WHERE id = bookings.company_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own bookings"
ON bookings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings"
ON bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create function to update trip available seats
CREATE OR REPLACE FUNCTION update_trip_available_seats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Decrease available seats when booking is created
    UPDATE trips
    SET available_seats = available_seats - NEW.seats
    WHERE id = NEW.trip_id;
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.status != 'cancelled' AND NEW.status = 'cancelled') THEN
    -- Increase available seats when booking is cancelled or deleted
    UPDATE trips
    SET available_seats = available_seats + OLD.seats
    WHERE id = OLD.trip_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating available seats
DROP TRIGGER IF EXISTS on_booking_change ON bookings;
CREATE TRIGGER on_booking_change
  AFTER INSERT OR UPDATE OF status OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_available_seats();

-- Create function to automatically update trip status
CREATE OR REPLACE FUNCTION update_trip_status()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT or UPDATE operations
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update status based on dates and times
    IF NEW.departure_date < CURRENT_DATE OR 
       (NEW.departure_date = CURRENT_DATE AND NEW.departure_time <= CURRENT_TIME) THEN
      NEW.status = 'active';
    END IF;

    IF NEW.arrival_date < CURRENT_DATE OR 
       (NEW.arrival_date = CURRENT_DATE AND NEW.arrival_time <= CURRENT_TIME) THEN
      NEW.status = 'completed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating trip status
DROP TRIGGER IF EXISTS check_trip_status ON trips;
CREATE TRIGGER check_trip_status
  BEFORE INSERT OR UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_status();

-- Create indexes for better performance
CREATE INDEX idx_buses_company ON buses(company_id);
CREATE INDEX idx_buses_status ON buses(status);
CREATE INDEX idx_trips_company ON trips(company_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_departure ON trips(departure_date, departure_time);
CREATE INDEX idx_bookings_trip ON bookings(trip_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_company ON bookings(company_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Grant permissions on materialized views
GRANT SELECT ON trip_seats TO anon, authenticated;
GRANT ALL ON trip_seats TO authenticated;
GRANT SELECT ON available_seats TO anon, authenticated;
GRANT ALL ON available_seats TO authenticated; 