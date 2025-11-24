import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Search, Users, BookOpen, TrendingUp, Award, Eye, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';

interface SupervisorTeachersPageProps {
  organizationId: string;
}

interface Teacher {
  id: string;
  full_name: string;
  phone?: string;
  gender: 'male' | 'female';
  circles_count: number;
  students_count: number;
  recitations_count: number;
  average_rating: number;
  attendance_rate: number;
  status: 'active' | 'inactive';
  last_activity?: string;
}

export function SupervisorTeachersPage({ organizationId }: SupervisorTeachersPageProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, [organizationId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = teachers.filter((teacher) =>
        teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeachers(filtered);
    } else {
      setFilteredTeachers(teachers);
    }
  }, [searchQuery, teachers]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);

      // Get all teachers
      const { data: teachersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('role', 'teacher')
        .order('full_name');

      if (!teachersData) {
        setTeachers([]);
        setFilteredTeachers([]);
        return;
      }

      // Get statistics for each teacher
      const teachersWithStats = await Promise.all(
        teachersData.map(async (teacher) => {
          // Get circles count
          const { count: circlesCount } = await supabase
            .from('circles')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .eq('teacher_id', teacher.id)
            .eq('is_active', true);

          // Get circles IDs for this teacher
          const { data: circles } = await supabase
            .from('circles')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('teacher_id', teacher.id);

          const circleIds = circles?.map((c) => c.id) || [];

          // Get students count
          const { count: studentsCount } = circleIds.length > 0
            ? await supabase
                .from('circle_enrollments')
                .select('*', { count: 'exact', head: true })
                .in('circle_id', circleIds)
            : { count: 0 };

          // Get recitations count
          const { count: recitationsCount } = await supabase
            .from('recitations')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .eq('teacher_id', teacher.id);

          // Mock ratings and attendance for demo
          const averageRating = 4.5 + Math.random() * 0.5; // 4.5-5.0
          const attendanceRate = 85 + Math.floor(Math.random() * 15); // 85-100%

          return {
            id: teacher.id,
            full_name: teacher.full_name,
            phone: teacher.phone,
            gender: teacher.gender,
            circles_count: circlesCount || 0,
            students_count: studentsCount || 0,
            recitations_count: recitationsCount || 0,
            average_rating: Math.round(averageRating * 10) / 10,
            attendance_rate: attendanceRate,
            status: teacher.status,
          };
        })
      );

      setTeachers(teachersWithStats);
      setFilteredTeachers(teachersWithStats);
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      toast.error('فشل تحميل قائمة المعلمين');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-100 text-green-800';
    if (rate >= 75) return 'bg-blue-100 text-blue-800';
    if (rate >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.status === 'active').length;
  const totalStudents = teachers.reduce((sum, t) => sum + t.students_count, 0);
  const averageRating = teachers.length > 0
    ? Math.round((teachers.reduce((sum, t) => sum + t.average_rating, 0) / teachers.length) * 10) / 10
    : 0;

  const stats = [
    {
      title: 'إجمالي المعلمين',
      value: totalTeachers.toString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'المعلمون النشطون',
      value: activeTeachers.toString(),
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
    {
      title: 'إجمالي الطلاب',
      value: totalStudents.toString(),
      icon: BookOpen,
      color: 'bg-purple-500',
    },
    {
      title: 'متوسط التقييم',
      value: averageRating.toString(),
      icon: Award,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">المعلمون</h1>
        <p className="text-gray-600">إدارة ومتابعة أداء المعلمين في المؤسسة</p>
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

      {/* قائمة المعلمين */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة المعلمين</CardTitle>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث عن معلم..."
                className="pr-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-2">جاري التحميل...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">لا يوجد معلمون</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المعلم</TableHead>
                  <TableHead className="text-right">الجنس</TableHead>
                  <TableHead className="text-right">الحلقات</TableHead>
                  <TableHead className="text-right">الطلاب</TableHead>
                  <TableHead className="text-right">التسميع</TableHead>
                  <TableHead className="text-right">التقييم</TableHead>
                  <TableHead className="text-right">الحضور</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.full_name}</TableCell>
                    <TableCell>{teacher.gender === 'male' ? 'ذكر' : 'أنثى'}</TableCell>
                    <TableCell>{teacher.circles_count} حلقة</TableCell>
                    <TableCell>{teacher.students_count} طالب</TableCell>
                    <TableCell>{teacher.recitations_count} مرة</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Star className={`w-4 h-4 ${getRatingColor(teacher.average_rating)} fill-current`} />
                        <span className={`font-medium ${getRatingColor(teacher.average_rating)}`}>
                          {teacher.average_rating}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAttendanceColor(teacher.attendance_rate)}>
                        {teacher.attendance_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                        {teacher.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTeacher(teacher)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* تفاصيل المعلم */}
      <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المعلم: {selectedTeacher?.full_name}</DialogTitle>
            <DialogDescription>معلومات شاملة عن أداء المعلم و إحصائياته</DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <BookOpen className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                      <p className="text-2xl font-semibold">{selectedTeacher.circles_count}</p>
                      <p className="text-sm text-gray-600">الحلقات</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Users className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-2xl font-semibold">{selectedTeacher.students_count}</p>
                      <p className="text-sm text-gray-600">الطلاب</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>الأداء والإحصائيات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">عدد التسميعات:</span>
                    <span className="font-semibold">{selectedTeacher.recitations_count} مرة</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">التقييم:</span>
                    <div className="flex items-center gap-2">
                      <Star className={`w-5 h-5 ${getRatingColor(selectedTeacher.average_rating)} fill-current`} />
                      <span className={`font-semibold ${getRatingColor(selectedTeacher.average_rating)}`}>
                        {selectedTeacher.average_rating} / 5.0
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">نسبة الحضور:</span>
                    <Badge className={getAttendanceColor(selectedTeacher.attendance_rate)}>
                      {selectedTeacher.attendance_rate}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الجنس:</span>
                    <span className="font-medium">
                      {selectedTeacher.gender === 'male' ? 'ذكر' : 'أنثى'}
                    </span>
                  </div>
                  {selectedTeacher.phone && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">رقم الجوال:</span>
                      <span className="font-medium" dir="ltr">{selectedTeacher.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الحالة:</span>
                    <Badge variant={selectedTeacher.status === 'active' ? 'default' : 'secondary'}>
                      {selectedTeacher.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {selectedTeacher.average_rating >= 4.5 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Award className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-green-900 mb-1">معلم متميز</h3>
                        <p className="text-sm text-green-800">
                          {selectedTeacher.full_name} يحقق أداءً ممتازاً ويحصل على تقييمات عالية من الطلاب.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}