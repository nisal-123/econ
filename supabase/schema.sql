-- ==============================================================================
-- CAMPUS BIRTHDAY HUB - SUPABASE DATABASE SCHEMA & MIGRATION (NO SIGN-IN REQUIRED)
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create User Roles Table (Optional for role tracking)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'designer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Student Profiles Table (Direct Public Access)
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    preferred_name VARCHAR(100),
    birthday_date DATE NOT NULL,
    profile_photo_url TEXT,
    profile_photo_path TEXT,
    department VARCHAR(150) NOT NULL,
    degree_programme VARCHAR(150),
    batch VARCHAR(50),
    contact_email VARCHAR(150),
    personal_note TEXT,
    consent_social_media BOOLEAN DEFAULT TRUE,
    consent_public_calendar BOOLEAN DEFAULT TRUE,
    approval_status VARCHAR(30) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'correction_requested')),
    admin_notes TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Birthday Post Tasks Table (For Post Designer & Tracking)
CREATE TABLE IF NOT EXISTS public.birthday_post_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    post_status VARCHAR(30) DEFAULT 'pending' CHECK (post_status IN ('pending', 'in_progress', 'design_completed', 'published')),
    design_template VARCHAR(50) DEFAULT 'navy_gold',
    designer_notes TEXT,
    canvas_settings JSONB DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast searching and filtering
CREATE INDEX IF NOT EXISTS idx_student_profiles_birthday ON public.student_profiles (birthday_date);
CREATE INDEX IF NOT EXISTS idx_student_profiles_department ON public.student_profiles (department);
CREATE INDEX IF NOT EXISTS idx_student_profiles_batch ON public.student_profiles (batch);
CREATE INDEX IF NOT EXISTS idx_student_profiles_approval ON public.student_profiles (approval_status);
CREATE INDEX IF NOT EXISTS idx_birthday_post_tasks_status ON public.birthday_post_tasks (post_status);

-- 5. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_student_profiles_updated_at
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trigger_birthday_post_tasks_updated_at
BEFORE UPDATE ON public.birthday_post_tasks
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Trigger to automatically create a birthday_post_tasks row when a student profile is created
CREATE OR REPLACE FUNCTION public.handle_new_student_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.birthday_post_tasks (student_profile_id, post_status)
    VALUES (NEW.id, 'pending')
    ON CONFLICT (student_profile_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_auto_create_post_task
AFTER INSERT ON public.student_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_new_student_profile();

-- 7. ROW LEVEL SECURITY (RLS) POLICIES - OPEN DIRECT ACCESS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_post_tasks ENABLE ROW LEVEL SECURITY;

-- Student Profiles: Open Direct Access
CREATE POLICY "Anyone can view student profiles"
ON public.student_profiles FOR SELECT
USING (true);

CREATE POLICY "Anyone can submit a student profile"
ON public.student_profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update a student profile"
ON public.student_profiles FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete a student profile"
ON public.student_profiles FOR DELETE
USING (true);

-- Birthday Post Tasks: Open Direct Access
CREATE POLICY "Anyone can view and update post tasks"
ON public.birthday_post_tasks FOR ALL
USING (true);

-- 8. Storage Bucket Configuration for Student Photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-photos',
    'student-photos',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS Policies (Public Direct Read & Upload)
CREATE POLICY "Public can view student photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos');

CREATE POLICY "Public can upload student photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student-photos');

CREATE POLICY "Public can update student photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'student-photos');
