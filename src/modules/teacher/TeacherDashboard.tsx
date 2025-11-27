import { useState, useEffect, useCallback } from 'react';
import { MyStudentsPage } from './MyStudentsPage';
import { EnhancedRecitationPage } from '../shared/EnhancedRecitationPage';
import { TeacherCirclesPage } from './TeacherCirclesPage';
import { DailyAssignmentsPage } from '../shared/DailyAssignmentsPage';
import { QRCodeScanner } from '../shared/QRCodeScanner';
import { SettingsPage } from '../shared/SettingsPage';
import { AttendanceRecorder } from '../shared/AttendanceRecorder';
import { StudentQuickAccess } from './StudentQuickAccess';
import { QuickMemorizationRecord } from '../../components/QuickMemorizationRecord';
import { QuickAttendancePanel } from '../../components/QuickAttendancePanel';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Users, BookOpen, CheckCircle, Clock, TrendingUp, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDemoMode } from '../../lib/supabase';
import type { Profile, Organization } from '../../lib/supabase';

interface TeacherDashboardProps {
  user: Profile;
  organization: Organization;
}

interface DashboardStats {
  totalStudents: number;
  todayRecitations: number;
  todayAttendance: number;
  activeCircles: number;
}

interface RecitationRecord {
  id: string;
  student_name: string;
  surah_name: string;
  from_ayah: number;
  to_ayah: number;
  type: string;
  grade: string;
  date: string;
  mistakes_count: number;
}

