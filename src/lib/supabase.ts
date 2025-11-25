import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const getEnvVar = (key: string): string => {
  // Try import.meta.env first (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || '';
  }
  // Fallback to process.env (Node.js)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  // If neither works, return empty string
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || '';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || '';

// Check if we're in demo mode
export const isDemoMode = (): boolean => {
  return !supabaseUrl || !supabaseAnonKey;
};

// Log info about connection
if (isDemoMode()) {
  console.info('📝 المنصة تعمل في وضع العرض التوضيحي');
  console.info('لتفعيل الاتصال الحقيقي بقاعدة البيانات:');
  console.info('1. قم بتوصيل مشروع Supabase الخاص بك');
  console.info('2. أضف متغيرات البيئة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client with demo mode handling
const createSupabaseClient = () => {
  // In demo mode, use dummy credentials to prevent network errors
  const url = supabaseUrl || 'https://demo.supabase.co';
  const key = supabaseAnonKey || 'demo-key';

  const client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  // Override fetch in demo mode to prevent actual network requests
  if (isDemoMode()) {
    const originalFetch = client.fetch;
    client.fetch = async (...args: any[]) => {
      console.warn('⚠️ محاولة اتصال بقاعدة البيانات في وضع العرض التوضيحي - تم الحظر');
      throw new Error('قاعدة البيانات غير متاحة في وضع العرض التوضيحي');
    };
  }

  return client;
};

export const supabase = createSupabaseClient();

// ==========================================
// Types
// ==========================================

export type UserRole = 'admin' | 'supervisor' | 'teacher' | 'student' | 'parent';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type RecitationType = 'memorization' | 'review' | 'test';
export type RecitationGrade = 'excellent' | 'very_good' | 'good' | 'acceptable' | 'needs_improvement';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active: boolean;
  settings?: any;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female';
  address?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  student_level?: string;
  memorization_progress?: any;
  specialization?: string;
  qualifications?: string[];
  created_at: string;
  updated_at: string;
  organization?: Organization;
}

export interface JoinRequest {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  gender?: 'male' | 'female';
  address?: string;
  requested_role: UserRole;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  notes?: string;
  qualifications?: string;
  status: RequestStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  organization?: Organization;
}

export interface Circle {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  teacher_id?: string;
  level: string;
  max_students: number;
  schedule?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  teacher?: Profile;
  enrollments_count?: number;
}

export interface Attendance {
  id: string;
  organization_id: string;
  circle_id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  recorded_by?: string;
  created_at: string;
  student?: Profile;
  circle?: Circle;
}

export interface Recitation {
  id: string;
  organization_id: string;
  student_id: string;
  teacher_id: string;
  circle_id: string;
  date: string;
  type: RecitationType;
  surah_number: number;
  surah_name: string;
  from_ayah: number;
  to_ayah: number;
  grade?: RecitationGrade;
  mistakes_count: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  student?: Profile;
  teacher?: Profile;
  circle?: Circle;
}

export interface Notification {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// ==========================================
// Helper Functions
// ==========================================

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    admin: 'مدير',
    supervisor: 'مشرف',
    teacher: 'معلم',
    student: 'طالب',
    parent: 'ولي أمر',
  };
  return labels[role];
};

export const getStatusLabel = (status: UserStatus): string => {
  const labels: Record<UserStatus, string> = {
    active: 'نشط',
    inactive: 'غير نشط',
    pending: 'قيد المراجعة',
    suspended: 'معلق',
  };
  return labels[status];
};

export const getAttendanceLabel = (status: AttendanceStatus): string => {
  const labels: Record<AttendanceStatus, string> = {
    present: 'حاضر',
    absent: 'غائب',
    late: 'متأخر',
    excused: 'غياب بعذر',
  };
  return labels[status];
};

export const getGradeLabel = (grade: RecitationGrade): string => {
  const labels: Record<RecitationGrade, string> = {
    excellent: 'ممتاز',
    very_good: 'جيد جداً',
    good: 'جيد',
    acceptable: 'مقبول',
    needs_improvement: '��حتاج تحسين',
  };
  return labels[grade];
};

export const getLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
  };
  return labels[level] || level;
};
