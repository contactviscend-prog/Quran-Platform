import { useState, useEffect } from 'react';
import { MyStudentsPage } from './MyStudentsPage';
import { EnhancedRecitationPage } from '../shared/EnhancedRecitationPage';
import { RecitationsPage } from '../shared/RecitationsPage';
import { AttendancePage } from '../shared/AttendancePage';
import { AttendanceRecorder } from '../shared/AttendanceRecorder';
import { TeacherCirclesPage } from './TeacherCirclesPage';
import { DailyAssignmentsPage } from '../shared/DailyAssignmentsPage';
import { QRCodeScanner } from '../shared/QRCodeScanner';
import { SettingsPage } from '../shared/SettingsPage';
import { StudentQuickAccess } from './StudentQuickAccess';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Users, BookOpen, CheckCircle, Clock, QrCode } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase, isDemoMode } from '../../lib/supabase';
import type { Profile, Organization } from '../../lib/supabase';

interface TeacherDashboardProps {
  user: Profile;
  organization: Organization;
}

interface Student {
  id: string;
  name: string;
  progress: number;
  lastReview: string;
  currentSurah: string;
  status: 'ممتاز' | 'جيد' | 'يحتاج متابعة';
}

export function TeacherDashboard({ user, organization }: TeacherDashboardProps) {
  const [currentSection, setCurrentSection] = useState('overview');
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayRecitations: 0,
    todayAttendance: 0,
    activeCircles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [organization.id, user.id]);

  const fetchStats = async () => {
    try {
      // Demo mode - use mock data
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

      // Real Supabase fetch
      // Get teacher's circles
      const { data: circles } = await supabase
        .from('circles')
        .select('id')
        .eq('organization_id', organization.id)
        .eq('teacher_id', user.id)
        .eq('is_active', true);

      const circleIds = circles?.map(c => c.id) || [];

      // Get total students in teacher's circles
      const { count: studentsCount } = await supabase
        .from('circle_enrollments')
        .select('*', { count: 'exact', head: true })
        .in('circle_id', circleIds);

      // Get today's recitations
      const today = new Date().toISOString().split('T')[0];
      const { count: recitationsCount } = await supabase
        .from('recitations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('teacher_id', user.id)
        .eq('date', today);

      // Get today's attendance
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
      // في Demo Mode لا نعرض رسالة خطأ
      if (!isDemoMode()) {
        toast.error('فشل في تحميل الإحصائيات');
      }
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { title: 'طلابي', value: stats.totalStudents.toString(), icon: Users, color: 'bg-blue-500' },
    { title: 'التسميع اليوم', value: stats.todayRecitations.toString(), icon: BookOpen, color: 'bg-emerald-500' },
    { title: 'الحضور اليوم', value: stats.todayAttendance.toString(), icon: CheckCircle, color: 'bg-green-500' },
    { title: 'حلقاتي', value: stats.activeCircles.toString(), icon: Clock, color: 'bg-orange-500' },
  ];

  const renderContent = () => {
    switch (currentSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl mb-2">لوحة تحكم المعلم</h1>
              <p className="text-gray-600">مرحباً {user.full_name}، تابع تقدم طلابك</p>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-3xl mt-2">{stat.value}</p>
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
            />

            {/* Tabs for different sections */}
            <Tabs defaultValue="recitations" dir="rtl">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recitations">سجل التسميع</TabsTrigger>
                <TabsTrigger value="attendance">الحضور والغياب</TabsTrigger>
              </TabsList>

              <TabsContent value="recitations">
                <RecitationsPage 
                  organizationId={organization.id} 
                  userRole="teacher"
                  userId={user.id}
                />
              </TabsContent>

              <TabsContent value="attendance">
                <AttendancePage 
                  organizationId={organization.id}
                  userRole="teacher"
                  userId={user.id}
                />
              </TabsContent>
            </Tabs>
          </div>
        );

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
      {renderContent()}
    </DashboardLayout>
  );
}