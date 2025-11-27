import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import {
  QrCode, Search, UserCheck, BookOpen, ClipboardList,
  CheckCircle, XCircle, Calendar, Award, Clock, Target, X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDemoMode } from '../../lib/supabase';
import { quranSurahs } from '../../lib/quranData';
import { QuranSelector } from '../../components/QuranSelector';

interface StudentQuickAccessProps {
  organizationId: string;
  teacherId: string;
  circleId?: string;
  onDataUpdate?: () => void;
}

interface Student {
  id: string;
  full_name: string;
  barcode: string;
  circle_name?: string;
}

export function StudentQuickAccess({ organizationId, teacherId, circleId, onDataUpdate }: StudentQuickAccessProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'attendance' | 'recitation' | 'assignment'>('attendance');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'unknown'>('unknown');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Attendance State
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'late' | 'excused'>('present');
  
  // Recitation State
  const [recitationData, setRecitationData] = useState({
    type: 'memorization' as 'memorization' | 'review' | 'consolidation' | 'test' | 'listening',
    surah_number: 1,
    from_ayah: 1,
    to_ayah: 1,
    grade: 'good' as 'excellent' | 'very_good' | 'good' | 'acceptable' | 'needs_improvement',
    mistakes_count: 0,
    mistakes_description: '',
    notes: ''
  });
  
  // Assignment State
  const [assignmentData, setAssignmentData] = useState({
    title: '',
    type: 'memorization' as 'memorization' | 'review' | 'reading' | 'research',
    surah_number: 1,
    from_ayah: 1,
    to_ayah: 1,
    due_date: new Date().toISOString().split('T')[0],
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    fetchStudents();
  }, [organizationId, circleId]);

  useEffect(() => {
    // Auto-search when barcode is scanned (typically ends with Enter)
    if (searchQuery.length >= 6) {
      const student = students.find(s => 
        s.barcode.toLowerCase() === searchQuery.toLowerCase()
      );
      if (student) {
        handleStudentSelect(student);
        setSearchQuery('');
      }
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    if (isDemoMode()) {
      const mockStudents: Student[] = [
        { id: '1', full_name: 'أحمد محمد علي', barcode: 'STU001', circle_name: 'حلقة المبتدئين' },
        { id: '2', full_name: 'فاطمة أحمد', barcode: 'STU002', circle_name: 'حلقة المبتدئين' },
        { id: '3', full_name: 'محمد عبدالله', barcode: 'STU003', circle_name: 'حلقة المتقدمين' },
        { id: '4', full_name: 'عائشة سالم', barcode: 'STU004', circle_name: 'حلقة المتقدمين' },
      ];
      setStudents(circleId ? mockStudents.filter(s => s.circle_name?.includes(circleId)) : mockStudents);
      return;
    }

    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          barcode,
          circle:circle_id(name)
        `)
        .eq('organization_id', organizationId)
        .eq('role', 'student');

      if (circleId) {
        query = query.eq('circle_id', circleId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setStudents((data as any[])?.map(s => ({
        id: s.id,
        full_name: s.full_name,
        barcode: s.barcode || '',
        circle_name: (s.circle as any)?.name
      })) || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('فشل في تحميل الطلاب');
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setShowDialog(true);
    setShowQRScanner(false);
  };

  const startQRScanner = async () => {
    setShowQRScanner(true);

    // Check if camera API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('الكاميرا غير مدعومة في هذا المتصفح');
      setCameraPermission('denied');
      return;
    }

    // Check if running in secure context (HTTPS)
    if (!window.isSecureContext && window.location.protocol !== 'http:') {
      toast.error('الكاميرا تتطلب اتصال آمن (HTTPS)');
      setCameraPermission('denied');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraPermission('granted');
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);

      // Provide specific error messages based on error type
      if (error.name === 'NotAllowedError') {
        toast.error('تم رفض الوصول للكاميرا. يرجى السماح بالوصول والمحاولة مرة أخرى');
        setCameraPermission('denied');
      } else if (error.name === 'NotFoundError') {
        toast.error('لم يتم العثور على كاميرا. تأكد من وجود كاميرا متصلة');
        setCameraPermission('denied');
      } else if (error.name === 'NotReadableError') {
        toast.error('الكاميرا قيد الاستخدام من قبل تطبيق آخر');
        setCameraPermission('denied');
      } else {
        toast.error('فشل الوصول للكاميرا. استخدم الإدخال اليدوي بدلاً من ذلك');
        setCameraPermission('denied');
      }
      setShowQRScanner(false);
    }
  };

  const stopQRScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowQRScanner(false);
    setCameraPermission('unknown');
  };

  const handleManualBarcodeScan = (barcode: string) => {
    const student = students.find(s =>
      s.barcode.toLowerCase() === barcode.toLowerCase()
    );
    if (student) {
      handleStudentSelect(student);
    } else {
      toast.error('الطالب غير موجود');
    }
  };

  const handleAttendance = async () => {
    if (!selectedStudent) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (isDemoMode()) {
        toast.success(`تم تسجيل ${attendanceStatus === 'present' ? 'حضور' : 'غياب'} ${selectedStudent.full_name}`);
        setShowDialog(false);
        return;
      }

      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: selectedStudent.id,
          date: today,
          status: attendanceStatus,
          recorded_by: teacherId,
          organization_id: organizationId
        });

      if (error) throw error;

      toast.success(`تم تسجيل ${attendanceStatus === 'present' ? 'حضور' : 'غياب'} ${selectedStudent.full_name}`);
      setShowDialog(false);
      onDataUpdate?.();
    } catch (error) {
      console.error('Error recording attendance:', error);
      toast.error('فشل في تسجيل الحضور');
    }
  };

  const handleRecitation = async () => {
    if (!selectedStudent) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (isDemoMode()) {
        toast.success(`تم تسجيل التسميع لـ ${selectedStudent.full_name}`);
        setShowDialog(false);
        return;
      }

      const { error } = await supabase
        .from('recitations')
        .insert({
          student_id: selectedStudent.id,
          teacher_id: teacherId,
          organization_id: organizationId,
          date: today,
          ...recitationData
        });

      if (error) throw error;

      toast.success(`تم تسجيل التسميع لـ ${selectedStudent.full_name}`);
      setShowDialog(false);
      onDataUpdate?.();

      // Reset form
      setRecitationData({
        type: 'memorization',
        surah_number: 1,
        from_ayah: 1,
        to_ayah: 1,
        grade: 'good',
        mistakes_count: 0,
        mistakes_description: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error recording recitation:', error);
      toast.error('فشل في تسجيل التسميع');
    }
  };

  const handleAssignment = async () => {
    if (!selectedStudent) return;

    try {
      if (isDemoMode()) {
        toast.success(`تم تكليف ${selectedStudent.full_name} بالمهمة`);
        setShowDialog(false);
        return;
      }

      const { error } = await supabase
        .from('assignments')
        .insert({
          student_id: selectedStudent.id,
          teacher_id: teacherId,
          organization_id: organizationId,
          created_at: new Date().toISOString(),
          status: 'pending',
          ...assignmentData
        });

      if (error) throw error;

      toast.success(`تم تكليف ${selectedStudent.full_name} بالمهمة`);
      setShowDialog(false);
      onDataUpdate?.();

      // Reset form
      setAssignmentData({
        title: '',
        type: 'memorization',
        surah_number: 1,
        from_ayah: 1,
        to_ayah: 1,
        due_date: new Date().toISOString().split('T')[0],
        description: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('فشل في إنشاء التكليف');
    }
  };

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSurah = quranSurahs.find(s => s.number === recitationData.surah_number);
  const assignmentSurah = quranSurahs.find(s => s.number === assignmentData.surah_number);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            الوصول السريع للطالب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="امسح الباركود أو ابحث عن الطالب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                  autoFocus
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={startQRScanner}
                title="مسح الباركود"
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>

            {/* QR Scanner Modal */}
            {showQRScanner && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">ماسح الباركود</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={stopQRScanner}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <video
                    ref={videoRef}
                    className="w-full h-64 bg-black rounded-lg object-cover"
                    autoPlay
                    playsInline
                  />
                  <Input
                    placeholder="أو أدخل الباركود يدويا..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value;
                        if (value) {
                          handleManualBarcodeScan(value);
                          (e.target as HTMLInputElement).value = '';
                          stopQRScanner();
                        }
                      }
                    }}
                    autoFocus
                  />
                  <p className="text-xs text-gray-600">
                    اوجّه الكاميرا على الباركود أو أدخل رمز الطالب يدويا ثم اضغط Enter
                  </p>
                </div>
              </div>
            )}

            {searchQuery && filteredStudents.length > 0 && (
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {filteredStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className="w-full p-3 hover:bg-gray-50 text-right transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        {student.circle_name && (
                          <p className="text-sm text-gray-500">{student.circle_name}</p>
                        )}
                      </div>
                      <Badge variant="outline">{student.barcode}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.full_name}
              <Badge variant="outline" className="mr-2">{selectedStudent?.barcode}</Badge>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                الحضور
              </TabsTrigger>
              <TabsTrigger value="recitation" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                التسميع
              </TabsTrigger>
              <TabsTrigger value="assignment" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                التكليف
              </TabsTrigger>
            </TabsList>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAttendanceStatus('present')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    attendanceStatus === 'present'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">حاضر</p>
                </button>

                <button
                  onClick={() => setAttendanceStatus('absent')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    attendanceStatus === 'absent'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <p className="font-medium">غائب</p>
                </button>

                <button
                  onClick={() => setAttendanceStatus('late')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    attendanceStatus === 'late'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <p className="font-medium">متأخر</p>
                </button>

                <button
                  onClick={() => setAttendanceStatus('excused')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    attendanceStatus === 'excused'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">غياب بعذر</p>
                </button>
              </div>

              <Button onClick={handleAttendance} className="w-full">
                تأكيد الحضور
              </Button>
            </TabsContent>

            {/* Recitation Tab */}
            <TabsContent value="recitation" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>نوع التسميع</Label>
                  <Select
                    value={recitationData.type}
                    onValueChange={(v) => setRecitationData({ ...recitationData, type: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="memorization">حفظ جديد</SelectItem>
                      <SelectItem value="review">مراجعة</SelectItem>
                      <SelectItem value="consolidation">تثبيت</SelectItem>
                      <SelectItem value="test">اختبار</SelectItem>
                      <SelectItem value="listening">استماع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <QuranSelector
                  defaultSurah={recitationData.surah_number}
                  defaultFromAyah={recitationData.from_ayah}
                  defaultToAyah={recitationData.to_ayah}
                  onSelectionChange={(selection) => {
                    setRecitationData({
                      ...recitationData,
                      surah_number: selection.surahNumber,
                      from_ayah: selection.fromAyah,
                      to_ayah: selection.toAyah
                    });
                  }}
                />

                <div>
                  <Label>التقييم</Label>
                  <Select
                    value={recitationData.grade}
                    onValueChange={(v) => setRecitationData({ ...recitationData, grade: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">ممتاز (95-100%)</SelectItem>
                      <SelectItem value="very_good">جيد جداً (85-94%)</SelectItem>
                      <SelectItem value="good">جيد (75-84%)</SelectItem>
                      <SelectItem value="acceptable">مقبول (65-74%)</SelectItem>
                      <SelectItem value="needs_improvement">يحتاج تحسي�� (&lt;65%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>عدد الأخطاء</Label>
                    <Input
                      type="number"
                      min="0"
                      value={recitationData.mistakes_count}
                      onChange={(e) => setRecitationData({
                        ...recitationData,
                        mistakes_count: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>وصف الأخطاء (اختياري)</Label>
                  <Textarea
                    value={recitationData.mistakes_description}
                    onChange={(e) => setRecitationData({
                      ...recitationData,
                      mistakes_description: e.target.value
                    })}
                    placeholder="تفصيل الأخطاء إن وجدت..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>ملاحظات (اختياري)</Label>
                  <Textarea
                    value={recitationData.notes}
                    onChange={(e) => setRecitationData({ ...recitationData, notes: e.target.value })}
                    placeholder="أي ملاحظات إضافية..."
                    rows={2}
                  />
                </div>

                <Button onClick={handleRecitation} className="w-full">
                  <Award className="w-4 h-4 ml-2" />
                  تسجيل التسميع
                </Button>
              </div>
            </TabsContent>

            {/* Assignment Tab */}
            <TabsContent value="assignment" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>عنوان التكليف</Label>
                  <Input
                    value={assignmentData.title}
                    onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                    placeholder="مثال: حفظ سورة الفاتحة"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>نوع التكليف</Label>
                    <Select
                      value={assignmentData.type}
                      onValueChange={(v) => setAssignmentData({ ...assignmentData, type: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="memorization">حفظ</SelectItem>
                        <SelectItem value="review">مراجعة</SelectItem>
                        <SelectItem value="reading">قراءة</SelectItem>
                        <SelectItem value="research">بحث</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>الأولوية</Label>
                    <Select
                      value={assignmentData.priority}
                      onValueChange={(v) => setAssignmentData({ ...assignmentData, priority: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="medium">متوسطة</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <QuranSelector
                  defaultSurah={assignmentData.surah_number}
                  defaultFromAyah={assignmentData.from_ayah}
                  defaultToAyah={assignmentData.to_ayah}
                  onSelectionChange={(selection) => {
                    setAssignmentData({
                      ...assignmentData,
                      surah_number: selection.surahNumber,
                      from_ayah: selection.fromAyah,
                      to_ayah: selection.toAyah
                    });
                  }}
                />

                <div>
                  <Label>تاريخ الاستحقاق</Label>
                  <Input
                    type="date"
                    value={assignmentData.due_date}
                    onChange={(e) => setAssignmentData({ ...assignmentData, due_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label>الوصف</Label>
                  <Textarea
                    value={assignmentData.description}
                    onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                    placeholder="وصف تفصيلي للتكليف..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleAssignment} className="w-full">
                  <Target className="w-4 h-4 ml-2" />
                  إنشاء التكليف
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