interface AttendanceRecord {
  id: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export function TeacherDashboard({ user, organization }: TeacherDashboardProps) {
  const [currentSection, setCurrentSection] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    todayRecitations: 0,
    todayAttendance: 0,
    activeCircles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentRecitations, setRecentRecitations] = useState<RecitationRecord[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [recitationSearch, setRecitationSearch] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCircleForRecitation, setSelectedCircleForRecitation] = useState<string>('');
  const [selectedDateForRecitation, setSelectedDateForRecitation] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCircleForAttendance, setSelectedCircleForAttendance] = useState<string>('');
  const [selectedDateForAttendance, setSelectedDateForAttendance] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [circles, setCircles] = useState<any[]>([]);

  useEffect(() => {
    fetchCircles();
    fetchStats();
    fetchRecentData();
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentData();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [organization.id, user.id, refreshKey]);

  const fetchCircles = async () => {
    try {
      if (isDemoMode()) {
        setCircles([
          { id: 'circle1', name: 'حلقة الفجر' },
          { id: 'circle2', name: 'حلقة المغرب' },
        ]);
        return;
      }

      const { data } = await supabase
        .from('circles')
        .select('id, name')
        .eq('organization_id', organization.id)
        .eq('teacher_id', user.id)
        .eq('is_active', true);

      setCircles(data || []);
    } catch (error) {
      console.error('Error fetching circles:', error);
    }
  };

  const fetchStats = async () => {
    try {
      if (isDemoMode()) {
        setStats({
          totalStudents: 24,
          todayRecitations: 18,
          todayAttendance: 22,
          activeCircles: 2,
        });
        setLoading(false);
        return;
      }

      const { data: circles } = await supabase
        .from('circles')
        .select('id')
        .eq('organization_id', organization.id)
        .eq('teacher_id', user.id)
        .eq('is_active', true);

      const circleIds = circles?.map(c => c.id) || [];

      const { count: studentsCount } = await supabase
        .from('circle_enrollments')
        .select('*', { count: 'exact', head: true })
        .in('circle_id', circleIds);

      const today = new Date().toISOString().split('T')[0];
      const { count: recitationsCount } = await supabase
        .from('recitations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('teacher_id', user.id)
        .eq('date', today);

      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .in('circle_id', circleIds)
        .eq('date', today);

      setStats({
        totalStudents: studentsCount || 0,
        todayRecitations: recitationsCount || 0,
        todayAttendance: attendanceCount || 0,
        activeCircles: circles?.length || 0,
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      if (!isDemoMode()) {
        toast.error('فشل في تحميل الإحصائيات');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentData = async () => {
    try {
      if (isDemoMode()) {
        setRecentRecitations([
          {
            id: '1',
            student_name: 'أحمد محمد',
            surah_name: 'البقرة',
            from_ayah: 1,
            to_ayah: 10,
            type: 'memorization',
            grade: 'excellent',
            date: new Date().toISOString().split('T')[0],
            mistakes_count: 0,
          },
          {
            id: '2',
            student_name: 'فاطمة علي',
            surah_name: 'آل عمران',
            from_ayah: 1,
            to_ayah: 20,
            type: 'review',
            grade: 'very_good',
            date: new Date().toISOString().split('T')[0],
            mistakes_count: 2,
          },
        ] as any);

        setRecentAttendance([
          {
            id: '1',
            studentName: 'أحمد محمد',
            date: new Date().toISOString().split('T')[0],
            status: 'present',
          },
          {
            id: '2',
            studentName: 'فاطمة علي',
            date: new Date().toISOString().split('T')[0],
            status: 'present',
          },
          {
            id: '3',
            studentName: 'محمود سلام',
            date: new Date().toISOString().split('T')[0],
            status: 'absent',
          },
        ] as any);
        return;
      }

      // Fetch recent recitations
      const { data: recitationsData } = await supabase
        .from('recitations')
        .select(`
          id,
          student_id,
          date,
          type,
          surah_name,
          from_ayah,
          to_ayah,
          grade,
          mistakes_count,
          profiles!student_id(full_name)
        `)
        .eq('organization_id', organization.id)
        .eq('teacher_id', user.id)
        .order('date', { ascending: false })
        .limit(10);

      if (recitationsData) {
        setRecentRecitations(
          recitationsData.map((r: any) => ({
            id: r.id,
            student_name: r.profiles?.full_name || 'Unknown',
            surah_name: r.surah_name,
            from_ayah: r.from_ayah,
            to_ayah: r.to_ayah,
            type: r.type,
            grade: r.grade,
            date: r.date,
            mistakes_count: r.mistakes_count,
          }))
        );
      }

      // Fetch recent attendance
      const { data: circles } = await supabase
        .from('circles')
        .select('id')
        .eq('organization_id', organization.id)
        .eq('teacher_id', user.id)
        .eq('is_active', true);

      const circleIds = circles?.map(c => c.id) || [];

      if (circleIds.length > 0) {
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select(`
            id,
            date,
            status,
            profiles!student_id(full_name)
          `)
          .in('circle_id', circleIds)
          .order('date', { ascending: false })
          .limit(10);

        if (attendanceData) {
          setRecentAttendance(
            attendanceData.map((a: any) => ({
              id: a.id,
              studentName: a.profiles?.full_name || 'Unknown',
              date: a.date,
              status: a.status,
            }))
          );
        }
      }
    } catch (error: any) {
      console.error('Error fetching recent data:', error);
    }
  };

  const handleDataRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    fetchStats();
    fetchRecentData();
    toast.success('تم تحديث البيانات');
  }, []);

  const getGradeBadge = (grade: string) => {
    const grades: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800',
      very_good: 'bg-blue-100 text-blue-800',
      good: 'bg-yellow-100 text-yellow-800',
      acceptable: 'bg-orange-100 text-orange-800',
      needs_improvement: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      excellent: 'ممتاز',
      very_good: 'جيد جداً',
      good: 'جيد',
      acceptable: 'مقبول',
      needs_improvement: 'يحتاج تحسين',
    };
    return { color: grades[grade] || 'bg-gray-100 text-gray-800', label: labels[grade] || grade };
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { color: string; label: string }> = {
      present: { color: 'bg-green-100 text-green-800', label: 'حاضر' },
      absent: { color: 'bg-red-100 text-red-800', label: 'غائب' },
      late: { color: 'bg-yellow-100 text-yellow-800', label: 'متأخر' },
      excused: { color: 'bg-blue-100 text-blue-800', label: 'غياب بعذر' },
    };
    return statuses[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      memorization: 'bg-purple-100 text-purple-800',
      review: 'bg-blue-100 text-blue-800',
      consolidation: 'bg-green-100 text-green-800',
      test: 'bg-orange-100 text-orange-800',
      listening: 'bg-indigo-100 text-indigo-800',
    };
    const labels: Record<string, string> = {
      memorization: 'حفظ جديد',
      review: 'مراجعة',
      consolidation: 'تثبيت',
      test: 'اختبار',
      listening: 'استماع',
    };
    return { color: types[type] || 'bg-gray-100 text-gray-800', label: labels[type] || type };
  };

  const filteredRecitations = recentRecitations.filter(r =>
    r.student_name.toLowerCase().includes(recitationSearch.toLowerCase())
  );

  const filteredAttendance = recentAttendance.filter(a =>
    a.studentName.toLowerCase().includes(attendanceSearch.toLowerCase())
  );

  const statsData = [
    { title: 'طلابي', value: stats.totalStudents.toString(), icon: Users, color: 'bg-blue-500', trend: '+2' },
    { title: 'التسميع اليوم', value: stats.todayRecitations.toString(), icon: BookOpen, color: 'bg-emerald-500', trend: '+5' },
    { title: 'الحضور اليوم', value: stats.todayAttendance.toString(), icon: CheckCircle, color: 'bg-green-500', trend: '+1' },
    { title: 'حلقاتي', value: stats.activeCircles.toString(), icon: Clock, color: 'bg-orange-500', trend: '0' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">لوحة تحكم المعلم</h1>
        <p className="text-gray-600">مرحباً {user.full_name}، تابع تقدم طلابك</p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <p className="text-xs text-emerald-600 mt-1">{stat.trend}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* الوصول السريع بالباركود */}
      <StudentQuickAccess 
        organizationId={organization.id}
        teacherId={user.id}
        onDataUpdate={handleDataRefresh}
      />

      {/* النسخ السريعة من التسميع والحضور */}
      <Tabs defaultValue="recitations" dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recitations" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            سجل التسميع
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            الحضور والغياب
          </TabsTrigger>
        </TabsList>

        {/* سجل التسميع السريع */}
        <TabsContent value="recitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>سجل التسميع - نسخة متقدمة</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSection('recitations')}
                >
                  عرض كامل
                </Button>
              </CardTitle>
              <CardDescription>تسجيل التسميع مع الإمكانيات الكاملة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اختر الحلقة</label>
                  <select
                    value={selectedCircleForRecitation}
                    onChange={(e) => setSelectedCircleForRecitation(e.target.value)}
                    className="w-full h-10 px-3 border rounded-md text-sm"
                  >
                    <option value="">-- اختر حلقة --</option>
                    {circles.map(circle => (
                      <option key={circle.id} value={circle.id}>
                        {circle.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">التاريخ</label>
                  <input
                    type="date"
                    value={selectedDateForRecitation}
                    onChange={(e) => setSelectedDateForRecitation(e.target.value)}
                    className="w-full h-10 px-3 border rounded-md text-sm"
                  />
                </div>
              </div>

              <QuickMemorizationRecord
                user={user}
                organization={organization}
                circleId={selectedCircleForRecitation}
                date={selectedDateForRecitation}
              />

              <div className="pt-3 border-t">
                <Button
                  onClick={() => setCurrentSection('recitations')}
                  className="w-full h-8 text-sm"
                  variant="outline"
                >
                  عرض كامل
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الحضور والغياب السريع */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>الحضور والغياب - نسخة متقدمة</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSection('attendance')}
                >
                  عرض كامل
                </Button>
              </CardTitle>
              <CardDescription>تسجيل الحضور بسهولة مع الحفظ الفوري</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اختر الحلقة</label>
                  <select
                    value={selectedCircleForAttendance}
                    onChange={(e) => setSelectedCircleForAttendance(e.target.value)}
                    className="w-full h-10 px-3 border rounded-md text-sm"
                  >
                    <option value="">-- اختر حلقة --</option>
                    {circles.map(circle => (
                      <option key={circle.id} value={circle.id}>
                        {circle.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">التاريخ</label>
                  <input
                    type="date"
                    value={selectedDateForAttendance}
                    onChange={(e) => setSelectedDateForAttendance(e.target.value)}
                    className="w-full h-10 px-3 border rounded-md text-sm"
                  />
                </div>
              </div>

              <QuickAttendancePanel
                user={user}
                organization={organization}
                circleId={selectedCircleForAttendance}
                date={selectedDateForAttendance}
                onAttendanceUpdate={handleDataRefresh}
              />

              <div className="pt-3 border-t">
                <Button
                  onClick={() => setCurrentSection('attendance-recorder')}
                  className="w-full h-8 text-sm"
                  variant="outline"
                >
                  عرض كامل
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'overview':
        return renderOverview();

      case 'students':
        return (
          <MyStudentsPage 
            user={user}
            organization={organization}
          />
        );

      case 'circles':
        return (
          <TeacherCirclesPage 
            teacherId={user.id}
            organizationId={organization.id} 
          />
        );

      case 'recitations':
        return (
          <EnhancedRecitationPage 
            user={user}
            organization={organization}
          />
        );

      case 'attendance-recorder':
        return (
          <AttendanceRecorder
            teacherId={user.id}
            organizationId={organization.id}
          />
        );

      case 'assignments':
        return (
          <DailyAssignmentsPage 
            userId={user.id}
            userRole="teacher"
            organizationId={organization.id}
          />
        );

      case 'qr-scanner':
        return (
          <QRCodeScanner 
            teacherId={user.id}
            organizationId={organization.id}
          />
        );

      case 'settings':
        return <SettingsPage user={user} />;

      default:
        return null;
    }
  };

  return (
    <DashboardLayout 
      user={user} 
      organization={organization} 
      role="teacher"
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      {loading && currentSection === 'overview' ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        renderContent()
      )}
    </DashboardLayout>
  );
}
