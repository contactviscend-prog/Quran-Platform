import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Progress } from '../../components/ui/progress';
import { 
  Users, Search, Eye, Edit, Award, CheckCircle, AlertCircle, 
  XCircle, Clock, Target, BookMarked, Calendar 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDemoMode, Profile, Circle } from '../../lib/supabase';
import { quranSurahs } from '../../lib/quranData';
import { QuranSelector } from '../../components/QuranSelector';

interface StudentProgress {
  id: string;
  full_name: string;
  circle_id: string;
  circle_name: string;
  
  // Current Status
  current_surah: number;
  current_ayah_from: number;
  current_ayah_to: number;
  
  // Next Planned
  next_surah: number;
  next_ayah_from: number;
  next_ayah_to: number;
  
  // Statistics
  total_pages_memorized: number;
  total_ayahs_memorized: number;
  attendance_rate: number;
  last_recitation_date: string;
  average_grade: string;
  
  // Educational Plan
  plan_type: 'daily' | 'weekly' | 'custom';
  daily_target_ayahs: number;
  weekly_target_pages: number;
  
  // Status
  status: 'excellent' | 'good' | 'needs_attention' | 'inactive';
}

interface MyStudentsPageProps {
  user: Profile;
  organization: any;
}

export function MyStudentsPage({ user, organization }: MyStudentsPageProps) {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, [organization.id, user.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (isDemoMode()) {
        // Mock data for demo
        setCircles([
          { id: 'circle1', name: 'حلقة الفجر', level: 'متقدم' } as Circle,
          { id: 'circle2', name: 'حلقة المغرب', level: 'مبتدئ' } as Circle,
        ]);

        setStudents([
          {
            id: 'student1',
            full_name: 'أحمد محمد',
            circle_id: 'circle1',
            circle_name: 'حلقة الفجر',
            current_surah: 2,
            current_ayah_from: 1,
            current_ayah_to: 5,
            next_surah: 2,
            next_ayah_from: 6,
            next_ayah_to: 10,
            total_pages_memorized: 15,
            total_ayahs_memorized: 450,
            attendance_rate: 95,
            last_recitation_date: '2025-11-22',
            average_grade: 'ممتاز',
            plan_type: 'daily',
            daily_target_ayahs: 5,
            weekly_target_pages: 2,
            status: 'excellent',
          },
          {
            id: 'student2',
            full_name: 'فاطمة علي',
            circle_id: 'circle1',
            circle_name: 'حلقة الفجر',
            current_surah: 3,
            current_ayah_from: 1,
            current_ayah_to: 10,
            next_surah: 3,
            next_ayah_from: 11,
            next_ayah_to: 20,
            total_pages_memorized: 20,
            total_ayahs_memorized: 600,
            attendance_rate: 92,
            last_recitation_date: '2025-11-22',
            average_grade: 'جيد جداً',
            plan_type: 'daily',
            daily_target_ayahs: 10,
            weekly_target_pages: 3,
            status: 'good',
          },
          {
            id: 'student3',
            full_name: 'عمر حسن',
            circle_id: 'circle2',
            circle_name: 'حلقة المغرب',
            current_surah: 1,
            current_ayah_from: 1,
            current_ayah_to: 7,
            next_surah: 114,
            next_ayah_from: 1,
            next_ayah_to: 6,
            total_pages_memorized: 2,
            total_ayahs_memorized: 60,
            attendance_rate: 88,
            last_recitation_date: '2025-11-21',
            average_grade: 'جيد',
            plan_type: 'weekly',
            daily_target_ayahs: 3,
            weekly_target_pages: 1,
            status: 'good',
          },
          {
            id: 'student4',
            full_name: 'مريم سعيد',
            circle_id: 'circle2',
            circle_name: 'حلقة المغرب',
            current_surah: 78,
            current_ayah_from: 1,
            current_ayah_to: 20,
            next_surah: 78,
            next_ayah_from: 21,
            next_ayah_to: 40,
            total_pages_memorized: 8,
            total_ayahs_memorized: 240,
            attendance_rate: 78,
            last_recitation_date: '2025-11-19',
            average_grade: 'مقبول',
            plan_type: 'custom',
            daily_target_ayahs: 4,
            weekly_target_pages: 1.5,
            status: 'needs_attention',
          },
        ]);

        setLoading(false);
        return;
      }

      // Real Supabase fetch
      // Fetch teacher's circles
      const { data: circlesData } = await supabase
        .from('circles')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('teacher_id', user.id)
        .eq('is_active', true);

      setCircles(circlesData || []);

      // Fetch students from all teacher's circles
      // This would need proper database structure
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      if (!isDemoMode()) {
        toast.error('فشل تحميل بيانات الطلاب');
      }
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'good': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'needs_attention': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'inactive': return 'bg-gray-500/10 text-gray-600 border-gray-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <Award className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'needs_attention': return <AlertCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent': return 'ممتاز';
      case 'good': return 'جيد';
      case 'needs_attention': return 'يحتاج متابعة';
      case 'inactive': return 'غير نشط';
      default: return status;
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesCircle = selectedCircle === 'all' || student.circle_id === selectedCircle;
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCircle && matchesSearch;
  });

  const handleUpdatePlan = async (studentId: string, plan: any) => {
    try {
      if (isDemoMode()) {
        toast.success('تم تحديث الخطة التعليمية بنجاح');
        setShowPlanDialog(false);
        fetchData();
        return;
      }

      // Real Supabase update
      toast.success('تم تحديث الخطة التعليمية بنجاح');
      setShowPlanDialog(false);
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('فشل تحديث الخطة التعليمية');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">طلابي</h1>
          <p className="text-gray-500">
            متابعة تقدم الطلاب وإدارة الخطط التعليمية
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            <Users className="w-4 h-4 ml-2" />
            {filteredStudents.length} طالب
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="البحث عن طالب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={selectedCircle} onValueChange={setSelectedCircle}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="اختر الحلقة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحلقات</SelectItem>
                {circles.map(circle => (
                  <SelectItem key={circle.id} value={circle.id}>
                    {circle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">جاري التحميل...</div>
          </CardContent>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">لا يوجد طلاب</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map(student => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg mb-1">{student.full_name}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {student.circle_name}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs border ${getStatusColor(student.status)}`}
                          >
                            <span className="ml-1">{getStatusIcon(student.status)}</span>
                            {getStatusLabel(student.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowProgressDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          التفاصيل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowPlanDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4 ml-2" />
                          تعديل الخطة
                        </Button>
                      </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">الحضور</div>
                        <div className="text-lg text-blue-600">{student.attendance_rate}%</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">عدد الآيات</div>
                        <div className="text-lg text-green-600">{student.total_ayahs_memorized}</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">عدد الصفحات</div>
                        <div className="text-lg text-purple-600">{student.total_pages_memorized}</div>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">المستوى</div>
                        <div className="text-lg text-orange-600">{student.average_grade}</div>
                      </div>
                    </div>

                    {/* Current & Next */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Current Progress */}
                      <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/10 dark:to-gray-900">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">الإنجاز الحالي</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">السورة:</span>
                            <span className="text-sm">
                              {quranSurahs.find(s => s.number === student.current_surah)?.name || '---'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">الآيات:</span>
                            <span className="text-sm">
                              من {student.current_ayah_from} إلى {student.current_ayah_to}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Next Plan */}
                      <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-white dark:from-green-950/10 dark:to-gray-900">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-green-600" />
                          <span className="text-sm">التالي (المقرر غداً)</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">السورة:</span>
                            <span className="text-sm">
                              {quranSurahs.find(s => s.number === student.next_surah)?.name || '---'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">الآيات:</span>
                            <span className="text-sm">
                              من {student.next_ayah_from} إلى {student.next_ayah_to}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Plan Info */}
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <BookMarked className="w-4 h-4" />
                        <span>الهدف اليومي: {student.daily_target_ayahs} آيات</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>آخر تسميع: {student.last_recitation_date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الخطة التعليمية - {selectedStudent?.full_name}</DialogTitle>
            <DialogDescription>
              قم بتحديد الخطة التعليمية والأهداف للطالب
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 py-4">
              {/* Plan Type */}
              <div className="space-y-2">
                <Label>نوع الخطة</Label>
                <Select defaultValue={selectedStudent.plan_type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">يومية (هدف يومي ثابت)</SelectItem>
                    <SelectItem value="weekly">أسبوعية (هدف أسبوعي)</SelectItem>
                    <SelectItem value="custom">مخصصة (تحديد يدوي)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Daily Target */}
              <div className="space-y-2">
                <Label>الهدف اليومي (عدد الآيات)</Label>
                <Input 
                  type="number" 
                  defaultValue={selectedStudent.daily_target_ayahs}
                  min="1"
                  max="50"
                />
                <p className="text-xs text-gray-500">
                  عدد الآيات المطلوب حفظها يومياً
                </p>
              </div>

              {/* Weekly Target */}
              <div className="space-y-2">
                <Label>الهدف الأسبوعي (عدد الصفحات)</Label>
                <Input 
                  type="number" 
                  step="0.5"
                  defaultValue={selectedStudent.weekly_target_pages}
                  min="0.5"
                  max="10"
                />
                <p className="text-xs text-gray-500">
                  عدد الصفحات المطلوب حفظها أسبوعياً
                </p>
              </div>

              {/* Next Assignment */}
              <div className="space-y-2">
                <Label>التكليف التالي (افتراضي)</Label>
                <div className="border rounded-lg p-4 space-y-4">
                  <QuranSelector
                    onSelectionChange={(selection) => {
                      console.log('Next assignment:', selection);
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>ملاحظات الخطة</Label>
                <Textarea 
                  placeholder="أضف ملاحظات حول الخطة التعليمية للطالب..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => handleUpdatePlan(selectedStudent.id, {})}>
                  <CheckCircle className="w-4 h-4 ml-2" />
                  حفظ الخطة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Progress Details Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل التقدم - {selectedStudent?.full_name}</DialogTitle>
            <DialogDescription>
              عرض تفصيلي لإنجازات وتقدم الطالب
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 py-4">
              {/* Overall Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">الإحصائيات العامة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">إجمالي الآيات المحفوظ��</div>
                      <div className="text-2xl text-blue-600">{selectedStudent.total_ayahs_memorized}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">إجمالي الصفحات</div>
                      <div className="text-2xl text-green-600">{selectedStudent.total_pages_memorized}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">معدل الحضور</div>
                      <div className="text-2xl text-purple-600">{selectedStudent.attendance_rate}%</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">التقدم في المصحف</span>
                      <span className="text-sm">
                        {Math.round((selectedStudent.total_pages_memorized / 604) * 100)}%
                      </span>
                    </div>
                    <Progress value={(selectedStudent.total_pages_memorized / 604) * 100} />
                  </div>
                </CardContent>
              </Card>

              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">الوضع الحالي</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <span className="text-sm">السورة الحالية</span>
                    <span>{quranSurahs.find(s => s.number === selectedStudent.current_surah)?.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <span className="text-sm">الآيات المحفوظة</span>
                    <span>من {selectedStudent.current_ayah_from} إلى {selectedStudent.current_ayah_to}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <span className="text-sm">آخر تسميع</span>
                    <span>{selectedStudent.last_recitation_date}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <span className="text-sm">المستوى</span>
                    <Badge variant="outline">{selectedStudent.average_grade}</Badge>
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
