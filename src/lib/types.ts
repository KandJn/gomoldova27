export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_driver: boolean;
  id_number: string | null;
  driver_license: string | null;
  id_verified: boolean;
  license_verified: boolean;
  created_at: string;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  rating?: number;
  travel_preferences?: {
    smoking: boolean;
    music: boolean;
    pets: boolean;
  };
}

export interface Trip {
  id: number;
  company_id: string;
  from_city: string;
  to_city: string;
  from_address: string;
  to_address: string;
  from_coordinates: string | null;
  to_coordinates: string | null;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  price: number;
  seats: number;
  available_seats: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  vehicle_type: 'car' | 'bus';
  driver: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    bio: string | null;
    avatar_url: string | null;
    is_driver: boolean;
    id_number: string | null;
    driver_license: string | null;
    id_verified: boolean;
    license_verified: boolean;
    created_at: string;
    verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
    rating?: number;
  };
  bus: {
    id: string;
    registration_number: string;
    model: string;
    capacity: number;
  } | null;
  bookings: Booking[];
  preferences: {
    smoking: boolean;
    music: boolean;
    pets: boolean;
  };
}

export interface Booking {
  id: number;
  trip_id: number;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  user: Profile;
}

export interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender: {
    full_name: string;
    avatar_url: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_booking_request' | 'booking_approved' | 'booking_rejected' | 'booking_cancelled' | 'trip_reminder' | 'new_message';
  content: {
    booking_id?: number;
    trip_id?: number;
    passenger_id?: string;
    passenger_name?: string;
    driver_id?: string;
    driver_name?: string;
    message_id?: number;
    link?: string;
    trip_details?: {
      from_city: string;
      to_city: string;
      date: string;
      time: string;
    };
  };
  created_at: string;
  read_at: string | null;
}

export interface BusCompany {
  id: string;
  owner_id: string;
  company_name: string;
  registration_number: string;
  email: string;
  phone: string;
  website?: string;
  operating_license: string;
  insurance_number: string;
  fleet_size: number;
  fleet_details: string;
  logo_url?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export interface BusRoute {
  id: string;
  company_id: string;
  from_city: string;
  to_city: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  price: number;
  seats: number;
  bus_type: string;
  amenities: {
    wifi: boolean;
    powerOutlets: boolean;
    airConditioning: boolean;
    toilet: boolean;
    entertainment: boolean;
    snacks: boolean;
    recliningSeats: boolean;
    luggageSpace: boolean;
  };
  pickup_point: string;
  dropoff_point: string;
  booking_conditions: string;
  created_at: string;
  company: BusCompany;
}