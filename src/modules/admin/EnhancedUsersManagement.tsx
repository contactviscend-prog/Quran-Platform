import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../../lib/supabase';
import { toast } from 'sonner';
import { IndividualStudentReports } from '../shared/IndividualStudentReports';
import { ExportReportButton } from '../../components/ExportReportButton';
import { type ReportData } from '../../lib/reportExport';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Users, BookOpen, CheckCircle, Award, TrendingUp, 
  Activity, Download, Star, Trophy, Target
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface ReportsPageProps {
  organizationId: string;
  userRole: string;
  userId: string;
}

export function ReportsPage({ organizationId, userRole, userId }: ReportsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCircle, setSelectedCircle] = useState('all');
  const [loading, setLoading] = useState(true);
  const [circles, setCircles] = useState<any[]>([]);
  
  // تحديد ما إذا كان المستخدم يمكنه رؤية التقارير الشاملة
  const canViewFullReports = userRole === 'admin' || userRole === 'supervisor';
  const isTeacher = userRole === 'teacher';

  // إحصائيات عامة
  const [summaryStats, setSummaryStats] = useState({
    totalStudents: 245,
    totalStudentsChange: 12,
    attendanceRate: 87,
    attendanceChange: 5,
    totalParts: 1240,
    partsChange: 18,
    progressRate: 82,
    progressChange: 8,
    totalRecitations: 856,
    recitationsChange: 15,
    activeTeachers: 12,
    teachersChange: 2,
  });

  // بيانات الحضور حسب النوع
  const [attendanceByType, setAttendanceByType] = useState([
    { name: 'حاضر', value: 756, percentage: 75.6, color: '#10b981' },
    { name: 'غائب', value: 120, percentage: 12.0, color: '#ef4444' },
    { name: 'مستأذن', value: 85, percentage: 8.5, color: '#f59e0b' },
    { name: 'متأخر', value: 39, percentage: 3.9, color: '#6366f1' },
  ]);

  // بيانات التسميع حسب النوع
  const [recitationsByType, setRecitationsByType] = useState([
    { name: 'حفظ جديد', value: 425, percentage: 49.6, color: '#8b5cf6' },
    { name: 'مراجعة', value: 315, percentage: 36.8, color: '#3b82f6' },
    { name: 'تثبيت', value: 116, percentage: 13.6, color: '#06b6d4' },
  ]);

  // بيانات التقدم الشهري
  const [monthlyProgress, setMonthlyProgress] = useState([
    { month: 'محرم', students: 210, recitations: 520, attendance: 85, parts: 38 },
    { month: 'صفر', students: 215, recitations: 580, attendance: 83, parts: 42 },
    { month: 'ربيع الأول', students: 225, recitations: 640, attendance: 87, parts: 45 },
    { month: 'ربيع الثاني', students: 232, recitations: 710, attendance: 88, parts: 48 },
    { month: 'جمادى الأول', students: 238, recitations: 780, attendance: 86, parts: 52 },
    { month: 'جمادى الثاني', students: 245, recitations: 856, attendance: 87, parts: 55 },
  ]);

  // أداء الحلقات
  const [circlePerformance, setCirclePerformance] = useState([
    { 
      id: '1',
      name: 'حلقة الفجر', 
      teacher: 'أحمد المعلم',
      students: 24, 
      attendance: 92, 
      progress: 85, 
      rating: 4.8,
      totalRecitations: 156,
      newMemorization: 78,
      review: 58,
      reinforcement: 20,
    },
    { 
      id: '2',
      name: 'حلقة الظهر', 
      teacher: 'محمد الحافظ',
      students: 22, 
      attendance: 90, 
      progress: 80, 
      rating: 4.5,
      totalRecitations: 134,
      newMemorization: 65,
      review: 52,
      reinforcement: 17,
    },
    { 
      id: '3',
      name: 'حلقة العصر', 
      teacher: 'خالد القارئ',
      students: 18, 
      attendance: 85, 
      progress: 82, 
      rating: 4.7,
      totalRecitations: 128,
      newMemorization: 62,
      review: 48,
      reinforcement: 18,
    },
    { 
      id: '4',
      name: 'حلقة المغرب', 
      teacher: 'يوسف المحفظ',
      students: 20, 
      attendance: 88, 
      progress: 78, 
      rating: 4.6,
      totalRecitations: 142,
      newMemorization: 70,
      review: 54,
      reinforcement: 18,
    },
  ]);

  // أداء المعلمين
  const [teacherPerformance, setTeacherPerformance] = useState([
    { 
      id: '1',
      name: 'أحمد المعلم', 
      circles: 2,
      students: 36, 
      recitations: 234,
      newMemorization: 117,
      review: 87,
      reinforcement: 30,
      avgRating: 4.8, 
      attendance: 92,
      completion: 85 
    },
    { 
      id: '2',
      name: 'محمد الحافظ', 
      circles: 1,
      students: 22, 
      recitations: 134,
      newMemorization: 65,
      review: 52,
      reinforcement: 17,
      avgRating: 4.5, 
      attendance: 90,
      completion: 80 
    },
    { 
      id: '3',
      name: 'خالد القارئ', 
      circles: 1,
      students: 18, 
      recitations: 128,
      newMemorization: 62,
      review: 48,
      reinforcement: 18,
      avgRating: 4.7, 
      attendance: 85,
      completion: 82 
    },
    { 
      id: '4',
      name: 'يوسف المحفظ', 
      circles: 2,
      students: 30, 
      recitations: 188,
      newMemorization: 92,
      review: 71,
      reinforcement: 25,
      avgRating: 4.6, 
      attendance: 88,
      completion: 78 
    },
  ]);

  // أفضل الطلاب
  const [topStudents, setTopStudents] = useState([
    { 
      rank: 1, 
      name: 'فاطمة أحمد', 
      circle: 'حلقة الفجر',
      parts: 15, 
      pages: 300,
      progress: 95,
      attendance: 98,
      recitations: 156,
      newMemorization: 78,
      review: 58,
      reinforcement: 20,
    },
    { 
      rank: 2, 
      name: 'محمد علي', 
      circle: 'حلقة المغرب',
      parts: 14, 
      pages: 280,
      progress: 93,
      attendance: 96,
      recitations: 148,
      newMemorization: 74,
      review: 55,
      reinforcement: 19,
    },
    { 
      rank: 3, 
      name: 'عائشة سالم', 
      circle: 'حلقة العصر',
      parts: 13, 
      pages: 260,
      progress: 90,
      attendance: 94,
      recitations: 142,
      newMemorization: 71,
      review: 52,
      reinforcement: 19,
    },
    { 
      rank: 4, 
      name: 'يوسف خالد', 
      circle: 'حلقة الفجر',
      parts: 12, 
      pages: 240,
      progress: 88,
      attendance: 92,
      recitations: 136,
      newMemorization: 68,
      review: 50,
      reinforcement: 18,
    },
    { 
      rank: 5, 
      name: 'نورة عبدالله', 
      circle: 'حلقة المغرب',
      parts: 11, 
      pages: 220,
      progress: 85,
      attendance: 90,
      recitations: 128,
      newMemorization: 64,
      review: 47,
      reinforcement: 17,
    },
  ]);

  // تقرير الحضور اليومي (آخر 30 يوم)
  const [dailyAttendance, setDailyAttendance] = useState(
    Array.from({ length: 30 }, (_, i) => {
      const day = 30 - i;
      return {
        date: `${day}/11`,
        present: Math.floor(Math.random() * 30) + 190,
        absent: Math.floor(Math.random() * 15) + 10,
        excused: Math.floor(Math.random() * 10) + 5,
        late: Math.floor(Math.random() * 5) + 2,
      };
    })
  );

  useEffect(() => {
    fetchData();
  }, [organizationId, selectedPeriod, selectedCircle]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (isDemoMode()) {
        // في Demo Mode نستخدم البيانات الوهمية الموجودة بالفعل
        setLoading(false);
        return;
      }

      // جلب الحلقات
      const { data: circlesData } = await supabase
        .from('circles')
        .select('id, name')
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      if (circlesData) {
        setCircles(circlesData);
      }

      // TODO: جلب البيانات الحقيقية من Supabase
      // يمكن إضافة استعلامات لجلب الإحصائيات الفعلية

    } catch (error: any) {
      console.error('Error fetching reports data:', error);
      if (!isDemoMode()) {
        toast.error('فشل تحميل بيانات التقارير');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    toast.success('جاري تصدير التقرير... (Demo Mode)');
    // TODO: تنفيذ تصدير التقارير
  };

  // إعداد بيانات التقرير لـ PDF
  const preparePDFData = (): ReportData => {
    const periodText = selectedPeriod === 'week' ? 'هذا الأسبوع' :
                      selectedPeriod === 'month' ? 'هذا الشهر' :
                      selectedPeriod === 'quarter' ? 'هذا الربع' : 'هذا العام';

    return {
      title: 'Reports & Statistics - التقارير والإحصائيات',
      organizationName: 'Quran Memorization Platform',
      period: periodText,
      summary: {
        'Total Students': summaryStats.totalStudents,
        'Attendance Rate': `${summaryStats.attendanceRate}%`,
        'Total Recitations': summaryStats.totalRecitations,
        'Total Parts Memorized': summaryStats.totalParts,
        'Progress Rate': `${summaryStats.progressRate}%`,
        'Active Teachers': summaryStats.activeTeachers,
      },
      sections: [
        {
          title: 'Attendance Distribution - توزيع الحضور',
          content: attendanceByType.map(type => 
            `${type.name}: ${type.value} (${type.percentage.toFixed(1)}%)`
          ),
          type: 'list'
        },
        {
          title: 'Recitation Types - أنواع التسميع',
          content: recitationsByType.map(type =>
            `${type.name}: ${type.value} (${type.percentage.toFixed(1)}%)`
          ),
          type: 'list'
        },
      ],
      tableData: {
        title: 'Top Performing Students - الطلاب المتميزون',
        headers: ['Rank', 'Name', 'Circle', 'Parts', 'Pages', 'Recitations', 'Progress'],
        rows: topStudents.map(s => [
          `#${s.rank}`,
          s.name,
          s.circle,
          `${s.parts}`,
          `${s.pages}`,
          `${s.recitations}`,
          `${s.progress}%`
        ])
      }
    };
  };

  // ألوان للرسوم البيانية
  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1'];
  const RECITATION_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">التقارير والإحصائيات</h2>
          <p className="text-gray-600 mt-1">تقارير شاملة عن الأداء والتقدم</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCircle} onValueChange={setSelectedCircle}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="جميع الحلقات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحلقات</SelectItem>
              {circles.map((circle) => (
                <SelectItem key={circle.id} value={circle.id}>
                  {circle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="quarter">هذا الربع</SelectItem>
              <SelectItem value="year">هذا العام</SelectItem>
            </SelectContent>
          </Select>
          <ExportReportButton
            reportData={preparePDFData()}
            fileName="quran_platform_report"
            className="bg-emerald-600 hover:bg-emerald-700"
          />
        </div>
      </div>

      {/* الإحصائيات ا��عامة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">إجمالي الطلاب</p>
                <p className="text-3xl mt-2">{summaryStats.totalStudents}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{summaryStats.totalStudentsChange}%</span>
              <span className="text-gray-500">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">معدل الحضور</p>
                <p className="text-3xl mt-2">{summaryStats.attendanceRate}%</p>
              </div>
              <div className="bg-emerald-500 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{summaryStats.attendanceChange}%</span>
              <span className="text-gray-500">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">إجمالي التسميع</p>
                <p className="text-3xl mt-2">{summaryStats.totalRecitations}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{summaryStats.recitationsChange}%</span>
              <span className="text-gray-500">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">الأجزاء المحفوظة</p>
                <p className="text-3xl mt-2">{summaryStats.totalParts}</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{summaryStats.partsChange}%</span>
              <span className="text-gray-500">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">معدل التقدم</p>
                <p className="text-3xl mt-2">{summaryStats.progressRate}%</p>
              </div>
              <div className="bg-indigo-500 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{summaryStats.progressChange}%</span>
              <span className="text-gray-500">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">المعلمون النشطون</p>
                <p className="text-3xl mt-2">{summaryStats.activeTeachers}</p>
              </div>
              <div className="bg-cyan-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{summaryStats.teachersChange}</span>
              <span className="text-gray-500">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="attendance">الحضور</TabsTrigger>
          <TabsTrigger value="recitations">التسميع</TabsTrigger>
          <TabsTrigger value="circles">الحلقات</TabsTrigger>
          <TabsTrigger value="teachers">المعلمون</TabsTrigger>
          <TabsTrigger value="students">الطلاب المتميزون</TabsTrigger>
          <TabsTrigger value="individual">تقارير فردية</TabsTrigger>
        </TabsList>

        {/* نظرة عامة */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* التقدم الشهري */}
            <Card>
              <CardHeader>
                <CardTitle>التقدم الشهري</CardTitle>
                <CardDescription>تطور الأداء خلال الأشهر الأخيرة</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyProgress}>
                    <defs>
                      <linearGradient id="colorRecitations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="recitations" 
                      stroke="#8b5cf6" 
                      fillOpacity={1} 
                      fill="url(#colorRecitations)" 
                      name="التسميع"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="attendance" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorAttendance)" 
                      name="الحضور %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* توزيع الحضور */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع الحضور</CardTitle>
                <CardDescription>تصنيف حالات الحضور والغياب</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={attendanceByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {attendanceByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* توزيع التسميع */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع التسميع</CardTitle>
                <CardDescription>تصنيف أنواع التسميع (حفظ، مراجعة، تثبيت)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={recitationsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {recitationsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* عدد الطلاب والأجزاء */}
            <Card>
              <CardHeader>
                <CardTitle>نمو الطلاب والحفظ</CardTitle>
                <CardDescription>تطور عدد الطلاب والأجزاء المحفوظة</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#3b82f6" name="الطلاب" />
                    <Bar dataKey="parts" fill="#f59e0b" name="الأجزاء" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تقرير الحضور */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            {attendanceByType.map((type) => (
              <Card key={type.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">{type.name}</p>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                  </div>
                  <p className="text-2xl">{type.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{type.percentage.toFixed(1)}% من الإجمالي</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>الحضور اليومي - آخر 30 يوم</CardTitle>
              <CardDescription>تتبع حالات الحضور والغياب يومياً</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={dailyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="present" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    name="حاضر"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="late" 
                    stackId="1"
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    name="متأخر"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="excused" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    name="مستأذن"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="absent" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    name="غائب"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>نسب الحضور حسب الحلقة</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الحلقة</TableHead>
                    <TableHead className="text-right">المعلم</TableHead>
                    <TableHead className="text-right">عدد الطلاب</TableHead>
                    <TableHead className="text-right">نسبة الحضور</TableHead>
                    <TableHead className="text-right">التصنيف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {circlePerformance.map((circle) => (
                    <TableRow key={circle.id}>
                      <TableCell className="font-medium">{circle.name}</TableCell>
                      <TableCell>{circle.teacher}</TableCell>
                      <TableCell>{circle.students} طالب</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={circle.attendance} className="h-2 w-32" />
                          <span>{circle.attendance}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            circle.attendance >= 90 ? 'bg-green-100 text-green-800' :
                            circle.attendance >= 80 ? 'bg-blue-100 text-blue-800' :
                            circle.attendance >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {circle.attendance >= 90 ? 'ممتاز' :
                           circle.attendance >= 80 ? 'جيد جداً' :
                           circle.attendance >= 70 ? 'جيد' : 'يحتاج تحسين'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تقرير التسميع */}
        <TabsContent value="recitations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {recitationsByType.map((type) => (
              <Card key={type.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">{type.name}</p>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                  </div>
                  <p className="text-2xl">{type.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{type.percentage.toFixed(1)}% من الإجمالي</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل التسميع حسب الحلقة</CardTitle>
              <CardDescription>توزيع أنواع التسميع لكل حلقة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={circlePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newMemorization" fill="#8b5cf6" name="حفظ جديد" />
                  <Bar dataKey="review" fill="#3b82f6" name="مراجعة" />
                  <Bar dataKey="reinforcement" fill="#06b6d4" name="تثبيت" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إحصائيات التسميع التفصيلية</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الحلقة</TableHead>
                    <TableHead className="text-right">إجمالي التسميع</TableHead>
                    <TableHead className="text-right">حفظ جديد</TableHead>
                    <TableHead className="text-right">مراجعة</TableHead>
                    <TableHead className="text-right">تثبيت</TableHead>
                    <TableHead className="text-right">معدل الطالب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {circlePerformance.map((circle) => (
                    <TableRow key={circle.id}>
                      <TableCell className="font-medium">{circle.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{circle.totalRecitations} تسميع</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-100 text-purple-800">
                          {circle.newMemorization}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          {circle.review}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-cyan-100 text-cyan-800">
                          {circle.reinforcement}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(circle.totalRecitations / circle.students).toFixed(1)} / طالب
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تقرير الحلقات */}
        <TabsContent value="circles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مقارنة أداء الحلقات</CardTitle>
              <CardDescription>تقييم شامل لجميع الحلقات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={circlePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendance" fill="#10b981" name="الحضور %" />
                  <Bar dataKey="progress" fill="#3b82f6" name="التقدم %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل أداء الحلقات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الحلقة</TableHead>
                    <TableHead className="text-right">المعلم</TableHead>
                    <TableHead className="text-right">الطلاب</TableHead>
                    <TableHead className="text-right">الحضور</TableHead>
                    <TableHead className="text-right">التقدم</TableHead>
                    <TableHead className="text-right">التسميع</TableHead>
                    <TableHead className="text-right">التقييم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {circlePerformance.map((circle) => (
                    <TableRow key={circle.id}>
                      <TableCell className="font-medium">{circle.name}</TableCell>
                      <TableCell>{circle.teacher}</TableCell>
                      <TableCell>{circle.students} طالب</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={circle.attendance} className="h-2 w-20" />
                          <span className="text-sm">{circle.attendance}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={circle.progress} className="h-2 w-20" />
                          <span className="text-sm">{circle.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{circle.totalRecitations}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{circle.rating}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تقرير المعلمين */}
        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مقارنة أداء المعلمين</CardTitle>
              <CardDescription>تقييم أداء المعلمين وإنتاجيتهم</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={teacherPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="recitations" fill="#8b5cf6" name="إجمالي التسميع" />
                  <Bar dataKey="students" fill="#3b82f6" name="عدد الطلاب" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل أداء المعلمين</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المعلم</TableHead>
                    <TableHead className="text-right">الحلقات</TableHead>
                    <TableHead className="text-right">الطلاب</TableHead>
                    <TableHead className="text-right">التسميع</TableHead>
                    <TableHead className="text-right">حفظ جديد</TableHead>
                    <TableHead className="text-right">مراجعة</TableHead>
                    <TableHead className="text-right">الحضور</TableHead>
                    <TableHead className="text-right">التقييم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherPerformance.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell>{teacher.circles} حلقة</TableCell>
                      <TableCell>{teacher.students} طالب</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{teacher.recitations}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-100 text-purple-800">
                          {teacher.newMemorization}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          {teacher.review}
                        </Badge>
                      </TableCell>
                      <TableCell>{teacher.attendance}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`${
                                i < Math.floor(teacher.avgRating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="mr-1 text-sm">{teacher.avgRating}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تقرير الطلاب المتميزين */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>الطلاب المتميزون</CardTitle>
                <CardDescription>أفضل 5 طلاب هذا الشهر</CardDescription>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topStudents.map((student) => (
                  <div key={student.rank} className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      student.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                      student.rank === 2 ? 'bg-gray-100 text-gray-700' :
                      student.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      <span className="text-xl font-bold">#{student.rank}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.circle}</p>
                    </div>
                    <div className="text-center px-4 border-r">
                      <p className="text-2xl font-bold text-emerald-600">{student.parts}</p>
                      <p className="text-xs text-gray-600">جزء</p>
                    </div>
                    <div className="text-center px-4 border-r">
                      <p className="text-2xl font-bold text-blue-600">{student.pages}</p>
                      <p className="text-xs text-gray-600">صفحة</p>
                    </div>
                    <div className="text-center px-4 border-r">
                      <p className="text-2xl font-bold text-purple-600">{student.recitations}</p>
                      <p className="text-xs text-gray-600">تسميع</p>
                    </div>
                    <div className="w-32">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">التقدم</span>
                        <span>{student.progress}%</span>
                      </div>
                      <Progress value={student.progress} className="h-2" />
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">الحضور</span>
                        <span>{student.attendance}%</span>
                      </div>
                      <Progress value={student.attendance} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>توزيع التسميع للطلاب المتميزين</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={[
                        { name: 'حفظ جديد', value: topStudents.reduce((sum, s) => sum + s.newMemorization, 0), color: '#8b5cf6' },
                        { name: 'مراجعة', value: topStudents.reduce((sum, s) => sum + s.review, 0), color: '#3b82f6' },
                        { name: 'تثبيت', value: topStudents.reduce((sum, s) => sum + s.reinforcement, 0), color: '#06b6d4' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {RECITATION_COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>مقارنة أداء الطلاب المتميزين</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topStudents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="parts" fill="#10b981" name="الأجزاء" />
                    <Bar dataKey="recitations" fill="#8b5cf6" name="التسميع" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تقارير فردية */}
        <TabsContent value="individual" className="space-y-4">
          <IndividualStudentReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
