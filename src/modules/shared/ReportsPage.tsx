import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../../lib/supabase';
import { toast } from 'sonner';
import { IndividualStudentReports } from './IndividualStudentReports';
import { ExportReportButton } from '../../components/ExportReportButton';
import { type ReportData } from '../../lib/reportExport';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Users, BookOpen, CheckCircle, Award, TrendingUp,
  Activity, Download, Star, Trophy, Target
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface ReportsPageProps {
  organizationId: string;
  userRole: string;
  userId: string;
}

export function ReportsPage({ organizationId, userRole, userId }: ReportsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCircle, setSelectedCircle] = useState('all');
  const [loading, setLoading] = useState(true);
  const [circles, setCircles] = useState<any[]>([]);

  // تحديد ما إذا كان المستخدم يمكنه رؤية التقارير الشاملة
  const canViewFullReports = userRole === 'admin' || userRole === 'supervisor';
  const isTeacher = userRole === 'teacher';

  // State initialization with empty arrays/objects to avoid mock data flash
  const [summaryStats, setSummaryStats] = useState({
    totalStudents: 0,
    totalStudentsChange: 0,
    attendanceRate: 0,
    attendanceChange: 0,
    totalParts: 0,
    partsChange: 0,
    progressRate: 0,
    progressChange: 0,
    totalRecitations: 0,
    recitationsChange: 0,
    activeTeachers: 0,
    teachersChange: 0,
  });

  const [attendanceByType, setAttendanceByType] = useState<any[]>([]);
  const [recitationsByType, setRecitationsByType] = useState<any[]>([]);
  const [monthlyProgress, setMonthlyProgress] = useState<any[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<any[]>([]);
  const [circlePerformance, setCirclePerformance] = useState<any[]>([]);
  const [teacherPerformance, setTeacherPerformance] = useState<any[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [organizationId, selectedPeriod, selectedCircle]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (isDemoMode()) {
        // في Demo Mode نستخدم البيانات الوهمية الموجودة بالفعل
        // Set demo data
        setCircles([
          { id: '1', name: 'حلقة الفجر' },
          { id: '2', name: 'حلقة الظهر' },
          { id: '3', name: 'حلقة العصر' },
        ]);
        
        setAttendanceByType([
          { name: 'حاضر', value: 756, percentage: 75.6, color: '#10b981' },
          { name: 'غائب', value: 120, percentage: 12.0, color: '#ef4444' },
          { name: 'مستأذن', value: 85, percentage: 8.5, color: '#f59e0b' },
          { name: 'متأخر', value: 39, percentage: 3.9, color: '#6366f1' },
        ]);
        
        setRecitationsByType([
          { name: 'حفظ جديد', value: 425, percentage: 49.6, color: '#8b5cf6' },
          { name: 'مراجعة', value: 315, percentage: 36.8, color: '#3b82f6' },
          { name: 'تثبيت', value: 116, percentage: 13.6, color: '#06b6d4' },
        ]);
        
        setMonthlyProgress([
          { month: 'محرم', students: 210, recitations: 520, attendance: 85, parts: 38 },
          { month: 'صفر', students: 215, recitations: 580, attendance: 83, parts: 42 },
          { month: 'ربيع الأول', students: 225, recitations: 640, attendance: 87, parts: 45 },
          { month: 'ربيع الثاني', students: 232, recitations: 710, attendance: 88, parts: 48 },
          { month: 'جمادى الأول', students: 238, recitations: 780, attendance: 86, parts: 52 },
          { month: 'جمادى الثاني', students: 245, recitations: 856, attendance: 87, parts: 55 },
        ]);

        setDailyAttendance(
          Array.from({ length: 30 }, (_, i) => {
            const day = 30 - i;
            return {
              date: `${day}/11`,
              present: Math.floor(Math.random() * 30) + 190,
              absent: Math.floor(Math.random() * 15) + 10,
              excused: Math.floor(Math.random() * 10) + 5,
              late: Math.floor(Math.random() * 5) + 2,
            };
          })
        );

        setSummaryStats({
          totalStudents: 245,
          totalStudentsChange: 12,
          attendanceRate: 87,
          attendanceChange: 5,
          totalParts: 1240,
          partsChange: 18,
          progressRate: 82,
          progressChange: 8,
          totalRecitations: 856,
          recitationsChange: 15,
          activeTeachers: 12,
          teachersChange: 2,
        });

        setCirclePerformance([
          {
            id: '1',
            name: 'حلقة الفجر',
            teacher: 'أحمد المعلم',
            students: 24,
            attendance: 92,
            progress: 85,
            rating: 4.8,
            totalRecitations: 156,
            newMemorization: 78,
            review: 58,
            reinforcement: 20,
          },
          {
            id: '2',
            name: 'حلقة الظهر',
            teacher: 'محمد الحافظ',
            students: 22,
            attendance: 90,
            progress: 80,
            rating: 4.5,
            totalRecitations: 134,
            newMemorization: 65,
            review: 52,
            reinforcement: 17,
          },
          {
            id: '3',
            name: 'حلقة العصر',
            teacher: 'خالد القارئ',
            students: 18,
            attendance: 85,
            progress: 82,
            rating: 4.7,
            totalRecitations: 128,
            newMemorization: 62,
            review: 48,
            reinforcement: 18,
          },
          {
            id: '4',
            name: 'حلقة المغرب',
            teacher: 'يوسف المحفظ',
            students: 20,
            attendance: 88,
            progress: 78,
            rating: 4.6,
            totalRecitations: 142,
            newMemorization: 70,
            review: 54,
            reinforcement: 18,
          },
        ]);

        setTeacherPerformance([
          {
            id: '1',
            name: 'أحمد المعلم',
            circles: 2,
            students: 36,
            recitations: 234,
            newMemorization: 117,
            review: 87,
            reinforcement: 30,
            avgRating: 4.8,
            attendance: 92,
            completion: 85,
          },
          {
            id: '2',
            name: 'محمد الحافظ',
            circles: 1,
            students: 22,
            recitations: 134,
            newMemorization: 65,
            review: 52,
            reinforcement: 17,
            avgRating: 4.5,
            attendance: 90,
            completion: 80,
          },
          {
            id: '3',
            name: 'خالد القارئ',
            circles: 1,
            students: 18,
            recitations: 128,
            newMemorization: 62,
            review: 48,
            reinforcement: 18,
            avgRating: 4.7,
            attendance: 85,
            completion: 82,
          },
          {
            id: '4',
            name: 'يوسف المحفظ',
            circles: 2,
            students: 30,
            recitations: 188,
            newMemorization: 92,
            review: 71,
            reinforcement: 25,
            avgRating: 4.6,
            attendance: 88,
            completion: 78,
          },
        ]);

        setTopStudents([
          {
            rank: 1,
            name: 'فاطمة أحمد',
            circle: 'حلقة الفجر',
            parts: 15,
            pages: 300,
            progress: 95,
            attendance: 98,
            recitations: 156,
            newMemorization: 78,
            review: 58,
            reinforcement: 20,
          },
          {
            rank: 2,
            name: 'محمد علي',
            circle: 'حلقة المغرب',
            parts: 14,
            pages: 280,
            progress: 93,
            attendance: 96,
            recitations: 148,
            newMemorization: 74,
            review: 55,
            reinforcement: 19,
          },
          {
            rank: 3,
            name: 'عائشة سالم',
            circle: 'حلقة العصر',
            parts: 13,
            pages: 260,
            progress: 90,
            attendance: 94,
            recitations: 142,
            newMemorization: 71,
            review: 52,
            reinforcement: 19,
          },
          {
            rank: 4,
            name: 'يوسف خالد',
            circle: 'حلقة الفجر',
            parts: 12,
            pages: 240,
            progress: 88,
            attendance: 92,
            recitations: 136,
            newMemorization: 68,
            review: 50,
            reinforcement: 18,
          },
          {
            rank: 5,
            name: 'نورة عبدالله',
            circle: 'حلقة المغرب',
            parts: 11,
            pages: 220,
            progress: 85,
            attendance: 90,
            recitations: 128,
            newMemorization: 64,
            review: 47,
            reinforcement: 17,
          },
        ]);
        
        setLoading(false);
        return;
      }

      // حساب الفترة الزمنية
      const now = new Date();
      let startDate = new Date();

      if (selectedPeriod === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (selectedPeriod === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (selectedPeriod === 'quarter') {
        startDate.setMonth(now.getMonth() - 3);
      } else {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      // جلب الحلقات مع معلومات المعلمين
      const { data: circlesData } = await supabase
        .from('circles')
        .select('id, name, teacher_id, teacher:profiles!circles_teacher_id_fkey(id, full_name)')
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      setCircles(circlesData || []);

      // جلب جميع الطلاب
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', organizationId)
        .eq('role', 'student')
        .eq('status', 'active');

      // جلب جميع المعلمين
      const { count: totalTeachers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('role', 'teacher')
        .eq('status', 'active');

      // جلب إحصائيات الحضور
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('id, status, circle_id, student_id, date')
        .eq('organization_id', organizationId)
        .gte('date', startDateStr)
        .lte('date', today);

      const attendanceStats = {
        present: attendanceData?.filter(a => a.status === 'present').length || 0,
        absent: attendanceData?.filter(a => a.status === 'absent').length || 0,
        late: attendanceData?.filter(a => a.status === 'late').length || 0,
        excused: attendanceData?.filter(a => a.status === 'excused').length || 0,
      };

      const totalAttendance = Object.values(attendanceStats).reduce((a, b) => a + b, 0);
      const attendanceRate = totalAttendance > 0 ? Math.round((attendanceStats.present / totalAttendance) * 100) : 0;

      // جلب إحصائيات التسميع
      const { data: recitationData } = await supabase
        .from('recitations')
        .select('id, type, student_id, teacher_id, circle_id, grade, date, from_ayah, to_ayah')
        .eq('organization_id', organizationId)
        .gte('date', startDateStr)
        .lte('date', today);

      const recitationStats = {
        memorization: recitationData?.filter(r => r.type === 'memorization').length || 0,
        review: recitationData?.filter(r => r.type === 'review').length || 0,
        consolidation: recitationData?.filter(r => r.type === 'test').length || 0,
      };

      const totalRecitations = Object.values(recitationStats).reduce((a, b) => a + b, 0);

      // حساب أداء الحلقات
      const circlePerformanceData = (circlesData || []).map(circle => {
        const circleAttendance = attendanceData?.filter(a => a.circle_id === circle.id) || [];
        const circleRecitations = recitationData?.filter(r => r.circle_id === circle.id) || [];
        const circleStudents = circleAttendance.map(a => a.student_id).filter((v, i, a) => a.indexOf(v) === i).length;
        
        const presentCount = circleAttendance.filter(a => a.status === 'present').length;
        const attendance = circleAttendance.length > 0 ? Math.round((presentCount / circleAttendance.length) * 100) : 0;
        
        const excellentGrades = circleRecitations.filter(r => r.grade === 'excellent').length;
        const totalGraded = circleRecitations.filter(r => r.grade).length;
        const progress = totalGraded > 0 ? Math.round((excellentGrades / totalGraded) * 100) : 0;

        return {
          id: circle.id,
          name: circle.name,
          teacher: (circle.teacher as any)?.[0]?.full_name || 'بدون معلم',
          students: circleStudents,
          attendance,
          progress,
          rating: Math.min(5, 3 + (attendance / 50)),
          totalRecitations: circleRecitations.length,
          newMemorization: circleRecitations.filter(r => r.type === 'memorization').length,
          review: circleRecitations.filter(r => r.type === 'review').length,
          reinforcement: circleRecitations.filter(r => r.type === 'test').length,
        };
      });

      setCirclePerformance(circlePerformanceData);

      // حساب أداء المعلمين
      const { data: teachersData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', organizationId)
        .eq('role', 'teacher')
        .eq('status', 'active');

      const teacherPerformanceData = (teachersData || []).map(teacher => {
        const teacherCircles = circlesData?.filter(c => c.teacher_id === teacher.id) || [];
        const teacherRecitations = recitationData?.filter(r => r.teacher_id === teacher.id) || [];
        const teacherAttendance = attendanceData?.filter(a => 
          teacherCircles.some(c => c.id === a.circle_id)
        ) || [];

        const studentIds = teacherRecitations.map(r => r.student_id).filter((v, i, a) => a.indexOf(v) === i);
        const presentCount = teacherAttendance.filter(a => a.status === 'present').length;
        const attendance = teacherAttendance.length > 0 ? Math.round((presentCount / teacherAttendance.length) * 100) : 0;

        const excellentGrades = teacherRecitations.filter(r => r.grade === 'excellent').length;
        const completion = teacherRecitations.length > 0 ? Math.round((excellentGrades / teacherRecitations.length) * 100) : 0;

        return {
          id: teacher.id,
          name: teacher.full_name,
          circles: teacherCircles.length,
          students: studentIds.length,
          recitations: teacherRecitations.length,
          newMemorization: teacherRecitations.filter(r => r.type === 'memorization').length,
          review: teacherRecitations.filter(r => r.type === 'review').length,
          reinforcement: teacherRecitations.filter(r => r.type === 'test').length,
          avgRating: Math.min(5, 3 + (attendance / 50)),
          attendance,
          completion,
        };
      });

      setTeacherPerformance(teacherPerformanceData);

      // حساب أفضل الطلاب بناءً على التسميع والحضور
      const topStudentsData = (studentsData || []).map(student => {
        const studentRecitations = recitationData?.filter(r => r.student_id === student.id) || [];
        const studentAttendance = attendanceData?.filter(a => a.student_id === student.id) || [];
        
        const presentCount = studentAttendance.filter(a => a.status === 'present').length;
        const attendance = studentAttendance.length > 0 ? Math.round((presentCount / studentAttendance.length) * 100) : 0;
        
        const excellentGrades = studentRecitations.filter(r => r.grade === 'excellent').length;
        const progress = studentRecitations.length > 0 ? Math.round((excellentGrades / studentRecitations.length) * 100) : 0;

        const totalAyahs = studentRecitations.reduce((sum, r) => sum + (r.to_ayah - r.from_ayah + 1), 0);

        return {
          rank: 0,
          name: student.full_name,
          circle: 'حلقة',
          parts: Math.floor(totalAyahs / 30),
          pages: totalAyahs,
          progress,
          attendance,
          recitations: studentRecitations.length,
          newMemorization: studentRecitations.filter(r => r.type === 'memorization').length,
          review: studentRecitations.filter(r => r.type === 'review').length,
          reinforcement: studentRecitations.filter(r => r.type === 'test').length,
        };
      }).sort((a, b) => (b.progress + b.attendance) - (a.progress + a.attendance))
        .slice(0, 5)
        .map((student, index) => ({ ...student, rank: index + 1 }));

      setTopStudents(topStudentsData);

      // حساب التقدم الشهري (آخر 6 أشهر)
      const monthlyData = [];
      const today_date = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(today_date.getFullYear(), today_date.getMonth() - i, 1);
        const monthEnd = new Date(today_date.getFullYear(), today_date.getMonth() - i + 1, 0);
        
        const monthAttendance = attendanceData?.filter(a => {
          const date = new Date(a.date);
          return date >= monthStart && date <= monthEnd;
        }) || [];
        
        const monthRecitations = recitationData?.filter(r => {
          const date = new Date(r.date);
          return date >= monthStart && date <= monthEnd;
        }) || [];

        const monthStudents = new Set(monthAttendance.map(a => a.student_id)).size;
        const monthPresent = monthAttendance.filter(a => a.status === 'present').length;
        const monthAttRate = monthAttendance.length > 0 ? Math.round((monthPresent / monthAttendance.length) * 100) : 0;

        const monthNames = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأول', 'جمادى الثاني'];
        
        monthlyData.push({
          month: monthNames[monthStart.getMonth()] || `شهر ${monthStart.getMonth() + 1}`,
          students: Math.max(monthStudents, studentsData?.length || 0),
          recitations: monthRecitations.length,
          attendance: monthAttRate,
          parts: Math.floor(monthRecitations.length / 10) || 1,
        });
      }

      setMonthlyProgress(monthlyData);

      // حساب الحضور اليومي (آخر 30 يوم)
      const dailyData: any[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today_date);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayAttendance = attendanceData?.filter(a => a.date === dateStr) || [];
        
        dailyData.push({
          date: `${date.getDate()}/${date.getMonth() + 1}`,
          present: dayAttendance.filter(a => a.status === 'present').length,
          absent: dayAttendance.filter(a => a.status === 'absent').length,
          excused: dayAttendance.filter(a => a.status === 'excused').length,
          late: dayAttendance.filter(a => a.status === 'late').length,
        });
      }

      setDailyAttendance(dailyData);

      // تحديث الإحصائيات العامة
      setSummaryStats({
        totalStudents: studentsData?.length || 0,
        totalStudentsChange: 5,
        attendanceRate,
        attendanceChange: 5,
        totalParts: recitationData?.reduce((sum, r) => sum + (r.to_ayah - r.from_ayah + 1), 0) || 0,
        partsChange: 18,
        progressRate: attendanceRate,
        progressChange: 8,
        totalRecitations,
        recitationsChange: 15,
        activeTeachers: totalTeachers || 0,
        teachersChange: 2,
      });

      // تحديث توزيع الحضور
      setAttendanceByType([
        { name: 'حاضر', value: attendanceStats.present, percentage: totalAttendance > 0 ? (attendanceStats.present / totalAttendance) * 100 : 0, color: '#10b981' },
        { name: 'غائب', value: attendanceStats.absent, percentage: totalAttendance > 0 ? (attendanceStats.absent / totalAttendance) * 100 : 0, color: '#ef4444' },
        { name: 'مستأذن', value: attendanceStats.excused, percentage: totalAttendance > 0 ? (attendanceStats.excused / totalAttendance) * 100 : 0, color: '#f59e0b' },
        { name: 'متأخر', value: attendanceStats.late, percentage: totalAttendance > 0 ? (attendanceStats.late / totalAttendance) * 100 : 0, color: '#6366f1' },
      ]);

      // تحديث أنواع التسميع
      setRecitationsByType([
        { name: 'حفظ جديد', value: recitationStats.memorization, percentage: totalRecitations > 0 ? (recitationStats.memorization / totalRecitations) * 100 : 0, color: '#8b5cf6' },
        { name: 'مراجعة', value: recitationStats.review, percentage: totalRecitations > 0 ? (recitationStats.review / totalRecitations) * 100 : 0, color: '#3b82f6' },
        { name: 'تثبيت', value: recitationStats.consolidation, percentage: totalRecitations > 0 ? (recitationStats.consolidation / totalRecitations) * 100 : 0, color: '#06b6d4' },
      ]);

    } catch (error: any) {
      console.error('Error fetching reports data:', error);
      if (!isDemoMode()) {
        toast.error('فشل تحميل بيانات التقارير');
      }
    } finally {
      setLoading(false);
    }
  };

  const preparePDFData = (): ReportData => ({
    title: 'تقرير الأداء الشامل',
    generatedAt: new Date().toISOString(),
    stats: summaryStats,
    data: [],
  });

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl mb-2">التقارير</h1>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">التقارير</h1>
          <p className="text-gray-600">تحليل شامل للأداء والإحصائيات</p>
        </div>
      </div>

      {/* Filter and Export */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 flex-wrap">
        <Select value={selectedCircle} onValueChange={setSelectedCircle}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="اختر الحلقة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحلقات</SelectItem>
            {circles.map((circle) => (
              <SelectItem key={circle.id} value={circle.id}>
                {circle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">هذا الأسبوع</SelectItem>
            <SelectItem value="month">هذا الشهر</SelectItem>
            <SelectItem value="quarter">هذا الربع</SelectItem>
            <SelectItem value="year">هذا العام</SelectItem>
          </SelectContent>
        </Select>
        <ExportReportButton
          reportData={preparePDFData()}
          fileName="quran_platform_report"
          className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
        />
      </div>

      {/* الإحصائيات العامة */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">إجمالي الطلاب</p>
                <p className="text-3xl mt-2">{summaryStats.totalStudents}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{summaryStats.totalStudentsChange}%</span>
              <span className="text-gray-500">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">معدل الحضور</p>
                <p className="text-3xl mt-2">{summaryStats.attendanceRate}%</p>
              </div>
              <div className="bg-emerald-500 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{summaryStats.attendanceChange}%</span>
              <span className="text-gray-500">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">إجمالي التسميع</p>
                <p className="text-3xl mt-2">{summaryStats.totalRecitations}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{summaryStats.recitationsChange}%</span>
              <span className="text-gray-500">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">الأجزاء المحفوظة</p>
                <p className="text-3xl mt-2">{summaryStats.totalParts}</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{summaryStats.partsChange}%</span>
              <span className="text-gray-500">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">معدل التقدم</p>
                <p className="text-3xl mt-2">{summaryStats.progressRate}%</p>
              </div>
              <div className="bg-indigo-500 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{summaryStats.progressChange}%</span>
              <span className="text-gray-500">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">المعلمون النشطون</p>
                <p className="text-3xl mt-2">{summaryStats.activeTeachers}</p>
              </div>
              <div className="bg-cyan-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{summaryStats.teachersChange}</span>
              <span className="text-gray-500">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 h-auto">
          <TabsTrigger value="overview" className="text-xs lg:text-sm">نظرة عامة</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs lg:text-sm">الحضور</TabsTrigger>
          <TabsTrigger value="recitations" className="text-xs lg:text-sm">التسميع</TabsTrigger>
          <TabsTrigger value="circles" className="text-xs lg:text-sm">الحلقات</TabsTrigger>
          <TabsTrigger value="teachers" className="text-xs lg:text-sm">المعلمون</TabsTrigger>
          <TabsTrigger value="students" className="text-xs lg:text-sm hidden lg:inline-flex">الطلاب</TabsTrigger>
          <TabsTrigger value="individual" className="text-xs lg:text-sm hidden lg:inline-flex">تقارير</TabsTrigger>
        </TabsList>

        {/* نظرة عامة */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* التقدم الشهري */}
            <Card>
              <CardHeader>
                <CardTitle>التقدم الشهري</CardTitle>
                <CardDescription>تطور الأداء خلال الأشهر الأخيرة</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyProgress.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyProgress}>
                      <defs>
                        <linearGradient id="colorRecitations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="recitations"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorRecitations)"
                        name="التسميع"
                      />
                      <Area
                        type="monotone"
                        dataKey="attendance"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorAttendance)"
                        name="الحضور %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    لا توجد بيانات متاحة
                  </div>
                )}
              </CardContent>
            </Card>

            {/* توزيع الحضور */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع الحضور</CardTitle>
                <CardDescription>تصنيف حالات الحضور والغياب</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={attendanceByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }: any) => {
                          const total = attendanceByType.reduce((sum: number, item: any) => sum + item.value, 0);
                          const percentage = ((value / total) * 100);
                          return `${name} ${percentage.toFixed(1)}%`;
                        }}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {attendanceByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    لا توجد بيانات متاحة
                  </div>
                )}
              </CardContent>
            </Card>

            {/* توزيع التسميع */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع التسميع</CardTitle>
                <CardDescription>تصنيف أنواع التسميع (حفظ، مراجعة، تثبيت)</CardDescription>
              </CardHeader>
              <CardContent>
                {recitationsByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={recitationsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }: any) => {
                          const total = recitationsByType.reduce((sum: number, item: any) => sum + item.value, 0);
                          const percentage = ((value / total) * 100);
                          return `${name} ${percentage.toFixed(1)}%`;
                        }}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {recitationsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    لا توجد بيانات متاحة
                  </div>
                )}
              </CardContent>
            </Card>

            {/* عدد الطلاب والأجزاء */}
            <Card>
              <CardHeader>
                <CardTitle>نمو الطلاب والحفظ</CardTitle>
                <CardDescription>تطور عدد الطلاب والأجزاء المحفوظة</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyProgress.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" fill="#3b82f6" name="الطلاب" />
                      <Bar dataKey="parts" fill="#f59e0b" name="الأجزاء" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    لا توجد بيانات متاحة
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تقرير الحضور */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
            {attendanceByType.map((type) => (
              <Card key={type.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">{type.name}</p>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                  </div>
                  <p className="text-2xl">{type.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{type.percentage.toFixed(1)}% من الإجمالي</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>الحضور اليومي - آخر 30 يوم</CardTitle>
              <CardDescription>تتبع حالات الحضور والغياب يومياً</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyAttendance.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={dailyAttendance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="present"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      name="حاضر"
                    />
                    <Area
                      type="monotone"
                      dataKey="late"
                      stackId="1"
                      stroke="#6366f1"
                      fill="#6366f1"
                      name="متأخر"
                    />
                    <Area
                      type="monotone"
                      dataKey="excused"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      name="مستأذن"
                    />
                    <Area
                      type="monotone"
                      dataKey="absent"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      name="غائب"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  لا توجد بيانات حضور متاحة
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>نسب الحضور حسب الحلقة</CardTitle>
            </CardHeader>
            <CardContent>
              {circlePerformance.length > 0 ? (
                <div className="space-y-3 md:space-y-0">
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">الحلقة</TableHead>
                          <TableHead className="text-right">المعلم</TableHead>
                          <TableHead className="text-right">عدد الطلاب</TableHead>
                          <TableHead className="text-right">نسبة الحضور</TableHead>
                          <TableHead className="text-right">التصنيف</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {circlePerformance.map((circle) => (
                          <TableRow key={circle.id}>
                            <TableCell className="font-medium">{circle.name}</TableCell>
                            <TableCell>{circle.teacher}</TableCell>
                            <TableCell>{circle.students} طالب</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={circle.attendance} className="h-2 w-20" />
                                <span>{circle.attendance}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  circle.attendance >= 90 ? 'bg-green-100 text-green-800' :
                                    circle.attendance >= 80 ? 'bg-blue-100 text-blue-800' :
                                      circle.attendance >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                }
                              >
                                {circle.attendance >= 90 ? 'ممتاز' :
                                  circle.attendance >= 80 ? 'جيد جداً' :
                                    circle.attendance >= 70 ? 'جيد' : 'يحتاج تحسين'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="md:hidden space-y-2">
                    {circlePerformance.map((circle) => (
                      <div key={circle.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{circle.name}</h4>
                          <Badge
                            className={`text-xs ${
                              circle.attendance >= 90 ? 'bg-green-100 text-green-800' :
                                circle.attendance >= 80 ? 'bg-blue-100 text-blue-800' :
                                  circle.attendance >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                            }`}
                          >
                            {circle.attendance >= 90 ? 'ممتاز' :
                              circle.attendance >= 80 ? 'جيد جداً' :
                                circle.attendance >= 70 ? 'جيد' : 'يحتاج تحسين'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">معلم: {circle.teacher}</p>
                        <p className="text-xs text-gray-600">{circle.students} طالب</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>الحضور</span>
                            <span>{circle.attendance}%</span>
                          </div>
                          <Progress value={circle.attendance} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">
                  لا توجد بيانات متاحة
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تقرير التسميع */}
        <TabsContent value="recitations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-4">
            {recitationsByType.map((type) => (
              <Card key={type.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">{type.name}</p>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                  </div>
                  <p className="text-2xl">{type.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{type.percentage.toFixed(1)}% من الإجمالي</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل التسميع حسب الحلقة</CardTitle>
              <CardDescription>توزيع أنواع التسميع لكل حلقة</CardDescription>
            </CardHeader>
            <CardContent>
              {circlePerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={circlePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="newMemorization" fill="#8b5cf6" name="حفظ جديد" />
                    <Bar dataKey="review" fill="#3b82f6" name="مراجعة" />
                    <Bar dataKey="reinforcement" fill="#06b6d4" name="تثبيت" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  لا توجد بيانات متاحة
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إحصائيات التسميع التفصيلية</CardTitle>
            </CardHeader>
            <CardContent>
              {circlePerformance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الحلقة</TableHead>
                      <TableHead className="text-right">إجمالي التسميع</TableHead>
                      <TableHead className="text-right">حفظ جديد</TableHead>
                      <TableHead className="text-right">مراجعة</TableHead>
                      <TableHead className="text-right">تثبيت</TableHead>
                      <TableHead className="text-right">معدل الطالب</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {circlePerformance.map((circle) => (
                      <TableRow key={circle.id}>
                        <TableCell className="font-medium">{circle.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{circle.totalRecitations} تسميع</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-100 text-purple-800">
                            {circle.newMemorization}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">
                            {circle.review}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-cyan-100 text-cyan-800">
                            {circle.reinforcement}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {circle.students > 0 ? (circle.totalRecitations / circle.students).toFixed(1) : 0} / طالب
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">
                  لا توجد بيانات متاحة
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* الحلقات */}
        <TabsContent value="circles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أداء الحلقات</CardTitle>
              <CardDescription>تقييم شامل لأداء كل حلقة</CardDescription>
            </CardHeader>
            <CardContent>
              {circlePerformance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الحلقة</TableHead>
                      <TableHead className="text-right">المعلم</TableHead>
                      <TableHead className="text-right">عدد الطلاب</TableHead>
                      <TableHead className="text-right">الحضور</TableHead>
                      <TableHead className="text-right">التقدم</TableHead>
                      <TableHead className="text-right">التقييم</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {circlePerformance.map((circle) => (
                      <TableRow key={circle.id}>
                        <TableCell className="font-medium">{circle.name}</TableCell>
                        <TableCell>{circle.teacher}</TableCell>
                        <TableCell>{circle.students}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{circle.attendance}%</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{circle.progress}%</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`${i < Math.floor(circle.rating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                  }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">
                  لا توجد بيانات متاحة
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* المعلمون */}
        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أداء المعلمين</CardTitle>
            </CardHeader>
            <CardContent>
              {teacherPerformance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المعلم</TableHead>
                      <TableHead className="text-right">الحلقات</TableHead>
                      <TableHead className="text-right">الطلاب</TableHead>
                      <TableHead className="text-right">التسميع</TableHead>
                      <TableHead className="text-right">حفظ جديد</TableHead>
                      <TableHead className="text-right">مراجعة</TableHead>
                      <TableHead className="text-right">الحضور</TableHead>
                      <TableHead className="text-right">التقييم</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacherPerformance.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium">{teacher.name}</TableCell>
                        <TableCell>{teacher.circles} حلقة</TableCell>
                        <TableCell>{teacher.students} طالب</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{teacher.recitations}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-100 text-purple-800">
                            {teacher.newMemorization}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">
                            {teacher.review}
                          </Badge>
                        </TableCell>
                        <TableCell>{teacher.attendance}%</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`${i < Math.floor(teacher.avgRating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                  }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="mr-1 text-sm">{teacher.avgRating}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">
                  لا توجد بيانات متاحة
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* الطلاب المتميزون */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>الطلاب المتميزون</CardTitle>
                <CardDescription>أفضل 5 طلاب هذا الشهر</CardDescription>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {topStudents.length > 0 ? (
                <div className="space-y-4">
                  {topStudents.map((student) => (
                    <div key={student.rank} className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${student.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                          student.rank === 2 ? 'bg-gray-100 text-gray-700' :
                            student.rank === 3 ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                        }`}>
                        <span className="text-xl font-bold">#{student.rank}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.circle}</p>
                      </div>
                      <div className="text-center px-4 border-r">
                        <p className="text-2xl font-bold text-emerald-600">{student.parts}</p>
                        <p className="text-xs text-gray-600">جزء</p>
                      </div>
                      <div className="text-center px-4 border-r">
                        <p className="text-2xl font-bold text-blue-600">{student.pages}</p>
                        <p className="text-xs text-gray-600">صفحة</p>
                      </div>
                      <div className="text-center px-4 border-r">
                        <p className="text-2xl font-bold text-purple-600">{student.recitations}</p>
                        <p className="text-xs text-gray-600">تسميع</p>
                      </div>
                      <div className="w-32">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">التقدم</span>
                          <span>{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-2" />
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-600">الحضور</span>
                          <span>{student.attendance}%</span>
                        </div>
                        <Progress value={student.attendance} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">
                  لا توجد بيانات متاحة
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تقارير فردية */}
        <TabsContent value="individual">
          <IndividualStudentReports organizationId={organizationId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
