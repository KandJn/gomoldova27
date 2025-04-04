\n\n-- Add indexes for profiles\nCREATE INDEX IF NOT EXISTS idx_profiles_is_driver ON profiles(is_driver);
\nCREATE INDEX IF NOT EXISTS idx_profiles_profile_completed ON profiles(profile_completed);
\n\n-- Add indexes for trips\nCREATE INDEX IF NOT EXISTS idx_trips_date ON trips(date);
\nCREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
\nCREATE INDEX IF NOT EXISTS idx_trips_from_to ON trips("from", "to");
\n\n-- Add indexes for bookings\nCREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
\nCREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
\nCREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
\nCREATE INDEX IF NOT EXISTS idx_bookings_trip_status ON bookings(trip_id, status);
\n\n-- Add indexes for messages\nCREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
\nCREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
\n\n-- Add indexes for notifications\nCREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
\nCREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
\n\n-- Create a function to refresh trip_seats periodically\nCREATE OR REPLACE FUNCTION refresh_trip_seats_periodic()\nRETURNS void AS $$\nBEGIN\n  REFRESH MATERIALIZED VIEW CONCURRENTLY trip_seats;
\nEND;
\n$$ LANGUAGE plpgsql;
\n\n-- Create a function to clean up old notifications\nCREATE OR REPLACE FUNCTION cleanup_old_notifications()\nRETURNS void AS $$\nBEGIN\n  DELETE FROM notifications\n  WHERE created_at < NOW() - INTERVAL '30 days';
\nEND;
\n$$ LANGUAGE plpgsql;
;
