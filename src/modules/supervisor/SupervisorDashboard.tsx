import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, BookOpen, GraduationCap, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { isDemoMode, supabase, Profile, Organization } from '../../lib/supabase';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { CirclesManagement } from '../shared/CirclesManagement';
import { RecitationsPage } from '../shared/RecitationsPage';
import { ReportsPage } from '../shared/ReportsPage';
import { SettingsPage } from '../shared/SettingsPage';
import { SupervisorTeachersPage } from './SupervisorTeachersPage';

interface SupervisorDashboardProps {
  user: Profile;
  organization: Organization;
}

export function SupervisorDashboard({ user, organization }: SupervisorDashboardProps) {
  const [currentSection, setCurrentSection] = useState('overview');
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    activeCircles: 0,
    totalRecitations: 0,
    todayAttendance: 0,
    weeklyRecitations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [organization.id]);

  const fetchData = async () => {
    try {
      // Demo mode - use mock data
      if (isDemoMode()) {
        setStats({
          totalTeachers: 12,
          totalStudents: 245,
          activeCircles: 18,
          totalRecitations: 1450,
          todayAttendance: 180,
          weeklyRecitations: 320,
        });
        setLoading(false);
        return;
      }

      // Real Supabase fetch
      // Fetch teachers count
      const { count: teachersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('role', 'teacher')
        .eq('status', 'active');

      // Fetch students count
      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('role', 'student')
        .eq('status', 'active');

      // Fetch circles count
      const { count: circlesCount } = await supabase
        .from('circles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('is_active', true);

      // Fetch recitations count
      const { count: recitationsCount } = await supabase
        .from('recitations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id);

      // Fetch today's attendance count
      const today = new Date().toISOString().split('T')[0];
      const { count: todayAttendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('date', today);

      // Fetch weekly recitations count
      const weekAgo = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
      const { count: weeklyRecitationsCount } = await supabase
        .from('recitations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .gte('date', weekAgo);

      setStats({
        totalTeachers: teachersCount || 0,
        totalStudents: studentsCount || 0,
        activeCircles: circlesCount || 0,
        totalRecitations: recitationsCount || 0,
        todayAttendance: todayAttendanceCount || 0,
        weeklyRecitations: weeklyRecitationsCount || 0,
      });

    } catch (error: any) {
      console.error('Error fetching data:', error);
      // في Demo Mode لا نعرض رسالة خطأ
      if (!isDemoMode()) {
        toast.error('فشل تحميل البيانات');
      }
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { title: 'المعلمون', value: stats.totalTeachers.toString(), icon: Users, color: 'bg-blue-500' },
    { title: 'الحلقات النشطة', value: stats.activeCircles.toString(), icon: BookOpen, color: 'bg-emerald-500' },
    { title: 'إجمالي الطلاب', value: stats.totalStudents.toString(), icon: Users, color: 'bg-purple-500' },
    { title: 'إجمالي التسميع', value: stats.totalRecitations.toString(), icon: ClipboardList, color: 'bg-orange-500' },
  ];

  const renderContent = () => {
    switch (currentSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl mb-2">لوحة تحكم المشرف</h1>
                <p className="text-gray-600">مرحباً {user.full_name}، راقب أداء المعلمين والحلقات</p>
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات الأسبوع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded">
                    <span className="text-sm text-gray-600">الحضور اليوم</span>
                    <span className="font-medium text-emerald-700">{stats.todayAttendance} طالب</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-sm text-gray-600">التسميع هذا الأسبوع</span>
                    <span className="font-medium text-blue-700">{stats.weeklyRecitations} مرة</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>آخر التحديثات</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">لا توجد تحديثات حالياً</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'teachers':
        return <SupervisorTeachersPage organizationId={organization.id} />;

      case 'circles':
        return <CirclesManagement organizationId={organization.id} />;

      case 'recitations':
        return (
          <RecitationsPage 
            organizationId={organization.id} 
            userRole="supervisor"
            userId={user.id}
          />
        );

      case 'reports':
        return (
          <ReportsPage 
            organizationId={organization.id}
            userRole="supervisor"
            userId={user.id}
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
      role="supervisor"
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
