import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDemoMode } from '../../lib/supabase';

interface CirclesManagementProps {
  organizationId: string;
}

interface Circle {
  id: string;
  name: string;
  description?: string;
  level: string;
  max_students: number;
  student_count: number;
  is_active: boolean;
}

export function CirclesManagement({ organizationId }: CirclesManagementProps) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '', level: 'beginner', max_students: 20 });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCircles();
  }, [organizationId]);

  const fetchCircles = async () => {
    try {
      if (isDemoMode()) {
        setCircles([
          { id: '1', name: 'حلقة المبتدئين', level: 'beginner', max_students: 20, student_count: 15, is_active: true },
          { id: '2', name: 'حلقة المتقدمين', level: 'intermediate', max_students: 15, student_count: 12, is_active: true },
        ]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('circles')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) throw error;
      setCircles(data || []);
    } catch (error) {
      console.error('Error fetching circles:', error);
      toast.error('فشل في تحميل الحلقات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('يرجى إدخال اسم الحلقة');
      return;
    }

    try {
      if (isDemoMode()) {
        toast.success(editingId ? 'تم تحديث الحلقة' : 'تم إنشاء حلقة جديدة');
        setFormData({ name: '', description: '', level: 'beginner', max_students: 20 });
        setEditingId(null);
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from('circles')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
        toast.success('تم تحديث الحلقة');
      } else {
        const { error } = await supabase
          .from('circles')
          .insert([{ ...formData, organization_id: organizationId }]);
        if (error) throw error;
        toast.success('تم إنشاء حلقة جديدة');
      }

      setFormData({ name: '', description: '', level: 'beginner', max_students: 20 });
      setEditingId(null);
      fetchCircles();
    } catch (error) {
      console.error('Error saving circle:', error);
      toast.error('فشل في حفظ الحلقة');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (isDemoMode()) {
        setCircles(circles.filter(c => c.id !== id));
        toast.success('تم حذف الحلقة');
        return;
      }

      const { error } = await supabase.from('circles').delete().eq('id', id);
      if (error) throw error;
      toast.success('تم حذف الحلقة');
      fetchCircles();
    } catch (error) {
      console.error('Error deleting circle:', error);
      toast.error('فشل في حذف الحلقة');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إدارة الحلقات</h2>
        <Dialog open={editingId === 'new' || editingId === null} onOpenChange={(open) => {
          if (!open) {
            setEditingId(null);
            setFormData({ name: '', description: '', level: 'beginner', max_students: 20 });
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingId('new')}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة حلقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId === 'new' ? 'إضافة حلقة جديدة' : 'تعديل الحلقة'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>اسم الحلقة</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: حلقة المبتدئين"
                />
              </div>
              <div>
                <Label>الوصف</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الحلقة..."
                />
              </div>
              <div>
                <Label>المستوى</Label>
                <Input
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                />
              </div>
              <div>
                <Label>الحد الأقصى للطلاب</Label>
                <Input
                  type="number"
                  value={formData.max_students}
                  onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) || 20 })}
                />
              </div>
              <Button onClick={handleSave} className="w-full">حفظ</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">جاري التحميل...</p>
          </CardContent>
        </Card>
      ) : circles.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">لا توجد حلقات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {circles.map(circle => (
            <Card key={circle.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{circle.name}</CardTitle>
                    <Badge variant="outline" className="mt-2">{circle.level}</Badge>
                  </div>
                  <Badge variant={circle.is_active ? 'default' : 'secondary'}>
                    {circle.is_active ? 'نشط' : 'معطل'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {circle.description && <p className="text-sm text-gray-600">{circle.description}</p>}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{circle.student_count} / {circle.max_students} طالب</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({ name: circle.name, description: circle.description || '', level: circle.level, max_students: circle.max_students });
                      setEditingId(circle.id);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(circle.id)}
                  >
                    <Trash2 className="w-4 h-4" />
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
