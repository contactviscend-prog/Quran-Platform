import { Organization, Profile, Circle, UserRole } from './supabase';

// Mock Organizations
export const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'مركز النور لتحفيظ القرآن',
    slug: 'alnoor',
    logo: undefined,
    description: 'مركز متخصص في تعليم القرآن الكريم وعلومه',
    contact_email: 'info@alnoor.example.com',
    contact_phone: '0501234567',
    address: 'الرياض، المملكة العربية السعودية',
    is_active: true,
    settings: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'دار الهدى للتحفيظ',
    slug: 'darhuda',
    logo: undefined,
    description: 'نسعى لخدمة كتاب الله وتعليمه للجميع',
    contact_email: 'info@darhuda.example.com',
    contact_phone: '0507654321',
    address: 'جدة، المملكة العربية السعودية',
    is_active: true,
    settings: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'جمعية البر الخيرية',
    slug: 'albirr',
    logo: undefined,
    description: 'جمعية خيرية تهتم بتحفيظ القرآن الكريم',
    contact_email: 'info@albirr.example.com',
    contact_phone: '0509876543',
    address: 'الدمام، المملكة العربية السعودية',
    is_active: true,
    settings: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Mock Users for Demo
export const mockUsers: { [key: string]: { email: string; password: string; profile: Profile } } = {
  'admin@demo.com': {
    email: 'admin@demo.com',
    password: 'demo123',
    profile: {
      id: 'user-1',
      organization_id: '1',
      full_name: 'أحمد المدير',
      phone: '0501234567',
      role: 'admin' as UserRole,
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      organization: mockOrganizations[0],
    },
  },
  'supervisor@demo.com': {
    email: 'supervisor@demo.com',
    password: 'demo123',
    profile: {
      id: 'user-2',
      organization_id: '1',
      full_name: 'محمد المشرف',
      phone: '0501234568',
      role: 'supervisor' as UserRole,
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      organization: mockOrganizations[0],
    },
  },
  'teacher@demo.com': {
    email: 'teacher@demo.com',
    password: 'demo123',
    profile: {
      id: 'user-3',
      organization_id: '1',
      full_name: 'خالد المعلم',
      phone: '0501234569',
      role: 'teacher' as UserRole,
      status: 'active',
      specialization: 'تحفيظ القرآن الكريم',
      qualifications: ['إجازة في القرآن الكريم', 'دبلوم تربوي'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      organization: mockOrganizations[0],
    },
  },
  'student@demo.com': {
    email: 'student@demo.com',
    password: 'demo123',
    profile: {
      id: 'user-4',
      organization_id: '1',
      full_name: 'عبدالله الطالب',
      phone: '0501234570',
      date_of_birth: '2010-01-01',
      role: 'student' as UserRole,
      status: 'active',
      student_level: 'متوسط',
      memorization_progress: {
        total_pages: 120,
        total_surahs: 15,
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      organization: mockOrganizations[0],
    },
  },
  'parent@demo.com': {
    email: 'parent@demo.com',
    password: 'demo123',
    profile: {
      id: 'user-5',
      organization_id: '1',
      full_name: 'عبدالرحمن ولي الأمر',
      phone: '0501234571',
      role: 'parent' as UserRole,
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      organization: mockOrganizations[0],
    },
  },
};

// Mock Circles
export const mockCircles: Circle[] = [
  {
    id: 'circle-1',
    organization_id: '1',
    name: 'حلقة المبتدئين',
    description: 'حلقة للطلاب المبتدئين في حفظ القرآن',
    teacher_id: 'user-3',
    level: 'beginner',
    max_students: 10,
    is_active: true,
    schedule: {
      days: ['Sunday', 'Tuesday', 'Thursday'],
      time: '16:00',
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    enrollments_count: 7,
  },
  {
    id: 'circle-2',
    organization_id: '1',
    name: 'حلقة المتوسطين',
    description: 'حلقة للطلاب المتوسطين',
    teacher_id: 'user-3',
    level: 'intermediate',
    max_students: 8,
    is_active: true,
    schedule: {
      days: ['Monday', 'Wednesday'],
      time: '17:00',
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    enrollments_count: 6,
  },
];

// Store for demo mode session
let demoSession: { user: any; profile: Profile; organization: Organization } | null = null;

export const setDemoSession = (email: string, organizationId: string) => {
  const user = mockUsers[email];
  const organization = mockOrganizations.find(org => org.id === organizationId);
  
  if (user && organization) {
    demoSession = {
      user: { id: user.profile.id, email: user.email },
      profile: { ...user.profile, organization },
      organization,
    };
    // Store in localStorage for persistence
    localStorage.setItem('demo_session', JSON.stringify(demoSession));
  }
};

export const getDemoSession = () => {
  if (demoSession) return demoSession;
  
  // Try to restore from localStorage
  const stored = localStorage.getItem('demo_session');
  if (stored) {
    try {
      demoSession = JSON.parse(stored);
      return demoSession;
    } catch (e) {
      localStorage.removeItem('demo_session');
    }
  }
  
  return null;
};

export const clearDemoSession = () => {
  demoSession = null;
  localStorage.removeItem('demo_session');
};
