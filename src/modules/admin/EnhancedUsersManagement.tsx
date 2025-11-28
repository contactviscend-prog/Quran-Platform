import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Plus, Edit, Trash2, Search, UserPlus, CheckCircle, XCircle, Clock, Mail, Phone, Calendar, User, Eye, Ban, Shield, FileText, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { logAuditAction } from '../../lib/auditLog';
import { supabase, isDemoMode, getRoleLabel, getStatusLabel } from '../../lib/supabase';

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  gender: 'ذكر' | 'أنثى';
  status: 'نشط' | 'معلق' | 'قيد المراجعة';
  joinDate: string;
  lastActive: string;
  circle?: string;
  studentsCount?: number;
  circlesCount?: number;
  childrenCount?: number;
}

interface UserStats {
  total: number;
  active: number;
  suspended: number;
  pending: number;
  byRole: {
    [key: string]: number;
  };
}

export function EnhancedUsersManagement({ organizationId }: { organizationId: string }) {
  const { profile: currentUserProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // حالة النموذج المعدل
  const [editFormData, setEditFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: string;
    status: 'نشط' | 'معلق' | 'قيد المراجعة';
    gender: 'ذكر' | 'أنثى';
  } | null>(null);

  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'طالب',
    gender: '',
  });

  // حساب الإحصائيات
  const stats: UserStats = {
    total: users.length,
    active: users.filter(u => u.status === 'نشط').length,
    suspended: users.filter(u => u.status === 'معلق').length,
    pending: users.filter(u => u.status === 'قيد المراجعة').length,
    byRole: {
      'معلم': users.filter(u => u.role === 'معلم').length,
      'طالب': users.filter(u => u.role === 'طالب').length,
      'مشرف': users.filter(u => u.role === 'مشرف').length,
      'ولي أمر': users.filter(u => u.role === 'ولي أمر').length,
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.gender) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    const user: ExtendedUser = {
      id: String(users.length + 1),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      gender: newUser.gender as 'ذكر' | 'أنثى',
      status: 'نشط',
      joinDate: '1446-03-20',
      lastActive: '1446-03-20',
    };
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', phone: '', role: 'طالب', gender: '' });
    setIsAddDialogOpen(false);
    toast.success('تم إضافة المستخدم بنجاح');

    // تسجيل في Audit Log
    logAuditAction(
      organizationId,
      currentUserProfile?.id || '',
      currentUserProfile?.full_name || 'مدير',
      'USER_CREATED',
      {
        targetType: 'user',
        targetId: user.id,
        targetName: user.name,
        newValue: { role: user.role, status: user.status },
      }
    );
  };

  const handleEditUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      gender: user.gender,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEditUser = async () => {
    if (!selectedUser || !editFormData) return;

    const oldData = {
      role: selectedUser.role,
      status: selectedUser.status,
      name: selectedUser.name,
    };

    const newData = {
      role: editFormData.role,
      status: editFormData.status,
      name: editFormData.name,
    };

    // تحديث البيانات
    setUsers(users.map(u =>
      u.id === selectedUser.id
        ? { ...u, ...editFormData }
        : u
    ));

    // تسجيل في Audit Log
    if (oldData.role !== newData.role) {
      await logAuditAction(
        organizationId,
        currentUserProfile?.id || '',
        currentUserProfile?.full_name || 'مدير',
        'USER_ROLE_CHANGED',
        {
          targetType: 'user',
          targetId: selectedUser.id,
          targetName: selectedUser.name,
          oldValue: { role: oldData.role },
          newValue: { role: newData.role },
          notes: `تم تغيير الدور من "${oldData.role}" إلى "${newData.role}"`,
        }
      );
    }

    if (oldData.status !== newData.status) {
      await logAuditAction(
        organizationId,
        currentUserProfile?.id || '',
        currentUserProfile?.full_name || 'مدير',
        'USER_STATUS_CHANGED',
        {
          targetType: 'user',
          targetId: selectedUser.id,
          targetName: selectedUser.name,
          oldValue: { status: oldData.status },
          newValue: { status: newData.status },
          notes: `تم تغيير الحالة من "${oldData.status}" إلى "${newData.status}"`,
        }
      );
    }

    if (oldData.name !== newData.name || oldData.role !== newData.role || oldData.status !== newData.status) {
      await logAuditAction(
        organizationId,
        currentUserProfile?.id || '',
        currentUserProfile?.full_name || 'مدير',
        'USER_UPDATED',
        {
          targetType: 'user',
          targetId: selectedUser.id,
          targetName: selectedUser.name,
          oldValue: oldData,
          newValue: newData,
        }
      );
    }

    setIsEditDialogOpen(false);
    toast.success('تم تحديث بيانات المستخدم بنجاح');
  };

  const handleViewUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleSuspendUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    setUsers(users.map(u => u.id === id ? { ...u, status: 'معلق' as const } : u));
    toast.success('تم تعليق المستخدم');

    await logAuditAction(
      organizationId,
      currentUserProfile?.id || '',
      currentUserProfile?.full_name || 'مدير',
      'USER_SUSPENDED',
      {
        targetType: 'user',
        targetId: id,
        targetName: user.name,
        oldValue: { status: user.status },
        newValue: { status: 'معلق' },
      }
    );
  };

  const handleActivateUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    setUsers(users.map(u => u.id === id ? { ...u, status: 'نشط' as const } : u));
    toast.success('تم تفعيل المستخدم');

    await logAuditAction(
      organizationId,
      currentUserProfile?.id || '',
      currentUserProfile?.full_name || 'مدير',
      'USER_ACTIVATED',
      {
        targetType: 'user',
        targetId: id,
        targetName: user.name,
        oldValue: { status: user.status },
        newValue: { status: 'نشط' },
      }
    );
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      const user = users.find(u => u.id === id);
      if (!user) return;

      setUsers(users.filter(u => u.id !== id));
      toast.success('تم حذف المستخدم');

      await logAuditAction(
        organizationId,
        currentUserProfile?.id || '',
        currentUserProfile?.full_name || 'مدير',
        'USER_DELETED',
        {
          targetType: 'user',
          targetId: id,
          targetName: user.name,
          oldValue: { role: user.role, status: user.status },
        }
      );
    }
  };

  const handleApproveRequest = async (id: string) => {
    const request = pendingRequests.find(r => r.id === id);
    if (request) {
      const newUser: ExtendedUser = {
        id: String(users.length + 1),
        name: request.name,
        email: request.email,
        phone: request.phone,
        role: request.role,
        gender: request.gender as 'ذكر' | 'أنثى',
        status: 'نشط',
        joinDate: '1446-03-20',
        lastActive: '1446-03-20',
      };
      setUsers([...users, newUser]);
      setPendingRequests(pendingRequests.filter(r => r.id !== id));
      toast.success('تمت الموافقة على الطلب');

      await logAuditAction(
        organizationId,
        currentUserProfile?.id || '',
        currentUserProfile?.full_name || 'مدير',
        'REQUEST_APPROVED',
        {
          targetType: 'user',
          targetId: newUser.id,
          targetName: newUser.name,
          newValue: { role: newUser.role, status: newUser.status },
        }
      );
    }
  };

  const handleRejectRequest = async (id: string) => {
    if (confirm('هل أنت متأكد من رفض هذا الطلب؟')) {
      const request = pendingRequests.find(r => r.id === id);
      if (!request) return;

      setPendingRequests(pendingRequests.filter(r => r.id !== id));
      toast.success('تم رفض الطلب');

      await logAuditAction(
        organizationId,
        currentUserProfile?.id || '',
        currentUserProfile?.full_name || 'مدير',
        'REQUEST_REJECTED',
        {
          targetType: 'join_request',
          targetId: id,
          targetName: request.name,
          notes: `تم رف�� طلب الانضمام كـ ${request.role}`,
        }
      );
    }
  };

  const handleExportUsers = () => {
    toast.success('جاري تصدير قائمة المستخدمين...');
    // TODO: تنفيذ التصدير الفعلي
  };

  const getStatusColor = (status: ExtendedUser['status']) => {
    switch (status) {
      case 'نشط':
        return 'bg-green-100 text-green-800';
      case 'معلق':
        return 'bg-red-100 text-red-800';
      case 'قيد المراجعة':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'مشرف':
        return 'bg-indigo-100 text-indigo-800';
      case 'معلم':
        return 'bg-blue-100 text-blue-800';
      case 'طالب':
        return 'bg-emerald-100 text-emerald-800';
      case 'ولي أمر':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'مشرف':
        return Shield;
      case 'معلم':
        return User;
      case 'طالب':
        return User;
      case 'ولي أمر':
        return User;
      default:
        return User;
    }
  };

  return (
    <div className="space-y-6">
      {/* العنوان والإجراءات */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl">إدارة المستخدمين</h2>
          <p className="text-gray-600 mt-1">إدارة شاملة لجميع المستخدمين في المنصة</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportUsers} variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مستخدم
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                <DialogDescription>أضف مستخدم جديد مباشرة إلى المنصة</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">الاسم الكامل *</Label>
                    <Input
                      id="user-name"
                      placeholder="محمد أحمد"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-gender">الجنس *</Label>
                    <Select value={newUser.gender} onValueChange={(value) => setNewUser({ ...newUser, gender: value })}>
                      <SelectTrigger id="user-gender">
                        <SelectValue placeholder="اختر الجنس" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ذكر">ذكر</SelectItem>
                        <SelectItem value="أنثى">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email">البريد الإلكتروني *</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="user@example.com"
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
                <div className="space-y-2">
                  <Label htmlFor="user-role">الدور *</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger id="user-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مشرف">مشرف</SelectItem>
                      <SelectItem value="معلم">معلم</SelectItem>
                      <SelectItem value="طالب">طالب</SelectItem>
                      <SelectItem value="ولي أمر">ولي أمر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddUser} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <UserPlus className="w-4 h-4 ml-2" />
                  إضافة المستخدم
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
              <p className="text-3xl mt-2 text-blue-600">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">المستخدمون النشطون</p>
              <p className="text-3xl mt-2 text-green-600">{stats.active}</p>
              <Progress value={(stats.active / stats.total) * 100} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">المعلقون</p>
              <p className="text-3xl mt-2 text-red-600">{stats.suspended}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">قيد المراجعة</p>
              <p className="text-3xl mt-2 text-yellow-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التبويبات */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">المستخدمون النشطون ({stats.active})</TabsTrigger>
          <TabsTrigger value="pending">
            الطلبات قيد المراجعة
            {pendingRequests.length > 0 && (
              <Badge className="mr-2 bg-red-500">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* المستخدمون النشطون */}
        <TabsContent value="active" className="space-y-4">
          {/* الفلاتر */}
          <Card>
            <CardHeader>
              <CardTitle>البحث والتصفية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث بالاسم، البريد، أو الجوال..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="جميع الأدوار" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جم��ع الأدوار</SelectItem>
                    <SelectItem value="مشرف">مشرف ({stats.byRole['مشرف']})</SelectItem>
                    <SelectItem value="معلم">معلم ({stats.byRole['معلم']})</SelectItem>
                    <SelectItem value="طالب">طالب ({stats.byRole['طالب']})</SelectItem>
                    <SelectItem value="ولي أمر">ولي أمر ({stats.byRole['ولي أمر']})</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="معلق">معلق</SelectItem>
                    <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* جدول المستخدمين */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة المستخدمين ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المستخدم</TableHead>
                      <TableHead className="text-right hidden md:table-cell">معلومات التواصل</TableHead>
                      <TableHead className="text-right">الدور</TableHead>
                      <TableHead className="text-right hidden lg:table-cell">تفاصيل إضافية</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right hidden md:table-cell">آخر نشاط</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const RoleIcon = getRoleIcon(user.role);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <RoleIcon className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.gender}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="space-y-1 text-sm">
                              <p className="flex items-center gap-1" dir="ltr">
                                <Mail className="w-3 h-3" />
                                <span className="text-right">{user.email}</span>
                              </p>
                              {user.phone && (
                                <p className="flex items-center gap-1" dir="ltr">
                                  <Phone className="w-3 h-3" />
                                  <span className="text-right">{user.phone}</span>
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="text-sm text-gray-600">
                              {user.role === 'معلم' && user.circlesCount && (
                                <p>{user.circlesCount} حلقات • {user.studentsCount} طالب</p>
                              )}
                              {user.role === 'طالب' && user.circle && (
                                <p>{user.circle}</p>
                              )}
                              {user.role === 'ولي أمر' && user.childrenCount && (
                                <p>{user.childrenCount} أبناء</p>
                              )}
                              {user.role === 'مشرف' && user.circlesCount && (
                                <p>يشرف على {user.circlesCount} حلقات</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="text-sm text-gray-600">{user.lastActive}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUser(user)}
                                title="عرض التفاصيل"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                title="تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {user.status === 'نشط' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSuspendUser(user.id)}
                                  title="تعليق"
                                >
                                  <Ban className="w-4 h-4 text-orange-600" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleActivateUser(user.id)}
                                  title="تفعيل"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>لا توجد نتائج مطابقة للبحث</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* الطلبات قيد المراجعة */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الطلبات قيد المراجعة</CardTitle>
              <CardDescription>راجع ووافق على طلبات الانضمام الجديدة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{request.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getRoleBadgeColor(request.role)}>{request.role}</Badge>
                              <Badge variant="secondary">{request.gender}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="mr-15 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span dir="ltr">{request.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span dir="ltr">{request.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>تاريخ التقديم: {request.requestDate}</span>
                          </div>
                          {request.notes && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{request.notes}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          <CheckCircle className="w-4 h-4 ml-2" />
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <XCircle className="w-4 h-4 ml-2" />
                          رفض
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>لا توجد طلبات قيد المراجعة</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* مودال عرض تفاصيل المستخدم */}
      {selectedUser && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent dir="rtl" className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل المستخدم</DialogTitle>
              <DialogDescription>معلومات كاملة عن المستخدم</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getRoleBadgeColor(selectedUser.role)}>{selectedUser.role}</Badge>
                    <Badge className={getStatusColor(selectedUser.status)}>{selectedUser.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                  <p className="font-medium" dir="ltr">{selectedUser.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">رقم الجوال</p>
                  <p className="font-medium" dir="ltr">{selectedUser.phone || 'غير محدد'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">الجنس</p>
                  <p className="font-medium">{selectedUser.gender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">تاريخ الانضمام</p>
                  <p className="font-medium">{selectedUser.joinDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">آخر نشاط</p>
                  <p className="font-medium">{selectedUser.lastActive}</p>
                </div>
                {selectedUser.role === 'معلم' && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">الإحصائيات</p>
                    <p className="font-medium">{selectedUser.circlesCount} حلقات • {selectedUser.studentsCount} طالب</p>
                  </div>
                )}
                {selectedUser.role === 'طالب' && selectedUser.circle && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">الحلقة</p>
                    <p className="font-medium">{selectedUser.circle}</p>
                  </div>
                )}
                {selectedUser.role === 'ولي أمر' && selectedUser.childrenCount && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">عدد الأبناء</p>
                    <p className="font-medium">{selectedUser.childrenCount}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={() => setIsViewDialogOpen(false)} variant="outline" className="flex-1">
                  إغلاق
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEditUser(selectedUser);
                }} className="flex-1 bg-emerald-600">
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* مودال تعديل المستخدم */}
      {editFormData && selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent dir="rtl" className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تعديل صلاحيات المستخدم</DialogTitle>
              <DialogDescription>تحديث الدور والحالة للمستخدم</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              {/* حقول التعديل */}
              <div className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    تغيير دور أو حالة المستخدم سيتم تسجيله في سجل التدقيق ويمكن مراجعته لاحقاً.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">الدور / الصلاحية</Label>
                    <Select
                      value={editFormData.role}
                      onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                    >
                      <SelectTrigger id="edit-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="مدير">مدير</SelectItem>
                        <SelectItem value="مشرف">مشرف</SelectItem>
                        <SelectItem value="معلم">معلم</SelectItem>
                        <SelectItem value="طالب">طالب</SelectItem>
                        <SelectItem value="ولي أمر">ولي أمر</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedUser.role !== editFormData.role && (
                      <p className="text-xs text-orange-600">
                        سيتم تغيير الدور من "{selectedUser.role}" إلى "{editFormData.role}"
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-status">الحالة</Label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) => setEditFormData({ ...editFormData, status: value as any })}
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="نشط">نشط</SelectItem>
                        <SelectItem value="معلق">معلق</SelectItem>
                        <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedUser.status !== editFormData.status && (
                      <p className="text-xs text-orange-600">
                        سيتم تغيير الحالة من "{selectedUser.status}" إلى "{editFormData.status}"
                      </p>
                    )}
                  </div>
                </div>

                {/* معاينة التغييرات */}
                {(selectedUser.role !== editFormData.role || selectedUser.status !== editFormData.status) && (
                  <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-orange-600" />
                      <p className="font-medium text-orange-800">ملخص التغييرات</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      {selectedUser.role !== editFormData.role && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">الدور:</span>
                          <Badge className={getRoleBadgeColor(selectedUser.role)}>{selectedUser.role}</Badge>
                          <span className="text-gray-400">←</span>
                          <Badge className={getRoleBadgeColor(editFormData.role)}>{editFormData.role}</Badge>
                        </div>
                      )}
                      {selectedUser.status !== editFormData.status && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">الحالة:</span>
                          <Badge className={getStatusColor(selectedUser.status)}>{selectedUser.status}</Badge>
                          <span className="text-gray-400">←</span>
                          <Badge className={getStatusColor(editFormData.status)}>{editFormData.status}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* معلومات إضافية */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <p className="text-gray-600">الجنس</p>
                    <p className="font-medium">{selectedUser.gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">تاريخ الانضمام</p>
                    <p className="font-medium">{selectedUser.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">رقم الجوال</p>
                    <p className="font-medium" dir="ltr">{selectedUser.phone || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">آخر نشاط</p>
                    <p className="font-medium">{selectedUser.lastActive}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={() => setIsEditDialogOpen(false)} variant="outline" className="flex-1">
                  إلغاء
                </Button>
                <Button
                  onClick={handleSaveEditUser}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={selectedUser.role === editFormData.role && selectedUser.status === editFormData.status}
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
