import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { QrCode, Camera, X, CheckCircle, User, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface QRCodeScannerProps {
  teacherId: string;
  organizationId: string;
  onScan?: (studentData: any) => void;
}

interface ScannedStudent {
  id: string;
  full_name: string;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
}

export function QRCodeScanner({ teacherId, organizationId, onScan }: QRCodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scannedStudents, setScannedStudents] = useState<ScannedStudent[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [showManualDialog, setShowManualDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // في الواقع يجب استخدام مكتبة لقراءة QR من الصورة
      // مثل jsQR أو html5-qrcode
      toast.info('جاري قراءة رمز الاستجابة السريعة...');
      
      // محاكاة قراءة الرمز
      setTimeout(() => {
        const mockQRData = {
          student_id: 'mock-student-1',
          full_name: 'محمد أحمد',
          organization_id: organizationId,
          type: 'student_qr',
        };
        processScannedData(mockQRData);
      }, 1000);
    } catch (error) {
      console.error('Error reading QR code:', error);
      toast.error('فشل قراءة رمز الاستجابة السريعة');
    }
  };

  const processScannedData = async (qrData: any) => {
    try {
      // التحقق من صحة البيانات
      if (qrData.organization_id !== organizationId) {
        toast.error('هذا الرمز ينتمي لمؤسسة أخرى');
        return;
      }

      if (qrData.type !== 'student_qr') {
        toast.error('نوع الرمز غير صحيح');
        return;
      }

      // جلب بيانات الطالب
      const { data: studentData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', qrData.student_id)
        .eq('organization_id', organizationId)
        .single();

      if (error || !studentData) {
        addScannedStudent({
          id: qrData.student_id,
          full_name: qrData.full_name,
          status: 'error',
          message: 'الطالب غير موجود',
          timestamp: new Date().toISOString(),
        });
        toast.error('الطالب غير موجود في النظام');
        return;
      }

      // إضافة الطالب للقائمة
      addScannedStudent({
        id: studentData.id,
        full_name: studentData.full_name,
        status: 'success',
        message: 'تم المسح بنجاح',
        timestamp: new Date().toISOString(),
      });

      toast.success(`تم مسح رمز الطالب: ${studentData.full_name}`);

      // استدعاء callback إذا كان موجوداً
      if (onScan) {
        onScan(studentData);
      }
    } catch (error: any) {
      console.error('Error processing QR data:', error);
      toast.error('فشل معالجة البيانات');
    }
  };

  const addScannedStudent = (student: ScannedStudent) => {
    setScannedStudents((prev) => {
      // تحقق من عدم وجود الطالب بالفعل في القائمة
      const exists = prev.some((s) => s.id === student.id);
      if (exists) {
        toast.info('تم مسح هذا الطالب مسبقاً');
        return prev;
      }
      return [student, ...prev];
    });
  };

  const handleManualInput = async () => {
    try {
      if (!manualInput.trim()) {
        toast.error('يرجى إدخال رقم الطالب');
        return;
      }

      // محاكاة البحث عن الطالب برقمه
      const mockStudentData = {
        student_id: manualInput,
        full_name: 'طالب من الإدخال اليدوي',
        organization_id: organizationId,
        type: 'student_qr',
      };

      processScannedData(mockStudentData);
      setManualInput('');
      setShowManualDialog(false);
    } catch (error) {
      console.error('Error with manual input:', error);
      toast.error('فشل البحث عن الطالب');
    }
  };

  const clearHistory = () => {
    setScannedStudents([]);
    toast.success('تم مسح السجل');
  };

  const startCamera = async () => {
    try {
      setScanning(true);
      // في الواقع يجب استخدام مكتبة html5-qrcode للوصول للكاميرا
      toast.info('سيتم فتح الكاميرا قريباً...');
    } catch (error) {
      console.error('Error starting camera:', error);
      toast.error('فشل الوصول للكاميرا');
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">ماسح رمز الاستجابة السريعة</h1>
        <p className="text-gray-600">قم بمسح رموز الطلاب للتسجيل السريع</p>
      </div>

      {/* خيارات المسح */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={startCamera}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold mb-1">مسح بالكاميرا</h3>
              <p className="text-sm text-gray-600">استخدم كاميرا الجهاز للمسح المباشر</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">رفع صورة</h3>
              <p className="text-sm text-gray-600">ارفع صورة رمز الاستجابة السريعة</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowManualDialog(true)}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">إدخال يدوي</h3>
              <p className="text-sm text-gray-600">أدخل رقم الطالب يدوياً</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* سجل المسح */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>سجل المسح ({scannedStudents.length})</CardTitle>
            {scannedStudents.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearHistory}>
                <X className="w-4 h-4 ml-2" />
                مسح السجل
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {scannedStudents.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">لم يتم مسح أي رموز بعد</p>
              <p className="text-sm text-gray-500 mt-2">ابدأ بمسح رموز الطلاب</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scannedStudents.map((student, index) => (
                <div
                  key={`${student.id}-${index}`}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg ${
                    student.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        student.status === 'success'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {student.status === 'success' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <X className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{student.full_name}</p>
                      <p className="text-sm text-gray-600">{student.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(student.timestamp).toLocaleTimeString('ar-SA')}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      student.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {student.status === 'success' ? 'نجح' : 'فشل'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة الإدخال اليدوي */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إدخال يدوي</DialogTitle>
            <DialogDescription>
              أدخل رقم الطالب أو اسمه للبحث عنه في النظام.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">رقم الطالب أو اسمه</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="أدخل رقم أو اسم الطالب"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowManualDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleManualInput} className="bg-emerald-600 hover:bg-emerald-700">
                بحث
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* إرشادات الاستخدام */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">نصائح للمسح السريع</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  تأكد من وضوح رمز الاستجابة السريعة
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  استخدم إضاءة جيدة عند المسح
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  اطلب من الطالب عرض الرمز بشكل واضح
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  يمكن استخدام الإدخال اليدوي في حال وجود مشكلة
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
