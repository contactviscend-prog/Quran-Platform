import { UserRole } from './supabase';

// ==========================================
// نظام الصلاحيات والقدرات
// ==========================================

export type Permission = 
  // إدارة المؤسسة
  | 'manage_organization'
  | 'view_organization_settings'
  | 'edit_organization_settings'
  
  // إدارة المستخدمين
  | 'view_users'
  | 'add_users'
  | 'edit_users'
  | 'delete_users'
  | 'suspend_users'
  | 'approve_requests'
  
  // إدارة الحلقات
  | 'view_circles'
  | 'add_circles'
  | 'edit_circles'
  | 'delete_circles'
  | 'assign_teachers'
  | 'enroll_students'
  
  // الحضور والغياب
  | 'view_attendance'
  | 'record_attendance'
  | 'edit_attendance'
  | 'view_own_attendance'
  | 'view_children_attendance'
  
  // التسميع والحفظ
  | 'view_recitations'
  | 'record_recitations'
  | 'edit_recitations'
  | 'view_own_recitations'
  | 'view_children_recitations'
  
  // التقارير
  | 'view_reports'
  | 'view_detailed_reports'
  | 'export_reports'
  | 'view_own_reports'
  | 'view_children_reports'
  
  // الإشعارات
  | 'send_notifications'
  | 'view_notifications'
  
  // الدعم الفني
  | 'view_support_tickets'
  | 'manage_support_tickets'
  | 'create_support_ticket';

// تعريف صلاحيات كل دور
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    // جميع الصلاحيات
    'manage_organization',
    'view_organization_settings',
    'edit_organization_settings',
    
    'view_users',
    'add_users',
    'edit_users',
    'delete_users',
    'suspend_users',
    'approve_requests',
    
    'view_circles',
    'add_circles',
    'edit_circles',
    'delete_circles',
    'assign_teachers',
    'enroll_students',
    
    'view_attendance',
    'record_attendance',
    'edit_attendance',
    
    'view_recitations',
    'record_recitations',
    'edit_recitations',
    
    'view_reports',
    'view_detailed_reports',
    'export_reports',
    
    'send_notifications',
    'view_notifications',
    
    'view_support_tickets',
    'manage_support_tickets',
    'create_support_ticket',
  ],
  
  supervisor: [
    // صلاحيات المشرف
    'view_organization_settings',
    
    'view_users',
    'add_users',
    'edit_users',
    'approve_requests',
    
    'view_circles',
    'add_circles',
    'edit_circles',
    'assign_teachers',
    'enroll_students',
    
    'view_attendance',
    'record_attendance',
    'edit_attendance',
    
    'view_recitations',
    'record_recitations',
    
    'view_reports',
    'view_detailed_reports',
    'export_reports',
    
    'send_notifications',
    'view_notifications',
    
    'view_support_tickets',
    'create_support_ticket',
  ],
  
  teacher: [
    // صلاحيات المعلم
    'view_circles',
    
    'view_attendance',
    'record_attendance',
    
    'view_recitations',
    'record_recitations',
    
    'view_reports',
    'view_own_reports',
    
    'view_notifications',
    'create_support_ticket',
  ],
  
  student: [
    // صلاحيات الطالب
    'view_circles',
    'view_own_attendance',
    'view_own_recitations',
    'view_own_reports',
    'view_notifications',
    'create_support_ticket',
  ],
  
  parent: [
    // صلاحيات ولي الأمر
    'view_circles',
    'view_children_attendance',
    'view_children_recitations',
    'view_children_reports',
    'view_notifications',
    'create_support_ticket',
  ],
};

// ==========================================
// دوال مساعدة للتحقق من الصلاحيات
// ==========================================

/**
 * التحقق من صلاحية معينة للمستخدم
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[userRole];
  return permissions.includes(permission);
}

/**
 * التحقق من عدة صلاحيات (يجب أن يملك جميعها)
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * التحقق من عدة صلاحيات (يكفي أن يملك واحدة منها)
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * الحصول على جميع صلاحيات دور معين
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return rolePermissions[userRole];
}

/**
 * التحقق من كون المستخدم مدير أو مشرف
 */
export function isAdminOrSupervisor(userRole: UserRole): boolean {
  return userRole === 'admin' || userRole === 'supervisor';
}

/**
 * التحقق من كون المستخدم مدير
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin';
}

/**
 * التحقق من كون المستخدم معلم
 */
export function isTeacher(userRole: UserRole): boolean {
  return userRole === 'teacher';
}

/**
 * التحقق من كون المستخدم طالب
 */
export function isStudent(userRole: UserRole): boolean {
  return userRole === 'student';
}

/**
 * التحقق من كون المستخدم ولي أمر
 */
export function isParent(userRole: UserRole): boolean {
  return userRole === 'parent';
}

// ==========================================
// قدرات خاصة بكل دور (Abilities)
// ==========================================

export interface RoleAbilities {
  canManageOrganization: boolean;
  canManageUsers: boolean;
  canManageCircles: boolean;
  canRecordAttendance: boolean;
  canRecordRecitations: boolean;
  canViewReports: boolean;
  canExportReports: boolean;
  canSendNotifications: boolean;
  canApproveRequests: boolean;
}

/**
 * الحصول على قدرات دور معين
 */
export function getRoleAbilities(userRole: UserRole): RoleAbilities {
  return {
    canManageOrganization: hasPermission(userRole, 'manage_organization'),
    canManageUsers: hasAllPermissions(userRole, ['view_users', 'add_users', 'edit_users']),
    canManageCircles: hasAllPermissions(userRole, ['view_circles', 'add_circles', 'edit_circles']),
    canRecordAttendance: hasPermission(userRole, 'record_attendance'),
    canRecordRecitations: hasPermission(userRole, 'record_recitations'),
    canViewReports: hasPermission(userRole, 'view_reports'),
    canExportReports: hasPermission(userRole, 'export_reports'),
    canSendNotifications: hasPermission(userRole, 'send_notifications'),
    canApproveRequests: hasPermission(userRole, 'approve_requests'),
  };
}

// ==========================================
// مكونات UI للتحكم بالعرض حسب الصلاحيات
// ==========================================

interface PermissionGuardProps {
  userRole: UserRole;
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * مكون لعرض المحتوى فقط إذا كان لدى المستخدم الصلاحية المطلوبة
 */
export function PermissionGuard({ userRole, permission, children, fallback = null }: PermissionGuardProps) {
  if (hasPermission(userRole, permission)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}

interface RoleGuardProps {
  userRole: UserRole;
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * مكون لعرض المحتوى فقط للأدوار المسموحة
 */
export function RoleGuard({ userRole, allowedRoles, children, fallback = null }: RoleGuardProps) {
  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}
