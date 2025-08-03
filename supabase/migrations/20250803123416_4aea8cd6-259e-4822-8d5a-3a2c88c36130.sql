-- Drop unnecessary e-commerce tables
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create tables for CV screening system
CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id),
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  analysis_result JSONB,
  match_score INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  analyzed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on resumes table
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create policies for resumes
CREATE POLICY "Users can view their own resumes" 
ON public.resumes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own resumes" 
ON public.resumes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" 
ON public.resumes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" 
ON public.resumes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create job requirements table
CREATE TABLE public.job_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[],
  experience_level TEXT,
  created_by UUID REFERENCES profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on job_requirements table
ALTER TABLE public.job_requirements ENABLE ROW LEVEL SECURITY;

-- Create policies for job requirements
CREATE POLICY "Job requirements are viewable by everyone" 
ON public.job_requirements 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create job requirements" 
ON public.job_requirements 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own job requirements" 
ON public.job_requirements 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Add trigger for updated_at
CREATE TRIGGER update_job_requirements_updated_at
BEFORE UPDATE ON public.job_requirements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();