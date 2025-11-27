import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Clock, Search, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDemoMode, Profile } from '../lib/supabase';

interface Student {
  id: string;
  name: string;
  attendance: 'present' | 'absent' | 'late' | 'excused' | null;
}

interface QuickAttendancePanelProps {
  user: Profile;
  organization: any;
  circleId?: string;
  date?: string;
  onAttendanceUpdate?: () => void;
}

export function QuickAttendancePanel({
  user,
  organization,
  circleId,
  date = new Date().toISOString().split('T')[0],
  onAttendanceUpdate,
}: QuickAttendancePanelProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (circleId) {
      fetchStudents();
    }
  }, [circleId, date]);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      if (isDemoMode()) {
        setStudents([
          { id: '1', name: 'فاطمة أحمد', attendance: null },
          { id: '2', name: 'محمد علي', attendance: null },
          { id: '3', name: 'عائشة سالم', attendance: null },
          { id: '4', name: 'يوسف خالد', attendance: null },
          { id: '5', name: 'نورة عبدالله', attendance: null },
          { id: '6', name: 'عبدالرحمن محمد', attendance: null },
        ]);
        return;
      }

      // Fetch students from circle enrollments
      const { data } = await supabase
        .from('circle_enrollments')
        .select(`
          profiles!student_id(id, full_name)
        `)
        .eq('circle_id', circleId);

      if (data) {
        setStudents(
          data.map((enrollment: any) => ({
            id: enrollment.profiles?.id || '',
            name: enrollment.profiles?.full_name || 'Unknown',
            attendance: null,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('فشل تحميل بيانات الطلاب');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setStudents(students.map(student =>
      student.id === studentId ? { ...student, attendance: status } : student
    ));
    setHasChanges(true);
  };

  const submitAttendance = async () => {
    try {
      if (isDemoMode()) {
        const present = students.filter(s => s.attendance === 'present').length;
        const absent = students.filter(s => s.attendance === 'absent').length;
        const excused = students.filter(s => s.attendance === 'excused').length;
        const late = students.filter(s => s.attendance === 'late').length;

        await new Promise(resolve => setTimeout(resolve, 500));
        toast.success(`تم تسجيل الحضور:\nحاضر: ${present}\nغائب: ${absent}\nمتأخر: ${late}\nبعذر: ${excused}`);
        setHasChanges(false);
        onAttendanceUpdate?.();
        return;
      }

      // Submit attendance records to database
      const attendanceRecords = students
        .filter(s => s.attendance !== null)
        .map(s => ({
          organization_id: organization.id,
          circle_id: circleId,
          student_id: s.id,
          date: date,
          status: s.attendance,
          recorded_by: user.id,
        }));

      if (attendanceRecords.length === 0) {
        toast.warning('الرجاء تحديد حضور واحد على الأقل');
        return;
      }

      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, {
          onConflict: 'organization_id,circle_id,student_id,date',
        });

      if (error) throw error;

      const present = students.filter(s => s.attendance === 'present').length;
      const absent = students.filter(s => s.attendance === 'absent').length;
      const late = students.filter(s => s.attendance === 'late').length;
      const excused = students.filter(s => s.attendance === 'excused').length;

      toast.success(`تم حفظ الحضور - حاضر: ${present} | غائب: ${absent} | متأخر: ${late} | بعذر: ${excused}`);
      setHasChanges(false);
      onAttendanceUpdate?.();
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast.error('فشل حفظ الحضور');
    }
  };

  const getAttendanceBadge = (status: Student['attendance']) => {
    if (!status) return null;

    const badges = {
      present: { color: 'bg-green-100 text-green-800', label: 'حاضر' },
      absent: { color: 'bg-red-100 text-red-800', label: 'غائب' },
      late: { color: 'bg-yellow-100 text-yellow-800', label: 'متأخر' },
      excused: { color: 'bg-blue-100 text-blue-800', label: 'بعذر' },
    };

    const badge = badges[status];
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const stats = {
    present: students.filter(s => s.attendance === 'present').length,
    absent: students.filter(s => s.attendance === 'absent').length,
    late: students.filter(s => s.attendance === 'late').length,
    excused: students.filter(s => s.attendance === 'excused').length,
    total: students.length,
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!circleId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500 py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>الرجاء اختيار حلقة من لوحة التحكم</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats Summary - Compact */}
      <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
        <div className="p-2 border rounded bg-gray-50">
          <p className="text-gray-600">{stats.total}</p>
          <p className="text-gray-500 text-xs">إجمالي</p>
        </div>
        <div className="p-2 border rounded bg-green-50">
          <p className="text-green-600 font-semibold">{stats.present}</p>
          <p className="text-green-600 text-xs">حاضر</p>
        </div>
        <div className="p-2 border rounded bg-red-50">
          <p className="text-red-600 font-semibold">{stats.absent}</p>
          <p className="text-red-600 text-xs">غائب</p>
        </div>
        <div className="p-2 border rounded bg-yellow-50">
          <p className="text-yellow-600 font-semibold">{stats.late + stats.excused}</p>
          <p className="text-yellow-600 text-xs">آخر</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400" />
        <Input
          placeholder="ابحث..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-9 py-2 text-sm"
        />
      </div>

      {/* Students List */}
      {loading ? (
        <div className="text-center text-gray-500 text-sm py-4">جاري التحميل...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center text-gray-500 text-sm py-4">لا يوجد طلاب</div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="p-2.5 border rounded text-sm flex items-center justify-between gap-2 hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs truncate">{student.name}</p>
                {student.attendance && (
                  <div className="text-xs mt-0.5">
                    {getAttendanceBadge(student.attendance)}
                  </div>
                )}
              </div>
              <div className="flex gap-0.5 flex-shrink-0">
                <Button
                  size="sm"
                  variant={student.attendance === 'present' ? 'default' : 'outline'}
                  className={
                    student.attendance === 'present'
                      ? 'bg-green-600 hover:bg-green-700 h-7 w-7 p-0'
                      : 'h-7 w-7 p-0'
                  }
                  onClick={() => markAttendance(student.id, 'present')}
                  title="حاضر"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant={student.attendance === 'absent' ? 'default' : 'outline'}
                  className={
                    student.attendance === 'absent'
                      ? 'bg-red-600 hover:bg-red-700 h-7 w-7 p-0'
                      : 'h-7 w-7 p-0'
                  }
                  onClick={() => markAttendance(student.id, 'absent')}
                  title="غائب"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant={student.attendance === 'late' ? 'default' : 'outline'}
                  className={
                    student.attendance === 'late'
                      ? 'bg-yellow-600 hover:bg-yellow-700 h-7 w-7 p-0'
                      : 'h-7 w-7 p-0'
                  }
                  onClick={() => markAttendance(student.id, 'late')}
                  title="متأخر"
                >
                  <Clock className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant={student.attendance === 'excused' ? 'default' : 'outline'}
                  className={
                    student.attendance === 'excused'
                      ? 'bg-blue-600 hover:bg-blue-700 h-7 px-1.5 text-xs'
                      : 'h-7 px-1.5 text-xs'
                  }
                  onClick={() => markAttendance(student.id, 'excused')}
                  title="بعذر"
                >
                  بعذر
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Button */}
      {hasChanges && (
        <Button
          onClick={submitAttendance}
          className="w-full h-8 text-sm bg-emerald-600 hover:bg-emerald-700"
        >
          <Save className="w-3.5 h-3.5 ml-1" />
          حفظ
        </Button>
      )}
    </div>
  );
}
