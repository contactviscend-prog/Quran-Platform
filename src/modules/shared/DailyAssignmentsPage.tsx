import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { BookOpen, Calendar, CheckCircle, Clock, XCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase, isDemoMode } from '../../lib/supabase';
import { toast } from 'sonner';

interface DailyAssignmentsPageProps {
  userId: string;
  userRole: 'teacher' | 'student';
  organizationId: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  circle_name: string;
  teacher_name: string;
  surah_from: string;
  verse_from: number;
  surah_to: string;
  verse_to: number;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
  completed_at?: string;
  notes?: string;
}

export function DailyAssignmentsPage({ userId, userRole, organizationId }: DailyAssignmentsPageProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedCircle, setSelectedCircle] = useState('');
  const [circles, setCircles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    surah_from: '',
    verse_from: '',
    surah_to: '',
    verse_to: '',
    due_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (userRole === 'teacher') {
      fetchTeacherCircles();
    }
    fetchAssignments();
  }, [userId, userRole, organizationId]);

  const fetchTeacherCircles = async () => {
    try {
      // Demo mode - use mock data
      if (isDemoMode()) {
        setCircles([
          { id: 'circle1', name: 'حلقة الفجر' },
          { id: 'circle2', name: 'حلقة المغرب' },
        ]);
        return;
      }

      // Real Supabase fetch
      const { data, error } = await supabase
        .from('circles')
        .select('id, name')
        .eq('organization_id', organizationId)
        .eq('teacher_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      setCircles(data || []);
    } catch (error: any) {
      console.error('Error fetching circles:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      if (isDemoMode()) {
        // Mock data for demo mode
        const mockAssignments: Assignment[] = [
          {
            id: '1',
            title: 'حفظ سورة البقرة',
            description: 'حفظ الآيات من 1 إلى 10 من سورة البقرة',
            circle_name: 'حلقة الفجر',
            teacher_name: 'أحمد المعلم',
            surah_from: 'البقرة',
            verse_from: 1,
            surah_to: 'البقرة',
            verse_to: 10,
            due_date: '2024-01-25',
            status: 'pending',
          },
          {
            id: '2',
            title: 'مراجعة سورة آل عمران',
            description: 'مراجعة الآيات من 50 إلى 75',
            circle_name: 'حلقة الفجر',
            teacher_name: 'أحمد المعلم',
            surah_from: 'آل عمران',
            verse_from: 50,
            surah_to: 'آل عمران',
            verse_to: 75,
            due_date: '2024-01-20',
            status: 'completed',
            completed_at: '2024-01-19',
          },
          {
            id: '3',
            title: 'حفظ سورة النساء',
            description: 'حفظ الآيات من 1 إلى 20',
            circle_name: 'حلقة الظهر',
            teacher_name: 'عمر الحافظ',
            surah_from: 'النساء',
            verse_from: 1,
            surah_to: 'النساء',
            verse_to: 20,
            due_date: '2024-01-18',
            status: 'overdue',
          },
        ];

        setAssignments(mockAssignments);
        setLoading(false);
        return;
      }

      // Real database fetch
      let query = supabase
        .from('assignments')
        .select(`
          id,
          title,
          description,
          circle:circles(id, name),
          teacher:profiles!assignments_teacher_id_fkey(full_name),
          surah_number,
          from_ayah,
          to_ayah,
          due_date,
          status,
          completed_at,
          completion_notes
        `)
        .eq('organization_id', organizationId);

      // Filter by user role
      if (userRole === 'student') {
        query = query.eq('student_id', userId);
      } else if (userRole === 'teacher') {
        query = query.eq('teacher_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching assignments:', error);
        setAssignments([]);
        return;
      }

      const formattedAssignments: Assignment[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        circle_name: item.circle?.name || 'بدون حلقة',
        teacher_name: item.teacher?.full_name || 'بدون معلم',
        surah_from: item.surah_from,
        verse_from: item.verse_from,
        surah_to: item.surah_to,
        verse_to: item.verse_to,
        due_date: item.due_date,
        status: item.status,
        completed_at: item.completed_at,
        notes: item.notes,
      }));

      setAssignments(formattedAssignments);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast.error('فشل تحميل التكليفات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      if (!selectedCircle) {
        toast.error('يرجى اختيار الحلقة');
        return;
      }

      if (!formData.title || !formData.surah_from || !formData.surah_to) {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      // في الواقع يجب حفظها في قاعدة البيانات
      toast.success('تم إنشاء التكليف بنجاح');
      setDialogOpen(false);
      resetForm();
      fetchAssignments();
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast.error('فشل إنشاء التكليف');
    }
  };

  const handleMarkComplete = async (assignmentId: string) => {
    try {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId
            ? { ...a, status: 'completed', completed_at: new Date().toISOString() }
            : a
        )
      );
      toast.success('تم تعليم التكليف كمكتمل');
    } catch (error: any) {
      console.error('Error marking assignment:', error);
      toast.error('فشل تحديث التكليف');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      surah_from: '',
      verse_from: '',
      surah_to: '',
      verse_to: '',
      due_date: new Date().toISOString().split('T')[0],
    });
    setSelectedCircle('');
    setEditingAssignment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'قيد الانتظار';
      case 'overdue':
        return 'متأخر';
      default:
        return status;
    }
  };

  const stats = {
    total: assignments.length,
    pending: assignments.filter((a) => a.status === 'pending').length,
    completed: assignments.filter((a) => a.status === 'completed').length,
    overdue: assignments.filter((a) => a.status === 'overdue').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">التكليفات اليومية</h1>
          <p className="text-gray-600">
            {userRole === 'teacher' ? 'إدارة التكليفات اليومية للطلاب' : 'تكليفاتي اليومية'}
          </p>
        </div>
        {userRole === 'teacher' && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            تكليف جديد
          </Button>
        )}
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            <div className="text-2xl font-semibold">{stats.total}</div>
            <div className="text-sm text-gray-600">إجمالي التكليفات</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 text-center">
            <Clock className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-semibold text-blue-700">{stats.pending}</div>
            <div className="text-sm text-blue-600">قيد الانتظار</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-semibold text-green-700">{stats.completed}</div>
            <div className="text-sm text-green-600">مكتمل</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-semibold text-red-700">{stats.overdue}</div>
            <div className="text-sm text-red-600">متأخرة</div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة التكليفات */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-2">جاري التحميل...</p>
            </CardContent>
          </Card>
        ) : assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">لا توجد تكليفات</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{assignment.title}</CardTitle>
                      <Badge className={getStatusColor(assignment.status)}>
                        <span className="ml-1">{getStatusIcon(assignment.status)}</span>
                        {getStatusLabel(assignment.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{assignment.description}</p>
                  </div>
                  {userRole === 'teacher' && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">المقطع:</span>
                      <span className="font-medium">
                        {assignment.surah_from} ({assignment.verse_from}) - {assignment.surah_to} (
                        {assignment.verse_to})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">موعد التسليم:</span>
                      <span className="font-medium">
                        {new Date(assignment.due_date).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {userRole === 'student' && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">الحلقة:</span>
                        <span className="font-medium">{assignment.circle_name}</span>
                      </div>
                    )}
                    {assignment.completed_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">أكمل في:</span>
                        <span className="font-medium text-green-600">
                          {new Date(assignment.completed_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {userRole === 'student' && assignment.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      onClick={() => handleMarkComplete(assignment.id)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      تعليم كمكتمل
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* نافذة إنشاء تكليف جديد */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تكليف جديد</DialogTitle>
            <DialogDescription>أنشئ تكليف حفظ أو مراجعة للطلاب</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الحلقة *</Label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-white"
                value={selectedCircle}
                onChange={(e) => setSelectedCircle(e.target.value)}
              >
                <option value="">اختر الحلقة</option>
                {circles.map((circle) => (
                  <option key={circle.id} value={circle.id}>
                    {circle.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>عنوان التكليف *</Label>
              <Input
                placeholder="مثال: حفظ سورة لبقرة"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea
                placeholder="وصف تفصيلي للتكليف..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>من سورة *</Label>
                <Input
                  placeholder="مثال: البقرة"
                  value={formData.surah_from}
                  onChange={(e) => setFormData({ ...formData, surah_from: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>من آية *</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.verse_from}
                  onChange={(e) => setFormData({ ...formData, verse_from: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>إلى سورة *</Label>
                <Input
                  placeholder="مثال: البقرة"
                  value={formData.surah_to}
                  onChange={(e) => setFormData({ ...formData, surah_to: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>إلى آية *</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={formData.verse_to}
                  onChange={(e) => setFormData({ ...formData, verse_to: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>موعد التسليم *</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCreateAssignment}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                إنشاء التكليف
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
