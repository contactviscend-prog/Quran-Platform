import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Users, Link, Unlink, Search, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

interface ParentStudentLinkProps {
  organizationId: string;
}

interface Parent {
  id: string;
  full_name: string;
  phone: string;
  email: string;
}

interface Student {
  id: string;
  full_name: string;
  circle_name?: string;
}

interface LinkedStudent extends Student {
  parent_id: string;
  parent_name: string;
}

export function ParentStudentLink({ organizationId }: ParentStudentLinkProps) {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    fetchData();
  }, [organizationId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch parents
      const { data: parentsData } = await supabase
        .from('profiles')
        .select('id, full_name, phone, email')
        .eq('organization_id', organizationId)
        .eq('role', 'parent')
        .eq('status', 'active')
        .order('full_name');

      // Fetch students
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', organizationId)
        .eq('role', 'student')
        .eq('status', 'active')
        .order('full_name');

      // Fetch linked students
      const { data: linksData } = await supabase
        .from('parent_students')
        .select(`
          parent_id,
          student_id,
          student:profiles!parent_students_student_id_fkey(id, full_name),
          parent:profiles!parent_students_parent_id_fkey(id, full_name)
        `)
        .eq('organization_id', organizationId);

      setParents(parentsData || []);
      setStudents(studentsData || []);
      
      if (linksData) {
        const formatted = linksData.map((link: any) => ({
          id: link.student.id,
          full_name: link.student.full_name,
          parent_id: link.parent_id,
          parent_name: link.parent.full_name,
        }));
        setLinkedStudents(formatted);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkParentStudent = async () => {
    if (!selectedParent || !selectedStudent) {
      toast.error('الرجاء اختيار ولي أمر وطالب');
      return;
    }

    try {
      // Check if already linked
      const { data: existing } = await supabase
        .from('parent_students')
        .select('id')
        .eq('parent_id', selectedParent)
        .eq('student_id', selectedStudent)
        .single();

      if (existing) {
        toast.error('الطالب مرتبط بولي الأمر بالفعل');
        return;
      }

      const { error } = await supabase
        .from('parent_students')
        .insert({
          organization_id: organizationId,
          parent_id: selectedParent,
          student_id: selectedStudent,
        });

      if (error) throw error;

      toast.success('تم ربط الطالب بولي الأمر بنجاح');
      setIsLinkDialogOpen(false);
      setSelectedParent('');
      setSelectedStudent('');
      fetchData();
    } catch (error: any) {
      console.error('Error linking:', error);
      toast.error('فشل في ربط الطالب بولي الأمر');
    }
  };

  const handleUnlink = async (parentId: string, studentId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء الربط؟')) return;

    try {
      const { error } = await supabase
        .from('parent_students')
        .delete()
        .eq('parent_id', parentId)
        .eq('student_id', studentId);

      if (error) throw error;

      toast.success('تم إلغاء الربط بنجاح');
      fetchData();
    } catch (error: any) {
      console.error('Error unlinking:', error);
      toast.error('فشل في إلغاء الربط');
    }
  };

  const filteredLinked = linkedStudents.filter((student) =>
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.parent_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByParent = filteredLinked.reduce((acc, student) => {
    if (!acc[student.parent_id]) {
      acc[student.parent_id] = {
        parent_name: student.parent_name,
        students: [],
      };
    }
    acc[student.parent_id].students.push(student);
    return acc;
  }, {} as Record<string, { parent_name: string; students: LinkedStudent[] }>);

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
          <h1 className="text-3xl mb-2">ربط أولياء الأمور بالطلاب</h1>
          <p className="text-gray-600">إدارة الربط بين أولياء الأمور والطلاب</p>
        </div>
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Link className="w-4 h-4" />
              ربط جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>ربط ولي أمر بطالب</DialogTitle>
              <DialogDescription>
                اختر ولي أمر وطالب لربطهما معاً
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>ولي الأمر *</Label>
                <Select value={selectedParent} onValueChange={setSelectedParent}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر ولي أمر" />
                  </SelectTrigger>
                  <SelectContent>
                    {parents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.full_name} - {parent.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الطالب *</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طالب" />
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

              <Button onClick={handleLinkParentStudent} className="w-full">
                <Link className="w-4 h-4 ml-2" />
                ربط
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* البحث */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ابحث باسم الطالب أو ولي الأمر..."
              className="pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">{parents.length}</div>
            <div className="text-sm text-gray-600">أولياء الأمور</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">{linkedStudents.length}</div>
            <div className="text-sm text-gray-600">الطلاب المرتبطون</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">{students.length - linkedStudents.length}</div>
            <div className="text-sm text-gray-600">طلاب غير مرتبطين</div>
          </CardContent>
        </Card>
      </div>

      {/* جدول الروابط */}
      {Object.keys(groupedByParent).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">لا توجد روابط حالياً</p>
            <Button onClick={() => setIsLinkDialogOpen(true)} className="gap-2">
              <Link className="w-4 h-4" />
              إضافة أول ربط
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByParent).map(([parentId, data]) => (
            <Card key={parentId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    {data.parent_name}
                  </CardTitle>
                  <Badge>{data.students.length} طالب</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم الطالب</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnlink(parentId, student.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Unlink className="w-4 h-4 ml-1" />
                            إلغاء الربط
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
