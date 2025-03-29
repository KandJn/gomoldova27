\n\n-- Create policy for updating notifications\nCREATE POLICY "Users can update own notifications"\n  ON notifications FOR UPDATE\n  TO authenticated\n  USING (auth.uid() = user_id)\n  WITH CHECK (\n    auth.uid() = user_id AND\n    read_at IS NOT NULL\n  );
\n\n-- Add index for better performance\nCREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_at);
;
