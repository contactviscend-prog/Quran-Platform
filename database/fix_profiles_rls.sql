-- ================================================
-- Fix Profiles RLS Infinite Recursion
-- ================================================

-- حذف السياسات القديمة التي تسبب infinite recursion
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;

-- إضافة سياسة جديدة: المستخدم يرى profile نفسه أولاً
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- سياسة لرؤية المستخدمين الآخرين في نفس المؤسسة
CREATE POLICY "Users can view other profiles in their organization"
  ON profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1
    )
  );

-- السياسات الأخرى تبقى كما هي (admins)
-- UPDATE policy بقي كما هو
-- Admin policy بقي كما هو
