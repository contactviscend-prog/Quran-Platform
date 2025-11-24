import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Users, TrendingUp, Calendar, Award, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

interface ParentChildrenPageProps {
  parentId: string;
  organizationId: string;
}

interface Child {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  teacher: string;
  circle: string;
  progress: number;
  attendance: number;
  lastReview: string;
  rating: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول';
  totalParts: number;
  currentSurah: string;
  nextSession: string;
}

export function ParentChildrenPage({ parentId, organizationId }: ParentChildrenPageProps) {
  // بيانات وهمية - في الواقع يجب جلبها من قاعدة البيانات
  const children: Child[] = [
    {
      id: '1',
      name: 'فاطمة عبدالله',
      age: 12,
      gender: 'female',
      teacher: 'أحمد المعلم',
      circle: 'حلقة الفجر',
      progress: 85,
      attendance: 18,
      lastReview: 'اليوم',
      rating: 'ممتاز',
      totalParts: 5,
      currentSurah: 'سورة البقرة',
      nextSession: '2024-01-20',
    },
    {
      id: '2',
      name: 'محمد عبدالله',
      age: 10,
      gender: 'male',
      teacher: 'عمر الحافظ',
      circle: 'حلقة المغرب',
      progress: 65,
      attendance: 16,
      lastReview: 'أمس',
      rating: 'جيد',
      totalParts: 3,
      currentSurah: 'سورة آل عمران',
      nextSession: '2024-01-21',
    },
    {
      id: '3',
      name: 'عائشة عبدالله',
      age: 8,
      gender: 'female',
      teacher: 'فاطمة المعلمة',
      circle: 'حلقة العصر',
      progress: 45,
      attendance: 19,
      lastReview: 'منذ يومين',
      rating: 'جيد جداً',
      totalParts: 2,
      currentSurah: 'سورة النساء',
      nextSession: '2024-01-20',
    },
  ];

  const [selectedChild, setSelectedChild] = useState<string>(children[0]?.id || '');

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'ممتاز':
        return 'bg-green-100 text-green-800';
      case 'جيد جداً':
        return 'bg-blue-100 text-blue-800';
      case 'جيد':
        return 'bg-cyan-100 text-cyan-800';
      case 'مقبول':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalChildren = children.length;
  const averageProgress = Math.round(
    children.reduce((sum, child) => sum + child.progress, 0) / totalChildren
  );
  const averageAttendance = Math.round(
    children.reduce((sum, child) => sum + child.attendance, 0) / totalChildren
  );
  const totalAchievements = children.reduce((sum, child) => sum + child.totalParts, 0);

  const stats = [
    {
      title: 'عدد الأبناء',
      value: totalChildren.toString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'متوسط التقدم',
      value: `${averageProgress}%`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
    {
      title: 'متوسط الحضور',
      value: `${averageAttendance}/20`,
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      title: 'إجمالي الأجزاء',
      value: totalAchievements.toString(),
      icon: Award,
      color: 'bg-orange-500',
    },
  ];

  const currentChild = children.find((c) => c.id === selectedChild);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">أبنائي</h1>
        <p className="text-gray-600">متابعة تقدم الأبناء في حفظ القرآن الكريم</p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs للأبناء */}
      <Card>
        <CardHeader>
          <CardTitle>اختر الطفل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {children.map((child) => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? 'default' : 'outline'}
                className={`h-auto p-4 justify-start ${
                  selectedChild === child.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                }`}
                onClick={() => setSelectedChild(child.id)}
              >
                <div className="text-right w-full">
                  <p className="font-semibold">{child.name}</p>
                  <p className="text-xs opacity-80">{child.age} سنة • {child.circle}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* تفاصيل الطفل المختار */}
      {currentChild && (
        <div className="space-y-4">
          {/* البطاقة الرئيسية */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-700 text-2xl">{currentChild.name.charAt(0)}</span>
                  </div>
                  <div>
                    <CardTitle>{currentChild.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {currentChild.age} سنة • {currentChild.circle}
                    </p>
                  </div>
                </div>
                <Badge className={getRatingColor(currentChild.rating)}>{currentChild.rating}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* التقدم في الحفظ */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">التقدم في الحفظ</span>
                      <span className="font-medium">{currentChild.progress}%</span>
                    </div>
                    <Progress value={currentChild.progress} className="h-3" />
                    <p className="text-xs text-gray-500 mt-2">
                      {currentChild.totalParts} أجزاء محفوظة
                    </p>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">الحضور</span>
                    <span className="font-semibold">{currentChild.attendance}/20 يوم</span>
                  </div>
                </div>

                {/* معلومات إضافية */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">المعلم</span>
                    <span className="font-medium">{currentChild.teacher}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">آخر مراجعة</span>
                    <span className="font-medium">{currentChild.lastReview}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* التقدم التفصيلي */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BookOpen className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-semibold">{currentChild.currentSurah}</p>
                  <p className="text-sm text-gray-600">السورة الحالية</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-semibold">{currentChild.totalParts}</p>
                  <p className="text-sm text-gray-600">أجزاء محفوظة</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                  <p className="text-sm font-semibold">
                    {new Date(currentChild.nextSession).toLocaleDateString('ar-SA')}
                  </p>
                  <p className="text-sm text-gray-600">الجلسة القادمة</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* آخر الإنجازات */}
          <Card>
            <CardHeader>
              <CardTitle>آخر الإنجازات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">إتمام حفظ الجزء الأخير</p>
                    <p className="text-sm text-gray-600">
                      أحسن {currentChild.name} حفظ جزء جديد من القرآن الكريم
                    </p>
                    <p className="text-xs text-gray-500 mt-1">منذ أسبوع</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">تقييم ممتاز في المراجعة</p>
                    <p className="text-sm text-gray-600">
                      حصل على تقييم ممتاز في مراجعة السور المحفوظة
                    </p>
                    <p className="text-xs text-gray-500 mt-1">منذ 3 أيام</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">تحسن ملحوظ في الأداء</p>
                    <p className="text-sm text-gray-600">
                      تحسن كبير في التلاوة والحفظ خلال الشهر الماضي
                    </p>
                    <p className="text-xs text-gray-500 mt-1">منذ أسبوعين</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* تنبيهات وملاحظات */}
          {currentChild.attendance < 15 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">تنبيه: نسبة الحضور</h3>
                    <p className="text-sm text-yellow-800">
                      نسبة حضور {currentChild.name} أقل من المعدل المطلوب. يرجى متابعة الأمر مع
                      المعلم.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
