import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { BookOpen, ArrowRight, Building2, User, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { supabase, Organization, UserRole } from '../../lib/supabase';
import { toast } from 'sonner';

interface JoinRequestFormProps {
  organization: Organization;
  onBack: () => void;
  onSuccess: () => void;
}

export function JoinRequestForm({ organization, onBack, onSuccess }: JoinRequestFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '' as UserRole | '',
    date_of_birth: '',
    gender: '' as 'male' | 'female' | '',
    address: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    qualifications: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role || !formData.gender) {
      toast.error('الرجاء ملء جميع الح��ول المطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('join_requests')
        .insert({
          organization_id: organization.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          requested_role: formData.role,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender,
          address: formData.address || null,
          guardian_name: formData.guardian_name || null,
          guardian_phone: formData.guardian_phone || null,
          guardian_email: formData.guardian_email || null,
          qualifications: formData.qualifications || null,
          notes: formData.notes || null,
          status: 'pending',
        });

      if (error) throw error;

      setSuccess(true);
      toast.success('تم إرسال طلبك بنجاح!');
      
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl mb-2">تم إرسال طلبك بنجاح!</h2>
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
            <CardTitle className="text-3xl">تقديم طلب انضمام</CardTitle>
            <div className="mt-3 flex items-center justify-center gap-2 text-gray-600">
              <Building2 className="w-4 h-4" />
              <span>{organization.name}</span>
            </div>
            <CardDescription className="mt-2">
              املأ البيانات التالية لتقديم طلب الانضمام للمؤسسة
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* نوع المستخدم */}
              <div className="space-y-2">
                <Label htmlFor="role">نوع المستخدم *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
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
                  <Label htmlFor="full_name">الاسم الكامل *</Label>
                  <Input
                    id="full_name"
                    placeholder="محمد أحمد"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">الجنس *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' })}>
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    dir="ltr"
                    className="text-right"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  placeholder="الحي، المدينة"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                      <Label htmlFor="guardian_name">اسم ولي الأمر *</Label>
                      <Input
                        id="guardian_name"
                        placeholder="عبدالله أحمد"
                        value={formData.guardian_name}
                        onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                        required={formData.role === 'student'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guardian_phone">جوال ولي الأمر *</Label>
                      <Input
                        id="guardian_phone"
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={formData.guardian_phone}
                        onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                        required={formData.role === 'student'}
                        dir="ltr"
                        className="text-right"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardian_email">بريد ولي الأمر</Label>
                    <Input
                      id="guardian_email"
                      type="email"
                      placeholder="parent@email.com"
                      value={formData.guardian_email}
                      onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                      dir="ltr"
                      className="text-right"
                    />
                  </div>
                </>
              )}

              {/* المؤهلات (للمعلمين) */}
              {formData.role === 'teacher' && (
                <div className="space-y-2">
                  <Label htmlFor="qualifications">المؤهلات والخبرات</Label>
                  <Textarea
                    id="qualifications"
                    placeholder="اذكر مؤهلاتك العلمية وخبراتك في تحفيظ القرآن..."
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    rows={4}
                  />
                </div>
              )}

              {/* ملاحظات إضافية */}
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات إضافية</Label>
                <Textarea
                  id="notes"
                  placeholder="أي معلومات إضافية تود إضافتها..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>ملاحظة:</strong> سيتم مراجعة طلبك من قبل إدارة المؤسسة، وستصلك رسالة على البريد الإلكتروني أو الجوال بعد الموافقة
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
