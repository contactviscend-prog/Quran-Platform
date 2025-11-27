import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Users, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { isDemoMode, Profile, Organization, supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { SettingsPage } from '../shared/SettingsPage';
import { ParentChildrenPage } from './ParentChildrenPage';

interface ParentDashboardProps {
  user: Profile;
  organization: Organization;
}

interface ChildData {
  id: string;
  full_name: string;
  circle_name: string | null;
  teacher_name: string | null;
  total_recitations: number;
  attendance_count: number;
}

export function ParentDashboard({ user, organization }: ParentDashboardProps) {
  const [currentSection, setCurrentSection] = useState('overview');
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, [organization.id, user.id]);

  const fetchChildren = async () => {
    try {
      // Demo mode - use mock data
      if (isDemoMode()) {
        const mockChildren: ChildData[] = [
          {
            id: '1',
            full_name: 'فاطمة عبدالله',
            circle_name: 'حلقة الفجر',
            teacher_name: 'أحمد المعلم',
            total_recitations: 45,
            attendance_count: 18,
          },
          {
            id: '2',
            full_name: 'محمد عبدالله',
            circle_name: 'حلقة المغرب',
            teacher_name: 'عمر الحافظ',
            total_recitations: 32,
            attendance_count: 16,
          },
        ];
        setChildren(mockChildren);
        setLoading(false);
        return;
      }

      // Real Supabase fetch
      // Get linked children for this parent
      const { data: links, error: linksError } = await supabase
        .from('parent_children_links')
        .select(`
          student_id,
          student:profiles!parent_children_links_student_id_fkey(
            id,
            full_name
          )
        `)
        .eq('parent_id', user.id);

      if (linksError) throw linksError;

      if (!links || links.length === 0) {
        setChildren([]);
        setLoading(false);
        return;
      }

      // For each child, get their circle, teacher, and stats
      const childrenData: ChildData[] = [];
      
      for (const link of (links as any[])) {
        const studentId = link.student_id;
        const studentName = (link.student as any)?.full_name || 'غير معروف';

        // Get circle enrollment
        const { data: enrollment } = await supabase
          .from('circle_enrollments')
          .select(`
            circle:circles(
              name,
              teacher:profiles!circles_teacher_id_fkey(full_name)
            )
          `)
          .eq('student_id', studentId)
          .single();

        // Get recitations count
        const { count: recitationsCount } = await supabase
          .from('recitations')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentId)
          .eq('organization_id', organization.id);

        // Get attendance count (this month)
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        const { count: attendanceCount } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentId)
          .eq('organization_id', organization.id)
          .gte('date', firstDayOfMonth.toISOString().split('T')[0])
          .eq('status', 'present');

        childrenData.push({
          id: studentId,
          full_name: studentName,
          circle_name: (enrollment as any)?.circle?.name || null,
          teacher_name: (enrollment as any)?.circle?.teacher?.[0]?.full_name || null,
          total_recitations: recitationsCount || 0,
          attendance_count: attendanceCount || 0,
        });
      }

      setChildren(childrenData);
    } catch (error: any) {
      console.error('Error fetching children:', error);
      // في Demo Mode لا نعرض رسالة خطأ
      if (!isDemoMode()) {
        toast.error('فشل في تحميل بيانات الأبناء');
      }
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: 'عدد الأبناء', value: children.length.toString(), icon: Users, color: 'bg-blue-500' },
    { 
      title: 'إجمالي التسميع', 
      value: children.reduce((sum, child) => sum + child.total_recitations, 0).toString(), 
      icon: TrendingUp, 
      color: 'bg-emerald-500' 
    },
    { 
      title: 'الحضور هذا الشهر', 
      value: children.reduce((sum, child) => sum + child.attendance_count, 0).toString(), 
      icon: Calendar, 
      color: 'bg-purple-500' 
    },
    { 
      title: 'الأبناء النشطون', 
      value: children.filter(c => c.circle_name).length.toString(), 
      icon: BookOpen, 
      color: 'bg-yellow-500' 
    },
  ];

  const renderContent = () => {
    switch (currentSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl mb-2">لوحة تحكم ولي الأمر</h1>
              <p className="text-gray-600">مرحباً {user.full_name}، تابع تقدم أبنائك</p>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
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

            {/* قائمة الأبناء */}
            {loading ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">جاري التحميل...</p>
                </CardContent>
              </Card>
            ) : children.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">لم يتم ربط أي طالب بحسابك بعد</p>
                  <p className="text-sm text-gray-500 mt-2">الرجاء التواصل مع إدارة المؤسسة لربط أبنائك</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {children.map((child) => (
                  <Card key={child.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-700 text-lg">{child.full_name.charAt(0)}</span>
                          </div>
                          <div>
                            <CardTitle>{child.full_name}</CardTitle>
                            <p className="text-sm text-gray-600">
                              {child.circle_name || 'لم يتم التسجيل في حلقة'}
                            </p>
                          </div>
                        </div>
                        {child.circle_name && (
                          <Badge className="bg-emerald-100 text-emerald-800">نشط</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {child.teacher_name && (
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">المعلم</span>
                            <span className="font-medium">{child.teacher_name}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center p-3 bg-emerald-50 rounded">
                          <span className="text-sm text-gray-600">عدد مرات التسميع</span>
                          <span className="font-medium text-emerald-700">{child.total_recitations}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                          <span className="text-sm text-gray-600">الحضور هذا الشهر</span>
                          <span className="font-medium text-blue-700">{child.attendance_count} يوم</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'children':
        return (
          <ParentChildrenPage 
            parentId={user.id}
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
      role="parent"
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
