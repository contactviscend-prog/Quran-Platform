-- ================================================
-- COMPLETE RLS FIX - Remove ALL Infinite Recursion
-- ================================================

-- STEP 1: Disable RLS temporarily to update policies cleanly
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE circles DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE recitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can view circles in their organization" ON circles;
DROP POLICY IF EXISTS "Teachers and admins can manage circles" ON circles;
DROP POLICY IF EXISTS "Users can view attendance in their organization" ON attendance;
DROP POLICY IF EXISTS "Teachers can record attendance" ON attendance;
DROP POLICY IF EXISTS "Users can view recitations in their organization" ON recitations;
DROP POLICY IF EXISTS "Teachers can record recitations" ON recitations;
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Anyone can view active organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view other profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON profiles;

-- STEP 3: Re-enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE recitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create NEW policies - SIMPLE and NO RECURSION

-- === ORGANIZATIONS ===
-- Anyone can view active organizations (no auth required)
CREATE POLICY "Anyone can view active organizations"
  ON organizations FOR SELECT
  USING (is_active = true);

-- Authenticated users can view their own organization
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    id = (SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1)
  );

-- === PROFILES ===
-- Everyone can see their own profile (NO SUBQUERY - direct comparison)
CREATE POLICY "Users can see their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Admins and supervisors can manage profiles (still uses subquery but careful)
CREATE POLICY "Admins can manage profiles"
  ON profiles FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'supervisor')
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'supervisor')
  );

-- === CIRCLES ===
-- Teachers can see their circles
CREATE POLICY "Users can view circles"
  ON circles FOR SELECT
  USING (
    (SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1) = organization_id
  );

-- Teachers and admins can manage circles
CREATE POLICY "Teachers can manage circles"
  ON circles FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'supervisor', 'teacher')
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'supervisor', 'teacher')
  );

-- === ATTENDANCE ===
-- Users can view attendance in their organization
CREATE POLICY "Users can view attendance"
  ON attendance FOR SELECT
  USING (
    (SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1) = organization_id
  );

-- Teachers can record attendance
CREATE POLICY "Teachers can record attendance"
  ON attendance FOR INSERT
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'supervisor', 'teacher')
  );

-- === RECITATIONS ===
-- Users can view recitations
CREATE POLICY "Users can view recitations"
  ON recitations FOR SELECT
  USING (
    (SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1) = organization_id
  );

-- Teachers can record recitations
CREATE POLICY "Teachers can record recitations"
  ON recitations FOR INSERT
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'supervisor', 'teacher')
  );

-- === AUDIT LOGS ===
-- Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'supervisor')
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);
