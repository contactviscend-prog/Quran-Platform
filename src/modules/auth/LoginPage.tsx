import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { isDemoMode } from '../../lib/supabase';
import type { Organization } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { BookOpen, Building2, ArrowRight, Info, UserPlus } from 'lucide-react';

interface LoginPageProps {
  organization: Organization;
  onBack: () => void;
  onRegister: () => void;
}

export function LoginPage({ organization, onBack, onRegister }: LoginPageProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isDemo = isDemoMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Pass the organization slug to validate user belongs to this organization
      await signIn(email, password, organization.slug);
    } catch (error: any) {
      // Check if it's an organization mismatch error
      if (error.message.includes('ينتمي لمؤسسة أخرى')) {
        setError(error.message);
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'مدير', email: 'admin@demo.com', icon: '👑' },
    { role: 'مشرف', email: 'supervisor@demo.com', icon: '👨‍💼' },
    { role: 'معلم', email: 'teacher@demo.com', icon: '👨‍🏫' },
    { role: 'طالب', email: 'student@demo.com', icon: '👨‍🎓' },
    { role: 'ولي أمر', email: 'parent@demo.com', icon: '👨‍👩‍👦' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={onBack}
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى اختيار المؤسسة
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl">تسجيل الدخول</CardTitle>
              <div className="mt-3 flex items-center justify-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{organization.name}</span>
              </div>
            </div>
            <CardDescription>ادخل بياناتك للوصول إلى حسابك</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Demo Mode Info */}
            {isDemo && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900 font-medium mb-2">حسابات تجريبية متاحة:</p>
                    <div className="space-y-1.5">
                      {demoAccounts.map((account) => (
                        <button
                          key={account.email}
                          type="button"
                          onClick={() => {
                            setEmail(account.email);
                            setPassword('demo123');
                          }}
                          className="w-full text-right text-xs bg-white hover:bg-blue-50 border border-blue-200 rounded px-3 py-2 transition-colors flex items-center justify-between"
                        >
                          <span className="text-blue-700">
                            <span className="font-medium">{account.role}:</span> {account.email}
                          </span>
                          <span>{account.icon}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-blue-700 mt-2">كلمة المرور لجميع الحسابات: <code className="bg-blue-100 px-1.5 py-0.5 rounded">demo123</code></p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir="ltr"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  dir="ltr"
                  className="text-right"
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-600 mb-3">مستخدم جديد؟</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={onRegister}
              >
                <UserPlus className="w-4 h-4 ml-2" />
                تقديم طلب انضمام
              </Button>
            </div>

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
