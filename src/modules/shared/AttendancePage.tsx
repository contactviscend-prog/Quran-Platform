import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Search, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDemoMode } from '../../lib/supabase';

interface AttendancePageProps {
  teacherId: string;
  organizationId: string;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  recorded_by: string;
}

export function AttendancePage({ teacherId, organizationId }: AttendancePageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'late' | 'excused'>('present');

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, [organizationId, selectedDate]);

  const fetchStudents = async () => {
    try {
      if (isDemoMode()) {
        setStudents([
          { id: '1', full_name: 'أحمد محمد', email: 'ahmed@example.com' },
          { id: '2', full_name: 'فاطمة علي', email: 'fatima@example.com' },
          { id: '3', full_name: 'محمود سالم', email: 'mahmoud@example.com' },
        ]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('organization_id', organizationId)
        .eq('role', 'student')
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('فشل في تحميل الطلاب');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      if (isDemoMode()) {
        setAttendance([
          { id: '1', student_id: '1', date: selectedDate, status: 'present', recorded_by: teacherId },
          { id: '2', student_id: '2', date: selectedDate, status: 'absent', recorded_by: teacherId },
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('recorded_by', teacherId)
        .eq('date', selectedDate);

      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('فشل في تحميل الحضور');
    }
  };

  const handleRecordAttendance = async () => {
    if (!selectedStudent) return;

    try {
      if (isDemoMode()) {
        const existing = attendance.find(a => a.student_id === selectedStudent.id && a.date === selectedDate);
        if (existing) {
          setAttendance(attendance.map(a =>
            a.student_id === selectedStudent.id ? { ...a, status: attendanceStatus } : a
          ));
        } else {
          setAttendance([...attendance, {
            id: Math.random().toString(),
            student_id: selectedStudent.id,
            date: selectedDate,
            status: attendanceStatus,
            recorded_by: teacherId
          }]);
        }
        toast.success('تم تسجيل الحضور');
        setShowDialog(false);
        return;
      }

      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: selectedStudent.id,
          date: selectedDate,
          status: attendanceStatus,
          recorded_by: teacherId,
          organization_id: organizationId
        });

      if (error) throw error;
      toast.success('تم تسجيل الحضور');
      setShowDialog(false);
      fetchAttendance();
    } catch (error) {
      console.error('Error recording attendance:', error);
      toast.error('فشل في تسجيل الحضور');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'excused':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'حاضر';
      case 'absent':
        return 'غائب';
      case 'late':
        return 'متأخر';
      case 'excused':
        return 'غياب معذور';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recordedCount = attendance.filter(a => a.status === 'present').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">الحضور والغياب</h2>
          <p className="text-gray-600 text-sm mt-1">تاريخ: {new Date(selectedDate).toLocaleDateString('ar-SA')}</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الحاضرون</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{recordedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الغائبون</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{attendance.filter(a => a.status === 'absent').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">لم يتم تسجيل</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-600">{students.length - attendance.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلاب</CardTitle>
          <div className="flex gap-2 mt-4">
            <Search className="w-5 h-5 text-gray-400 absolute mt-3 ml-3" />
            <Input
              placeholder="ابحث عن طالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">جاري التحميل...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map(student => {
                    const record = attendance.find(a => a.student_id === student.id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell className="text-sm">{student.email}</TableCell>
                        <TableCell>
                          {record ? (
                            <Badge className={getStatusColor(record.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(record.status)}
                                {getStatusLabel(record.status)}
                              </span>
                            </Badge>
                          ) : (
                            <Badge variant="outline">لم يتم التسجيل</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(student);
                              if (record) {
                                setAttendanceStatus(record.status);
                              } else {
                                setAttendanceStatus('present');
                              }
                              setShowDialog(true);
                            }}
                          >
                            {record ? 'تعديل' : 'تسجيل'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تسجيل الحضور</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <p className="font-medium">{selectedStudent.full_name}</p>
              <div className="grid grid-cols-2 gap-2">
                {(['present', 'absent', 'late', 'excused'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setAttendanceStatus(status)}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      attendanceStatus === status
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      {getStatusIcon(status)}
                    </div>
                    <p className="text-sm font-medium">{getStatusLabel(status)}</p>
                  </button>
                ))}
              </div>
              <Button onClick={handleRecordAttendance} className="w-full">
                تأكيد
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
