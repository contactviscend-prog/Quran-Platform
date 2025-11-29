import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { BookOpen, CheckCircle, Clock, Award, TrendingUp } from 'lucide-react';
import { supabase, isDemoMode } from '../../lib/supabase';
import { toast } from 'sonner';

interface StudentMemorizationPageProps {
  studentId: string;
  organizationId: string;
}

interface JuzProgress {
  juzNumber: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'reviewing';
}

interface Surah {
  number: number;
  name: string;
  juz: number;
  verses: number;
  memorized: boolean;
}

export function StudentMemorizationPage({ studentId, organizationId }: StudentMemorizationPageProps) {
  const [juzProgress, setJuzProgress] = useState<JuzProgress[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // بيانات السور - في الواقع يجب جلبها من قاعدة بيانات
  const surahs: Surah[] = [
    { number: 1, name: 'الفاتحة', juz: 1, verses: 7, memorized: true },
    { number: 2, name: 'البقرة', juz: 1, verses: 286, memorized: false },
    { number: 3, name: 'آل عمران', juz: 3, verses: 200, memorized: false },
    { number: 4, name: 'النساء', juz: 4, verses: 176, memorized: false },
    { number: 5, name: 'المائدة', juz: 6, verses: 120, memorized: false },
  ];

  useEffect(() => {
    fetchMemorizationProgress();
  }, [studentId, organizationId]);

  const fetchMemorizationProgress = async () => {
    try {
      setLoading(true);

      let juzData: JuzProgress[];

      if (isDemoMode()) {
        // Initialize 30 juz with random progress for demo
        juzData = Array.from({ length: 30 }, (_, i) => {
          const juzNum = i + 1;
          let progress = 0;
          let status: JuzProgress['status'] = 'not_started';

          // For demo, make first 5 juz have some progress
          if (juzNum <= 3) {
            progress = 100;
            status = 'completed';
          } else if (juzNum === 4) {
            progress = 65;
            status = 'in_progress';
          } else if (juzNum === 5) {
            progress = 30;
            status = 'in_progress';
          }

          return {
            juzNumber: juzNum,
            progress,
            status,
          };
        });
      } else {
        // Fetch from database
        const { data: progressData } = await supabase
          .from('student_progress')
          .select('memorization_details, parts_memorized, surahs_completed')
          .eq('student_id', studentId)
          .eq('organization_id', organizationId)
          .single();

        if (progressData?.memorization_details) {
          const memorization = progressData.memorization_details;
          // Build juz progress from memorization details
          juzData = Array.from({ length: 30 }, (_, i) => {
            const juzNum = i + 1;
            const juzData = memorization[`juz_${juzNum}`];

            return {
              juzNumber: juzNum,
              progress: juzData?.progress || 0,
              status: (juzData?.status || 'not_started') as JuzProgress['status'],
            };
          });
        } else {
          // Initialize with empty progress if no data
          juzData = Array.from({ length: 30 }, (_, i) => ({
            juzNumber: i + 1,
            progress: 0,
            status: 'not_started' as const,
          }));
        }
      }

      setJuzProgress(juzData);

      // Calculate total progress
      const total = Math.round(
        juzData.reduce((sum, juz) => sum + juz.progress, 0) / 30
      );
      setTotalProgress(total);
    } catch (error: any) {
      console.error('Error fetching memorization progress:', error);
      if (!isDemoMode()) {
        toast.error('فشل تحميل بيانات الحفظ');
      }
    } finally {
      setLoading(false);
    }
  };

  const getJuzStatusColor = (status: JuzProgress['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'reviewing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getJuzStatusText = (status: JuzProgress['status']) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in_progress':
        return 'جاري الحفظ';
      case 'reviewing':
        return 'مراجعة';
      default:
        return 'لم يبدأ';
    }
  };

  const completedJuz = juzProgress.filter(j => j.status === 'completed').length;
  const inProgressJuz = juzProgress.filter(j => j.status === 'in_progress').length;

  const stats = [
    {
      title: 'إجمالي التقدم',
      value: `${totalProgress}%`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      description: `${completedJuz} أجزاء محفوظة`,
    },
    {
      title: 'الأجزاء المكتملة',
      value: completedJuz.toString(),
      icon: CheckCircle,
      color: 'bg-green-500',
      description: 'من أصل 30 جزء',
    },
    {
      title: 'قيد الحفظ',
      value: inProgressJuz.toString(),
      icon: BookOpen,
      color: 'bg-blue-500',
      description: 'أجزاء حالية',
    },
    {
      title: 'الإنجاز',
      value: `${Math.round((completedJuz / 30) * 100)}%`,
      icon: Award,
      color: 'bg-orange-500',
      description: 'من المصحف الكامل',
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">جاري تحميل بيانات الحفظ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">حفظي</h1>
        <p className="text-gray-600">تابع تقدمك في حفظ القرآن الكريم</p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl">{stat.value}</p>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* التقدم الكلي */}
      <Card>
        <CardHeader>
          <CardTitle>التقدم الإجمالي في الحفظ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">نسبة الإنجاز</span>
              <span className="font-medium">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-4" />
            <p className="text-sm text-gray-500">
              تم حفظ {completedJuz} أجزاء من أصل 30 جزء
            </p>
          </div>
        </CardContent>
      </Card>

      {/* تقدم الأجزاء */}
      <Card>
        <CardHeader>
          <CardTitle>تقدم الأجزاء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {juzProgress.map((juz) => (
              <div
                key={juz.juzNumber}
                className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all hover:shadow-md ${getJuzStatusColor(
                  juz.status
                )}`}
              >
                <p className="font-semibold mb-2">الجزء {juz.juzNumber}</p>
                <Progress value={juz.progress} className="h-2 mb-2" />
                <p className="text-xs">{juz.progress}%</p>
                <Badge
                  className={`mt-2 text-xs ${getJuzStatusColor(juz.status)}`}
                  variant="outline"
                >
                  {getJuzStatusText(juz.status)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* السور المحفوظة */}
      <Card>
        <CardHeader>
          <CardTitle>السور المحفوظة مؤخراً</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {surahs.slice(0, 5).map((surah) => (
              <div
                key={surah.number}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-700 font-semibold">{surah.number}</span>
                  </div>
                  <div>
                    <p className="font-medium">{surah.name}</p>
                    <p className="text-sm text-gray-500">{surah.verses} آية • الجزء {surah.juz}</p>
                  </div>
                </div>
                {surah.memorized ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 ml-1" />
                    محفوظة
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 ml-1" />
                    قيد الحفظ
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* نصائح وتشجيع */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 mb-2">استمر في التقدم الرائع!</h3>
              <p className="text-emerald-800 text-sm mb-3">
                لقد أحرزت تقدماً ممتازاً في حفظ القرآن الكريم. حافظ على المراجعة المستمرة لتثبيت حفظك.
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  ابدأ المراجعة
                </Button>
                <Button size="sm" variant="outline">
                  عرض خطة الحفظ
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
