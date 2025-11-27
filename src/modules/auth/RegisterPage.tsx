import { useState, ChangeEvent } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { BookOpen, ArrowRight, Building2, User, Mail, Phone, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import type { Organization } from '../../App';

interface RegisterPageProps {
  organization: Organization;
  onBack: () => void;
  onSuccess: () => void;
}

export function RegisterPage({ organization, onBack, onSuccess }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    guardianName: '',
    guardianPhone: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // محاكاة إرسال الطلب
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSuccess(true);
    
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">تم إرسال طلبك بنجاح!</h2>
            <p className="text-gray-600 mb-6">
              سيتم مراجعة طلبك والتواصل معك قريباً عبر البريد الإلكتروني أو الهاتف
            </p>
            <Button onClick={onBack} className="bg-emerald-600 hover:bg-emerald-700">
              العودة إلى الصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4" dir="rtl">
      <div className="max-w-3xl mx-auto py-8">
        <Button variant="ghost" className="mb-4" onClick={onBack}>
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl">تسجيل مستخد�� جديد</CardTitle>
            <div className="mt-3 flex items-center justify-center gap-2 text-gray-600">
              <Building2 className="w-4 h-4" />
              <span>{organization.name}</span>
            </div>
            <CardDescription className="mt-2">
              املأ البيانات التالية لتقديم طلب الانضمام
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* نوع المستخدم */}
              <div className="space-y-2">
                <Label htmlFor="role">نوع المستخدم *</Label>
                <Select value={formData.role} onValueChange={(value: string) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="اختر نوع المستخدم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">طالب</SelectItem>
                    <SelectItem value="teacher">معلم</SelectItem>
                    <SelectItem value="parent">ولي أمر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* البيانات الشخصية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    placeholder="محمد أحمد"
                    value={formData.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">الجنس *</Label>
                  <Select value={formData.gender} onValueChange={(value: string) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                    required
                    dir="ltr"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الجوال *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={formData.phone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    dir="ltr"
                    className="text-right"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">تاري�� الميلاد *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  placeholder="الحي، المدينة"
                  value={formData.address}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              {/* بيانات ولي الأمر (للطلاب) */}
              {formData.role === 'student' && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">بيانات ولي الأمر</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guardianName">اسم ولي الأمر *</Label>
                      <Input
                        id="guardianName"
                        placeholder="عبدالله أحمد"
                        value={formData.guardianName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, guardianName: e.target.value })}
                        required={formData.role === 'student'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guardianPhone">جوال ولي الأمر *</Label>
                      <Input
                        id="guardianPhone"
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={formData.guardianPhone}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, guardianPhone: e.target.value })}
                        required={formData.role === 'student'}
                        dir="ltr"
                        className="text-right"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ملاحظات إضافية */}
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات إضافية</Label>
                <Textarea
                  id="notes"
                  placeholder="أي معلومات إضافية تود إضافتها..."
                  value={formData.notes}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>ملاحظة:</strong> سيتم مراجعة طلبك من قبل إدارة المركز، وستصلك رسالة على البريد الإلكتروني أو الجوال بعد الموافقة
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'جاري الإرسال...' : 'تقديم الطلب'}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
              <p>فِسند للتطوير الرقمي والإنتاج المرئي</p>
              <p>المهندس محمد معياد</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
