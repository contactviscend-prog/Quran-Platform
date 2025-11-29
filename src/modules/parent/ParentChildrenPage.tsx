import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Users, TrendingUp, Calendar, Award, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, isDemoMode } from '../../lib/supabase';
import { toast } from 'sonner';

interface ParentChildrenPageProps {
  parentId: string;
  organizationId: string;
}

interface Child {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  teacher: string;
  circle: string;
  progress: number;
  attendance: number;
  lastReview: string;
  rating: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول';
  totalParts: number;
  currentSurah: string;
  nextSession: string;
}

export function ParentChildrenPage({ parentId, organizationId }: ParentChildrenPageProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string>('');

  useEffect(() => {
    fetchChildren();
  }, [parentId, organizationId]);

  const fetchChildren = async () => {
    try {
      setLoading(true);

      if (isDemoMode()) {
        // بيانات وهمية للعرض التوضيحي
        const demoChildren: Child[] = [
          {
            id: '1',
            name: 'فاطمة عبدالله',
            age: 12,
            gender: 'female',
            teacher: 'أحمد المعلم',
            circle: 'حلقة الفجر',
            progress: 85,
            attendance: 18,
            lastReview: 'اليوم',
            rating: 'ممتاز',
            totalParts: 5,
            currentSurah: 'سورة البقرة',
            nextSession: '2024-01-20',
          },
          {
            id: '2',
            name: 'محمد عبدالله',
            age: 10,
            gender: 'male',
            teacher: 'عمر الحافظ',
            circle: 'حلقة المغرب',
            progress: 65,
            attendance: 16,
            lastReview: 'أمس',
            rating: 'جيد',
            totalParts: 3,
            currentSurah: 'سورة آل عمران',
            nextSession: '2024-01-21',
          },
        ];
        setChildren(demoChildren);
        setSelectedChild(demoChildren[0]?.id || '');
        setLoading(false);
        return;
      }

      // Fetch linked children from database
      const { data: links } = await supabase
        .from('parent_student_links')
        .select('student_id, student:profiles!parent_student_links_student_id_fkey(id, full_name, date_of_birth, gender)')
        .eq('parent_id', parentId);

      if (!links || links.length === 0) {
        setChildren([]);
        setLoading(false);
        return;
      }

      const childrenData: Child[] = [];

      for (const link of links as any[]) {
        const studentId = link.student_id;
        const student = link.student;

        // Get student's circle enrollment
        const { data: enrollment } = await supabase
          .from('circle_enrollments')
          .select('circle:circles(name, teacher:profiles!circles_teacher_id_fkey(full_name))')
          .eq('student_id', studentId)
          .eq('status', 'active')
          .single();

        // Get attendance count this month
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        const { count: attendanceCount } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentId)
          .eq('organization_id', organizationId)
          .eq('status', 'present')
          .gte('date', firstDayOfMonth.toISOString().split('T')[0]);

        // Get student progress
        const { data: progressData } = await supabase
          .from('student_progress')
          .select('parts_memorized, current_surah, last_recitation_date, memorization_details')
          .eq('student_id', studentId)
          .eq('organization_id', organizationId)
          .single();

        // Calculate age
        let age = 0;
        if (student.date_of_birth) {
          const birthDate = new Date(student.date_of_birth);
          age = new Date().getFullYear() - birthDate.getFullYear();
        }

        // Calculate progress percentage
        const progress = (progressData?.parts_memorized || 0) * (100 / 30);

        // Calculate days since last review
        let lastReview = 'لم يتم';
        if (progressData?.last_recitation_date) {
          const lastDate = new Date(progressData.last_recitation_date);
          const today = new Date();
          const daysAgo = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysAgo === 0) lastReview = 'اليوم';
          else if (daysAgo === 1) lastReview = 'أمس';
          else lastReview = `منذ ${daysAgo} أيام`;
        }

        // Determine rating based on progress
        let rating: Child['rating'] = 'مقبول';
        if (progress >= 90) rating = 'ممتاز';
        else if (progress >= 70) rating = 'جيد جداً';
        else if (progress >= 50) rating = 'جيد';

        childrenData.push({
          id: studentId,
          name: student.full_name,
          age,
          gender: student.gender || 'male',
          teacher: (enrollment as any)?.circle?.teacher?.full_name || 'بدون معلم',
          circle: (enrollment as any)?.circle?.name || 'بدون حلقة',
          progress: Math.round(progress),
          attendance: attendanceCount || 0,
          lastReview,
          rating,
          totalParts: progressData?.parts_memorized || 0,
          currentSurah: progressData?.current_surah ? `سورة رقم ${progressData.current_surah}` : 'لم يحدد',
          nextSession: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      }

      setChildren(childrenData);
      setSelectedChild(childrenData[0]?.id || '');
    } catch (error: any) {
      console.error('Error fetching children:', error);
      if (!isDemoMode()) {
        toast.error('فشل تحميل بيانات الأبناء');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'ممتاز':
        return 'bg-green-100 text-green-800';
      case 'جيد جداً':
        return 'bg-blue-100 text-blue-800';
      case 'جيد':
        return 'bg-cyan-100 text-cyan-800';
      case 'مقبول':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600">لا توجد أبناء مرتبطين بحسابك حالياً</p>
        </CardContent>
      </Card>
    );
  }

  const totalChildren = children.length;
  const averageProgress = children.length > 0
    ? Math.round(children.reduce((sum, child) => sum + child.progress, 0) / totalChildren)
    : 0;
  const averageAttendance = children.length > 0
    ? Math.round(children.reduce((sum, child) => sum + child.attendance, 0) / totalChildren)
    : 0;
  const totalAchievements = children.reduce((sum, child) => sum + child.totalParts, 0);

  const stats = [
    {
      title: 'عدد الأبناء',
      value: totalChildren.toString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'متوسط التقدم',
      value: `${averageProgress}%`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
    {
      title: 'متوسط الحضور',
      value: `${averageAttendance}/20`,
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      title: 'إجمالي الأجزاء',
      value: totalAchievements.toString(),
      icon: Award,
      color: 'bg-orange-500',
    },
  ];

  const currentChild = children.find((c) => c.id === selectedChild);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">أبنائي</h1>
        <p className="text-gray-600">متابعة تقدم الأبناء في حفظ القرآن الكريم</p>
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

      {/* اختيار الطفل */}
      <Card>
        <CardHeader>
          <CardTitle>اختر الطفل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {children.map((child) => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? 'default' : 'outline'}
                className={`h-auto p-4 justify-start ${
                  selectedChild === child.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                }`}
                onClick={() => setSelectedChild(child.id)}
              >
                <div className="text-right w-full">
                  <p className="font-semibold">{child.name}</p>
                  <p className="text-xs opacity-80">{child.age} سنة • {child.circle}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* تفاصيل الطفل المختار */}
      {currentChild && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-700 text-2xl">{currentChild.name.charAt(0)}</span>
                  </div>
                  <div>
                    <CardTitle>{currentChild.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {currentChild.age} سنة • {currentChild.circle}
                    </p>
                  </div>
                </div>
                <Badge className={getRatingColor(currentChild.rating)}>{currentChild.rating}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">التقدم في الحفظ</span>
                      <span className="font-medium">{currentChild.progress}%</span>
                    </div>
                    <Progress value={currentChild.progress} className="h-3" />
                    <p className="text-xs text-gray-500 mt-2">
                      {currentChild.totalParts} أجزاء محفوظة
                    </p>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">الحضور</span>
                    <span className="font-semibold">{currentChild.attendance}/20 يوم</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">المعلم</span>
                    <span className="font-medium">{currentChild.teacher}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">آخر مراجعة</span>
                    <span className="font-medium">{currentChild.lastReview}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BookOpen className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-semibold">{currentChild.currentSurah}</p>
                  <p className="text-sm text-gray-600">السورة الحالية</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-semibold">{currentChild.totalParts}</p>
                  <p className="text-sm text-gray-600">أجزاء محفوظة</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                  <p className="text-sm font-semibold">
                    {new Date(currentChild.nextSession).toLocaleDateString('ar-SA')}
                  </p>
                  <p className="text-sm text-gray-600">الجلسة القادمة</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {currentChild.attendance < 15 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">تنبيه: نسبة الحضور</h3>
                    <p className="text-sm text-yellow-800">
                      نسبة حضور {currentChild.name} أقل من المعدل المطلوب. يرجى متابعة الأمر مع المعلم.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
