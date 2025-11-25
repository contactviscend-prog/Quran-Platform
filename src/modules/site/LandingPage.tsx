import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { BookOpen, Users, TrendingUp, Award, CheckCircle, BarChart3, Shield, Heart, Globe, ArrowRight } from 'lucide-react';
import { DemoModeBanner } from '../../components/DemoModeBanner';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  // Check if we're in demo mode
  const isDemoMode = !import.meta.env?.VITE_SUPABASE_URL || 
    import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';

  const features = [
    {
      icon: BookOpen,
      title: 'إدارة الحفظ',
      description: 'نظام متكامل لتتبع حفظ الطلاب ومراجعاتهم',
    },
    {
      icon: Users,
      title: 'تعدد الأدوار',
      description: 'مدير، مشرف، معلم، طالب، ولي أمر - كل بصلاحياته',
    },
    {
      icon: BarChart3,
      title: 'التقارير والإحصائيات',
      description: 'تقارير تفصيلية عن تقدم الطلاب والحلقات',
    },
    {
      icon: Shield,
      title: 'نظام متعدد المؤسسات',
      description: 'عزل كامل للبيانات بين المراكز والمؤسسات',
    },
    {
      icon: TrendingUp,
      title: 'متابعة التقدم',
      description: 'رصد مستمر لتقدم الطلاب وأدائهم',
    },
    {
      icon: Award,
      title: 'نظام الإنجازات',
      description: 'تحفيز الطلاب من خلال الإنجازات والنقاط',
    },
  ];

  const roles = [
    {
      title: 'المدير',
      description: 'إدارة شاملة للمنصة والمستخدمين والحلقات',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'المشرف',
      description: 'متابعة المعلمين والحلقات وإعداد التقارير',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'المعلم',
      description: 'تسجيل حفظ الطلاب والمراجعات اليومية',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'الطالب',
      description: 'متابعة التقدم والحفظ والمراجعات الشخصية',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'ولي الأمر',
      description: 'متابعة تقدم الأبناء وحضورهم وإنجازاتهم',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50" dir="rtl">
      {/* Charity Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 fill-white" />
            <p className="text-sm md:text-base">
              منصة خيرية مجانية بالكامل • نهدف لخدمة كتاب الله وتسهيل إدارة حلقات التحفيظ
            </p>
            <Heart className="w-5 h-5 fill-white" />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-24">
          <div className="text-center space-y-8">
            {/* Demo Mode Banner */}
            {isDemoMode && (
              <div className="mb-8 max-w-2xl mx-auto">
                <DemoModeBanner />
              </div>
            )}

            <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-xl">منصة تحفيظ القرآن الكريم</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 leading-tight">
              خدمة خيرية مجانية
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                لإدارة حلقات التحفيظ
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              منصة احترافية مجانية تهدف لخدمة القرآن الكريم ومساعدة مراكز ومؤسسات تحفيظ القرآن
              في إدارة حلقاتها بكفاءة عالية من خلال نظام متعدد المؤسسات مع تتبع شامل للطلاب والمعلمين
            </p>

            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <Globe className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div className="text-right">
                  <h3 className="font-semibold text-emerald-900 mb-2">رسالتنا</h3>
                  <p className="text-emerald-800">
                    نسعى لتسهيل رحلة حفظ كتاب الله من خلال توفير أدوات تقنية حديثة ومجانية 
                    لجميع مراكز التحفيظ، صغيرها وكبيرها، في كل مكان
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-6 text-lg"
                onClick={onGetStarted}
              >
                ابدأ الآن مجاناً
                <BookOpen className="mr-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                تعرف على المزيد
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">المميزات الرئيسية</h2>
            <p className="text-xl text-gray-600">
              كل ما تحتاجه ��إدارة مركز التحفيظ بكفاءة واحترافية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-emerald-200 transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">الأدوار والصلاحيات</h2>
            <p className="text-xl text-gray-600">
              نظام شامل لجميع المستخدمين ف�� مؤسستك
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <Card key={index} className="border-0 overflow-hidden hover:shadow-xl transition-all">
                <div className={`h-2 bg-gradient-to-r ${role.color}`}></div>
                <CardContent className="pt-6">
                  <h3 className="text-2xl mb-3">{role.title}</h3>
                  <p className="text-gray-600">{role.description}</p>
                  <div className="mt-4 flex items-center text-emerald-600">
                    <CheckCircle className="w-5 h-5 ml-2" />
                    <span>صلاحيات مخصصة</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-4">إحصائيات المنصة</h2>
            <p className="text-emerald-100">نفخر بخدمة مراكز التحفيظ في كل مكان</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-2">100+</div>
              <div className="text-emerald-100">مؤسسة</div>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-2">5000+</div>
              <div className="text-emerald-100">طالب</div>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-2">300+</div>
              <div className="text-emerald-100">معلم</div>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-2">100%</div>
              <div className="text-emerald-100">مجاني</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl mb-6">هل أنت جاهز للبدء؟</h2>
          <p className="text-xl text-gray-600 mb-8">
            انضم إلى مئات المؤسسات التي تستخدم منصتنا المجانية لإدارة حلقات التحفيظ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-12 py-6 text-xl"
              onClick={onGetStarted}
            >
              ابدأ مجاناً الآن
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-12 py-6 text-xl"
            >
              طلب انضمام مؤسسة
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* عن المنصة */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="font-bold text-xl block">منصة تحفيظ القرآن</span>
                  <span className="text-sm text-emerald-400">خدمة خيرية مجانية</span>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                نظام احترافي متكامل لإدارة مراكز ومؤسسات تحفيظ القرآن الكريم.
                نسعى لتسهيل رحلة حفظ كتاب الله من خلال توفير أدوات تقنية حديثة ومجانية
                لجميع مراكز التحفيظ.
              </p>
              <div className="flex items-center gap-2 text-emerald-400">
                <Heart className="w-4 h-4 fill-emerald-400" />
                <span className="text-sm">100% مجاني للجميع</span>
              </div>
            </div>
            
            {/* روابط سريعة */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">روابط سريعة</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-gray-300 hover:text-emerald-400 transition flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    المميزات
                  </a>
                </li>
                <li>
                  <a href="#roles" className="text-gray-300 hover:text-emerald-400 transition flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    الأدوار
                  </a>
                </li>
                <li>
                  <a href="#stats" className="text-gray-300 hover:text-emerald-400 transition flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    الإحصائيات
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-gray-300 hover:text-emerald-400 transition flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    تواصل معنا
                  </a>
                </li>
              </ul>
            </div>
            
            {/* الدعم */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">الدعم الفني</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#help" className="text-gray-300 hover:text-emerald-400 transition flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    مركز المساعدة
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-300 hover:text-emerald-400 transition flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    الأسئلة الشائعة
                  </a>
                </li>
                <li>
                  <a href="#terms" className="text-gray-300 hover:text-emerald-400 transition flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    شروط الاستخدام
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="text-gray-300 hover:text-emerald-400 transition flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    سياسة الخصوصية
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* الحد الفاصل */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* معلومات التطوير */}
              <div className="text-center md:text-right">
                <p className="text-gray-400 mb-2">
                  جميع الحقوق محفوظة © 2025 • منصة تحفيظ القرآن الكريم
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">
                      طُوّرت بواسطة 
                      <span className="text-emerald-400 font-semibold mr-1">فِسند للتطوير الرقمي والإنتاج المرئي</span>
                    </p>
                    <p className="text-xs text-gray-500">المهندس محمد معياد</p>
                  </div>
                </div>
              </div>
              
              {/* Badge */}
              <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-600/30 rounded-xl px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-400">خدمة خيرية</p>
                    <p className="text-xs text-gray-400">مجانية 100%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
