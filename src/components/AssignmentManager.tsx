import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CalendarIcon, Plus, Trash2, Edit, CheckCircle, Clock } from 'lucide-react';
import { QuranSelector, QuranSelection } from './QuranSelector';
import { toast } from 'sonner';
import { getCurrentHijriDate, formatHijriDate, addHijriDays, formatHijriDateForStorage } from '../lib/hijriCalendar';

interface Assignment {
  id: string;
  studentId: string;
  studentName: string;
  surahName: string;
  surahNumber: number;
  fromAyah: number;
  toAyah: number;
  totalAyahs: number;
  estimatedLines: number;
  dueDate: string; // التاريخ الهجري
  dueDateGregorian: string; // التاريخ الميلادي
  status: 'pending' | 'completed' | 'overdue';
  type: 'memorization' | 'review' | 'consolidation';
  notes?: string;
}

interface AssignmentManagerProps {
  circleId: string;
  students: Array<{ id: string; full_name: string }>;
}

export function AssignmentManager({ circleId, students }: AssignmentManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [quranSelection, setQuranSelection] = useState<QuranSelection | null>(null);
  const [assignmentType, setAssignmentType] = useState<'memorization' | 'review' | 'consolidation'>('memorization');
  const [daysUntilDue, setDaysUntilDue] = useState(1);
  const [notes, setNotes] = useState('');
  
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      studentId: 'student1',
      studentName: 'محمد أحمد',
      surahName: 'البقرة',
      surahNumber: 2,
      fromAyah: 1,
      toAyah: 5,
      totalAyahs: 5,
      estimatedLines: 10,
      dueDate: formatHijriDateForStorage(addHijriDays(getCurrentHijriDate(), 1)),
      dueDateGregorian: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: 'pending',
      type: 'memorization',
      notes: 'التركيز على التجويد',
    },
    {
      id: '2',
      studentId: 'student2',
      studentName: 'فاطمة علي',
      surahName: 'آل عمران',
      surahNumber: 3,
      fromAyah: 1,
      toAyah: 10,
      totalAyahs: 10,
      estimatedLines: 20,
      dueDate: formatHijriDateForStorage(getCurrentHijriDate()),
      dueDateGregorian: new Date().toISOString().split('T')[0],
      status: 'completed',
      type: 'review',
    },
  ]);

  const currentHijriDate = getCurrentHijriDate();

  const handleCreateAssignment = () => {
    if (selectedStudents.length === 0) {
      toast.error('الرجاء اختيار طالب واحد على الأقل');
      return;
    }

    if (!quranSelection) {
      toast.error('الرجاء تحديد نطاق التسميع');
      return;
    }

    const dueDate = addHijriDays(currentHijriDate, daysUntilDue);
    const dueDateGregorian = new Date(Date.now() + daysUntilDue * 86400000).toISOString().split('T')[0];

    const newAssignments: Assignment[] = selectedStudents.map((studentId) => {
      const student = students.find(s => s.id === studentId);
      return {
        id: `${Date.now()}-${studentId}`,
        studentId,
        studentName: student?.full_name || '',
        surahName: quranSelection.surahName,
        surahNumber: quranSelection.surahNumber,
        fromAyah: quranSelection.fromAyah,
        toAyah: quranSelection.toAyah,
        totalAyahs: quranSelection.totalAyahs,
        estimatedLines: quranSelection.estimatedLines,
        dueDate: formatHijriDateForStorage(dueDate),
        dueDateGregorian,
        status: 'pending' as const,
        type: assignmentType,
        notes,
      };
    });

    setAssignments([...assignments, ...newAssignments]);
    toast.success(`تم تعيين التكليف لـ ${selectedStudents.length} طالب`);
    
    // إعادة تعيين النموذج
    setSelectedStudents([]);
    setNotes('');
    setIsDialogOpen(false);
  };

  const handleDeleteAssignment = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التكليف؟')) {
      setAssignments(assignments.filter(a => a.id !== id));
      toast.success('تم حذف التكليف');
    }
  };

  const handleMarkComplete = (id: string) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status: 'completed' as const } : a
    ));
    toast.success('تم تحديد التكليف كمكتمل');
  };

  const getStatusBadge = (status: Assignment['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">مكتمل</Badge>;
      case 'pending':
        return <Badge className="bg-blue-600">قيد الانتظار</Badge>;
      case 'overdue':
        return <Badge className="bg-red-600">متأخر</Badge>;
    }
  };

  const getTypeBadge = (type: Assignment['type']) => {
    switch (type) {
      case 'memorization':
        return <Badge variant="secondary">حفظ جديد</Badge>;
      case 'review':
        return <Badge variant="secondary" className="bg-purple-100">مراجعة</Badge>;
      case 'consolidation':
        return <Badge variant="secondary" className="bg-orange-100">تثبيت</Badge>;
    }
  };

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl">إدارة التكاليف</h2>
          <p className="text-gray-600 mt-1">تعيين ومتابعة تكاليف الحفظ والمراجعة للطلاب</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 ml-2" />
              تكليف جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء تكليف جديد</DialogTitle>
              <DialogDescription>
                حدد الطلاب ونطاق الحفظ المطلوب وموعد التسليم
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* اختيار نوع التكليف */}
              <div className="space-y-2">
                <Label>نوع التكليف *</Label>
                <Select value={assignmentType} onValueChange={(value: any) => setAssignmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="memorization">حفظ جديد</SelectItem>
                    <SelectItem value="review">مراجعة</SelectItem>
                    <SelectItem value="consolidation">تثبيت</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* اختيار الطلاب */}
              <div className="space-y-2">
                <Label>اختيار الطلاب *</Label>
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                  {students.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      لا توجد طلاب في هذه الحلقة
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2 mb-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedStudents(students.map(s => s.id))}
                        >
                          تحديد الكل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedStudents([])}
                        >
                          إلغاء التحديد
                        </Button>
                      </div>
                      {students.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents([...selectedStudents, student.id]);
                              } else {
                                setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span>{student.full_name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {selectedStudents.length > 0 && (
                  <p className="text-sm text-gray-600">
                    تم اختيار {selectedStudents.length} طالب
                  </p>
                )}
              </div>

              {/* محدد القرآن */}
              <QuranSelector onSelectionChange={setQuranSelection} />

              {/* موعد التسليم */}
              <div className="space-y-2">
                <Label>موعد التسليم</Label>
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-gray-500" />
                  <Select 
                    value={daysUntilDue.toString()} 
                    onValueChange={(value) => setDaysUntilDue(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">غداً</SelectItem>
                      <SelectItem value="2">بعد يومين</SelectItem>
                      <SelectItem value="3">بعد 3 أيام</SelectItem>
                      <SelectItem value="7">بعد أسبوع</SelectItem>
                      <SelectItem value="14">بعد أسبوعين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-gray-600">
                  التاريخ: {formatHijriDate(addHijriDays(currentHijriDate, daysUntilDue), 'long')}
                </p>
              </div>

              {/* ملاحظات */}
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="notes"
                  placeholder="أضف ملاحظات أو تعليمات للطلاب..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleCreateAssignment}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={selectedStudents.length === 0 || !quranSelection}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء التكليف
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">إجمالي التكاليف</p>
              <p className="text-3xl mt-2">{assignments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">قيد الانتظار</p>
              <p className="text-3xl mt-2 text-blue-600">{pendingAssignments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">المكتملة</p>
              <p className="text-3xl mt-2 text-green-600">{completedAssignments.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة التكاليف */}
      <Card>
        <CardHeader>
          <CardTitle>التكاليف الحالية</CardTitle>
          <CardDescription>جميع تكاليف الحفظ والمراجعة المعينة للطلاب</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الطالب</TableHead>
                  <TableHead className="text-right">النطاق</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right hidden md:table-cell">موعد التسليم</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      لا توجد تكاليف حالياً
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assignment.studentName}</p>
                          {assignment.notes && (
                            <p className="text-xs text-gray-500 mt-1">{assignment.notes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{assignment.surahName}</p>
                          <p className="text-sm text-gray-600">
                            آية {assignment.fromAyah} - {assignment.toAyah}
                          </p>
                          <div className="flex gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {assignment.totalAyahs} آية
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {assignment.estimatedLines} سطر
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(assignment.type)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <p className="text-sm">{assignment.dueDate}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {assignment.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkComplete(assignment.id)}
                              title="تحديد كمكتمل"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
