-- Drop the existing messages table if it exists
DROP TABLE IF EXISTS messages;

-- Create messages table with explicit foreign key names
CREATE TABLE messages (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    content text NOT NULL,
    sender_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    read_at timestamptz,
    CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id)
        REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id)
        REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX messages_sender_id_idx ON messages(sender_id);
CREATE INDEX messages_receiver_id_idx ON messages(receiver_id);
CREATE INDEX messages_created_at_idx ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view messages they sent or received"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they sent"
    ON messages FOR UPDATE
    USING (auth.uid() = sender_id);

-- Add comment to the table
COMMENT ON TABLE messages IS 'Stores messages between users'; 