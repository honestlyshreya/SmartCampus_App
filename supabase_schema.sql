-- ========================================================
-- ⚡ QUICK FIX: RESOLVE "Could not find 'batch_year' in schema cache"
-- Copy and run ONLY these 3 lines in Supabase SQL Editor to fix immediately WITHOUT deleting any data:
-- --------------------------------------------------------
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS batch_year TEXT DEFAULT 'Batch 2024';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS batch_year TEXT DEFAULT 'Batch 2024';
NOTIFY pgrst, 'reload schema';
-- ========================================================

-- ========================================================
-- FULL SCHEMA SETUP (Only use if recreating tables from scratch)
-- Run this entire script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. DROP EXISTING TABLES TO PREVENT TYPE MISMATCH CONFLICTS
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.class_subjects CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.notices CASCADE;
DROP TABLE IF EXISTS public.academic_events CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ========================================================
-- 1ST STEP: SUBJECTS TABLE
-- Fields: Subject Code, Name of the Subject, Automatic ID
-- ========================================================
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Automatically created unique ID
    subject_code TEXT UNIQUE NOT NULL,             -- Subject Code (e.g. 'CS-301')
    subject_name TEXT NOT NULL,                    -- Name of the Subject (e.g. 'Data Structures & Algorithms')
    department TEXT DEFAULT 'Computer Science & Engineering', -- Assigned Branch / Department
    year_semester TEXT DEFAULT '1st Year | 2nd Semester',     -- Assigned Year & Semester
    credits INT DEFAULT 4,                         -- Course credits
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- 2ND STEP: CLASSES TABLE
-- Fields: Department, Class Section, Year | Semester, Automatic ID
-- ========================================================
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Automatically created unique ID
    department TEXT NOT NULL,                      -- Department (e.g. 'Computer Science & Engineering')
    class_section TEXT NOT NULL,                   -- Class Section (e.g. 'Section A', 'Section B', 'Section C')
    year_semester TEXT NOT NULL,                   -- Year | Semester (e.g. '1st Year | 2nd Semester')
    class_name TEXT NOT NULL UNIQUE,               -- Unique Class Identifier (e.g. 'CSE-A', 'CSE-B', 'CSE-C')
    batch_year TEXT DEFAULT 'Batch 2024',          -- Year of admission batch (e.g. 'Batch 2024')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- TEACHERS TABLE (Prerequisite for Student mentor & Class assignments)
-- Fields: Teacher ID, Teacher Code, Full Name, Department, Email
-- ========================================================
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Automatically created unique ID
    teacher_code TEXT UNIQUE NOT NULL,             -- Teacher Code / Staff ID (e.g. 'T101')
    full_name TEXT NOT NULL,                       -- Teacher Full Name
    department TEXT NOT NULL,                      -- Department
    email TEXT UNIQUE NOT NULL,                    -- Email address
    designation TEXT DEFAULT 'Senior Professor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- 3RD STEP: STUDENT TABLE
-- Fields: Name of Student, Student ID, Email, Admission Batch Year,
--         Current Year & Semester (dropdown), Class Belongs to (name & mapped to Class ID),
--         Attendance Percentage (marked/updated by teacher), Teacher ID, Automatic ID
-- ========================================================
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Automatically created unique ID
    student_code TEXT UNIQUE NOT NULL,             -- Student ID / Roll Number (e.g. 'S001')
    full_name TEXT NOT NULL,                       -- Name of the Student
    email TEXT UNIQUE NOT NULL,                    -- Student Email Address
    batch_year TEXT DEFAULT 'Batch 2024',          -- Year of admission batch (e.g. 'Batch 2024')
    year_semester TEXT NOT NULL,                   -- Currently in Year & Semester (e.g. '1st Year | 2nd Semester')
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE, -- Mapped to Class ID
    class_name TEXT NOT NULL,                      -- Class Name (e.g. 'CSE-C')
    attendance_percentage NUMERIC(5,2) DEFAULT 0.00, -- Attendance percentage (marked and updated by teacher)
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,     -- Teacher ID assigned to student
    cgpa NUMERIC(3,2) DEFAULT 0.00,
    library_books_due INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- 4TH STEP: CLASSES SUBJECTS TABLE
-- Fields: Class ID mapped with Class Subject and Subject (Assign Subject to Class, 
--         Teacher with Class ID, Teacher ID, Subject ID), Automatic ID
-- ========================================================
CREATE TABLE public.class_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Automatically created unique ID
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,   -- Mapped Class ID
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE, -- Mapped Subject ID
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE, -- Mapped Teacher ID
    day_of_week TEXT NOT NULL DEFAULT 'Today',
    time_slot TEXT NOT NULL DEFAULT '10:00 AM - 11:30 AM',
    room TEXT NOT NULL DEFAULT 'Lab 402',
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('In Progress', 'Upcoming', 'Completed')),
    color TEXT DEFAULT '#6366F1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- ADDITIONAL SUPPORTING TABLES
-- ========================================================

-- NOTICES TABLE
CREATE TABLE public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Academic', 'Events', 'Admin')),
    date_label TEXT NOT NULL,
    content TEXT NOT NULL,
    unread BOOLEAN DEFAULT true,
    target_class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACADEMIC EVENTS TABLE
CREATE TABLE public.academic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    event_date TEXT NOT NULL,
    icon TEXT DEFAULT '📅',
    icon_bg TEXT DEFAULT '#F3E8FF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ASSIGNMENTS TABLE
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    due_date TEXT NOT NULL,
    due_status_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ATTENDANCE LOGS TABLE (Attendance marked and updated by teacher)
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_subject_id UUID REFERENCES public.class_subjects(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'Present'
);

