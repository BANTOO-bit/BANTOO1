
-- Fix Driver RLS Policies for ADMINS
-- Currently only the driver themselves can update their record.
-- We need to allow Admins to update ANY driver record (to approve/reject).

CREATE POLICY "Admins can update drivers" ON drivers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Also allow Admins to DELETE drivers if needed
CREATE POLICY "Admins can delete drivers" ON drivers
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
