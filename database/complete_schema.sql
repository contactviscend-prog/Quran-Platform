-- ================================================
-- قاعدة بيانات منصة تحفيظ القرآن الكريم - Schema كامل
-- Complete Database Schema for Quran Memorization Platform
-- ================================================

-- تفعيل UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. جدول المؤسسات (Organizations)
-- ================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo TEXT,
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- 2. جدول الملفات الشخصية (Profiles)
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  address TEXT,
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'supervisor', 'teacher', 'student', 'parent')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  student_level VARCHAR(50),
  memorization_progress JSONB DEFAULT '{}',
  specialization TEXT,
  qualifications TEXT[],
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT profiles_organization_email_unique UNIQUE (organization_id, email)
);

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ================================================
-- 3. جدول طلبات الانضمام (Join Requests)
-- ================================================
CREATE TABLE IF NOT EXISTS join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  address TEXT,
  requested_role VARCHAR(20) NOT NULL CHECK (requested_role IN ('teacher', 'student', 'parent')),
  guardian_name VARCHAR(255),
  guardian_phone VARCHAR(20),
  guardian_email VARCHAR(255),
  notes TEXT,
  qualifications TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_join_requests_organization ON join_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);

-- ================================================
-- 4. جدول الحلقات (Circles)
-- ================================================
CREATE TABLE IF NOT EXISTS circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  level VARCHAR(50) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  max_students INTEGER DEFAULT 30,
  schedule JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  location TEXT,
  meeting_days TEXT[],
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT circles_organization_name_unique UNIQUE (organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_circles_organization ON circles(organization_id);
CREATE INDEX IF NOT EXISTS idx_circles_teacher ON circles(teacher_id);
CREATE INDEX IF NOT EXISTS idx_circles_active ON circles(is_active);

-- ================================================
-- 5. جدول التسجيل في الحلقات (Circle Enrollments)
-- ================================================
CREATE TABLE IF NOT EXISTS circle_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
  completion_date TIMESTAMPTZ,
  notes TEXT,
  CONSTRAINT circle_enrollments_unique UNIQUE (circle_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_circle ON circle_enrollments(circle_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON circle_enrollments(student_id);

-- ================================================
-- 6. جدول الحضور (Attendance)
-- ================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT attendance_unique UNIQUE (circle_id, student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_organization ON attendance(organization_id);
CREATE INDEX IF NOT EXISTS idx_attendance_circle ON attendance(circle_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date DESC);

-- ================================================
-- 7. جدول التسميع (Recitations)
-- ================================================
CREATE TABLE IF NOT EXISTS recitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('memorization', 'review', 'test', 'reinforcement', 'oral_test')),
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  surah_name VARCHAR(100) NOT NULL,
  from_ayah INTEGER NOT NULL,
  to_ayah INTEGER NOT NULL,
  grade VARCHAR(20) CHECK (grade IN ('excellent', 'very_good', 'good', 'acceptable', 'needs_improvement')),
  mistakes_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recitations_organization ON recitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_recitations_student ON recitations(student_id);
CREATE INDEX IF NOT EXISTS idx_recitations_teacher ON recitations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_recitations_circle ON recitations(circle_id);
CREATE INDEX IF NOT EXISTS idx_recitations_date ON recitations(date DESC);
CREATE INDEX IF NOT EXISTS idx_recitations_type ON recitations(type);

-- ================================================
-- 8. جدول تقدم الطلاب (Student Progress)
-- ================================================
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parts_memorized INTEGER DEFAULT 0 CHECK (parts_memorized >= 0 AND parts_memorized <= 30),
  pages_memorized INTEGER DEFAULT 0 CHECK (pages_memorized >= 0 AND pages_memorized <= 604),
  surahs_completed INTEGER DEFAULT 0 CHECK (surahs_completed >= 0 AND surahs_completed <= 114),
  current_surah INTEGER CHECK (current_surah BETWEEN 1 AND 114),
  current_ayah INTEGER,
  last_recitation_date DATE,
  total_recitations INTEGER DEFAULT 0,
  average_grade DECIMAL(3,2),
  memorization_details JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT student_progress_unique UNIQUE (organization_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_organization ON student_progress(organization_id);
CREATE INDEX IF NOT EXISTS idx_progress_student ON student_progress(student_id);

-- ================================================
-- 9. جدول الخطط الدراسية (Study Plans)
-- ================================================
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  target_surahs INTEGER[],
  target_pages INTEGER,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_plans_organization ON study_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_student ON study_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_teacher ON study_plans(teacher_id);

-- ================================================
-- 10. جدول التكاليف (Assignments)
-- ================================================
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignment_type VARCHAR(20) CHECK (assignment_type IN ('memorization', 'review', 'reading', 'writing', 'research')),
  surah_number INTEGER CHECK (surah_number BETWEEN 1 AND 114),
  from_ayah INTEGER,
  to_ayah INTEGER,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_organization ON assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_circle ON assignments(circle_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

-- ================================================
-- 11. جدول العلاقات بين الأولياء والطلاب (Parent-Student Links)
-- ================================================
CREATE TABLE IF NOT EXISTS parent_student_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship VARCHAR(50) NOT NULL,
  can_view_progress BOOLEAN DEFAULT true,
  can_view_attendance BOOLEAN DEFAULT true,
  can_receive_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT parent_student_unique UNIQUE (parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_links_parent ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_student ON parent_student_links(student_id);

-- ================================================
-- 12. جدول الإشعارات (Notifications)
-- ================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_organization ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ================================================
-- 13. جدول سجل التدقيق (Audit Logs) - جديد!
-- ================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  target_name VARCHAR(255),
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ================================================
-- Row Level Security (RLS) Policies
-- ================================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE recitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- سياسات Organizations
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- سياسات Profiles
CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles in their organization"
  ON profiles FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- سياسات Circles
CREATE POLICY "Users can view circles in their organization"
  ON circles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers and admins can manage circles"
  ON circles FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor', 'teacher')
    )
  );

-- سياسات Attendance
CREATE POLICY "Users can view attendance in their organization"
  ON attendance FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers can record attendance"
  ON attendance FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor', 'teacher')
    )
  );

-- سياسات Recitations
CREATE POLICY "Users can view recitations in their organization"
  ON recitations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers can record recitations"
  ON recitations FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- سياسات Audit Logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ================================================
-- Functions & Triggers
-- ================================================

-- Function لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers لـ updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_circles_updated_at BEFORE UPDATE ON circles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recitations_updated_at BEFORE UPDATE ON recitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON student_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function لحساب تقدم الطالب تلقائياً
CREATE OR REPLACE FUNCTION update_student_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث تقدم الطالب عند إضافة تسميع جديد
  IF (TG_OP = 'INSERT' AND NEW.type = 'memorization') THEN
    INSERT INTO student_progress (
      organization_id,
      student_id,
      last_recitation_date,
      total_recitations
    )
    VALUES (
      NEW.organization_id,
      NEW.student_id,
      NEW.date,
      1
    )
    ON CONFLICT (organization_id, student_id) 
    DO UPDATE SET
      last_recitation_date = NEW.date,
      total_recitations = student_progress.total_recitations + 1,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_student_progress
  AFTER INSERT ON recitations
  FOR EACH ROW
  EXECUTE FUNCTION update_student_progress();

-- ================================================
-- Initial Data - مؤسسة تجريبية
-- ================================================

-- إضافة مؤسسة تجريبية
INSERT INTO organizations (id, name, slug, description, is_active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'مركز النور لتحفيظ القرآن', 'alnoor', 'مركز متخصص في تعليم القرآن الكريم وعلومه', true)
ON CONFLICT (slug) DO NOTHING;

-- ================================================
-- Comments للتوثيق
-- ================================================

COMMENT ON TABLE organizations IS 'جدول المؤسسات - يحتوي على معلومات المراكز والجمعيات';
COMMENT ON TABLE profiles IS 'جدول الملفات الشخصية للمستخدمين - مدراء، معلمين، طلاب، أولياء أمور';
COMMENT ON TABLE circles IS 'جدول الحلقات الدراسية';
COMMENT ON TABLE attendance IS 'جدول الحضور والغياب';
COMMENT ON TABLE recitations IS 'جدول التسميع (حفظ، مراجعة، اختبار)';
COMMENT ON TABLE student_progress IS 'جدول تقدم الطلاب في الحفظ';
COMMENT ON TABLE audit_logs IS 'سجل التدقيق - تتبع جميع التغييرات والإجراءات المهمة';

-- ================================================
-- انتهى Schema
-- ================================================

-- ملاحظة: لإنشاء مدير للنظام، استخدم الأمر التالي بعد إنشاء المستخدم في Supabase Auth:
/*
INSERT INTO profiles (id, organization_id, full_name, email, role, status)
VALUES (
  'USER_UUID_FROM_AUTH',
  '00000000-0000-0000-0000-000000000001',
  'اسم المدير',
  'admin@example.com',
  'admin',
  'active'
);
*/
