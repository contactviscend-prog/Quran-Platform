import { useState, useEffect } from 'react';
import { Building2, BookOpen, ArrowRight, Search, Users, TrendingUp } from 'lucide-react';
import { supabase, Organization, isDemoMode } from '../../lib/supabase';
import { mockOrganizations } from '../../lib/mockData';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

interface OrganizationSelectorProps {
  onSelectOrg: (org: Organization) => void;
}

export function OrganizationSelector({ onSelectOrg }: OrganizationSelectorProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      console.log('🔍 جاري جلب المؤسسات من Supabase...');

      // Fetch from Supabase (no demo mode check - use real data)
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ خطأ ��ن Supabase:', error);
        throw error;
      }

      console.log('✅ تم جلب المؤسسات:', data?.length || 0);
      console.log('📋 بيانات المؤسسات:', data);

      setOrganizations(data || []);
    } catch (error: any) {
      console.error('Error fetching organizations:', error?.message || error);
      console.log('⚠️ فشل الاتصال - استخدام البيانات الوهمية للاختبار');
      // Fallback to mock data only if real data fails
      setOrganizations(mockOrganizations);
      toast.error('فشل جلب البيانات: ' + (error?.message || 'خطأ غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المؤسسات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-12">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl mb-3">اختر المؤسسة</h1>
          <p className="text-xl text-gray-600">اختر المؤسسة التي تريد الدخول إليها للمتابعة</p>
          
          {/* Badge عدد المؤسسات */}
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full">
            <Building2 className="w-4 h-4" />
            <span className="font-medium">{organizations.length} مؤسسة متاحة</span>
          </div>
        </div>

        {/* شريط البحث */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="ابحث عن المؤسسة بالاسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-14 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm"
            />
          </div>
        </div>

        {organizations.length === 0 ? (
          <Card className="shadow-2xl max-w-2xl mx-auto border-2">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl mb-3">لا توجد مؤسسات متاحة حالياً</h3>
              <p className="text-gray-600 mb-2">يبدو أنه لا توجد مؤسسات نشطة في الوقت الحالي</p>
              <p className="text-sm text-gray-500">يرجى التواصل مع الدعم الفني لمزيد من المعلومات</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations
                .filter((org) =>
                  org.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((org) => (
                  <Card
                    key={org.id}
                    className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-emerald-500 group relative overflow-hidden"
                    onClick={() => onSelectOrg(org)}
                  >
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <CardHeader className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                        {org.logo ? (
                          <img
                            src={org.logo}
                            alt={org.name}
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                        ) : (
                          <Building2 className="w-12 h-12 text-emerald-600" />
                        )}
                      </div>
                      <CardTitle className="text-center text-2xl">{org.name}</CardTitle>
                      {org.description && (
                        <CardDescription className="text-center mt-2 line-clamp-2">
                          {org.description}
                        </CardDescription>
                      )}
                      
                      {/* معلومات إضافية */}
                      <div className="mt-4 flex items-center justify-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>نشط</span>
                        </div>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          متاح
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="text-center relative">
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-12 text-lg shadow-md group-hover:shadow-lg transition-shadow">
                        <ArrowRight className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                        الدخول إلى المنصة
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* رسالة عدم إيجاد المؤسسة */}
            {organizations.filter((org) =>
              org.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <Card className="max-w-2xl mx-auto bg-gray-50 border-2 mt-8">
                <CardContent className="pt-8 pb-8 text-center">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl mb-2">لم يتم العثور على نتائج</h3>
                  <p className="text-gray-600">لا توجد مؤسسة تطابق بحثك</p>
                </CardContent>
              </Card>
            )}

            {/* بطاقة طلب انضمام */}
            <div className="mt-16 text-center">
              <Card className="max-w-3xl mx-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-xl">
                <CardContent className="pt-10 pb-10">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl mb-3">لا تجد مؤسستك؟</h3>
                      <p className="text-lg text-gray-700 mb-2">نحن هنا لمساعدتك</p>
                      <p className="text-gray-600 mb-6 max-w-xl">
                        إذا كنت تمثل مؤسسة تحفيظ قرآن وترغب في الانضمام إلى منصتنا المجانية،
                        تواصل معنا وسنكون سعداء بإضافة مؤسستك
                      </p>
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 h-14 text-lg shadow-lg"
                        onClick={() => window.location.href = '/support'}
                      >
                        <TrendingUp className="w-5 h-5 ml-2" />
                        طلب انضمام مؤسسة جديدة
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* تذييل محسّن */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-gray-900">فِسند للتطوير الرقمي</span>
            </div>
            <p className="text-gray-600">
              نظام احترافي لإدارة مراكز تحفيظ القرآن الكريم
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 pt-2">
              <span>المهندس محمد معياد</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>خدمة خيرية مجانية</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
