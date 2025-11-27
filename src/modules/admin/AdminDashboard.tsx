import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Users, BookOpen, GraduationCap, ClipboardList, Plus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDemoMode, Profile, Organization, Circle, UserRole, getRoleLabel } from '../../lib/supabase';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { CirclesManagement } from './CirclesManagement';
import { JoinRequestsManagement } from './JoinRequestsManagement';
import { UsersManagement } from './UsersManagement';
import { RecitationsPage } from '../shared/RecitationsPage';
import { ReportsPage } from '../shared/ReportsPage';
import { SettingsPage } from '../shared/SettingsPage';

interface AdminDashboardProps {
  user: Profile;
  organization: Organization;
}

export function AdminDashboard({ user, organization }: AdminDashboardProps) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [currentSection, setCurrentSection] = useState('overview');
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCircles: 0,
    totalTeachers: 0,
    totalRecitations: 0,
    todayAttendance: 0,
    weeklyRecitations: 0,
  });
  const [isAddCircleDialogOpen, setIsAddCircleDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCircle, setNewCircle] = useState({
    name: '',
    teacher_id: '',
    level: 'beginner',
    description: '',
    max_students: 20,
  });
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'student' as UserRole,
    gender: '' as 'male' | 'female' | '',
  });
  const [teachers, setTeachers] = useState<Profile[]>([]);

  useEffect(() => {
    fetchData();
  }, [organization.id]);

  const fetchData = async () => {
    try {
      // Demo mode - use mock data
      if (isDemoMode()) {
        setCircles([
          {
            id: '1',
            organization_id: organization.id,
            name: 'حلقة الفجر',
            teacher_id: 'teacher1',
            teacher: { id: 'teacher1', full_name: 'أحمد المعلم' },
            level: 'beginner',
            description: 'حلقة للمبتدئين',
            max_students: 20,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ] as any);

        setTeachers([
          {
            id: 'teacher1',
            organization_id: organization.id,
            full_name: 'أحمد المعلم',
            phone: '0501234567',
            gender: 'male',
            role: 'teacher',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ] as any);

        setStats({
          totalStudents: 156,
          activeCircles: 8,
          totalTeachers: 6,
          totalRecitations: 1250,
          todayAttendance: 120,
          weeklyRecitations: 280,
        });

        setLoading(false);
        return;
      }

      // Real Supabase fetch (سيتم تفعيله عند الربط الفعلي)

    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (!isDemoMode()) {
        toast.error('فشل تحميل البيانات');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCircle = async () => {
    if (!newCircle.name || !newCircle.teacher_id) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    toast.success('تم إضافة الحلقة بنجاح (Demo Mode)');
    setNewCircle({ name: '', teacher_id: '', level: 'beginner', description: '', max_students: 20 });
    setIsAddCircleDialogOpen(false);
    fetchData();
  };

  const handleAddUser = async () => {
    if (!newUser.full_name || !newUser.email || !newUser.role || !newUser.gender) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    toast.success(`تم إضافة ${getRoleLabel(newUser.role)} بنجاح (Demo Mode)`);
    setNewUser({ full_name: '', email: '', phone: '', role: 'student', gender: '' });
    setIsAddUserDialogOpen(false);
    fetchData();
  };

  const statsData = [
    { title: 'إجمالي الطلاب', value: stats.totalStudents.toString(), icon: Users, color: 'bg-blue-500' },
    { title: 'الحلقات النشطة', value: stats.activeCircles.toString(), icon: BookOpen, color: 'bg-emerald-500' },
    { title: 'المعلمون', value: stats.totalTeachers.toString(), icon: GraduationCap, color: 'bg-purple-500' },
    { title: 'إجمالي التسميع', value: stats.totalRecitations.toString(), icon: ClipboardList, color: 'bg-orange-500' },
  ];

  const renderContent = () => {
    switch (currentSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl mb-2">لوحة تحكم المدير</h1>
              <p className="text-gray-600">مرح��اً {user.full_name}، إليك نظرة عامة على المنصة</p>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map((stat) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>إجراءات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <UserPlus className="w-5 h-5 ml-2" />
                        إضافة مستخدم جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl" className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                        <DialogDescription>
                          أضف مستخدم جديد مباشرة إلى المنصة
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="user-role">نوع المستخدم *</Label>
                          <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}>
                            <SelectTrigger id="user-role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="supervisor">مشرف</SelectItem>
                              <SelectItem value="teacher">معلم</SelectItem>
                              <SelectItem value="student">طالب</SelectItem>
                              <SelectItem value="parent">ولي أمر</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="user-name">الاسم الكامل *</Label>
                            <Input
                              id="user-name"
                              placeholder="محمد أحمد"
                              value={newUser.full_name}
                              onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="user-gender">الجنس *</Label>
                            <Select value={newUser.gender} onValueChange={(value) => setNewUser({ ...newUser, gender: value as 'male' | 'female' })}>
                              <SelectTrigger id="user-gender">
                                <SelectValue placeholder="اختر الجنس" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">ذكر</SelectItem>
                                <SelectItem value="female">أنثى</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="user-email">البريد الإلكتروني *</Label>
                            <Input
                              id="user-email"
                              type="email"
                              placeholder="example@email.com"
                              value={newUser.email}
                              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                              dir="ltr"
                              className="text-right"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="user-phone">رقم الجوال</Label>
                            <Input
                              id="user-phone"
                              type="tel"
                              placeholder="05xxxxxxxx"
                              value={newUser.phone}
                              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                              dir="ltr"
                              className="text-right"
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddUser} className="w-full bg-emerald-600 hover:bg-emerald-700">
                          <UserPlus className="w-4 h-4 ml-2" />
                          إضافة المستخدم
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isAddCircleDialogOpen} onOpenChange={setIsAddCircleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="w-5 h-5 ml-2" />
                        إضافة حلقة جديدة
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl">
                      <DialogHeader>
                        <DialogTitle>إضافة حلقة جديدة</DialogTitle>
                        <DialogDescription>
                          أضف حلقة تحفيظ جديدة للمنصة
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="circle-name">اسم الحلقة *</Label>
                          <Input
                            id="circle-name"
                            placeholder="مثال: حلقة الفجر"
                            value={newCircle.name}
                            onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teacher">المعلم *</Label>
                          <Select value={newCircle.teacher_id} onValueChange={(value) => setNewCircle({ ...newCircle, teacher_id: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المعلم" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {teacher.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="level">المستوى *</Label>
                          <Select value={newCircle.level} onValueChange={(value) => setNewCircle({ ...newCircle, level: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">مبتدئ</SelectItem>
                              <SelectItem value="intermediate">متوسط</SelectItem>
                              <SelectItem value="advanced">متقدم</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddCircle} className="w-full bg-emerald-600 hover:bg-emerald-700">
                          إضافة الحلقة
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>آخر التحديثات</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">لا توجد تحديثات حالياً</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'users':
        return <UsersManagement />;

      case 'circles':
        return <CirclesManagement organizationId={organization.id} />;

      case 'recitations':
        return <RecitationsPage organizationId={organization.id} userRole="admin" userId={user.id} />;

      case 'reports':
        return <ReportsPage organizationId={organization.id} userRole="admin" userId={user.id} />;

      case 'parent-link':
        return <JoinRequestsManagement organizationId={organization.id} userId={user.id} />;

      case 'settings':
        return <SettingsPage user={user} />;

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      user={user}
      organization={organization}
      role="admin"
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
