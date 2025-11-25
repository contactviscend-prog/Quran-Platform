import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../../lib/supabase';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { CheckCircle, XCircle, Clock, AlertCircle, Search, Save } from 'lucide-react';

interface AttendanceRecorderProps {
  teacherId: string;
  organizationId: string;
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface Student {
  id: string;
  full_name: string;
  circle_name: string;
  status: AttendanceStatus | null;
  notes?: string;
}

interface Circle {
  id: string;
  name: string;
}

export function AttendanceRecorder({ teacherId, organizationId }: AttendanceRecorderProps) {
  const [selectedCircle, setSelectedCircle] = useState<string>('');
  const [circles, setCircles] = useState<Circle[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [noteDialog, setNoteDialog] = useState(false);
  const [currentNote, setCurrentNote] = useState('');

  useEffect(() => {
    fetchCircles();
  }, [teacherId, organizationId]);

  useEffect(() => {
    if (selectedCircle) {
      fetchStudents();
    }
  }, [selectedCircle, selectedDate]);

  const fetchCircles = async () => {
    try {
      // Demo mode - use mock data
      if (isDemoMode()) {
        const mockCircles: Circle[] = [
          { id: 'circle1', name: 'حلقة الفجر' },
          { id: 'circle2', name: 'حلقة المغرب' },
        ];
        setCircles(mockCircles);
        if (mockCircles.length > 0) {
          setSelectedCircle(mockCircles[0].id);
        }
        return;
      }

      // Real Supabase fetch
      const { data, error } = await supabase
        .from('circles')
        .select('id, name')
        .eq('organization_id', organizationId)
        .eq('teacher_id', teacherId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCircles(data || []);
      if (data && data.length > 0) {
        setSelectedCircle(data[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching circles:', error);
      if (!isDemoMode()) {
        toast.error('فشل تحميل الحلقات');
      }
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);

      // Demo mode - use mock data
      if (isDemoMode()) {
        const mockStudents: Student[] = [
          {
            id: 'student1',
            full_name: 'فاطمة أحمد',
            circle_name: circles.find((c) => c.id === selectedCircle)?.name || 'حلقة الفجر',
            status: null,
            notes: '',
          },
          {
            id: 'student2',
            full_name: 'محمد علي',
            circle_name: circles.find((c) => c.id === selectedCircle)?.name || 'حلقة الفجر',
            status: null,
            notes: '',
          },
          {
            id: 'student3',
            full_name: 'عائشة سالم',
            circle_name: circles.find((c) => c.id === selectedCircle)?.name || 'حلقة الفجر',
            status: null,
            notes: '',
          },
          {
            id: 'student4',
            full_name: 'عبدالله محمد',
            circle_name: circles.find((c) => c.id === selectedCircle)?.name || 'حلقة الفجر',
            status: null,
            notes: '',
          },
          {
            id: 'student5',
            full_name: 'مريم خالد',
            circle_name: circles.find((c) => c.id === selectedCircle)?.name || 'حلقة الفجر',
            status: null,
            notes: '',
          },
        ];
        setStudents(mockStudents);
        setLoading(false);
        return;
      }

      // Real Supabase fetch
      // Get students in the circle
      const { data: enrollments, error: enrollError } = await supabase
        .from('circle_enrollments')
        .select(`
          student_id,
          profiles!circle_enrollments_student_id_fkey(id, full_name)
        `)
        .eq('circle_id', selectedCircle);

      if (enrollError) throw enrollError;

      const circleName = circles.find((c) => c.id === selectedCircle)?.name || '';

      // Get existing attendance for the selected date
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('student_id, status, notes')
        .eq('circle_id', selectedCircle)
        .eq('date', selectedDate);

      if (attendanceError) throw attendanceError;

      const attendanceMap = new Map(
        attendanceData?.map((a) => [a.student_id, { status: a.status, notes: a.notes }]) || []
      );

      const studentsWithAttendance: Student[] =
        enrollments?.map((enrollment: any) => ({
          id: enrollment.profiles.id,
          full_name: enrollment.profiles.full_name,
          circle_name: circleName,
          status: attendanceMap.get(enrollment.profiles.id)?.status || null,
          notes: attendanceMap.get(enrollment.profiles.id)?.notes || '',
        })) || [];

      setStudents(studentsWithAttendance);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      if (!isDemoMode()) {
        toast.error('فشل تحميل قائمة الطلاب');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const openNoteDialog = (student: Student) => {
    setSelectedStudent(student);
    setCurrentNote(student.notes || '');
    setNoteDialog(true);
  };

  const saveNote = () => {
    if (selectedStudent) {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === selectedStudent.id
            ? { ...student, notes: currentNote }
            : student
        )
      );
      setNoteDialog(false);
      setSelectedStudent(null);
      setCurrentNote('');
    }
  };

  const saveAllAttendance = async () => {
    try {
      setSaving(true);

      // Prepare attendance records
      const attendanceRecords = students
        .filter((student) => student.status !== null)
        .map((student) => ({
          organization_id: organizationId,
          circle_id: selectedCircle,
          student_id: student.id,
          teacher_id: teacherId,
          date: selectedDate,
          status: student.status,
          notes: student.notes || null,
        }));

      if (attendanceRecords.length === 0) {
        toast.error('يرجى تحديد حالة الحضور لطالب واحد على الأقل');
        return;
      }

      // Demo mode - just show success message
      if (isDemoMode()) {
        // Simulate a short delay
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.success('تم حفظ الحضور بنجاح (Demo Mode)');
        setSaving(false);
        return;
      }

      // Real Supabase save
      // Delete existing records for this date and circle
      const { error: deleteError } = await supabase
        .from('attendance')
        .delete()
        .eq('circle_id', selectedCircle)
        .eq('date', selectedDate);

      if (deleteError) throw deleteError;

      // Insert new records
      const { error: insertError } = await supabase
        .from('attendance')
        .insert(attendanceRecords);

      if (insertError) throw insertError;

      toast.success('تم حفظ الحضور بنجا��');
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      if (!isDemoMode()) {
        toast.error('فشل حفظ الحضور');
      }
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    setStudents((prev) =>
      prev.map((student) => ({ ...student, status: 'present' as AttendanceStatus }))
    );
    toast.success('تم تعليم جميع الطلاب كحاضرين');
  };

  const getStatusColor = (status: AttendanceStatus | null) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'excused':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: AttendanceStatus | null) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5" />;
      case 'absent':
        return <XCircle className="w-5 h-5" />;
      case 'late':
        return <Clock className="w-5 h-5" />;
      case 'excused':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: AttendanceStatus | null) => {
    switch (status) {
      case 'present':
        return 'حاضر';
      case 'absent':
        return 'غائب';
      case 'late':
        return 'متأخر';
      case 'excused':
        return 'مستأذن';
      default:
        return 'لم يتم التحديد';
    }
  };

  const filteredStudents = students.filter((student) =>
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    present: students.filter((s) => s.status === 'present').length,
    absent: students.filter((s) => s.status === 'absent').length,
    late: students.filter((s) => s.status === 'late').length,
    excused: students.filter((s) => s.status === 'excused').length,
    total: students.length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">تسجيل الحضور</h1>
        <p className="text-gray-600">تسجيل حضور الطلاب في الحلقات</p>
      </div>

      {/* عناصر التحكم */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>الحلقة</Label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-white"
                value={selectedCircle}
                onChange={(e) => setSelectedCircle(e.target.value)}
              >
                {circles.map((circle) => (
                  <option key={circle.id} value={circle.id}>
                    {circle.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>البحث عن طالب</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ابحث باسم الطالب..."
                  className="pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-semibold mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">إجمالي الطلاب</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-semibold text-green-700 mb-1">{stats.present}</div>
            <div className="text-sm text-green-600">حاضر</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-semibold text-red-700 mb-1">{stats.absent}</div>
            <div className="text-sm text-red-600">غائب</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-semibold text-yellow-700 mb-1">{stats.late}</div>
            <div className="text-sm text-yellow-600">متأخر</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-semibold text-blue-700 mb-1">{stats.excused}</div>
            <div className="text-sm text-blue-600">مستأذن</div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الطلاب */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة الطلاب</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllPresent}
                disabled={loading}
              >
                <CheckCircle className="w-4 h-4 ml-2" />
                تعليم الكل حاضر
              </Button>
              <Button
                size="sm"
                onClick={saveAllAttendance}
                disabled={saving || loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ الحضور
                  </>
                )}
              </Button>
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
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <Card
                  key={student.id}
                  className={`border-2 ${getStatusColor(student.status)}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-700 font-semibold">
                            {student.full_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{student.full_name}</p>
                          {student.status && (
                            <Badge className={`${getStatusColor(student.status)} mt-1`}>
                              <span className="ml-1">{getStatusIcon(student.status)}</span>
                              {getStatusLabel(student.status)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStudentStatus(student.id, 'present')}
                          className={`${
                            student.status === 'present'
                              ? 'bg-green-100 border-green-300 text-green-700'
                              : ''
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStudentStatus(student.id, 'absent')}
                          className={`${
                            student.status === 'absent'
                              ? 'bg-red-100 border-red-300 text-red-700'
                              : ''
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStudentStatus(student.id, 'late')}
                          className={`${
                            student.status === 'late'
                              ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                              : ''
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStudentStatus(student.id, 'excused')}
                          className={`${
                            student.status === 'excused'
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : ''
                          }`}
                        >
                          <AlertCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openNoteDialog(student)}
                        >
                          ملاحظة
                        </Button>
                      </div>
                    </div>
                    {student.notes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        <strong>ملاحظة:</strong> {student.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة الملاحظات */}
      <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة ملاحظة - {selectedStudent?.full_name}</DialogTitle>
            <DialogDescription>أضف ملاحظة لطالب معين</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الملاحظة</Label>
              <Textarea
                placeholder="اكتب ملاحظتك هنا..."
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setNoteDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={saveNote} className="bg-emerald-600 hover:bg-emerald-700">
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
