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
      // في وضع العرض التوضيحي، استخدم البيانات الوهمية مباشرة
      if (isDemoMode()) {
        console.log('وضع العرض التوضيحي - استخدام المؤسسات الوهمية');
        setOrganizations(mockOrganizations);
        setLoading(false);
        return;
      }

      console.log('جاري جلب المؤسسات من Supabase...');

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('خطأ من Supabase:', error);
        throw error;
      }

      console.log('تم جلب المؤسسات:', data?.length || 0);
      console.log('بيانات المؤسسات:', data);

      setOrganizations(data || []);
    } catch (error: any) {
      console.error('Error fetching organizations:', error?.message || error);
      console.log('فشل الاتصال - استخدام البيانات الوهمية للاختبار');
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

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-12">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl mb-3">اختر المؤسسة</h1>
          <p className="text-xl text-gray-600">اختر المؤسسة التي تريد الدخول إليها للمتابعة</p>
          
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full">
            <Building2 className="w-4 h-4" />
            <span className="font-medium">{organizations.length} مؤسسة متاحة</span>
          </div>
        </div>

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

        {filteredOrganizations.length === 0 ? (
          <Card className="shadow-2xl max-w-2xl mx-auto border-2">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl mb-2">لم نجد مؤسسات</h3>
              <p className="text-gray-600">لا توجد مؤسسات متطابقة مع البحث</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => (
              <Card 
                key={org.id}
                className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-emerald-500"
                onClick={() => onSelectOrg(org)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-right">{org.name}</CardTitle>
                  <CardDescription className="text-right">{org.slug}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 text-right line-clamp-2">
                    {org.description || 'لا توجد وصف'}
                  </p>
                  <div className="space-y-2 text-sm">
                    {org.contact_email && (
                      <div className="text-right">
                        <span className="text-gray-500">البريد الإلكتروني:</span>
                        <p className="font-medium">{org.contact_email}</p>
                      </div>
                    )}
                    {org.contact_phone && (
                      <div className="text-right">
                        <span className="text-gray-500">الهاتف:</span>
                        <p className="font-medium">{org.contact_phone}</p>
                      </div>
                    )}
                    {org.address && (
                      <div className="text-right">
                        <span className="text-gray-500">العنوان:</span>
                        <p className="font-medium">{org.address}</p>
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOrg(org);
                    }}
                  >
                    <span>الدخول</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
