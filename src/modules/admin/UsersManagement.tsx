import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Plus, Edit, Trash2, Search, UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'نشط' | 'معلق' | 'قيد المراجعة';
  joinDate: string;
}

export function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'أحمد المعلم', email: 'ahmed@example.com', phone: '0501234567', role: 'معلم', status: 'نشط', joinDate: '2024-01-15' },
    { id: '2', name: 'فاطمة الطالبة', email: 'fatima@example.com', phone: '0509876543', role: 'طالب', status: 'نشط', joinDate: '2024-02-20' },
    { id: '3', name: 'عبدالله ولي الأمر', email: 'abdullah@example.com', phone: '0505551234', role: 'ولي أمر', status: 'نشط', joinDate: '2024-02-21' },
    { id: '4', name: 'خالد المشرف', email: 'khaled@example.com', phone: '0507778899', role: 'مشرف', status: 'نشط', joinDate: '2024-01-10' },
    { id: '5', name: 'محمد الجديد', email: 'mohamed@example.com', phone: '0503334455', role: 'طالب', status: 'قيد المراجعة', joinDate: '2024-03-01' },
  ]);

  const [pendingRequests] = useState([
    { id: '1', name: 'سارة أحمد', email: 'sara@example.com', phone: '0501112233', role: 'طالب', requestDate: '2024-03-05' },
    { id: '2', name: 'يوسف محمد', email: 'yousef@example.com', phone: '0504445566', role: 'معلم', requestDate: '2024-03-06' },
    { id: '3', name: 'نورة عبدالله', email: 'noura@example.com', phone: '0507778888', role: 'ولي أمر', requestDate: '2024-03-07' },
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'طالب',
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    const user: User = {
      id: String(users.length + 1),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: 'نشط',
      joinDate: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', phone: '', role: 'طالب' });
    setIsAddDialogOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleApproveRequest = (id: string) => {
    // منطق الموافقة على الطلب
    console.log('Approved request:', id);
  };

  const handleRejectRequest = (id: string) => {
    // منطق رفض الطلب
    console.log('Rejected request:', id);
  };

  const getStatusColor = (status: User['status']) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">إدارة المستخدمين</h2>
          <p className="text-gray-600 mt-1">إدارة جميع المستخدمين في المنصة</p>
        </div>
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
              <DialogDescription>أضف مستخدم جديد إلى المنصة</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">الاسم الكامل</Label>
                <Input
                  id="user-name"
                  placeholder="محمد أحمد"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">البريد الإلكتروني</Label>
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
                <Label htmlFor="user-role">الدور</Label>
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
                إضافة المستخدم
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">المستخدمون النشطون</TabsTrigger>
          <TabsTrigger value="pending">
            الطلبات قيد المراجعة
            {pendingRequests.length > 0 && (
              <Badge className="mr-2 bg-red-500">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث عن مستخدم..."
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
                    <SelectItem value="all">جميع الأدوار</SelectItem>
                    <SelectItem value="مشرف">مشرف</SelectItem>
                    <SelectItem value="معلم">معلم</SelectItem>
                    <SelectItem value="طالب">طالب</SelectItem>
                    <SelectItem value="ولي أمر">ولي أمر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right">الجوال</TableHead>
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">تاريخ الانضمام</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell dir="ltr" className="text-right">{user.email}</TableCell>
                      <TableCell dir="ltr" className="text-right">{user.phone}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الطلبات قيد المراجعة</CardTitle>
              <p className="text-sm text-gray-600 mt-1">راجع وافق على طلبات الانضمام الجديدة</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{request.name}</h3>
                            <Badge className={getRoleBadgeColor(request.role)}>{request.role}</Badge>
                          </div>
                        </div>
                        <div className="mr-13 space-y-1 text-sm text-gray-600">
                          <p dir="ltr" className="text-right">📧 {request.email}</p>
                          <p dir="ltr" className="text-right">📱 {request.phone}</p>
                          <p className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            تاريخ التقديم: {request.requestDate}
                          </p>
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
    </div>
  );
}
