import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Plus, Filter, BookOpen, User, Calendar, Award } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDemoMode } from '../../lib/supabase';
import type { Profile, Circle, Recitation } from '../../lib/supabase';

interface RecitationsPageProps {
  organizationId: string;
  userRole: 'admin' | 'supervisor' | 'teacher' | 'student' | 'parent';
  userId?: string;
}

// قائمة السور
const SURAHS = [
  { number: 1, name: 'الفاتحة', ayahs: 7 },
  { number: 2, name: 'البقرة', ayahs: 286 },
  { number: 3, name: 'آل عمران', ayahs: 200 },
  { number: 4, name: 'النساء', ayahs: 176 },
  { number: 5, name: 'المائدة', ayahs: 120 },
  { number: 6, name: 'الأنعام', ayahs: 165 },
  { number: 7, name: 'الأعراف', ayahs: 206 },
  { number: 8, name: 'الأنفال', ayahs: 75 },
  { number: 9, name: 'التوبة', ayahs: 129 },
  { number: 10, name: 'يونس', ayahs: 109 },
  // يمكن إضافة باقي السور
];

export function RecitationsPage({ organizationId, userRole, userId }: RecitationsPageProps) {
  const [recitations, setRecitations] = useState<Recitation[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'memorization' | 'review' | 'test'>('all');

  // Form state
  const [formData, setFormData] = useState({
    student_id: '',
    circle_id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'memorization' as 'memorization' | 'review' | 'consolidation' | 'test',
    surah_number: 1,
    from_ayah: 1,
    to_ayah: 1,
    grade: 'good' as 'excellent' | 'very_good' | 'good' | 'acceptable' | 'needs_improvement',
    mistakes_count: 0,
    notes: '',
  });

  useEffect(() => {
    fetchRecitations();
    if (userRole === 'teacher' || userRole === 'admin' || userRole === 'supervisor') {
      fetchStudents();
      fetchCircles();
    }
  }, [organizationId, userRole, userId, filterType]);

  const fetchRecitations = async () => {
    try {
      setLoading(true);
      
      // Demo mode - use mock data
      if (isDemoMode()) {
        const mockRecitations: any[] = [
          {
            id: '1',
            organization_id: organizationId,
            student_id: 'student1',
            teacher_id: 'teacher1',
            circle_id: 'circle1',
            date: new Date().toISOString().split('T')[0],
            type: 'memorization',
            surah_number: 2,
            surah_name: 'البقرة',
            from_ayah: 1,
            to_ayah: 10,
            grade: 'excellent',
            mistakes_count: 0,
            notes: 'ممتاز جداً',
            created_at: new Date().toISOString(),
            student: { id: 'student1', full_name: 'أحمد الطالب' },
            teacher: { id: 'teacher1', full_name: 'محمد المعلم' },
            circle: { id: 'circle1', name: 'حلقة الفجر' },
          },
        ];
        setRecitations(mockRecitations);
        setLoading(false);
        return;
      }

      // Real Supabase fetch
      let query = supabase
        .from('recitations')
        .select(`
          *,
          student:profiles!recitations_student_id_fkey(id, full_name),
          teacher:profiles!recitations_teacher_id_fkey(id, full_name),
          circle:circles(id, name)
        `)
        .eq('organization_id', organizationId)
        .order('date', { ascending: false });

      // Filter by type
      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      // Filter by user role
      if (userRole === 'student' && userId) {
        query = query.eq('student_id', userId);
      } else if (userRole === 'teacher' && userId) {
        query = query.eq('teacher_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecitations(data || []);
    } catch (error: any) {
      console.error('Error fetching recitations:', error);
      if (!isDemoMode()) {
        toast.error('فشل في تحميل سجلات التسميع');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // Demo mode - use mock data
      if (isDemoMode()) {
        setStudents([
          { id: 'student1', full_name: 'أحمد الطالب' } as any,
          { id: 'student2', full_name: 'محمد الطالب' } as any,
        ]);
        return;
      }

      // Real Supabase fetch
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', organizationId)
        .eq('role', 'student')
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;
      setStudents((data as any[])?.map(item => ({
        id: item.id,
        full_name: item.full_name,
        organization_id: organizationId,
        role: 'student' as const,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchCircles = async () => {
    try {
      // Demo mode - use mock data
      if (isDemoMode()) {
        setCircles([
          { id: 'circle1', name: 'حلقة الفجر' } as any,
          { id: 'circle2', name: 'حلقة المغرب' } as any,
        ]);
        return;
      }

      // Real Supabase fetch
      let query = supabase
        .from('circles')
        .select('id, name')
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      if (userRole === 'teacher' && userId) {
        query = query.eq('teacher_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCircles((data as any[])?.map(item => ({
        id: item.id,
        name: item.name,
        organization_id: organizationId,
        level: item.level || 1,
        max_students: 30,
        teacher_id: item.teacher_id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) || []);
    } catch (error: any) {
      console.error('Error fetching circles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('خطأ في تسجيل التسميع');
      return;
    }

    try {
      const selectedSurah = SURAHS.find(s => s.number === formData.surah_number);
      
      // Demo mode - simulate save
      if (isDemoMode()) {
        toast.success('تم تسجيل التسميع بنجاح (Demo Mode)');
        fetchRecitations();
        resetForm();
        setIsAddDialogOpen(false);
        return;
      }

      const { error } = await supabase
        .from('recitations')
        .insert({
          organization_id: organizationId,
          student_id: formData.student_id,
          teacher_id: userId,
          circle_id: formData.circle_id,
          date: formData.date,
          type: formData.type,
          surah_number: formData.surah_number,
          surah_name: selectedSurah?.name || '',
          from_ayah: formData.from_ayah,
          to_ayah: formData.to_ayah,
          grade: formData.grade,
          mistakes_count: formData.mistakes_count,
          notes: formData.notes,
        });

      if (error) throw error;
      toast.success('تم تسجيل التسميع بنجاح');
      fetchRecitations();
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving recitation:', error);
      if (!isDemoMode()) {
        toast.error('فشل في تسجيل التسميع');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      circle_id: '',
      date: new Date().toISOString().split('T')[0],
      type: 'memorization',
      surah_number: 1,
      from_ayah: 1,
      to_ayah: 1,
      grade: 'good',
      mistakes_count: 0,
      notes: '',
    });
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      memorization: { label: 'حفظ جديد', variant: 'default' },
      review: { label: 'مراجعة', variant: 'secondary' },
      consolidation: { label: 'تثبيت', variant: 'outline' },
      test: { label: 'اختبار', variant: 'outline' },
    };
    return types[type] || { label: type, variant: 'default' };
  };

  const getGradeBadge = (grade: string) => {
    const grades: Record<string, { label: string; color: string }> = {
      excellent: { label: 'ممتاز', color: 'bg-green-100 text-green-800' },
      very_good: { label: 'جيد جداً', color: 'bg-blue-100 text-blue-800' },
      good: { label: 'جيد', color: 'bg-yellow-100 text-yellow-800' },
      acceptable: { label: 'مقبول', color: 'bg-orange-100 text-orange-800' },
      needs_improvement: { label: 'يحتاج تحسين', color: 'bg-red-100 text-red-800' },
    };
    return grades[grade] || { label: grade, color: 'bg-gray-100 text-gray-800' };
  };

  const selectedSurah = SURAHS.find(s => s.number === formData.surah_number);

  const canAddRecitation = userRole === 'teacher' || userRole === 'admin' || userRole === 'supervisor';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">سجل التسميع</h2>
          <p className="text-gray-600">متابعة احفظ والمراجعة والاختبارات</p>
        </div>
        {canAddRecitation && (
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                تسجيل تسميع جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>تسجيل تسميع جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student">الطالب *</Label>
                    <Select
                      value={formData.student_id}
                      onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الطالب" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="circle">الحلقة *</Label>
                    <Select
                      value={formData.circle_id}
                      onValueChange={(value) => setFormData({ ...formData, circle_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحلقة" />
                      </SelectTrigger>
                      <SelectContent>
                        {circles.map((circle) => (
                          <SelectItem key={circle.id} value={circle.id}>
                            {circle.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">التاريخ *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">النوع *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="memorization">حفظ جديد</SelectItem>
                        <SelectItem value="review">مراجعة</SelectItem>
                        <SelectItem value="consolidation">تثبيت</SelectItem>
                        <SelectItem value="test">اختبار</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surah">السورة *</Label>
                  <Select
                    value={formData.surah_number.toString()}
                    onValueChange={(value) => setFormData({ ...formData, surah_number: parseInt(value), from_ayah: 1, to_ayah: 1 })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SURAHS.map((surah) => (
                        <SelectItem key={surah.number} value={surah.number.toString()}>
                          {surah.number}. {surah.name} ({surah.ayahs} آية)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from_ayah">من الآية *</Label>
                    <Input
                      id="from_ayah"
                      type="number"
                      min="1"
                      max={selectedSurah?.ayahs || 1}
                      value={formData.from_ayah}
                      onChange={(e) => setFormData({ ...formData, from_ayah: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to_ayah">إلى الآية *</Label>
                    <Input
                      id="to_ayah"
                      type="number"
                      min="1"
                      max={selectedSurah?.ayahs || 1}
                      value={formData.to_ayah}
                      onChange={(e) => setFormData({ ...formData, to_ayah: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade">التقييم *</Label>
                    <Select
                      value={formData.grade}
                      onValueChange={(value: any) => setFormData({ ...formData, grade: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">ممتاز</SelectItem>
                        <SelectItem value="very_good">جيد جداً</SelectItem>
                        <SelectItem value="good">جيد</SelectItem>
                        <SelectItem value="acceptable">مقبول</SelectItem>
                        <SelectItem value="needs_improvement">يحتاج تحسين</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mistakes">عدد الأخطاء</Label>
                    <Input
                      id="mistakes"
                      type="number"
                      min="0"
                      value={formData.mistakes_count}
                      onChange={(e) => setFormData({ ...formData, mistakes_count: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="ملاحظات على التسميع..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit">
                    تسجيل التسميع
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('all')}
        >
          الكل
        </Button>
        <Button
          variant={filterType === 'memorization' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('memorization')}
        >
          حفظ جديد
        </Button>
        <Button
          variant={filterType === 'review' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('review')}
        >
          مراجعة
        </Button>
        <Button
          variant={filterType === 'test' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('test')}
        >
          اختبار
        </Button>
      </div>

      {recitations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">لا توجد سجلات تسميع حالياً</p>
            {canAddRecitation && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                تسجيل أول تسميع
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recitations.map((recitation) => (
            <Card key={recitation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{recitation.surah_name}</CardTitle>
                      <Badge variant={getTypeBadge(recitation.type).variant}>
                        {getTypeBadge(recitation.type).label}
                      </Badge>
                      <Badge className={getGradeBadge(recitation.grade || 'good').color}>
                        {getGradeBadge(recitation.grade || 'good').label}
                      </Badge>
                    </div>
                    <CardDescription>
                      من الآية {recitation.from_ayah} إلى الآية {recitation.to_ayah}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{recitation.student?.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(recitation.date).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4" />
                    <span>الأخطاء: {recitation.mistakes_count}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>المعلم: {recitation.teacher?.full_name}</span>
                  </div>
                </div>
                {recitation.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="text-gray-600">{recitation.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
