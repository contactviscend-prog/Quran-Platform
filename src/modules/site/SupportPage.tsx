import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { MessageCircle, Phone, Mail, HelpCircle, FileText, Send, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export function SupportPage() {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'متوسطة',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactMethods = [
    {
      icon: Phone,
      title: 'الهاتف',
      value: '+966 50 123 4567',
      description: 'اتصل بنا مباشرة',
      color: 'bg-blue-500',
    },
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      value: 'support@fisand.com',
      description: 'راسلنا عبر البريد',
      color: 'bg-emerald-500',
    },
    {
      icon: MessageCircle,
      title: 'الدعم الفني',
      value: 'متاح 24/7',
      description: 'دردشة مباشرة',
      color: 'bg-purple-500',
    },
  ];

  const faqs = [
    {
      question: 'كيف أضيف حلقة جديدة؟',
      answer: 'يمكنك إضافة حلقة جديدة من لوحة التحكم الخاصة بالمدير، قسم "إدارة الحلقات"، ثم اضغط على زر "إضافة حلقة جديدة".',
    },
    {
      question: 'كيف أسجل مراجعة لطالب؟',
      answer: 'من لوحة تحكم المعلم، اختر الطالب المراد تسجيل مراجعة له، ثم اضغط على "إضافة مراجعة" وأدخل التفاصيل المطلوبة.',
    },
    {
      question: 'كيف أضيف مؤسسة جديدة؟',
      answer: 'يمكنك تقديم طلب انضمام مؤسسة من الصفحة الرئيسية، سيتم مراجعته خلال 2-3 أيام عمل والتواصل معك.',
    },
    {
      question: 'كيف أصدّر التقارير؟',
      answer: 'من صفحة التقارير، اختر التقرير المطلوب واضغط على زر "تصدير التقرير" في أعلى الصفحة.',
    },
    {
      question: 'هل المنصة مجانية فعلاً؟',
      answer: 'نعم، المنصة خيرية ومجانية بالكامل لجميع مراكز ومؤسسات تحفيظ القرآن الكريم.',
    },
    {
      question: 'كيف أغير كلمة المرور؟',
      answer: 'من صفحة الإعدادات، اختر "تغيير كلمة المرور" وأدخل كلمة المرور الحالية والجديدة.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ subject: '', category: '', message: '', priority: 'متوسطة' });
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">الدعم الفني</h2>
        <p className="text-gray-600 mt-1">نحن هنا لمساعدتك في أي وقت</p>
      </div>

      <Tabs defaultValue="contact" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contact">تواصل معنا</TabsTrigger>
          <TabsTrigger value="faq">الأسئلة الشائعة</TabsTrigger>
          <TabsTrigger value="request-org">طلب انضمام مؤسسة</TabsTrigger>
        </TabsList>

        {/* تواصل معنا */}
        <TabsContent value="contact" className="space-y-6">
          {/* طرق التواصل */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactMethods.map((method) => (
              <Card key={method.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className={`${method.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{method.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                  <p className="font-medium text-emerald-600">{method.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* نموذج الاتصال */}
          <Card>
            <CardHeader>
              <CardTitle>أرسل رسالة</CardTitle>
              <p className="text-sm text-gray-600 mt-1">سنرد عليك في أقرب وقت ممكن</p>
            </CardHeader>
            <CardContent>
              {submitted && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    تم إرسال رسالتك بنجاح! سنتواصل معك قريباً
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">الموضوع *</Label>
                    <Input
                      id="subject"
                      placeholder="موضوع الرسالة"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">التصنيف *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">مشكلة تقنية</SelectItem>
                        <SelectItem value="account">مشكلة في الحساب</SelectItem>
                        <SelectItem value="feature">طلب ميزة جديدة</SelectItem>
                        <SelectItem value="question">استفسار عام</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">الأولوية</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="عالية">عالية - عاجل</SelectItem>
                      <SelectItem value="متوسطة">متوسطة</SelectItem>
                      <SelectItem value="منخفضة">منخفضة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">الرسالة *</Label>
                  <Textarea
                    id="message"
                    placeholder="اكتب رسالتك هنا..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  <Send className="w-4 h-4 mr-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الأسئلة الشائعة */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-emerald-600" />
                الأسئلة الشائعة
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">إجابات على الأسئلة الأكثر شيوعاً</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-semibold mb-2 flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 mr-4">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">لم تجد إجابة لسؤالك؟</h3>
                  <p className="text-blue-800 mb-3">
                    يمكنك التواصل معنا مباشرة وسنكون سعداء بمساعدتك
                  </p>
                  <Button variant="outline" className="bg-white">
                    تواصل مع الدعم الفني
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* طلب انضمام مؤسسة */}
        <TabsContent value="request-org" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-emerald-600" />
                طلب انضمام مؤسسة جديدة
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                هل تريد إضافة مركز أو مؤسسة تحفيظ جديدة إلى المنصة؟
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6">
                  <h3 className="font-semibold text-emerald-900 mb-4">لماذا تنضم إلينا؟</h3>
                  <ul className="space-y-2 text-emerald-800">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">✓</span>
                      <span>منصة مجانية 100% - خيرية بالكامل</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">✓</span>
                      <span>نظام متكامل لإدارة الحلقات والطلاب</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">✓</span>
                      <span>تقارير تفصيلية ودقيقة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">✓</span>
                      <span>دعم فني متواصل</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">✓</span>
                      <span>تحديثات وتطويرات مستمرة</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">خطوات الانضمام</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium">تقديم الطلب</h4>
                        <p className="text-sm text-gray-600">املأ نموذج طلب انضمام المؤسسة</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium">المراجعة</h4>
                        <p className="text-sm text-gray-600">سيتم مراجعة الطلب خلال 2-3 أيام عمل</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium">التفعيل</h4>
                        <p className="text-sm text-gray-600">سيتم التواصل معك وتفعيل حسابك</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-12"
                  >
                    <Building2 className="w-5 h-5 ml-2" />
                    تقديم طلب انضمام مؤسسة
                  </Button>
                  <p className="text-sm text-gray-500 mt-3">
                    أو تواصل معنا عبر البريد: support@fisand.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* معلومات فسند */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">طُوّرت بواسطة</h3>
            <p className="text-xl text-emerald-700 font-semibold mb-1">فِسند للتطوير الرقمي والإنتاج المرئي</p>
            <p className="text-gray-600">المهندس محمد معياد</p>
            <div className="mt-4 flex justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                info@fisand.com
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                +966 50 123 4567
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
