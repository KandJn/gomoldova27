-- Drop existing foreign key constraints if they exist
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Add explicit foreign key constraints with proper names
ALTER TABLE messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE messages
ADD CONSTRAINT messages_receiver_id_fkey
FOREIGN KEY (receiver_id)
REFERENCES profiles(id)
ON DELETE CASCADE; 