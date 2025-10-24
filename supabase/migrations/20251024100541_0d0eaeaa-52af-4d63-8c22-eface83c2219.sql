-- Create storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', true);

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload task files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-attachments');

-- Allow authenticated users to view task files
CREATE POLICY "Users can view task files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'task-attachments');

-- Allow users to delete their own uploaded files
CREATE POLICY "Users can delete task files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'task-attachments');