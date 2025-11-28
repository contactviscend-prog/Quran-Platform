import { useState, useEffect } from 'react';
import { Building2, BookOpen, ArrowRight, Search, Plus } from 'lucide-react';
import { supabase, Organization, isDemoMode } from '../../lib/supabase';
import { mockOrganizations } from '../../lib/mockData';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

interface OrganizationSelectorProps {
  onSelectOrg: (org: Organization) => void;
  onRequestNew?: () => void;
}

export function OrganizationSelector({ onSelectOrg, onRequestNew }: OrganizationSelectorProps) {
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
      <div className="max-w-6xl mx-auto py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-teal-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 text-gray-900">اختر المؤسسة</h1>
          <p className="text-gray-600 mb-4">اختر المؤسسة التي تريد الدخول إليها للمتابعة</p>

          <div className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm">
            <Building2 className="w-4 h-4" />
            <span>{organizations.length} مؤسسة متاحة</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="ابحث عن المؤسسة بالاسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-12 text-base border border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg shadow-sm"
            />
          </div>
        </div>

        {/* Organizations Grid */}
        {filteredOrganizations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">لم نجد مؤسسات</h3>
            <p className="text-gray-600">لا توجد مؤسسات متطابقة مع البحث</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredOrganizations.map((org) => (
              <Card
                key={org.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-teal-300 overflow-hidden"
                onClick={() => onSelectOrg(org)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                    {org.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {org.description || 'مؤسسة متخصصة'}
                  </p>

                  {/* Status Badge - showing organization contact info or status */}
                  {org.contact_email && (
                    <Badge variant="outline" className="mb-4 border-teal-200 bg-teal-50 text-teal-700">
                      {org.contact_email}
                    </Badge>
                  )}

                  {/* Button */}
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOrg(org);
                    }}
                  >
                    <span>الدخول إلى المنصة</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Don't find your organization section */}
        <div className="max-w-2xl mx-auto bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">لا تجد مؤسستك؟</h3>
          <p className="text-gray-600 mb-6 text-sm">
            إذا كنت تمثل مؤسسة متخصصة في تحفيظ القرآن، يرجى التواصل مع منصتنا الجديدة. تواصل معنا وتمكن من إضافة مؤسستك
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            onClick={onRequestNew}
          >
            <Plus className="ml-2 w-4 h-4" />
            <span>طلب انضمام مؤسسة جديدة</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
