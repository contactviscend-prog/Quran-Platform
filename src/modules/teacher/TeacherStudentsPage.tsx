import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Progress } from '../../components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search, UserPlus, BookOpen, TrendingUp, Award, Calendar, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface TeacherStudentsPageProps {
  teacherId: string;
  organizationId: string;
}

interface Student {
  id: string;
  full_name: string;
  circle_name?: string;
  total_recitations: number;
  average_grade: number;
  attendance_rate: number;
  last_recitation?: string;
  status: 'active' | 'inactive';
}

export function TeacherStudentsPage({ teacherId, organizationId }: TeacherStudentsPageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [teacherId, organizationId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = students.filter(student =>
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Get teacher's circles
      const { data: circles } = await supabase
        .from('circles')
        .select('id, name')
        .eq('organization_id', organizationId)
        .eq('teacher_id', teacherId)
        .eq('is_active', true);

      if (!circles || circles.length === 0) {
        setStudents([]);
        setFilteredStudents([]);
        return;
      }

      const circleIds = circles.map(c => c.id);

      // Get students in these circles
      const { data: enrollments } = await supabase
        .from('circle_enrollments')
        .select(`
          student:profiles!circle_enrollments_student_id_fkey(id, full_name, status),
          circle:circles(name)
        `)
        .in('circle_id', circleIds);

      if (!enrollments) return;

      // Get statistics for each student
      const studentsWithStats = await Promise.all(
        enrollments.map(async (enrollment: any) => {
          const studentId = enrollment.student.id;

          // Get recitations
          const { data: recitations } = await supabase
            .from('recitations')
            .select('grade, date')
            .eq('student_id', studentId)
            .eq('organization_id', organizationId);

          // Get attendance
          const { data: attendance } = await supabase
            .from('attendance')
            .select('status')
            .eq('student_id', studentId)
            .eq('organization_id', organizationId);

          const totalRecitations = recitations?.length || 0;
          const averageGrade = totalRecitations > 0 && recitations
            ? Math.round(recitations.reduce((sum: number, r: any) => sum + (r.grade || 0), 0) / totalRecitations)
            : 0;

          const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
          const totalAttendance = attendance?.length || 1;
          const attendanceRate = Math.round((presentCount / totalAttendance) * 100);

          const lastRecitation = recitations && recitations.length > 0
            ? recitations[recitations.length - 1].date
            : undefined;

          return {
            id: studentId,
            full_name: enrollment.student.full_name,
            circle_name: enrollment.circle?.name,
            total_recitations: totalRecitations,
            average_grade: averageGrade,
            attendance_rate: attendanceRate,
            last_recitation: lastRecitation,
            status: enrollment.student.status,
          };
        })
      );

      setStudents(studentsWithStats);
      setFilteredStudents(studentsWithStats);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast.error('فشل تحميل قائمة الطلاب');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 75) return 'text-blue-600';
    if (grade >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-100 text-green-800';
    if (rate >= 75) return 'bg-blue-100 text-blue-800';
    if (rate >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const stats = [
    {
      title: 'إجمالي الطلاب',
      value: students.length.toString(),
      icon: UserPlus,
      color: 'bg-blue-500',
    },
    {
      title: 'الطلاب النشطون',
      value: students.filter(s => s.status === 'active').length.toString(),
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
    {
      title: 'متوسط التسميع',
      value: students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + s.total_recitations, 0) / students.length).toString()
        : '0',
      icon: BookOpen,
      color: 'bg-purple-500',
    },
    {
      title: 'متوسط الدرجات',
      value: students.length > 0
        ? `${Math.round(students.reduce((sum, s) => sum + s.average_grade, 0) / students.length)}%`
        : '0%',
      icon: Award,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">طلابي</h1>
        <p className="text-gray-600">قائمة جميع الطلاب وتقدمهم الدراسي</p>
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

      {/* قائمة الطلاب */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة الطلاب</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث عن طالب..."
                  className="pr-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-2">جاري التحميل...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">لا يوجد طلاب</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الطالب</TableHead>
                  <TableHead className="text-right">الحلقة</TableHead>
                  <TableHead className="text-right">التسميع</TableHead>
                  <TableHead className="text-right">المعدل</TableHead>
                  <TableHead className="text-right">الحضور</TableHead>
                  <TableHead className="text-right">آخر تسميع</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.full_name}</TableCell>
                    <TableCell>{student.circle_name || '-'}</TableCell>
                    <TableCell>{student.total_recitations} مرة</TableCell>
                    <TableCell>
                      <span className={`font-medium ${getGradeColor(student.average_grade)}`}>
                        {student.average_grade}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAttendanceColor(student.attendance_rate)}>
                        {student.attendance_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {student.last_recitation
                        ? new Date(student.last_recitation).toLocaleDateString('ar-SA')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
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

      {/* تفاصيل الطالب */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الطالب: {selectedStudent?.full_name}</DialogTitle>
            <DialogDescription>معلومات شاملة عن تقدم الطالب الدراسي</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <BookOpen className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                      <p className="text-2xl font-semibold">{selectedStudent.total_recitations}</p>
                      <p className="text-sm text-gray-600">إجمالي التسميع</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Award className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-2xl font-semibold">{selectedStudent.average_grade}%</p>
                      <p className="text-sm text-gray-600">المعدل العام</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>معدل الحضور</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={selectedStudent.attendance_rate} className="h-3" />
                  <p className="text-sm text-gray-600 mt-2">{selectedStudent.attendance_rate}% من الأيام</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معلومات إضافية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحلقة:</span>
                    <span className="font-medium">{selectedStudent.circle_name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">آخر تسميع:</span>
                    <span className="font-medium">
                      {selectedStudent.last_recitation
                        ? new Date(selectedStudent.last_recitation).toLocaleDateString('ar-SA')
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحالة:</span>
                    <Badge variant={selectedStudent.status === 'active' ? 'default' : 'secondary'}>
                      {selectedStudent.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
