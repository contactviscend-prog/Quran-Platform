import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../../lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { BookOpen, Users, TrendingUp, Calendar, Eye, UserPlus } from 'lucide-react';

interface TeacherCirclesPageProps {
  teacherId: string;
  organizationId: string;
}

interface Circle {
  id: string;
  name: string;
  level: string;
  description?: string;
  max_students: number;
  is_active: boolean;
  student_count: number;
  average_progress: number;
  last_session?: string;
}

export function TeacherCirclesPage({ teacherId, organizationId }: TeacherCirclesPageProps) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);

  useEffect(() => {
    fetchCircles();
  }, [teacherId, organizationId]);

  const fetchCircles = async () => {
    try {
      setLoading(true);

      // Demo mode - use mock data
      if (isDemoMode()) {
        const mockCircles: Circle[] = [
          {
            id: 'circle1',
            name: 'حلقة الفجر',
            level: 'beginner',
            description: 'حلقة للمبتدئين',
            max_students: 20,
            is_active: true,
            student_count: 15,
            average_progress: 75,
            last_session: new Date().toISOString(),
          },
          {
            id: 'circle2',
            name: 'حلقة العصر',
            level: 'intermediate',
            description: 'حلقة متوسطة',
            max_students: 18,
            is_active: true,
            student_count: 12,
            average_progress: 68,
            last_session: new Date().toISOString(),
          },
        ];
        setCircles(mockCircles);
        setLoading(false);
        return;
      }

      // Real Supabase fetch
      // Get teacher's circles
      const { data: circlesData } = await supabase
        .from('circles')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (!circlesData) {
        setCircles([]);
        return;
      }

      // Get statistics for each circle
      const circlesWithStats = await Promise.all(
        circlesData.map(async (circle) => {
          // Get student count
          const { count: studentCount } = await supabase
            .from('circle_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('circle_id', circle.id);

          // Get average progress (mock for now)
          const averageProgress = Math.floor(Math.random() * 40) + 60; // 60-100%

          return {
            ...circle,
            student_count: studentCount || 0,
            average_progress: averageProgress,
          };
        })
      );

      setCircles(circlesWithStats);
    } catch (error: any) {
      console.error('Error fetching circles:', error);
      if (!isDemoMode()) {
        toast.error('فشل تحميل قائمة الحلقات');
      }
    } finally {
      setLoading(false);
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      default:
        return level;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-purple-100 text-purple-800';
      case 'advanced':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalStudents = circles.reduce((sum, c) => sum + c.student_count, 0);
  const activeCircles = circles.filter(c => c.is_active).length;
  const averageProgress = circles.length > 0
    ? Math.round(circles.reduce((sum, c) => sum + c.average_progress, 0) / circles.length)
    : 0;

  const stats = [
    {
      title: 'الحلقات النشطة',
      value: activeCircles.toString(),
      icon: BookOpen,
      color: 'bg-emerald-500',
    },
    {
      title: 'إجمالي الطلاب',
      value: totalStudents.toString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'متوسط التقدم',
      value: `${averageProgress}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'إجمالي الحلقات',
      value: circles.length.toString(),
      icon: Calendar,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">جاري تحميل الحلقات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">حلقاتي</h1>
        <p className="text-gray-600">إدارة ومتابعة جميع حلقاتك</p>
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

      {/* قائمة الحلقات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {circles.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">لا توجد حلقات مسندة لك حالياً</p>
            </CardContent>
          </Card>
        ) : (
          circles.map((circle) => (
            <Card key={circle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-2">{circle.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getLevelColor(circle.level)}>
                        {getLevelLabel(circle.level)}
                      </Badge>
                      <Badge variant={circle.is_active ? 'default' : 'secondary'}>
                        {circle.is_active ? 'نشطة' : 'غير نشطة'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {circle.description && (
                  <p className="text-sm text-gray-600">{circle.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Users className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                    <p className="text-xl font-semibold">{circle.student_count}</p>
                    <p className="text-xs text-gray-600">طالب</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                    <p className="text-xl font-semibold">{circle.average_progress}%</p>
                    <p className="text-xs text-gray-600">متوسط التقدم</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">سعة الحلقة</span>
                    <span className="font-medium">
                      {circle.student_count} / {circle.max_students}
                    </span>
                  </div>
                  <Progress
                    value={(circle.student_count / circle.max_students) * 100}
                    className="h-2"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="sm"
                    onClick={() => setSelectedCircle(circle)}
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    التفاصيل
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    size="sm"
                  >
                    <UserPlus className="w-4 h-4 ml-2" />
                    إضافة طالب
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* تفاصيل الحلقة */}
      <Dialog open={!!selectedCircle} onOpenChange={() => setSelectedCircle(null)}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الحلقة: {selectedCircle?.name}</DialogTitle>
            <DialogDescription>
              معلومات وإحصائيات مفصلة عن الحلقة
            </DialogDescription>
          </DialogHeader>
          {selectedCircle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Users className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-2xl font-semibold">{selectedCircle.student_count}</p>
                      <p className="text-sm text-gray-600">عدد الطلاب</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                      <p className="text-2xl font-semibold">{selectedCircle.average_progress}%</p>
                      <p className="text-sm text-gray-600">متوسط التقدم</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>معلومات الحلقة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المستوى:</span>
                    <Badge className={getLevelColor(selectedCircle.level)}>
                      {getLevelLabel(selectedCircle.level)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحد الأقصى للطلاب:</span>
                    <span className="font-medium">{selectedCircle.max_students} طالب</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحالة:</span>
                    <Badge variant={selectedCircle.is_active ? 'default' : 'secondary'}>
                      {selectedCircle.is_active ? 'نشطة' : 'غير نشطة'}
                    </Badge>
                  </div>
                  {selectedCircle.description && (
                    <div>
                      <span className="text-gray-600 block mb-2">الوصف:</span>
                      <p className="text-sm">{selectedCircle.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
