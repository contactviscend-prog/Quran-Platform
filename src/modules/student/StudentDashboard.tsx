import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  BookOpen, Award, Target, TrendingUp, Calendar, 
  Clock, Star, CheckCircle, ClipboardList, Users 
} from 'lucide-react';
import { StudentAssignmentsPage } from './StudentAssignmentsPage';
import { StudentMemorizationPage } from './StudentMemorizationPage';
import { StudentQRCode } from './StudentQRCode';
import { SettingsPage } from '../shared/SettingsPage';
import { toast } from 'sonner@2.0.3';
import { supabase, isDemoMode } from '../../lib/supabase';
import type { Profile, Organization } from '../../lib/supabase';

interface StudentDashboardProps {
  user: Profile;
  organization: Organization;
}

export function StudentDashboard({ user, organization }: StudentDashboardProps) {
  const [currentSection, setCurrentSection] = useState('overview');
  const [stats, setStats] = useState({
    currentCircle: null as string | null,
    currentTeacher: null as string | null,
    totalRecitations: 0,
    weeklyGoal: 5,
    weeklyProgress: 3,
    attendanceRate: 18,
    totalAttendanceDays: 20,
    points: 245,
    savedRatings: 5,
    currentGoal: {
      surah: 'سورة آل عمران',
      fromAyah: 16,
      toAyah: 30,
      progress: 60,
    },
    recentRecitations: [] as any[],
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
          currentCircle: 'حلقة الفجر',
          currentTeacher: 'أحمد المعلم',
          totalRecitations: 45,
          weeklyGoal: 5,
          weeklyProgress: 3,
          attendanceRate: 18,
          totalAttendanceDays: 20,
          points: 245,
          savedRatings: 5,
          currentGoal: {
            surah: 'سورة آل عمران',
            fromAyah: 16,
            toAyah: 30,
            progress: 60,
          },
          recentRecitations: [
            {
              id: '1',
              surah_name: 'سورة البقرة',
              from_ayah: 1,
              to_ayah: 10,
              grade: 'excellent',
              date: new Date().toISOString(),
            },
          ],
        });
        setLoading(false);
        return;
      }

      // Real Supabase fetch
      // Get student's circle and teacher
      const { data: enrollment } = await supabase
        .from('circle_enrollments')
        .select('circle:circles(name, teacher:profiles!circles_teacher_id_fkey(full_name))')
        .eq('student_id', user.id)
        .single();

      setStats({
        currentCircle: enrollment?.circle?.name || null,
        currentTeacher: enrollment?.circle?.teacher?.full_name || null,
        totalRecitations: 0,
        weeklyGoal: 5,
        weeklyProgress: 0,
        attendanceRate: 0,
        totalAttendanceDays: 0,
        points: 0,
        savedRatings: 0,
        currentGoal: {
          surah: 'سورة البقرة',
          fromAyah: 1,
          toAyah: 10,
          progress: 0,
        },
        recentRecitations: [],
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

  const getGradeLabel = (grade: string) => {
    switch (grade) {
      case 'excellent':
        return 'ممتاز';
      case 'very_good':
        return 'جيد جداً';
      case 'good':
        return 'جيد';
      case 'acceptable':
        return 'مقبول';
      case 'needs_improvement':
        return 'يحتاج تحسين';
      default:
        return grade;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'very_good':
        return 'bg-blue-100 text-blue-800';
      case 'good':
        return 'bg-emerald-100 text-emerald-800';
      case 'acceptable':
        return 'bg-yellow-100 text-yellow-800';
      case 'needs_improvement':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl mb-2">لوحة تحكم الطالب</h1>
              <p className="text-gray-600">مرحباً {user.full_name}، تابع تقدمك في الحفظ</p>
            </div>

            {/* الإحصائيات الرئيسية */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* التقييم المحفوظ */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">التقييم المحفوظة</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.savedRatings}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Award className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* الهدف الأسبوعي */}
              <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">الهدف الأسبوعي</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {stats.weeklyProgress}/{stats.weeklyGoal}
                      </p>
                    </div>
                    <div className="bg-emerald-100 p-3 rounded-xl">
                      <Target className="w-8 h-8 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* الحضور */}
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">الحضور</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {stats.attendanceRate}/{stats.totalAttendanceDays}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* الطاقة (النقاط) */}
              <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">الطاقة</p>
                      <p className="text-3xl font-bold text-amber-600">{stats.points}</p>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-xl">
                      <TrendingUp className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* هدفك الحالي */}
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    هدفك الحالي
                  </CardTitle>
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    جاري الحفظ
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {stats.currentGoal.surah}
                    </h3>
                    <p className="text-gray-600">
                      من الآية {stats.currentGoal.fromAyah} إلى الآية {stats.currentGoal.toAyah}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">التقدم</span>
                      <span className="text-sm font-semibold text-emerald-600">
                        {stats.currentGoal.progress}%
                      </span>
                    </div>
                    <Progress value={stats.currentGoal.progress} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* آخر المراجعات */}
            <Card>
              <CardHeader>
                <CardTitle>آخر المراجعات</CardTitle>
                <p className="text-sm text-gray-600">مراجعاتك في آخر مرة</p>
              </CardHeader>
              <CardContent>
                {stats.recentRecitations.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">لا توجد مراجعات بعد</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentRecitations.map((recitation) => (
                      <div
                        key={recitation.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {recitation.surah_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            الآيات {recitation.from_ayah} - {recitation.to_ayah}
                          </p>
                        </div>
                        <Badge className={getGradeColor(recitation.grade)}>
                          {getGradeLabel(recitation.grade)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* بطاقة معلومات الطالب */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الدراسة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">الحلقة</p>
                      <p className="text-lg font-medium">{stats.currentCircle || 'غير محدد'}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-emerald-600" />
                  </div>
                  {stats.currentTeacher && (
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">المعلم</p>
                        <p className="text-lg font-medium">{stats.currentTeacher}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'assignments':
        return (
          <StudentAssignmentsPage
            studentId={user.id}
            organizationId={organization.id}
          />
        );

      case 'memorization':
        return (
          <StudentMemorizationPage
            studentId={user.id}
            organizationId={organization.id}
          />
        );

      case 'qr-code':
        return (
          <StudentQRCode
            studentId={user.id}
            studentName={user.full_name}
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
      role="student"
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