-- ========================================================
-- SAMPLE SEED DATA INSERTS WITH STABLE UUIDs
-- ========================================================

-- 1. Insert Subjects (1st Step)
INSERT INTO public.subjects (id, subject_code, subject_name, department, year_semester, credits) VALUES
('11111111-1111-1111-1111-111111111101', 'CS-301', 'Data Structures & Algorithms', 'Computer Science & Engineering', '1st Year | 2nd Semester', 4),
('11111111-1111-1111-1111-111111111102', 'CS-304', 'Database Management Systems', 'Computer Science & Engineering', '1st Year | 2nd Semester', 4),
('11111111-1111-1111-1111-111111111103', 'CS-402', 'Artificial Intelligence', 'Computer Science & Engineering', '2nd Year | 4th Semester', 3);

-- 2. Insert Classes (2nd Step)
INSERT INTO public.classes (id, class_name, department, class_section, year_semester, batch_year) VALUES
('22222222-2222-2222-2222-222222222201', 'CSE-A', 'Computer Science & Engineering', 'Section A', '1st Year | 2nd Semester', 'Batch 2024'),
('22222222-2222-2222-2222-222222222202', 'CSE-B', 'Computer Science & Engineering', 'Section B', '1st Year | 2nd Semester', 'Batch 2024'),
('22222222-2222-2222-2222-222222222203', 'CSE-C', 'Computer Science & Engineering', 'Section C', '1st Year | 2nd Semester', 'Batch 2024'),
('22222222-2222-2222-2222-222222222204', 'ECE-A', 'Electronics & Communication', 'Section A', '1st Year | 2nd Semester', 'Batch 2024');

-- Insert Teachers
INSERT INTO public.teachers (id, teacher_code, full_name, department, email, designation) VALUES
('33333333-3333-3333-3333-333333333301', 'T101', 'Dr. Sarah Jenkins', 'Computer Science & Engineering', 'sarah.jenkins@svist.edu', 'Senior Professor'),
('33333333-3333-3333-3333-333333333302', 'T102', 'Prof. Alan Turing', 'Computer Science & Engineering', 'alan.turing@svist.edu', 'Associate Professor');

-- 3. Insert Students (3rd Step)
INSERT INTO public.students (id, student_code, full_name, email, batch_year, year_semester, class_id, class_name, attendance_percentage, teacher_id, cgpa, library_books_due) VALUES
('44444444-4444-4444-4444-444444444401', 'S001', 'Rohit Sharma', 'rohit.sharma@svist.edu', 'Batch 2024', '1st Year | 2nd Semester', '22222222-2222-2222-2222-222222222203', 'CSE-C', 88.00, '33333333-3333-3333-3333-333333333301', 3.88, 2),
('44444444-4444-4444-4444-444444444402', 'S002', 'Aarav Patel', 'aarav.patel@svist.edu', 'Batch 2024', '1st Year | 2nd Semester', '22222222-2222-2222-2222-222222222201', 'CSE-A', 92.50, '33333333-3333-3333-3333-333333333302', 3.75, 1);

-- 4. Insert Class Subjects (4th Step: Assigning Subjects & Teachers to Classes)
INSERT INTO public.class_subjects (id, class_id, subject_id, teacher_id, day_of_week, time_slot, room, status, color) VALUES
('55555555-5555-5555-5555-555555555501', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111101', '33333333-3333-3333-3333-333333333301', 'Today', '10:00 AM - 11:30 AM', 'Lab 402, CS Block', 'In Progress', '#6366F1'),
('55555555-5555-5555-5555-555555555502', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111102', '33333333-3333-3333-3333-333333333302', 'Today', '01:00 PM - 02:30 PM', 'Hall B, Science Complex', 'Upcoming', '#0EA5E9'),
('55555555-5555-5555-5555-555555555503', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', '33333333-3333-3333-3333-333333333301', 'Today', '03:00 PM - 04:30 PM', 'Auditorium 1', 'Upcoming', '#8B5CF6');

-- Insert Notices
INSERT INTO public.notices (title, category, date_label, content, unread, target_class_id) VALUES
('Mid-Semester Examination Schedule Released', 'Academic', '10 mins ago', 'The mid-semester timetable for Fall 2026 is published on the portal.', true, '22222222-2222-2222-2222-222222222203'),
('Annual Tech Fest "HackCampus 2026" Registrations Open', 'Events', '2 hours ago', 'Register your team before Friday for early bird passes.', true, NULL),
('Library Extended Hours During Exam Week', 'Admin', '1 day ago', 'Central library will remain open 24/7 starting next Monday.', false, NULL);

-- Insert Academic Events
INSERT INTO public.academic_events (title, department, event_date, icon, icon_bg) VALUES
('Even Semester Examination', 'All departments', 'May 2 - May 15, 2026', '📅', '#F3E8FF'),
('Campus Recruitment Drive', 'Placement Cell', 'May 5, 2026', '📢', '#FFE4E6'),
('Summer Internship Program', 'Computer Science Department', 'May 25, 2026', '👥', '#DBEAFE');

-- Enable Row Level Security (RLS) & Public Read/Write Policies
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Allow Public SELECT, INSERT, UPDATE on All Tables
CREATE POLICY "Public Manage Classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Subjects" ON public.subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage ClassSubjects" ON public.class_subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Notices" ON public.notices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Events" ON public.academic_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Assignments" ON public.assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

