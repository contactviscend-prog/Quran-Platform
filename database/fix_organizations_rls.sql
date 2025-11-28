-- ================================================
-- Fix Organizations RLS Policy
-- Allow viewing public organizations without authentication
-- ================================================

-- أولاً، حذف السياسة القديمة
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;

-- إضافة سياسة جديدة تسمح برؤية جميع المؤسسات النشطة للجميع
CREATE POLICY "Anyone can view active organizations"
  ON organizations FOR SELECT
  USING (is_active = true);

-- إذا كنت تريد السماح للمستخدمين المسجلين برؤية م��سستهم حتى لو لم تكن نشطة
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );
