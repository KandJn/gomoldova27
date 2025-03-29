-- Drop existing mark_notification_as_read functions\nDROP FUNCTION IF EXISTS mark_notification_as_read(bigint);
\nDROP FUNCTION IF EXISTS mark_notification_as_read(uuid);
\n\n-- Create single mark_notification_as_read function with UUID parameter\nCREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id uuid)\nRETURNS void AS $$\nBEGIN\n  UPDATE notifications\n  SET read_at = now()\n  WHERE id = notification_id\n  AND user_id = auth.uid()\n  AND read_at IS NULL;
\nEND;
\n$$ LANGUAGE plpgsql SECURITY DEFINER;
\n\n-- Refresh materialized view\nREFRESH MATERIALIZED VIEW available_seats;
;
