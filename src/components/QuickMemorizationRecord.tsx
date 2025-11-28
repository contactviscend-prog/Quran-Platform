import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { BookOpen, CheckCircle, Search, Save, Star, TrendingUp, Award, Target } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDemoMode, Profile } from '../lib/supabase';
import { quranSurahs } from '../lib/quranData';
import { QuranSelector } from './QuranSelector';

type RecitationType = 'memorization' | 'consolidation' | 'review' | 'test' | 'assignment';
type RecitationGrade = 'excellent' | 'very_good' | 'good' | 'acceptable' | 'needs_improvement';

interface Student {
  student_id: string;
  student_name: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  can_recite: boolean;
  current_surah: number;
  current_ayah_from: number;
  current_ayah_to: number;
  next_surah: number;
  next_ayah_from: number;
  next_ayah_to: number;
  recitation_recorded: boolean;
  recitation_type?: RecitationType;
  recitation_grade?: RecitationGrade;
  mistakes_count?: number;
}

interface QuickMemorizationRecordProps {
  user: Profile;
  organization: any;
  circleId?: string;
  date?: string;
}

export function QuickMemorizationRecord({
  user,
  organization,
  circleId,
  date = new Date().toISOString().split('T')[0],
}: QuickMemorizationRecordProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showRecitationDialog, setShowRecitationDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [recitationType, setRecitationType] = useState<RecitationType>('memorization');
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [fromAyah, setFromAyah] = useState<number>(1);
  const [toAyah, setToAyah] = useState<number>(1);
  const [grade, setGrade] = useState<RecitationGrade>('good');
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [useDefaultNext, setUseDefaultNext] = useState(true);

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
        ]);
        return;
      }

      // Real database fetch would go here
      setStudents([]);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('فشل تحميل بيانات الطلاب');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordRecitation = async () => {
    if (!selectedStudent) return;

    try {
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 100));
        toast.success('تم تسجيل التسميع بنجاح');
        setShowRecitationDialog(false);
        fetchStudents();
        resetForm();
        return;
      }

      const { error } = await supabase
        .from('recitations')
        .insert({
          organization_id: organization.id,
          student_id: selectedStudent.student_id,
          teacher_id: user.id,
          circle_id: circleId,
          date: date,
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
      fetchStudents();
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

  const openRecitationDialog = (student: Student) => {
    setSelectedStudent(student);
    if (useDefaultNext) {
      setSelectedSurah(student.next_surah);
      setFromAyah(student.next_ayah_from);
      setToAyah(student.next_ayah_to);
    }
    setShowRecitationDialog(true);
  };

  const getGradeColor = (grade: RecitationGrade) => {
    switch (grade) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'very_good': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-cyan-100 text-cyan-800';
      case 'acceptable': return 'bg-yellow-100 text-yellow-800';
      case 'needs_improvement': return 'bg-orange-100 text-orange-800';
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

  const getTypeLabel = (type: RecitationType) => {
    switch (type) {
      case 'memorization': return 'حفظ جديد';
      case 'consolidation': return 'تثبيت';
      case 'review': return 'مراجعة';
      case 'test': return 'اختبار';
      case 'assignment': return 'تكليف';
    }
  };

  const filteredStudents = students.filter(student =>
    student.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!circleId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500 py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>الرجاء اختيار حلقة من لوحة التحكم</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ابحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 py-2 text-sm"
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-500 text-sm py-4">جاري التحميل...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">لا يوجد طلاب</div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {filteredStudents.map((student) => (
              <div
                key={student.student_id}
                className={`p-2.5 border rounded text-sm flex items-center justify-between gap-2 ${
                  student.recitation_recorded ? 'bg-green-50 border-green-200' : ''
                } ${!student.can_recite ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs truncate">{student.student_name}</p>
                  {student.recitation_recorded && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <Badge className="bg-green-100 text-green-800 text-xs h-5">
                        ✓
                      </Badge>
                      {student.recitation_grade && (
                        <Badge className={`${getGradeColor(student.recitation_grade)} text-xs h-5`}>
                          {getGradeLabel(student.recitation_grade)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  disabled={!student.can_recite}
                  variant={student.recitation_recorded ? 'outline' : 'default'}
                  onClick={() => openRecitationDialog(student)}
                  className="h-7 px-2 text-xs flex-shrink-0"
                >
                  {student.recitation_recorded ? 'تعديل' : 'تسجيل'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50">
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
                استخدام الآيات المقررة افتراضياً
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
                placeholder="ملاحظات على التسميع..."
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
    </>
  );
}
