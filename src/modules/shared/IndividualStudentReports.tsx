import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Search, User, BookOpen, Calendar, Award, TrendingUp, Download, ChevronRight } from 'lucide-react';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

interface Student {
  id: string;
  name: string;
  circle: string;
  teacher: string;
  totalParts: number;
  totalPages: number;
  totalLines: number;
  attendance: number;
  progress: number;
  totalRecitations: number;
}

export function IndividualStudentReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCircle, setSelectedCircle] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // قائمة الط��اب
  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'فاطمة أحمد',
      circle: 'حلقة الفجر',
      teacher: 'أحمد المعلم',
      totalParts: 15,
      totalPages: 300,
      totalLines: 4500,
      attendance: 98,
      progress: 95,
      totalRecitations: 156,
    },
    {
      id: '2',
      name: 'محمد علي',
      circle: 'حلقة المغرب',
      teacher: 'عمر الحافظ',
      totalParts: 14,
      totalPages: 280,
      totalLines: 4200,
      attendance: 96,
      progress: 93,
      totalRecitations: 148,
    },
    {
      id: '3',
      name: 'عائشة سالم',
      circle: 'حلقة العصر',
      teacher: 'خالد القارئ',
      totalParts: 13,
      totalPages: 260,
      totalLines: 3900,
      attendance: 94,
      progress: 90,
      totalRecitations: 142,
    },
    {
      id: '4',
      name: 'يوسف خالد',
      circle: 'حلقة الفجر',
      teacher: 'أحمد المعلم',
      totalParts: 12,
      totalPages: 240,
      totalLines: 3600,
      attendance: 92,
      progress: 88,
      totalRecitations: 136,
    },
    {
      id: '5',
      name: 'نورة عبدالله',
      circle: 'حلقة المغرب',
      teacher: 'عمر الحافظ',
      totalParts: 11,
      totalPages: 220,
      totalLines: 3300,
      attendance: 90,
      progress: 85,
      totalRecitations: 128,
    },
    {
      id: '6',
      name: 'عبدالله محمود',
      circle: 'حلقة الظهر',
      teacher: 'محمد الحافظ',
      totalParts: 10,
      totalPages: 200,
      totalLines: 3000,
      attendance: 88,
      progress: 80,
      totalRecitations: 120,
    },
    {
      id: '7',
      name: 'سارة إبراهيم',
      circle: 'حلقة العصر',
      teacher: 'خالد القارئ',
      totalParts: 9,
      totalPages: 180,
      totalLines: 2700,
      attendance: 86,
      progress: 75,
      totalRecitations: 112,
    },
    {
      id: '8',
      name: 'أحمد حسن',
      circle: 'حلقة الفجر',
      teacher: 'أحمد المعلم',
      totalParts: 8,
      totalPages: 160,
      totalLines: 2400,
      attendance: 84,
      progress: 70,
      totalRecitations: 104,
    },
  ]);

  // بيانات تفصيلية للطالب المحدد
  const getStudentDetails = (student: Student) => ({
    weeklyProgress: [
      { week: 'الأسبوع 1', pages: 12, lines: 180, recitations: 8 },
      { week: 'الأسبوع 2', pages: 15, lines: 225, recitations: 10 },
      { week: 'الأسبوع 3', pages: 14, lines: 210, recitations: 9 },
      { week: 'الأسبوع 4', pages: 16, lines: 240, recitations: 11 },
      { week: 'الأسبوع 5', pages: 13, lines: 195, recitations: 9 },
      { week: 'الأسبوع 6', pages: 18, lines: 270, recitations: 12 },
    ],
    recitationTypes: [
      { name: 'حفظ جديد', value: 78, color: '#8b5cf6' },
      { name: 'مراجعة', value: 58, color: '#3b82f6' },
      { name: 'تثبيت', value: 20, color: '#06b6d4' },
    ],
    attendanceHistory: [
      { month: 'محرم', present: 20, absent: 0, excused: 1, late: 1 },
      { month: 'صفر', present: 22, absent: 0, excused: 0, late: 0 },
      { month: 'ربيع الأول', present: 21, absent: 1, excused: 0, late: 1 },
      { month: 'ربيع الثاني', present: 23, absent: 0, excused: 1, late: 0 },
      { month: 'جمادى الأول', present: 22, absent: 0, excused: 2, late: 0 },
      { month: 'جمادى الثاني', present: 24, absent: 0, excused: 0, late: 0 },
    ],
    recentRecitations: [
      { id: '1', date: '2024-11-20', surah: 'آل عمران', ayahFrom: 16, ayahTo: 30, type: 'حفظ جديد', grade: 'ممتاز', pages: 2, lines: 30 },
      { id: '2', date: '2024-11-19', surah: 'البقرة', ayahFrom: 255, ayahTo: 260, type: 'مراجعة', grade: 'جيد جداً', pages: 1, lines: 15 },
      { id: '3', date: '2024-11-18', surah: 'آل عمران', ayahFrom: 1, ayahTo: 15, type: 'تثبيت', grade: 'ممتاز', pages: 1.5, lines: 25 },
      { id: '4', date: '2024-11-17', surah: 'البقرة', ayahFrom: 200, ayahTo: 220, type: 'حفظ جديد', grade: 'جيد جداً', pages: 2, lines: 35 },
      { id: '5', date: '2024-11-16', surah: 'آل عمران', ayahFrom: 31, ayahTo: 45, type: 'حفظ جديد', grade: 'ممتاز', pages: 2, lines: 32 },
    ],
    achievements: [
      { id: '1', title: 'حفظ 10 أجزاء', date: '2024-10-15', icon: Award },
      { id: '2', title: 'حضور مثالي لمدة شهر', date: '2024-09-30', icon: Calendar },
      { id: '3', title: 'أفضل تسميع في الحلقة', date: '2024-09-15', icon: BookOpen },
    ],
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCircle = selectedCircle === 'all' || student.circle === selectedCircle;
    return matchesSearch && matchesCircle;
  });

  const handleViewReport = (student: Student) => {
    setSelectedStudent(student);
    setIsReportOpen(true);
  };

  const handleExportReport = () => {
    // TODO: تنفيذ تصدير التقرير
    console.log('Export report for', selectedStudent?.name);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'ممتاز':
        return 'bg-green-100 text-green-800';
      case 'جيد جداً':
        return 'bg-blue-100 text-blue-800';
      case 'جيد':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'حفظ جديد':
        return 'bg-purple-100 text-purple-800';
      case 'مراجعة':
        return 'bg-blue-100 text-blue-800';
      case 'تثبيت':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">تقارير الطلاب الفردية</h2>
          <p className="text-gray-600 mt-1">تفاصيل شاملة عن تقدم وأداء كل طالب</p>
        </div>
      </div>

      {/* فلاتر البحث */}
      <Card>
        <CardHeader>
          <CardTitle>البحث عن طالب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ابحث عن طالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedCircle} onValueChange={setSelectedCircle}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="جميع الحلقات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحلقات</SelectItem>
                <SelectItem value="حلقة الفجر">حلقة الفجر</SelectItem>
                <SelectItem value="حلقة الظهر">حلقة الظهر</SelectItem>
                <SelectItem value="حلقة العصر">حلقة العصر</SelectItem>
                <SelectItem value="حلقة المغرب">حلقة المغرب</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الطلاب */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلاب ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الحلقة</TableHead>
                <TableHead className="text-right">المعلم</TableHead>
                <TableHead className="text-right">الحفظ</TableHead>
                <TableHead className="text-right">الحضور</TableHead>
                <TableHead className="text-right">التقدم</TableHead>
                <TableHead className="text-right">التسميع</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-emerald-700" />
                      </div>
                      {student.name}
                    </div>
                  </TableCell>
                  <TableCell>{student.circle}</TableCell>
                  <TableCell>{student.teacher}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="secondary">{student.totalParts} جزء</Badge>
                      <p className="text-xs text-gray-500">
                        {student.totalPages} صفحة • {student.totalLines} سطر
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={student.attendance} className="h-2 w-20" />
                      <span className="text-sm">{student.attendance}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={student.progress} className="h-2 w-20" />
                      <span className="text-sm">{student.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-800">
                      {student.totalRecitations} تسميع
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewReport(student)}
                      className="gap-1"
                    >
                      عرض التقرير
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* مودال التقرير التفصيلي */}
      {selectedStudent && (
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <p>تقرير الطالب: {selectedStudent.name}</p>
                    <p className="text-sm font-normal text-gray-600">
                      {selectedStudent.circle} • المعلم: {selectedStudent.teacher}
                    </p>
                  </div>
                </div>
                <Button onClick={handleExportReport} size="sm" className="bg-emerald-600">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير PDF
                </Button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* الإحصائيات الرئيسية */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Award className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                      <p className="text-3xl font-bold text-emerald-600">{selectedStudent.totalParts}</p>
                      <p className="text-sm text-gray-600 mt-1">جزء محفوظ</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedStudent.totalPages} صفحة • {selectedStudent.totalLines} سطر
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Calendar className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-3xl font-bold text-blue-600">{selectedStudent.attendance}%</p>
                      <p className="text-sm text-gray-600 mt-1">نسبة الحضور</p>
                      <div className="mt-2">
                        <Progress value={selectedStudent.attendance} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                      <p className="text-3xl font-bold text-purple-600">{selectedStudent.progress}%</p>
                      <p className="text-sm text-gray-600 mt-1">معدل التقدم</p>
                      <div className="mt-2">
                        <Progress value={selectedStudent.progress} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <BookOpen className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                      <p className="text-3xl font-bold text-orange-600">{selectedStudent.totalRecitations}</p>
                      <p className="text-sm text-gray-600 mt-1">إجمالي التسميع</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* التقدم الأسبوعي */}
              <Card>
                <CardHeader>
                  <CardTitle>التقدم الأسبوعي</CardTitle>
                  <CardDescription>تتبع تقدم الطالب خلال الأسابيع الأخيرة</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getStudentDetails(selectedStudent).weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="pages" fill="#8b5cf6" name="الصفحات" />
                      <Bar dataKey="lines" fill="#3b82f6" name="الأسطر" />
                      <Bar dataKey="recitations" fill="#10b981" name="التسميع" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* توزيع التسميع والحضور */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>توزيع أنواع التسميع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getStudentDetails(selectedStudent).recitationTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getStudentDetails(selectedStudent).recitationTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>سجل الحضور الشهري</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getStudentDetails(selectedStudent).attendanceHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="present" fill="#10b981" name="حاضر" stackId="a" />
                        <Bar dataKey="late" fill="#6366f1" name="متأخر" stackId="a" />
                        <Bar dataKey="excused" fill="#f59e0b" name="مستأذن" stackId="a" />
                        <Bar dataKey="absent" fill="#ef4444" name="غائب" stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* آخر التسميعات */}
              <Card>
                <CardHeader>
                  <CardTitle>آخر التسميعات</CardTitle>
                  <CardDescription>سجل التسميع الأخير للطالب</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">السورة</TableHead>
                        <TableHead className="text-right">الآيات</TableHead>
                        <TableHead className="text-right">النور</TableHead>
                        <TableHead className="text-right">الكمية</TableHead>
                        <TableHead className="text-right">التقييم</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getStudentDetails(selectedStudent).recentRecitations.map((rec) => (
                        <TableRow key={rec.id}>
                          <TableCell>{rec.date}</TableCell>
                          <TableCell className="font-medium">{rec.surah}</TableCell>
                          <TableCell>{rec.ayahFrom} - {rec.ayahTo}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(rec.type)}>{rec.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span>{rec.pages} صفحة</span>
                              <span className="text-gray-500"> • {rec.lines} سطر</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getGradeColor(rec.grade)}>{rec.grade}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* الإنجازات */}
              <Card>
                <CardHeader>
                  <CardTitle>الإنجازات والأوسمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getStudentDetails(selectedStudent).achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-3 p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50"
                      >
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <achievement.icon className="w-6 h-6 text-yellow-700" />
                        </div>
                        <div>
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-xs text-gray-600">{achievement.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
