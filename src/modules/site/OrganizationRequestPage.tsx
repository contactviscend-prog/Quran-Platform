import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Building2, ArrowRight, Mail, Phone, MapPin, User } from 'lucide-react';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

interface OrganizationRequestPageProps {
  onBack: () => void;
}

export function OrganizationRequestPage({ onBack }: OrganizationRequestPageProps) {
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    city: '',
    district: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    directorName: '',
    directorPhone: '',
    directorEmail: '',
    studentsCount: '',
    teachersCount: '',
    circlesCount: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setIsSubmitting(false);
    setSuccess(true);
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
            <p className="text-gray-600 mb-4">
              شكراً لثقتكم بمنصتنا. سيتم مراجعة طلب انضمام مؤسستكم خلال 2-3 أيام عمل
            </p>
            <p className="text-sm text-gray-500 mb-6">
              سنتواصل معكم عبر البريد الإلكتروني أو الهاتف لاستكمال الإجراءات
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
      <div className="max-w-4xl mx-auto py-8">
        <Button variant="ghost" className="mb-4" onClick={onBack}>
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl">طلب انضمام مؤسسة جديدة</CardTitle>
            <CardDescription className="mt-2">
              املأ البيانات التالية لتقديم طلب انضمام مؤسستك أو مركزك إلى المنصة
            </CardDescription>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-emerald-900">
                <strong>منصة خيرية مجانية 100%</strong> - نهدف لخدمة القرآن الكريم ومساعدة جميع المراكز
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* بيانات المؤسسة */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  بيانات المؤسسة
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">اسم المؤسسة/المركز *</Label>
                    <Input
                      id="organizationName"
                      placeholder="مثال: مركز الفجر لتحفيظ القرآن الكريم"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationType">نوع المؤسسة *</Label>
                    <Select value={formData.organizationType} onValueChange={(value) => setFormData({ ...formData, organizationType: value })}>
                      <SelectTrigger id="organizationType">
                        <SelectValue placeholder="اختر نوع المؤسسة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="جمعية">جمعية تحفيظ</SelectItem>
                        <SelectItem value="مركز">مركز تحفيظ</SelectItem>
                        <SelectItem value="دار">دار قرآن</SelectItem>
                        <SelectItem value="مسجد">مسجد</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">المدينة *</Label>
                      <Input
                        id="city"
                        placeholder="مثال: الرياض"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district">الحي *</Label>
                      <Input
                        id="district"
                        placeholder="مثال: حي النخيل"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان التفصيلي</Label>
                    <Input
                      id="address"
                      placeholder="الشارع، رقم المبنى..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">هاتف المؤسسة *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="011xxxxxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        dir="ltr"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="info@organization.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        dir="ltr"
                        className="text-right"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">الموقع الإلكتروني (اختياري)</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      dir="ltr"
                      className="text-right"
                    />
                  </div>
                </div>
              </div>

              {/* بيانات المدير */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  بيانات مدير المؤسسة
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="directorName">اسم المدير *</Label>
                    <Input
                      id="directorName"
                      placeholder="عبدالله أحمد"
                      value={formData.directorName}
                      onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="directorPhone">جوال المدير *</Label>
                      <Input
                        id="directorPhone"
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={formData.directorPhone}
                        onChange={(e) => setFormData({ ...formData, directorPhone: e.target.value })}
                        required
                        dir="ltr"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="directorEmail">بريد المدير *</Label>
                      <Input
                        id="directorEmail"
                        type="email"
                        placeholder="director@email.com"
                        value={formData.directorEmail}
                        onChange={(e) => setFormData({ ...formData, directorEmail: e.target.value })}
                        required
                        dir="ltr"
                        className="text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* الإحصائيات */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">الإحصائيات الحالية</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentsCount">عدد الطلاب (تقريبي)</Label>
                    <Input
                      id="studentsCount"
                      type="number"
                      placeholder="مثال: 150"
                      value={formData.studentsCount}
                      onChange={(e) => setFormData({ ...formData, studentsCount: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teachersCount">عدد المعلمين</Label>
                    <Input
                      id="teachersCount"
                      type="number"
                      placeholder="مثال: 10"
                      value={formData.teachersCount}
                      onChange={(e) => setFormData({ ...formData, teachersCount: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="circlesCount">عدد الحلقات</Label>
                    <Input
                      id="circlesCount"
                      type="number"
                      placeholder="مثال: 8"
                      value={formData.circlesCount}
                      onChange={(e) => setFormData({ ...formData, circlesCount: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* نبذة عن المؤسسة */}
              <div className="space-y-2">
                <Label htmlFor="description">نبذة عن المؤسسة</Label>
                <Textarea
                  id="description"
                  placeholder="اكتب نبذة مختصرة عن المؤسسة وأهدافها..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>ملاحظة:</strong> سيتم مراجعة الطلب خلال 2-3 أيام عمل. سنتواصل معكم لاستكمال 
                  الإجراءات وتفعيل حسابكم على المنصة بشكل مجاني بالكامل.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg"
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
