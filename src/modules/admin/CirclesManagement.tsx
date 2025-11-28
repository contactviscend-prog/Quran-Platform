import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { isDemoMode, supabase, Circle, Profile } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Plus, BookOpen, User, Users, Edit, Trash2 } from 'lucide-react';

interface CirclesManagementProps {
  organizationId: string;
}

export function CirclesManagement({ organizationId }: CirclesManagementProps) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCircle, setEditingCircle] = useState<Circle | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teacher_id: '',
    level: 'beginner',
    max_students: 15,
  });

  useEffect(() => {
    fetchCircles();
    fetchTeachers();
  }, [organizationId]);

  const fetchCircles = async () => {
    try {
      setLoading(true);

      
      // Demo mode - use mock data
      if (isDemoMode()) {
        const mockCircles: any[] = [
          {
            id: 'circle1',
            organization_id: organizationId,
            name: 'حلقة الفجر',
            description: 'حلقة للمبتدئين',
            teacher_id: 'teacher1',
            teacher: { id: 'teacher1', full_name: 'أحمد المعلم' },
            level: 'beginner',
            max_students: 20,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'circle2',
            organization_id: organizationId,
            name: 'حلقة المغرب',
            description: 'حلقة متقدمة',
            teacher_id: 'teacher2',
            teacher: { id: 'teacher2', full_name: 'عمر المعلم' },
            level: 'advanced',
            max_students: 15,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        setCircles(mockCircles);
        setLoading(false);
        return;
      }

      // Real Supabase fetch
      const { data, error } = await supabase
        .from('circles')
        .select(`
          *,
          teacher:profiles!circles_teacher_id_fkey(id, full_name)
        `)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCircles(data || []);
    } catch (error: any) {
      console.error('Error fetching circles:', error);
      if (!isDemoMode()) {
        toast.error('فشل في تحميل الحلقات');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      // Demo mode - use mock data
      if (isDemoMode()) {
        setTeachers([
          { id: 'teacher1', full_name: 'أحمد المعلم' } as any,
          { id: 'teacher2', full_name: 'عمر المعلم' } as any,
          { id: 'teacher3', full_name: 'محمد المعلم' } as any,
        ]);
        return;
      }

      // Real Supabase fetch
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('role', 'teacher')
        .eq('status', 'active')
        .order('full_name');

      if (error) {
        console.error('Error fetching teachers:', error.message || error);
        return;
      }
      setTeachers(data || []);
    } catch (error: any) {
      console.error('Error fetching teachers:', error?.message || error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Handle "none" as null for teacher_id
      const teacherId = formData.teacher_id === 'none' ? null : formData.teacher_id || null;

      // Demo mode - simulate save
      if (isDemoMode()) {
        if (editingCircle) {
          toast.success('تم تحديث الحلقة بنجاح (Demo Mode)');
        } else {
          toast.success('تم إضافة الحلقة بنجاح (Demo Mode)');
        }
        fetchCircles();
        resetForm();
        setIsAddDialogOpen(false);
        return;
      }

      if (editingCircle) {
        // Update existing circle
        const { error } = await supabase
          .from('circles')
          .update({
            name: formData.name,
            description: formData.description,
            teacher_id: teacherId,
            level: formData.level,
            max_students: formData.max_students,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCircle.id);

        if (error) throw error;
        toast.success('تم تحديث الحلقة بنجاح');
      } else {
        // Create new circle
        const { error } = await supabase
          .from('circles')
          .insert({
            organization_id: organizationId,
            name: formData.name,
            description: formData.description,
            teacher_id: teacherId,
            level: formData.level,
            max_students: formData.max_students,
            is_active: true,
          });

        if (error) throw error;
        toast.success('تم إضافة الحلقة بنجاح');
      }

      fetchCircles();
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving circle:', error);
      if (!isDemoMode()) {
        toast.error('فشل في حفظ الحلقة');
      }
    }
  };

  const handleEdit = (circle: Circle) => {
    setEditingCircle(circle);
    setFormData({
      name: circle.name,
      description: circle.description || '',
      teacher_id: circle.teacher_id || '',
      level: circle.level,
      max_students: circle.max_students,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (circleId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحلقة؟')) return;

    try {
      if (isDemoMode()) {
        setCircles(circles.filter((c) => c.id !== circleId));
        toast.success('تم حذف الحلقة بنجاح (Demo Mode)');
        return;
      }

      const { error } = await supabase
        .from('circles')
        .update({ is_active: false })
        .eq('id', circleId);

      if (error) throw error;
      toast.success('تم حذف الحلقة بنجاح');
      fetchCircles();
    } catch (error: any) {
      console.error('Error deleting circle:', error);
      if (!isDemoMode()) {
        toast.error('فشل في حذف الحلقة');
      }
      toast.error('فشل في حذف الحلقة');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      teacher_id: '',
      level: 'beginner',
      max_students: 15,
    });
    setEditingCircle(null);
  };

  const getLevelBadge = (level: string) => {
    const levels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      beginner: { label: 'مبتدئ', variant: 'default' },
      intermediate: { label: 'متوسط', variant: 'secondary' },
      advanced: { label: 'متقدم', variant: 'outline' },
    };
    return levels[level] || { label: level, variant: 'default' };
  };

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
          <h2 className="text-2xl">إدارة الحلقات</h2>
          <p className="text-gray-600">إدارة حلقات الت��فيظ والمعلمين</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة حلقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCircle ? 'تعديل الحلقة' : 'إضافة حلقة جديدة'}</DialogTitle>
              <DialogDescription>
                أدخل معلومات الحلقة والمعلم المسؤول عنها
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الحلقة *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: حلقة الفجر للمبتدئين"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف مختصر عن الحلقة..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher">المعلم المسؤول</Label>
                  <Select
                    value={formData.teacher_id}
                    onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المعلم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون معلم</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">المستوى *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">مبتدئ</SelectItem>
                      <SelectItem value="intermediate">متوسط</SelectItem>
                      <SelectItem value="advanced">متقدم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_students">الحد الأقصى للطلاب *</Label>
                <Input
                  id="max_students"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.max_students}
                  onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                  required
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
                  {editingCircle ? 'حفظ التعديلات' : 'إضافة الحلقة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {circles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">لا توجد حلقات حالياً</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة أول حلقة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {circles.map((circle) => (
            <Card key={circle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{circle.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {circle.description || 'لا يوجد وصف'}
                    </CardDescription>
                  </div>
                  <Badge variant={getLevelBadge(circle.level).variant}>
                    {getLevelBadge(circle.level).label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{circle.teacher?.full_name || 'بدون معلم'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>الحد الأقصى: {circle.max_students} طالب</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handleEdit(circle)}
                  >
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(circle.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
