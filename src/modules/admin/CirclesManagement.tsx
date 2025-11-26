import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { BookOpen, Plus, Edit2, Trash2, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDemoMode, Circle } from '../../lib/supabase';

interface CirclesManagementProps {
  organizationId: string;
}

interface CircleForm {
  name: string;
  description: string;
  level: string;
  max_students: number;
  schedule: string;
}

export function CirclesManagement({ organizationId }: CirclesManagementProps) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCircle, setEditingCircle] = useState<Circle | null>(null);
  const [formData, setFormData] = useState<CircleForm>({
    name: '',
    description: '',
    level: 'beginner',
    max_students: 30,
    schedule: '',
  });

  useEffect(() => {
    fetchCircles();
  }, [organizationId]);

  const fetchCircles = async () => {
    try {
      if (isDemoMode()) {
        console.log('📝 وضع العرض التوضيحي - استخدام بيانات وهمية للحلقات');
        const mockCircles: Circle[] = [
          {
            id: '1',
            organization_id: organizationId,
            name: 'حلقة القرآن الأساسية',
            description: 'للمبتدئين',
            level: 'beginner',
            max_students: 30,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            enrollments_count: 25,
          },
          {
            id: '2',
            organization_id: organizationId,
            name: 'حلقة التجويد المتقدمة',
            description: 'للطلاب المتقدمين',
            level: 'advanced',
            max_students: 20,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            enrollments_count: 18,
          },
          {
            id: '3',
            organization_id: organizationId,
            name: 'حلقة المراجعة المستمرة',
            description: 'لتثبيت الحفظ',
            level: 'intermediate',
            max_students: 25,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            enrollments_count: 20,
          },
        ];
        setCircles(mockCircles);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('circles')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCircles(data || []);
    } catch (error: any) {
      console.error('Error fetching circles:', error);
      toast.error('فشل تحميل الحلقات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCircle = async () => {
    if (!formData.name.trim()) {
      toast.error('يرجى إدخال اسم الحلقة');
      return;
    }

    try {
      if (isDemoMode()) {
        const newCircle: Circle = {
          id: Date.now().toString(),
          organization_id: organizationId,
          name: formData.name,
          description: formData.description,
          level: formData.level,
          max_students: formData.max_students,
          schedule: formData.schedule,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCircles([...circles, newCircle]);
        toast.success('تم إضافة الحلقة بنجاح (Demo Mode)');
        resetForm();
        return;
      }

      const { error } = await supabase.from('circles').insert([
        {
          organization_id: organizationId,
          ...formData,
          is_active: true,
        },
      ]);

      if (error) throw error;
      toast.success('تم إضافة الحلقة بنجاح');
      resetForm();
      fetchCircles();
    } catch (error: any) {
      console.error('Error adding circle:', error);
      toast.error('فشل إضافة الحلقة');
    }
  };

  const handleDeleteCircle = async (circleId: string) => {
    if (!confirm('هل تريد حذف هذه الحلقة؟')) return;

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
      toast.error('فشل حذف الحلقة');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      level: 'beginner',
      max_students: 30,
      schedule: '',
    });
    setEditingCircle(null);
    setIsDialogOpen(false);
  };

  const filteredCircles = circles.filter((circle) =>
    circle.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-600">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            إدارة الحلقات
          </h2>
          <p className="text-gray-600 mt-2">
            إدارة حلقات الدراسة والمستويات
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 ml-2" />
              حلقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة حلقة جديدة</DialogTitle>
              <DialogDescription>
                أضف حلقة دراسية جديدة لمؤسستك
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم الحلقة</Label>
                <Input
                  placeholder="مثال: حلقة القرآن الكريم"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Input
                  placeholder="وصف الحلقة والأهداف"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>المستوى</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                >
                  <option value="beginner">مبتدئ</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">متقدم</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>الحد الأقصى للطلاب</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_students}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_students: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddCircle}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  إضافة الحلقة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="ابحث عن حلقة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الحلقات ({filteredCircles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCircles.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">لم يتم العثور على حلقات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>المستوى</TableHead>
                    <TableHead>
                      <Users className="w-4 h-4" />
                    </TableHead>
                    <TableHead>الحد الأقصى</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCircles.map((circle) => (
                    <TableRow key={circle.id}>
                      <TableCell className="font-medium">
                        {circle.name}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {circle.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {circle.level === 'beginner'
                            ? 'مبتدئ'
                            : circle.level === 'intermediate'
                            ? 'متوسط'
                            : 'متقدم'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {circle.enrollments_count || 0}
                      </TableCell>
                      <TableCell>
                        {circle.max_students}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          نشطة
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCircle(circle.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
