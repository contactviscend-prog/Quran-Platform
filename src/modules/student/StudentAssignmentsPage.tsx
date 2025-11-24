import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { 
  ClipboardList, Calendar, BookOpen, CheckCircle, 
  Clock, AlertCircle, Target, Award
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase, isDemoMode } from '../../lib/supabase';
import { quranSurahs } from '../../lib/quranData';

interface StudentAssignmentsPageProps {
  studentId: string;
  organizationId: string;
}

interface Assignment {
  id: string;
  title: string;
  type: 'memorization' | 'review' | 'reading' | 'research';
  surah_number: number;
  from_ayah: number;
  to_ayah: number;
  due_date: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  teacher_name?: string;
  created_at: string;
  completion_notes?: string;
  completed_at?: string;
}

export function StudentAssignmentsPage({ studentId, organizationId }: StudentAssignmentsPageProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchAssignments();
  }, [studentId, organizationId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      if (isDemoMode()) {
        const mockAssignments: Assignment[] = [
          {
            id: '1',
            title: 'حفظ سورة الفاتحة',
            type: 'memorization',
            surah_number: 1,
            from_ayah: 1,
            to_ayah: 7,
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'احفظ سورة الفاتحة كاملة مع التجويد',
            status: 'pending',
            priority: 'high',
            teacher_name: 'الأستاذ محمد أحمد',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'مراجعة سورة البقرة (1-20)',
            type: 'review',
            surah_number: 2,
            from_ayah: 1,
            to_ayah: 20,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'راجع الآيات من 1 إلى 20 من سورة البقرة',
            status: 'in_progress',
            priority: 'medium',
            teacher_name: 'الأستاذ محمد أحمد',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            title: 'قراءة سورة آل عمران',
            type: 'reading',
            surah_number: 3,
            from_ayah: 1,
            to_ayah: 50,
            due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'اقرأ أول 50 آية من سورة آل عمران',
            status: 'overdue',
            priority: 'low',
            teacher_name: 'الأستاذ محمد أحمد',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '4',
            title: 'حفظ سورة الإخلاص',
            type: 'memorization',
            surah_number: 112,
            from_ayah: 1,
            to_ayah: 4,
            due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'حفظ متقن',
            status: 'completed',
            priority: 'high',
            teacher_name: 'الأستاذ محمد أحمد',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            completion_notes: 'تم الحفظ بشكل ممتاز'
          }
        ];
        setAssignments(mockAssignments);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          teacher:teacher_id(full_name)
        `)
        .eq('student_id', studentId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAssignments(data?.map(a => ({
        ...a,
        teacher_name: a.teacher?.full_name
      })) || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('فشل في تحميل التكاليف');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedAssignment) return;

    try {
      if (isDemoMode()) {
        toast.success('تم وضع علامة على التكليف كمكتمل');
        setShowDialog(false);
        fetchAssignments();
        return;
      }

      const { error } = await supabase
        .from('assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_notes: completionNotes
        })
        .eq('id', selectedAssignment.id);

      if (error) throw error;

      toast.success('تم وضع علامة على التكليف كمكتمل');
      setShowDialog(false);
      setCompletionNotes('');
      fetchAssignments();
    } catch (error) {
      console.error('Error completing assignment:', error);
      toast.error('فشل في تحديث التكليف');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">قيد الانتظار</Badge>,
      in_progress: <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">قيد التنفيذ</Badge>,
      completed: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">مكتمل</Badge>,
      overdue: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">متأخر</Badge>
    };
    return badges[status as keyof typeof badges];
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: <Badge variant="outline">منخفضة</Badge>,
      medium: <Badge variant="outline" className="bg-yellow-50 text-yellow-700">متوسطة</Badge>,
      high: <Badge variant="outline" className="bg-red-50 text-red-700">عالية</Badge>
    };
    return badges[priority as keyof typeof badges];
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      memorization: <BookOpen className="w-4 h-4" />,
      review: <Target className="w-4 h-4" />,
      reading: <BookOpen className="w-4 h-4" />,
      research: <ClipboardList className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons];
  };

  const getTypeName = (type: string) => {
    const names = {
      memorization: 'حفظ',
      review: 'مراجعة',
      reading: 'قراءة',
      research: 'بحث'
    };
    return names[type as keyof typeof names];
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredAssignments = assignments.filter(a => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return a.status === 'pending' || a.status === 'in_progress' || a.status === 'overdue';
    return a.status === 'completed';
  });

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending' || a.status === 'in_progress').length,
    completed: assignments.filter(a => a.status === 'completed').length,
    overdue: assignments.filter(a => a.status === 'overdue').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي التكاليف</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">قيد التنفيذ</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">مكتملة</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">متأخرة</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      {stats.total > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>نسبة الإنجاز</span>
                <span className="font-medium">
                  {Math.round((stats.completed / stats.total) * 100)}%
                </span>
              </div>
              <Progress value={(stats.completed / stats.total) * 100} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              الكل ({stats.total})
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('pending')}
              size="sm"
            >
              قيد التنفيذ ({stats.pending + stats.overdue})
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('completed')}
              size="sm"
            >
              مكتملة ({stats.completed})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد تكاليف حالياً</p>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map(assignment => {
            const surah = quranSurahs.find(s => s.number === assignment.surah_number);
            const daysUntil = getDaysUntilDue(assignment.due_date);

            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(assignment.type)}
                          <h3 className="font-semibold">{assignment.title}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {getStatusBadge(assignment.status)}
                          {getPriorityBadge(assignment.priority)}
                          <Badge variant="outline">{getTypeName(assignment.type)}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span>
                          {surah?.name} - من آية {assignment.from_ayah} إلى {assignment.to_ayah}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>الموعد النهائي: {new Date(assignment.due_date).toLocaleDateString('ar-SA')}</span>
                        {assignment.status !== 'completed' && (
                          <span className={`mr-2 ${daysUntil < 0 ? 'text-red-600' : daysUntil <= 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                            ({daysUntil < 0 ? `متأخر ${Math.abs(daysUntil)} يوم` : daysUntil === 0 ? 'اليوم' : `باقي ${daysUntil} يوم`})
                          </span>
                        )}
                      </div>
                      {assignment.teacher_name && (
                        <div className="text-sm text-gray-600">
                          المعلم: {assignment.teacher_name}
                        </div>
                      )}
                    </div>

                    {assignment.description && (
                      <p className="text-sm text-gray-600">{assignment.description}</p>
                    )}

                    {assignment.completed_at && assignment.completion_notes && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
                          <Award className="w-4 h-4" />
                          <span className="font-medium">تم الإكمال في {new Date(assignment.completed_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                        {assignment.completion_notes && (
                          <p className="text-sm text-gray-700 mt-2">{assignment.completion_notes}</p>
                        )}
                      </div>
                    )}

                    {assignment.status !== 'completed' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setShowDialog(true);
                          }}
                          className="w-full"
                        >
                          <CheckCircle className="w-4 h-4 ml-2" />
                          وضع علامة كمكتمل
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Complete Assignment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إكمال التكليف</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">{selectedAssignment?.title}</p>
              <p className="text-sm text-gray-600">{selectedAssignment?.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                ملاحظات الإكمال (اختياري)
              </label>
              <Textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="أضف أي ملاحظات حول إكمال التكليف..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleMarkComplete} className="flex-1">
                <CheckCircle className="w-4 h-4 ml-2" />
                تأكيد الإكمال
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
