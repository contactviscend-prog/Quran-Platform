import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BookOpen, CheckCircle, XCircle, Clock, Calendar,
  Save, AlertCircle, Users, Search, Filter,
  TrendingUp, BookMarked, Star, Award, Target
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase, isDemoMode, Profile } from '../lib/supabase';
import { quranSurahs } from '../lib/quranData';
import { QuranSelector } from './QuranSelector';

type RecitationType = 'memorization' | 'consolidation' | 'review' | 'test' | 'assignment';
type RecitationGrade = 'excellent' | 'very_good' | 'good' | 'acceptable' | 'needs_improvement';
type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface StudentAttendance {
  student_id: string;
  student_name: string;
  status: AttendanceStatus;
  can_recite: boolean;
  
  // Student Info
  current_surah: number;
  current_ayah_from: number;
  current_ayah_to: number;
  next_surah: number;
  next_ayah_from: number;
  next_ayah_to: number;
  
  // Today's Recitation
  recitation_recorded: boolean;
  recitation_type?: RecitationType;
  recitation_grade?: RecitationGrade;
  mistakes_count?: number;
}

interface EnhancedRecitationPageProps {
  user: Profile;
  organization: any;
}

export function EnhancedRecitationPage({ user, organization }: EnhancedRecitationPageProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCircle, setSelectedCircle] = useState<string>('');
  const [circles, setCircles] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentAttendance | null>(null);
  const [showRecitationDialog, setShowRecitationDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Recitation Form
  const [recitationType, setRecitationType] = useState<RecitationType>('memorization');
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [fromAyah, setFromAyah] = useState<number>(1);
  const [toAyah, setToAyah] = useState<number>(1);
  const [grade, setGrade] = useState<RecitationGrade>('good');
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [useDefaultNext, setUseDefaultNext] = useState(true);

  useEffect(() => {
    fetchCircles();
  }, [organization.id, user.id]);

  useEffect(() => {
    if (selectedCircle) {
      fetchStudentsWithAttendance();
    }
  }, [selectedCircle, selectedDate]);

  const fetchCircles = async () => {
    try {
      if (isDemoMode()) {
        setCircles([
          { id: 'circle1', name: 'حلقة الفجر', level: 'متقدم' },
          { id: 'circle2', name: 'حلقة المغرب', level: 'مبتدئ' },
        ]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('circles')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('teacher_id', user.id)
        .eq('is_active', true);

      setCircles(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching circles:', error);
      setLoading(false);
    }
  };

  const fetchStudentsWithAttendance = async () => {
    try {
      setLoading(true);

      if (isDemoMode()) {
        // Mock data combining attendance and student info
        setStudents([
          {
            student_id: 'student1',
            student_name: 'أحمد محمد',
            status: 'present',
            can_recite: true,
            current_surah: 2,
            current_ayah_from: 1,
            current_ayah_to: 5,
            next_surah: 2,
            next_ayah_from: 6,
            next_ayah_to: 10,
            recitation_recorded: false,
          },
          {
            student_id: 'student2',
            student_name: 'فاطمة علي',
            status: 'present',
            can_recite: true,
            current_surah: 3,
            current_ayah_from: 1,
            current_ayah_to: 10,
            next_surah: 3,
            next_ayah_from: 11,
            next_ayah_to: 20,
            recitation_recorded: true,
            recitation_type: 'memorization',
            recitation_grade: 'excellent',
            mistakes_count: 0,
          },
          {
            student_id: 'student3',
            student_name: 'عمر حسن',
            status: 'late',
            can_recite: true,
            current_surah: 1,
            current_ayah_from: 1,
            current_ayah_to: 7,
            next_surah: 114,
            next_ayah_from: 1,
            next_ayah_to: 6,
            recitation_recorded: false,
          },
          {
            student_id: 'student4',
            student_name: 'مريم سعيد',
            status: 'absent',
            can_recite: false,
            current_surah: 78,
            current_ayah_from: 1,
            current_ayah_to: 20,
            next_surah: 78,
            next_ayah_from: 21,
            next_ayah_to: 40,
            recitation_recorded: false,
          },
          {
            student_id: 'student5',
            student_name: 'يوسف أحمد',
            status: 'present',
            can_recite: true,
            current_surah: 18,
            current_ayah_from: 1,
            current_ayah_to: 10,
            next_surah: 18,
            next_ayah_from: 11,
            next_ayah_to: 20,
            recitation_recorded: false,
          },
        ]);

        setLoading(false);
        return;
      }

      // Real Supabase fetch - would need to join attendance with student progress data
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('فشل تحميل بيانات الطلاب');
      setLoading(false);
    }
  };

  const handleRecordRecitation = async () => {
    if (!selectedStudent) return;

    try {
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.success('تم تسجيل التسميع بنجاح');
        setShowRecitationDialog(false);
        fetchStudentsWithAttendance();
        resetForm();
        return;
      }

      // Real Supabase insert
      const { error } = await supabase
        .from('recitations')
        .insert({
          organization_id: organization.id,
          student_id: selectedStudent.student_id,
          teacher_id: user.id,
          circle_id: selectedCircle,
          date: selectedDate,
          type: recitationType,
          surah_number: selectedSurah,
          surah_name: quranSurahs.find(s => s.number === selectedSurah)?.name || '',
          from_ayah: fromAyah,
          to_ayah: toAyah,
          grade: grade,
          mistakes_count: mistakesCount,
          notes: notes,
        });

      if (error) throw error;

      toast.success('تم تسجيل التسميع بنجاح');
      setShowRecitationDialog(false);
      fetchStudentsWithAttendance();
      resetForm();
    } catch (error) {
      console.error('Error recording recitation:', error);
      toast.error('فشل تسجيل التسميع');
    }
  };

  const resetForm = () => {
    setRecitationType('memorization');
    setSelectedSurah(1);
    setFromAyah(1);
    setToAyah(1);
    setGrade('good');
    setMistakesCount(0);
    setNotes('');
    setUseDefaultNext(true);
    setSelectedStudent(null);
  };

  const openRecitationDialog = (student: StudentAttendance) => {
    setSelectedStudent(student);
    
    // Pre-fill with student's next planned verses
    if (useDefaultNext) {
      setSelectedSurah(student.next_surah);
      setFromAyah(student.next_ayah_from);
      setToAyah(student.next_ayah_to);
    }
    
    setShowRecitationDialog(true);
  };

  const getAttendanceStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'absent': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'late': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'excused': return 'bg-blue-500/10 text-blue-600 border-blue-200';
    }
  };

  const getAttendanceStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'حاضر';
      case 'absent': return 'غائب';
      case 'late': return 'متأخر';
      case 'excused': return 'غياب بعذر';
    }
  };

  const getRecitationTypeLabel = (type: RecitationType) => {
    switch (type) {
      case 'memorization': return 'حفظ جديد';
      case 'consolidation': return 'تثبيت';
      case 'review': return 'مراجعة';
      case 'test': return 'اختبار';
      case 'assignment': return 'تكليف';
    }
  };

  const getGradeLabel = (grade: RecitationGrade) => {
    switch (grade) {
      case 'excellent': return 'ممتاز';
      case 'very_good': return 'جيد جداً';
      case 'good': return 'جيد';
      case 'acceptable': return 'مقبول';
      case 'needs_improvement': return 'يحتاج تحسين';
    }
  };

  const getGradeColor = (grade: RecitationGrade) => {
    switch (grade) {
      case 'excellent': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'very_good': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'good': return 'bg-cyan-500/10 text-cyan-600 border-cyan-200';
      case 'acceptable': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'needs_improvement': return 'bg-orange-500/10 text-orange-600 border-orange-200';
    }
  };

  const filteredStudents = students.filter(student =>
    student.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: students.length,
    present: students.filter(s => s.can_recite).length,
    recorded: students.filter(s => s.recitation_recorded).length,
    pending: students.filter(s => s.can_recite && !s.recitation_recorded).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">التسميع المتقدم</h1>
        <p className="text-gray-500">
          تسجيل التسميع اليومي مع التكامل الكامل مع الحضور والخطط التعليمية
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
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
              <Label>الحلقة</Label>
              <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحلقة" />
                </SelectTrigger>
                <SelectContent>
                  {circles.map(circle => (
                    <SelectItem key={circle.id} value={circle.id}>
                      {circle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن طالب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {selectedCircle && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الطلاب</p>
                  <p className="text-2xl mt-1">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الحاضرون</p>
                  <p className="text-2xl mt-1 text-green-600">{stats.present}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تم التسميع</p>
                  <p className="text-2xl mt-1 text-blue-600">{stats.recorded}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">قيد الانتظار</p>
                  <p className="text-2xl mt-1 text-orange-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Students List */}
      {!selectedCircle ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>الرجاء اختيار حلقة لبدء التسميع</p>
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
          </CardContent>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">لا يوجد طلاب</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredStudents.map(student => (
            <Card 
              key={student.student_id}
              className={`transition-all ${
                !student.can_recite ? 'opacity-60 bg-gray-50 dark:bg-gray-900/50' : 
                student.recitation_recorded ? 'border-green-200 bg-green-50/30 dark:bg-green-950/10' : 
                'hover:shadow-md'
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="mb-2">{student.student_name}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={`text-xs border ${getAttendanceStatusColor(student.status)}`}
                          >
                            {getAttendanceStatusLabel(student.status)}
                          </Badge>
                          {student.recitation_recorded && (
                            <>
                              <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/20 border-green-200">
                                <CheckCircle className="w-3 h-3 ml-1" />
                                تم التسميع
                              </Badge>
                              {student.recitation_type && (
                                <Badge variant="outline" className="text-xs">
                                  {getRecitationTypeLabel(student.recitation_type)}
                                </Badge>
                              )}
                              {student.recitation_grade && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs border ${getGradeColor(student.recitation_grade)}`}
                                >
                                  {getGradeLabel(student.recitation_grade)}
                                </Badge>
                              )}
                            </>
                          )}
                          {!student.can_recite && (
                            <Badge variant="outline" className="text-xs bg-red-50 dark:bg-red-950/20 border-red-200">
                              <XCircle className="w-3 h-3 ml-1" />
                              لا يمكن التسميع (غائب)
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        disabled={!student.can_recite}
                        variant={student.recitation_recorded ? "outline" : "default"}
                        onClick={() => openRecitationDialog(student)}
                      >
                        {student.recitation_recorded ? (
                          <>
                            <CheckCircle className="w-4 h-4 ml-2" />
                            تعديل التسميع
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-4 h-4 ml-2" />
                            تسجيل تسميع
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      {/* Current */}
                      <div className="border rounded-lg p-3 bg-blue-50/50 dark:bg-blue-950/10">
                        <div className="flex items-center gap-2 mb-2 text-blue-600">
                          <BookMarked className="w-4 h-4" />
                          <span className="text-xs">الإنجاز الحالي</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">السورة:</span>
                            <span className="text-sm">
                              {quranSurahs.find(s => s.number === student.current_surah)?.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">الآيات:</span>
                            <span className="text-sm">
                              {student.current_ayah_from} - {student.current_ayah_to}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Next */}
                      <div className="border rounded-lg p-3 bg-green-50/50 dark:bg-green-950/10">
                        <div className="flex items-center gap-2 mb-2 text-green-600">
                          <Target className="w-4 h-4" />
                          <span className="text-xs">التالي (المقرر غداً)</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">السورة:</span>
                            <span className="text-sm">
                              {quranSurahs.find(s => s.number === student.next_surah)?.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">الآيات:</span>
                            <span className="text-sm">
                              {student.next_ayah_from} - {student.next_ayah_to}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recitation Dialog */}
      <Dialog open={showRecitationDialog} onOpenChange={setShowRecitationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تسجيل التسميع - {selectedStudent?.student_name}</DialogTitle>
            <DialogDescription>
              قم بتسجيل تفاصيل التسميع بدقة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Type */}
            <div className="space-y-2">
              <Label>نوع التسميع *</Label>
              <Select value={recitationType} onValueChange={(v) => setRecitationType(v as RecitationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="memorization">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-green-500" />
                      <span>حفظ جديد</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="consolidation">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span>تثبيت</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="review">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-500" />
                      <span>مراجعة</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="test">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange-500" />
                      <span>اختبار</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="assignment">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-500" />
                      <span>تكليف</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Use Default Next */}
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <input
                type="checkbox"
                id="useDefaultNext"
                checked={useDefaultNext}
                onChange={(e) => {
                  setUseDefaultNext(e.target.checked);
                  if (e.target.checked && selectedStudent) {
                    setSelectedSurah(selectedStudent.next_surah);
                    setFromAyah(selectedStudent.next_ayah_from);
                    setToAyah(selectedStudent.next_ayah_to);
                  }
                }}
                className="w-4 h-4"
              />
              <label htmlFor="useDefaultNext" className="text-sm cursor-pointer">
                استخدام الآيات المقررة افتراضياً (حسب الخطة التعليمية)
              </label>
            </div>

            {/* Quran Selection */}
            {selectedStudent && (
              <div className="space-y-2">
                <Label>اختيار الآيات *</Label>
                <QuranSelector
                  defaultSurah={useDefaultNext ? selectedStudent.next_surah : undefined}
                  defaultFromAyah={useDefaultNext ? selectedStudent.next_ayah_from : undefined}
                  defaultToAyah={useDefaultNext ? selectedStudent.next_ayah_to : undefined}
                  onSelectionChange={(selection) => {
                    setSelectedSurah(selection.surahNumber);
                    setFromAyah(selection.fromAyah);
                    setToAyah(selection.toAyah);
                  }}
                />
              </div>
            )}

            {/* Grade */}
            <div className="space-y-2">
              <Label>التقييم *</Label>
              <Select value={grade} onValueChange={(v) => setGrade(v as RecitationGrade)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">⭐⭐⭐⭐⭐ ممتاز</SelectItem>
                  <SelectItem value="very_good">⭐⭐⭐⭐ جيد جداً</SelectItem>
                  <SelectItem value="good">⭐⭐⭐ جيد</SelectItem>
                  <SelectItem value="acceptable">⭐⭐ مقبول</SelectItem>
                  <SelectItem value="needs_improvement">⭐ يحتاج تحسين</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mistakes */}
            <div className="space-y-2">
              <Label>عدد الأخطاء</Label>
              <Input
                type="number"
                min="0"
                value={mistakesCount}
                onChange={(e) => setMistakesCount(parseInt(e.target.value) || 0)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                placeholder="ملاحظات على التسميع (اختياري)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRecitationDialog(false);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
              <Button onClick={handleRecordRecitation}>
                <Save className="w-4 h-4 ml-2" />
                حفظ التسميع
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}