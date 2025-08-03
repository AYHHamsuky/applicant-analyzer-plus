-- Create storage bucket for CV uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cv-uploads', 'cv-uploads', true);

-- Create storage policies for CV uploads
CREATE POLICY "CV uploads are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cv-uploads');

CREATE POLICY "Anyone can upload CVs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cv-uploads');

CREATE POLICY "Anyone can update CV files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cv-uploads');

CREATE POLICY "Anyone can delete CV files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cv-uploads');