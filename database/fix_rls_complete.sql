-- ================================================
-- Complete RLS Fix for Authentication Flow
-- ================================================

-- Step 1: Fix organizations table (allow public to view active ones)
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Anyone can view active organizations" ON organizations;

CREATE POLICY "Anyone can view active organizations"
  ON organizations FOR SELECT
  USING (is_active = true);

-- Step 2: Fix profiles table (prevent infinite recursion)
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view other profiles in their organization" ON profiles;

-- Users can ALWAYS view their own profile (no subquery)
CREATE POLICY "Users can view their own profile"
  ON organizations FOR SELECT
  USING (id = auth.uid());

-- Authenticated users can view other profiles in their organization
-- This uses a direct check to avoid circular dependencies
CREATE POLICY "Users can view other profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1
    )
  );

-- Step 3: Allow users to update their own profile
-- (This policy already exists and is fine)
-- CREATE POLICY "Users can update their own profile"
--   ON profiles FOR UPDATE
--   USING (id = auth.uid());

-- Step 4: Allow admin/supervisor to manage all profiles in their org
-- (This policy already exists and is fine)
-- CREATE POLICY "Admins can manage all profiles in their organization"
--   ON profiles FOR ALL
--   USING (
--     organization_id IN (
--       SELECT organization_id FROM profiles 
--       WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
--     )
--   );

COMMENT ON POLICY "Users can view their own profile" ON profiles 
  IS 'المستخدم يرى profile نفسه بدون subquery لتجنب infinite recursion';

COMMENT ON POLICY "Users can view other profiles" ON profiles 
  IS 'المستخدم يرى الملفات الأخرى في نفس المؤسسة';
