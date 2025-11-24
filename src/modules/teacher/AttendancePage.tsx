import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Download, Filter } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

interface Student {
  id: string;
  name: string;
  attendance: 'حاضر' | 'غائب' | 'غائب بعذر' | null;
}

interface AttendanceRecord {
  date: string;
  circle: string;
  present: number;
  absent: number;
  excused: number;
  total: number;
}

export function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCircle, setSelectedCircle] = useState('حلقة الفجر');

  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'فاطمة أحمد', attendance: null },
    { id: '2', name: 'محمد علي', attendance: null },
    { id: '3', name: 'عائشة سالم', attendance: null },
    { id: '4', name: 'يوسف خالد', attendance: null },
    { id: '5', name: 'نورة عبدالله', attendance: null },
    { id: '6', name: 'عبدالرحمن محمد', attendance: null },
    { id: '7', name: 'مريم سعيد', attendance: null },
    { id: '8', name: 'خالد أحمد', attendance: null },
  ]);

  const attendanceHistory: AttendanceRecord[] = [
    { date: '2024-03-10', circle: 'حلقة الفجر', present: 22, absent: 2, excused: 0, total: 24 },
    { date: '2024-03-09', circle: 'حلقة الفجر', present: 23, absent: 1, excused: 0, total: 24 },
    { date: '2024-03-08', circle: 'حلقة الفجر', present: 21, absent: 1, excused: 2, total: 24 },
    { date: '2024-03-07', circle: 'حلقة الفجر', present: 24, absent: 0, excused: 0, total: 24 },
    { date: '2024-03-06', circle: 'حلقة الفجر', present: 22, absent: 2, excused: 0, total: 24 },
  ];

  const markAttendance = (studentId: string, status: 'حاضر' | 'غائب' | 'غائب بعذر') => {
    setStudents(students.map(student =>
      student.id === studentId ? { ...student, attendance: status } : student
    ));
  };

  const submitAttendance = () => {
    const present = students.filter(s => s.attendance === 'حاضر').length;
    const absent = students.filter(s => s.attendance === 'غائب').length;
    const excused = students.filter(s => s.attendance === 'غائب بعذر').length;
    
    alert(`تم تسجيل الحضور:\nحاضر: ${present}\nغائب: ${absent}\nغائب بعذر: ${excused}`);
  };

  const getAttendanceBadge = (status: Student['attendance']) => {
    if (!status) return null;
    
    switch (status) {
      case 'حاضر':
        return <Badge className="bg-green-100 text-green-800">حاضر</Badge>;
      case 'غائب':
        return <Badge className="bg-red-100 text-red-800">غائب</Badge>;
      case 'غائب بعذر':
        return <Badge className="bg-yellow-100 text-yellow-800">غائب بعذر</Badge>;
    }
  };

  const calculateAttendanceRate = (record: AttendanceRecord) => {
    return Math.round((record.present / record.total) * 100);
  };

  const stats = [
    {
      title: 'إجمالي الحضور اليوم',
      value: students.filter(s => s.attendance === 'حاضر').length,
      total: students.length,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'الغياب اليوم',
      value: students.filter(s => s.attendance === 'غائب').length,
      total: students.length,
      icon: XCircle,
      color: 'bg-red-500',
    },
    {
      title: 'غياب بعذر',
      value: students.filter(s => s.attendance === 'غائب بعذر').length,
      total: students.length,
      icon: Clock,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">نظام الحضور والغياب</h2>
          <p className="text-gray-600 mt-1">تسجيل ومتابعة حضور الطلاب</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="w-4 h-4 ml-2" />
          تصدير التقرير
        </Button>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">تسجيل الحضور</TabsTrigger>
          <TabsTrigger value="history">السجل</TabsTrigger>
        </TabsList>

        {/* تسجيل الحضور */}
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <CardTitle>تسجيل حضور اليوم</CardTitle>
                <div className="flex gap-2 w-full md:w-auto">
                  <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="حلقة الفجر">حلقة الفجر</SelectItem>
                      <SelectItem value="حلقة المغرب">حلقة المغرب</SelectItem>
                      <SelectItem value="حلقة العصر">حلقة العصر</SelectItem>
                      <SelectItem value="حلقة الظهر">حلقة الظهر</SelectItem>
                    </SelectContent>
                  </Select>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex h-10 w-full md:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* الإحصائيات السريعة */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {stats.map((stat) => (
                  <Card key={stat.title}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{stat.title}</p>
                          <p className="text-3xl mt-2">
                            {stat.value}
                            <span className="text-lg text-gray-500">/{stat.total}</span>
                          </p>
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
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-700 font-medium">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        {getAttendanceBadge(student.attendance)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={student.attendance === 'حاضر' ? 'default' : 'outline'}
                        className={student.attendance === 'حاضر' ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => markAttendance(student.id, 'حاضر')}
                      >
                        <CheckCircle className="w-4 h-4 ml-2" />
                        حاضر
                      </Button>
                      <Button
                        size="sm"
                        variant={student.attendance === 'غائب' ? 'default' : 'outline'}
                        className={student.attendance === 'غائب' ? 'bg-red-600 hover:bg-red-700' : ''}
                        onClick={() => markAttendance(student.id, 'غائب')}
                      >
                        <XCircle className="w-4 h-4 ml-2" />
                        غائب
                      </Button>
                      <Button
                        size="sm"
                        variant={student.attendance === 'غائب بعذر' ? 'default' : 'outline'}
                        className={student.attendance === 'غائب بعذر' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                        onClick={() => markAttendance(student.id, 'غائب بعذر')}
                      >
                        <Clock className="w-4 h-4 ml-2" />
                        بعذر
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={submitAttendance}
                  className="bg-emerald-600 hover:bg-emerald-700 px-8"
                  disabled={students.every(s => s.attendance === null)}
                >
                  حفظ الحضور
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* سجل الحضور */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>سجل الحضور</CardTitle>
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحلقات</SelectItem>
                    <SelectItem value="حلقة الفجر">حلقة الفجر</SelectItem>
                    <SelectItem value="حلقة المغرب">حلقة المغرب</SelectItem>
                    <SelectItem value="حلقة العصر">حلقة العصر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceHistory.map((record, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{record.circle}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <CalendarIcon className="w-4 h-4" />
                          {record.date}
                        </p>
                      </div>
                      <Badge
                        className={
                          calculateAttendanceRate(record) >= 90
                            ? 'bg-green-100 text-green-800'
                            : calculateAttendanceRate(record) >= 75
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }
                      >
                        {calculateAttendanceRate(record)}% نسبة الحضور
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-2xl font-semibold">{record.total}</p>
                        <p className="text-xs text-gray-600">إجمالي</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="text-2xl font-semibold text-green-600">{record.present}</p>
                        <p className="text-xs text-gray-600">حاضر</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded">
                        <p className="text-2xl font-semibold text-red-600">{record.absent}</p>
                        <p className="text-xs text-gray-600">غائب</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <p className="text-2xl font-semibold text-yellow-600">{record.excused}</p>
                        <p className="text-xs text-gray-600">بعذر</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
