import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Users, BookOpen, GraduationCap, ClipboardList, Plus, UserPlus, TrendingUp, AlertCircle, CheckCircle, Activity, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDemoMode, Profile, Organization, UserRole, getRoleLabel, getStatusLabel } from '../../lib/supabase';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { CirclesManagement } from './CirclesManagement';
import { EnhancedUsersManagement } from './EnhancedUsersManagement';
import { EnhancedRecitationPage } from '../shared/EnhancedRecitationPage';
import { ReportsPage } from '../shared/ReportsPage';
import { ParentStudentLink } from '../parent/ParentStudentLink';
import { SettingsPage } from '../shared/SettingsPage';

interface AdminDashboardProps {
  user: Profile;
  organization: Organization;
}

interface DashboardStats {
  totalStudents: number;
  activeCircles: number;
  totalTeachers: number;
  totalRecitations: number;
  todayAttendance: number;
  weeklyRecitations: number;
  pendingRequests: number;
  activeUsers: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'circle' | 'attendance' | 'recitation';
  action: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'error';
}

export function AdminDashboard({ user, organization }: AdminDashboardProps) {
  const [currentSection, setCurrentSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeCircles: 0,
    totalTeachers: 0,
    totalRecitations: 0,
    todayAttendance: 0,
    weeklyRecitations: 0,
    pendingRequests: 0,
    activeUsers: 0,
  });
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [recentCircles, setRecentCircles] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddCircleDialogOpen, setIsAddCircleDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'student' as UserRole,
    gender: '' as 'male' | 'female' | '',
  });
  const [newCircle, setNewCircle] = useState({
    name: '',
    teacher_id: '',
    level: 'beginner',
    description: '',
    max_students: 20,
  });

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [organization.id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      if (isDemoMode()) {
        // Mock data for demo mode
        setStats({
          totalStudents: 156,
          activeCircles: 8,
          totalTeachers: 6,
          totalRecitations: 1250,
          todayAttendance: 120,
          weeklyRecitations: 280,
          pendingRequests: 5,
          activeUsers: 162,
        });

        setRecentUsers([
          {
            id: 'user1',
            organization_id: organization.id,
            full_name: 'محمد أحمد',
            email: 'mohammad@example.com',
            phone: '0501234567',
            gender: 'male',
            role: 'student',
            status: 'active',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'user2',
            organization_id: organization.id,
            full_name: 'فاطمة علي',
            email: 'fatima@example.com',
            phone: '0559876543',
            gender: 'female',
            role: 'student',
            status: 'active',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'user3',
            organization_id: organization.id,
            full_name: 'سارة محمود',
            email: 'sarah@example.com',
            phone: '0551234567',
            gender: 'female',
            role: 'teacher',
            status: 'active',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
        ] as any);

        setRecentCircles([
          {
            id: 'circle1',
            organization_id: organization.id,
            name: 'حلقة الفجر',
            teacher_id: 'user3',
            teacher: { id: 'user3', full_name: 'سارة محمود' },
            level: 'beginner',
            description: 'حلقة للمبتدئين في تحفيظ القرآن',
            max_students: 20,
            is_active: true,
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'circle2',
            organization_id: organization.id,
            name: 'حلقة المغرب المتقدمة',
            teacher_id: 'user3',
            teacher: { id: 'user3', full_name: 'سارة محمود' },
            level: 'advanced',
            description: 'حلقة متقدمة للمراجعة والتثبيت',
            max_students: 15,
            is_active: true,
            created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        setRecentActivities([
          {
            id: '1',
            type: 'user',
            action: 'تسجيل مستخدم جديد',
            description: 'انضم الطالب فاطمة علي إلى المنصة',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            status: 'success',
          },
          {
            id: '2',
            type: 'attendance',
            action: 'حضور',
            description: 'حضر 120 طالب في حلقات اليوم',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'success',
          },
          {
            id: '3',
            type: 'recitation',
            action: 'تسميع',
            description: 'تم تسجيل 15 جلسة تسميع اليوم',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            status: 'success',
          },
          {
            id: '4',
            type: 'circle',
            action: 'حلقة جديدة',
            description: 'تم إنشاء حلقة "النور للمبتدئين"',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            status: 'success',
          },
        ]);

        setTeachers([
          {
            id: 'user3',
            organization_id: organization.id,
            full_name: 'سارة محمود',
            role: 'teacher',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any,
        ]);

        setLoading(false);
        return;
      }

      // Fetch statistics
      const [
        studentsRes,
        teachersRes,
        circlesRes,
        recitationsRes,
        attendanceRes,
        requestsRes,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization.id)
          .eq('role', 'student')
          .eq('status', 'active'),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization.id)
          .eq('role', 'teacher')
          .eq('status', 'active'),
        supabase
          .from('circles')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization.id)
          .eq('is_active', true),
        supabase
          .from('recitations')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization.id),
        supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization.id)
          .eq('date', new Date().toISOString().split('T')[0]),
        supabase
          .from('join_requests')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization.id)
          .eq('status', 'pending'),
      ]);

      // Fetch weekly recitations
      const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));
      const { count: weeklyCount } = await supabase
        .from('recitations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Fetch all active users
      const { count: activeUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('status', 'active');

      // Fetch recent users
      const { data: recentUsersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent circles
      const { data: recentCirclesData } = await supabase
        .from('circles')
        .select(`
          *,
          teacher:profiles!circles_teacher_id_fkey(id, full_name)
        `)
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch teachers
      const { data: teachersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('role', 'teacher')
        .eq('status', 'active');

      setStats({
        totalStudents: studentsRes.count || 0,
        activeCircles: circlesRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalRecitations: recitationsRes.count || 0,
        todayAttendance: attendanceRes.count || 0,
        weeklyRecitations: weeklyCount || 0,
        pendingRequests: requestsRes.count || 0,
        activeUsers: activeUsersCount || 0,
      });

      if (recentUsersData) setRecentUsers(recentUsersData);
      if (recentCirclesData) setRecentCircles(recentCirclesData);
      if (teachersData) setTeachers(teachersData);

      // Generate recent activities from data
      const activities: RecentActivity[] = [];
      if (recentUsersData && recentUsersData.length > 0) {
        recentUsersData.slice(0, 2).forEach((userData) => {
          activities.push({
            id: `user-${userData.id}`,
            type: 'user',
            action: `مستخدم جديد - ${getRoleLabel(userData.role)}`,
            description: userData.full_name,
            timestamp: userData.created_at,
            status: 'success',
          });
        });
      }
      if (attendanceRes.count && attendanceRes.count > 0) {
        activities.push({
          id: 'attendance-today',
          type: 'attendance',
          action: 'حضور اليوم',
          description: `${attendanceRes.count} طالب حاضر`,
          timestamp: new Date().toISOString(),
          status: 'success',
        });
      }
      setRecentActivities(activities);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      if (!isDemoMode()) {
        toast.error('فشل تحميل بيانات لوحة التحكم');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.full_name || !newUser.email || !newUser.role || !newUser.gender) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      if (isDemoMode()) {
        toast.success(`تم إضافة ${getRoleLabel(newUser.role)} بنجاح (Demo Mode)`);
        setNewUser({ full_name: '', email: '', phone: '', role: 'student', gender: '' });
        setIsAddUserDialogOpen(false);
        fetchAllData();
        return;
      }

      const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: newUser.full_name,
          role: newUser.role,
          organization_id: organization.id,
        },
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          organization_id: organization.id,
          full_name: newUser.full_name,
          email: newUser.email,
          phone: newUser.phone,
          gender: newUser.gender,
          role: newUser.role,
          status: 'active',
        });

      if (profileError) throw profileError;

      toast.success(`تم إضافة ${getRoleLabel(newUser.role)} بنجاح`);
      setNewUser({ full_name: '', email: '', phone: '', role: 'student', gender: '' });
      setIsAddUserDialogOpen(false);
      fetchAllData();
    } catch (error: any) {
      console.error('Error adding user:', error);
      if (!isDemoMode()) {
        toast.error('فشل إضافة المستخدم');
      }
    }
  };

  const handleAddCircle = async () => {
    if (!newCircle.name || !newCircle.teacher_id) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      if (isDemoMode()) {
        toast.success('تم إضافة الحلقة بنجاح (Demo Mode)');
        setNewCircle({ name: '', teacher_id: '', level: 'beginner', description: '', max_students: 20 });
        setIsAddCircleDialogOpen(false);
        fetchAllData();
        return;
      }

      const { error } = await supabase
        .from('circles')
        .insert({
          organization_id: organization.id,
          name: newCircle.name,
          teacher_id: newCircle.teacher_id,
          level: newCircle.level,
          description: newCircle.description,
          max_students: newCircle.max_students,
          is_active: true,
        });

      if (error) throw error;

      toast.success('تم إضافة الحلقة بنجاح');
      setNewCircle({ name: '', teacher_id: '', level: 'beginner', description: '', max_students: 20 });
      setIsAddCircleDialogOpen(false);
      fetchAllData();
    } catch (error: any) {
      console.error('Error adding circle:', error);
      if (!isDemoMode()) {
        toast.error('فشل إضافة الحلقة');
      }
    }
  };

  const statsCards = [
    { title: 'إجمالي الطلاب', value: stats.totalStudents, icon: Users, color: 'bg-blue-500', trend: '+5%' },
    { title: 'الحلقات النشطة', value: stats.activeCircles, icon: BookOpen, color: 'bg-emerald-500', trend: '+2%' },
    { title: 'المعلمون', value: stats.totalTeachers, icon: GraduationCap, color: 'bg-purple-500', trend: '+1%' },
    { title: 'إجمالي التسميع', value: stats.totalRecitations, icon: ClipboardList, color: 'bg-orange-500', trend: '+12%' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">لوحة تحكم المدير</h1>
        <p className="text-gray-600">مرحباً {user.full_name}، إليك نظرة عامة شاملة على المنصة</p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* صف إحصائيات إضافية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">طلب الانضمام المعلق</p>
                <p className="text-2xl font-bold mt-2">{stats.pendingRequests}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الحضور اليوم</p>
                <p className="text-2xl font-bold mt-2">{stats.todayAttendance}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تسميع هذا الأسبوع</p>
                <p className="text-2xl font-bold mt-2">{stats.weeklyRecitations}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الإجراءات السريعة والأنشطة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* الإجراءات السريعة */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 justify-start gap-2">
                  <UserPlus className="w-4 h-4" />
                  إضافة مستخدم
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl" className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>نوع المستخدم *</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}>
                      <SelectTrigger>
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
                      <Label>الاسم الكامل *</Label>
                      <Input
                        placeholder="محمد أحمد"
                        value={newUser.full_name}
                        onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الجنس *</Label>
                      <Select value={newUser.gender} onValueChange={(value) => setNewUser({ ...newUser, gender: value as 'male' | 'female' })}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر" />
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
                      <Label>البريد الإلكتروني *</Label>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>رقم الجوال</Label>
                      <Input
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddUser} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    إضافة المستخدم
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddCircleDialogOpen} onOpenChange={setIsAddCircleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة حلقة
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة حلقة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>اسم الحلقة *</Label>
                    <Input
                      placeholder="حلقة الفجر"
                      value={newCircle.name}
                      onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المعلم *</Label>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>المستوى *</Label>
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
                    <div className="space-y-2">
                      <Label>الحد الأقصى للطلاب</Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={newCircle.max_students}
                        onChange={(e) => setNewCircle({ ...newCircle, max_students: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <Input
                      placeholder="وصف الحلقة"
                      value={newCircle.description}
                      onChange={(e) => setNewCircle({ ...newCircle, description: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddCircle} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    إضافة الحلقة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* آخر النشاطات */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              آخر النشاطات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                    <div className="mt-1">
                      {activity.status === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                      {activity.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.timestamp).toLocaleString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">لا توجد نشاطات حالياً</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* المستخدمون والحلقات الأخيرة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* المستخدمون الأخيرون */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">المستخدمون الأخيرون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.length > 0 ? (
                recentUsers.slice(0, 5).map((userData) => (
                  <div key={userData.id} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-sm">{userData.full_name}</p>
                      <p className="text-xs text-gray-500">{userData.email}</p>
                    </div>
                    <Badge variant={userData.role === 'student' ? 'default' : 'secondary'}>
                      {getRoleLabel(userData.role)}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">لا يوجد مستخدمون</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* الحلقات الأخيرة */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">الح��قات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCircles.length > 0 ? (
                recentCircles.slice(0, 5).map((circle) => (
                  <div key={circle.id} className="pb-3 border-b last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{circle.name}</p>
                        <p className="text-xs text-gray-500">{circle.teacher?.full_name || 'بدون معلم'}</p>
                      </div>
                      <Badge variant="outline">
                        {circle.level === 'beginner' ? 'مبتدئ' : circle.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">لا توجد حلقات</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'overview':
        return renderOverview();

      case 'users':
        return <EnhancedUsersManagement organizationId={organization.id} />;

      case 'circles':
        return <CirclesManagement organizationId={organization.id} />;

      case 'recitations':
        return (
          <RecitationsPage
            organizationId={organization.id}
            userRole="admin"
            userId={user.id}
          />
        );

      case 'reports':
        return (
          <ReportsPage
            organizationId={organization.id}
            userRole="admin"
            userId={user.id}
          />
        );

      case 'parent-link':
        return <ParentStudentLink organizationId={organization.id} />;

      case 'settings':
        return <SettingsPage user={user} />;

      default:
        return null;
    }
  };

  if (loading && currentSection === 'overview') {
    return (
      <DashboardLayout
        user={user}
        organization={organization}
        role="admin"
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      >
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

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
