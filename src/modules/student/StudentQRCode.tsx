import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { QrCode, Download, Share2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface StudentQRCodeProps {
  studentId: string;
  studentName: string;
}

export function StudentQRCode({ studentId, studentName }: StudentQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode();
  }, [studentId]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      // إنشاء البيانات للباركود
      const qrData = {
        student_id: studentId,
        full_name: studentName,
        type: 'student_qr',
        timestamp: new Date().toISOString(),
      };

      // تحويل البيانات إلى نص JSON
      const qrText = JSON.stringify(qrData);

      // استخدام API لإنشاء QR Code
      // يمكنك استخدام خدمات مثل qrcode.react أو api.qrserver.com
      const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}`;
      
      setQrCodeUrl(qrCodeApiUrl);
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast.error('فشل إنشاء رمز الاستجابة السريعة');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${studentName}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('تم تحميل رمز الاستجابة السريعة');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('فشل تحميل الصورة');
    }
  };

  const shareQRCode = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `رمز الاستجابة السريعة - ${studentName}`,
          text: 'استخدم هذا الرمز للمسح السريع',
          url: qrCodeUrl,
        });
      } else {
        // نسخ الرابط إذا لم يكن المشاركة مدعومة
        await navigator.clipboard.writeText(qrCodeUrl);
        toast.success('تم نسخ الرابط إلى الحافظة');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">رمز الاستجابة السريعة (QR)</h1>
        <p className="text-gray-600">استخدم هذا الرمز للمسح السريع من قبل المعلم</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* بطاقة الرمز */}
        <Card>
          <CardHeader>
            <CardTitle>رمز الاستجابة السريعة الخاص بك</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="p-6 bg-white border-4 border-emerald-600 rounded-2xl shadow-lg">
                    <img
                      src={qrCodeUrl}
                      alt="Student QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  <Badge className="mt-4 bg-emerald-600 text-white px-4 py-2 text-sm">
                    <QrCode className="w-4 h-4 ml-2" />
                    رمز نشط
                  </Badge>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={downloadQRCode}
                  className="bg-emerald-600 hover:bg-emerald-700 w-full"
                  disabled={loading}
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل الرمز
                </Button>
                <Button
                  onClick={shareQRCode}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  <Share2 className="w-4 h-4 ml-2" />
                  مشاركة الرمز
                </Button>
                <Button
                  onClick={generateQRCode}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  إعادة إنشاء الرمز
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* معلومات وإرشادات */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الطالب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">الاسم الكامل:</span>
                <span className="font-semibold">{studentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">الدور:</span>
                <Badge>طالب</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">حالة الرمز:</span>
                <Badge className="bg-green-100 text-green-800">نشط</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">كيفية الاستخدام</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-blue-900">احفظ الرمز</p>
                  <p className="text-sm text-blue-800">
                    قم بتحميل الرمز أو أخذ لقطة شاشة له
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-blue-900">اعرض الرمز</p>
                  <p className="text-sm text-blue-800">
                    اعرض الرمز للمعلم عند تسجيل الحضور أو التسميع
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-blue-900">مسح سريع</p>
                  <p className="text-sm text-blue-800">
                    سيقوم المعلم بمسح الرمز لتسجيل بياناتك بشكل فوري
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  !
                </div>
                <div>
                  <p className="font-semibold text-amber-900">ملاحظة مهمة</p>
                  <p className="text-sm text-amber-800">
                    هذا الرمز خاص بك ولا يجب مشاركته مع الآخرين. استخدمه فقط داخل
                    المؤسسة التعليمية.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* معلومات إضافية */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 mb-2">مزايا رمز الاستجابة السريعة</h3>
              <ul className="space-y-2 text-sm text-emerald-800">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                  تسجيل حضور فوري وسريع
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                  تقليل الأخطاء في تسجيل البيانات
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                  سهولة الوصول إلى معلوماتك
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                  توفير الوقت للمعلم والطالب
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}