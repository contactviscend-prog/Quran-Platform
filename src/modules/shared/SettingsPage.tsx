import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Profile } from '../../lib/supabase';
import { Save, User, Bell, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsPageProps {
  user: Profile;
}

export function SettingsPage({ user }: SettingsPageProps) {
  const [profileData, setProfileData] = useState({
    full_name: user.full_name,
    phone: user.phone || '',
    email: user.id, // في الواقع يجب جلب البريد من Auth
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReport: true,
    dailyReminder: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = () => {
    toast.success('تم حفظ الملف الشخصي بنجاح');
  };

  const handleSaveNotifications = () => {
    toast.success('تم حفظ إعدادات الإشعارات بنجاح');
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    toast.success('تم تغيير كلمة المرور بنجاح');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">الإعدادات</h1>
        <p className="text-gray-600">قم بإدارة حسابك وتفضيلاتك</p>
      </div>

      <Tabs defaultValue="profile" dir="rtl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="preferences">التفضيلات</TabsTrigger>
        </TabsList>

        {/* الملف الشخصي */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الملف الشخصي</CardTitle>
              <CardDescription>قم بتحديث معلوماتك الشخصية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl">
                    {user.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    تغيير الصورة
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG أو GIF (حد أقصى 2MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">الاسم الكامل</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الجوال</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    dir="ltr"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-50"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500">لا يمكن تغيير البريد الإلكتروني</p>
                </div>

                <div className="space-y-2">
                  <Label>الجنس</Label>
                  <Input value={user.gender === 'male' ? 'ذكر' : 'أنثى'} disabled className="bg-gray-50" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التغيير��ت
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الإشعارات */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>اختر كيف تريد تلقي الإشعارات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إشعارات البريد الإلكتروني</Label>
                    <p className="text-sm text-gray-500">استقبال الإشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الإشعارات الفورية</Label>
                    <p className="text-sm text-gray-500">استقبال الإشعارات الفورية في المتصفح</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الرسائل النصية</Label>
                    <p className="text-sm text-gray-500">استقبال الإشعارات عبر الرسائل النصية</p>
                  </div>
                  <Switch
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, smsNotifications: checked })
                    }
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium mb-4">التقارير الدورية</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>التقرير الأسبوعي</Label>
                        <p className="text-sm text-gray-500">استلام ملخص أسبوعي للأنشطة</p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReport}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, weeklyReport: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>التذكير اليومي</Label>
                        <p className="text-sm text-gray-500">تذكير يومي بالمهام والمراجعات</p>
                      </div>
                      <Switch
                        checked={notifications.dailyReminder}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, dailyReminder: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ الإعدادات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الأمان */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>الأمان وكلمة المرور</CardTitle>
              <CardDescription>قم بتحديث كلمة المرور الخاصة بك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">كلمة المرور الحالية</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">كلمة المرور الجديدة</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">يجب أن تحتوي على 8 أحرف على الأقل</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleChangePassword} className="bg-emerald-600 hover:bg-emerald-700">
                  <Lock className="w-4 h-4 ml-2" />
                  تغيير كلمة المرور
                </Button>
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="text-sm font-medium mb-4">الجلسات النشطة</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Chrome على Windows</p>
                      <p className="text-xs text-gray-500">الجلسة الحالية • الرياض، السعودية</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">نشطة</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التفضيلات */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>التفضيلات</CardTitle>
              <CardDescription>قم بتخصيص تجربتك في المنصة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>اللغة</Label>
                  <select className="w-full px-3 py-2 border rounded-md bg-white">
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>المنطقة الزمنية</Label>
                  <select className="w-full px-3 py-2 border rounded-md bg-white">
                    <option value="Asia/Riyadh">توقيت الرياض (GMT+3)</option>
                    <option value="Asia/Dubai">توقيت دبي (GMT+4)</option>
                    <option value="Africa/Cairo">توقيت القاهرة (GMT+2)</option>
                  </select>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium mb-4">تفضيلات العرض</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>الوضع الليلي</Label>
                        <p className="text-sm text-gray-500">تفعيل الوضع الداكن للمنصة</p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>الوضع المدمج</Label>
                        <p className="text-sm text-gray-500">عرض أكثر كثافة للمعلومات</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التفضيلات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
