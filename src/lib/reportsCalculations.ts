import { supabase, isDemoMode } from './supabase';

/**
 * حساب الإحصائيات الحقيقية من قاعدة البيانات أو البيانات التجريبية
 */
export const calculateRealStats = async (organizationId: string) => {
  try {
    if (isDemoMode()) {
      // في Demo Mode نحسب من البيانات المتاحة في المكونات
      // هذه بيانات مؤقتة - يتم تحديثها عند تسجيل حضور أو تسميع
      return {
        totalStudents: 7, // عدد المستخدمين بدور "طالب"
        activeStudents: 5, // الطلاب النشطون
        totalTeachers: 2, // عدد المعلمين
        totalCircles: 4, // عدد الحلقات
        totalRecitations: 0, // سيزيد مع كل تسميع
        totalParts: 0, // سيزيد مع التقدم
        attendanceRate: 0, // سيُحسب من الحضور الفعلي
        progressRate: 0, // معدل التقدم
      };
    }

    // في Production نجلب من Supabase
    const [students, teachers, circles, recitations, attendance, progress] = await Promise.all([
      // عدد الطلاب
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('role', 'student')
        .eq('status', 'active'),
      
      // عدد المعلمين
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('role', 'teacher')
        .eq('status', 'active'),
      
      // عدد الحلقات
      supabase
        .from('circles')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('is_active', true),
      
      // عدد التسميعات
      supabase
        .from('recitations')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId),
      
      // بيانات الحضور
      supabase
        .from('attendance')
        .select('status')
        .eq('organization_id', organizationId),
      
      // بيانات التقدم
      supabase
        .from('student_progress')
        .select('parts_memorized, pages_memorized')
        .eq('organization_id', organizationId),
    ]);

    // حساب معدل الحضور
    const attendanceData = attendance.data || [];
    const presentCount = attendanceData.filter((a: any) => a.status === 'present').length;
    const attendanceRate = attendanceData.length > 0 
      ? Math.round((presentCount / attendanceData.length) * 100) 
      : 0;

    // حساب إجمالي الأجزاء
    const progressData = progress.data || [];
    const totalParts = progressData.reduce((sum: number, p: any) => sum + (p.parts_memorized || 0), 0);

    // حساب معدل التقدم
    const progressRate = progressData.length > 0
      ? Math.round(progressData.reduce((sum: number, p: any) => {
          const progress = ((p.parts_memorized || 0) / 30) * 100;
          return sum + progress;
        }, 0) / progressData.length)
      : 0;

    return {
      totalStudents: students.count || 0,
      activeStudents: students.count || 0,
      totalTeachers: teachers.count || 0,
      totalCircles: circles.count || 0,
      totalRecitations: recitations.count || 0,
      totalParts,
      attendanceRate,
      progressRate,
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return {
      totalStudents: 0,
      activeStudents: 0,
      totalTeachers: 0,
      totalCircles: 0,
      totalRecitations: 0,
      totalParts: 0,
      attendanceRate: 0,
      progressRate: 0,
    };
  }
};

/**
 * حساب بيانات الحضور حسب النوع
 */
export const calculateAttendanceByType = async (organizationId: string) => {
  if (isDemoMode()) {
    // في Demo Mode نرجع بيانات تجريبية
    return [
      { name: 'حاضر', value: 0, percentage: 0, color: '#10b981' },
      { name: 'غائب', value: 0, percentage: 0, color: '#ef4444' },
      { name: 'مستأذن', value: 0, percentage: 0, color: '#f59e0b' },
      { name: 'متأخر', value: 0, percentage: 0, color: '#6366f1' },
    ];
  }

  try {
    const { data } = await supabase
      .from('attendance')
      .select('status')
      .eq('organization_id', organizationId);

    if (!data || data.length === 0) {
      return [
        { name: 'حاضر', value: 0, percentage: 0, color: '#10b981' },
        { name: 'غائب', value: 0, percentage: 0, color: '#ef4444' },
        { name: 'مستأذن', value: 0, percentage: 0, color: '#f59e0b' },
        { name: 'متأخر', value: 0, percentage: 0, color: '#6366f1' },
      ];
    }

    const total = data.length;
    const present = data.filter((a: any) => a.status === 'present').length;
    const absent = data.filter((a: any) => a.status === 'absent').length;
    const excused = data.filter((a: any) => a.status === 'excused').length;
    const late = data.filter((a: any) => a.status === 'late').length;

    return [
      { name: 'حاضر', value: present, percentage: (present / total) * 100, color: '#10b981' },
      { name: 'غائب', value: absent, percentage: (absent / total) * 100, color: '#ef4444' },
      { name: 'مستأذن', value: excused, percentage: (excused / total) * 100, color: '#f59e0b' },
      { name: 'متأخر', value: late, percentage: (late / total) * 100, color: '#6366f1' },
    ];
  } catch (error) {
    console.error('Error calculating attendance by type:', error);
    return [];
  }
};

/**
 * حساب بيانات التسميع حسب النوع
 */
export const calculateRecitationsByType = async (organizationId: string) => {
  if (isDemoMode()) {
    return [
      { name: 'حفظ جديد', value: 0, percentage: 0, color: '#8b5cf6' },
      { name: 'مراجعة', value: 0, percentage: 0, color: '#3b82f6' },
      { name: 'تثبيت', value: 0, percentage: 0, color: '#06b6d4' },
    ];
  }

  try {
    const { data } = await supabase
      .from('recitations')
      .select('type')
      .eq('organization_id', organizationId);

    if (!data || data.length === 0) {
      return [
        { name: 'حفظ جديد', value: 0, percentage: 0, color: '#8b5cf6' },
        { name: 'مراجعة', value: 0, percentage: 0, color: '#3b82f6' },
        { name: 'تثبيت', value: 0, percentage: 0, color: '#06b6d4' },
      ];
    }

    const total = data.length;
    const memorization = data.filter((r: any) => r.type === 'memorization').length;
    const review = data.filter((r: any) => r.type === 'review').length;
    const test = data.filter((r: any) => r.type === 'test').length;

    return [
      { name: 'حفظ جديد', value: memorization, percentage: (memorization / total) * 100, color: '#8b5cf6' },
      { name: 'مراجعة', value: review, percentage: (review / total) * 100, color: '#3b82f6' },
      { name: 'تثبيت', value: test, percentage: (test / total) * 100, color: '#06b6d4' },
    ];
  } catch (error) {
    console.error('Error calculating recitations by type:', error);
    return [];
  }
};

/**
 * تسجيل حدث يؤثر على الإحصائيات (للاستخدام في Demo Mode)
 */
let demoStatsCache = {
  totalRecitations: 0,
  totalParts: 0,
  totalAttendance: 0,
  presentCount: 0,
  lastUpdate: Date.now(),
};

export const recordDemoEvent = (eventType: 'attendance' | 'recitation', data: any) => {
  if (eventType === 'attendance') {
    demoStatsCache.totalAttendance++;
    if (data.status === 'present') {
      demoStatsCache.presentCount++;
    }
  } else if (eventType === 'recitation') {
    demoStatsCache.totalRecitations++;
    if (data.partsCompleted) {
      demoStatsCache.totalParts += data.partsCompleted;
    }
  }
  demoStatsCache.lastUpdate = Date.now();
};

export const getDemoStats = () => {
  return {
    ...demoStatsCache,
    attendanceRate: demoStatsCache.totalAttendance > 0
      ? Math.round((demoStatsCache.presentCount / demoStatsCache.totalAttendance) * 100)
      : 0,
  };
};
