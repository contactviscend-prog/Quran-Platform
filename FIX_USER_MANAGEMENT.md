# 🔧 FIX USER MANAGEMENT SYSTEM
## Complete Implementation Guide

---

## 📋 PROBLEMS TO FIX

1. ❌ **EnhancedUsersManagement.tsx** - Has NO database integration
2. ❌ **Role changes not persisted** - Only update local state
3. ❌ **Audit logging broken** - Never saves to database
4. ❌ **No delete/suspend operations** - Missing database calls
5. ⚠️ **Mixed implementations** - Two different approaches

---

## 🎯 SOLUTION APPROACH

### Step 1: Update EnhancedUsersManagement.tsx

Replace the entire file with database-integrated version:

```typescript
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
import { supabase, isDemoMode, Profile, Organization } from '../../lib/supabase';

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
  const [loading, setLoading] = useState(false);

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
    full_name: '',
    email: '',
    phone: '',
    role: 'student',
    gender: '' as 'ذكر' | 'أنثى' | '',
  });

  useEffect(() => {
    fetchUsers();
  }, [organizationId]);

  // ✅ NEW: Fetch users from database
  const fetchUsers = async () => {
    try {
      setLoading(true);

      if (isDemoMode()) {
        // Demo data
        setUsers([
          {
            id: '1',
            name: 'أحمد المعلم',
            email: 'ahmed@example.com',
            phone: '0501234567',
            role: 'معلم',
            gender: 'ذكر',
            status: 'نشط',
            joinDate: '1445-07-15',
            lastActive: '1446-03-20',
            circlesCount: 3,
            studentsCount: 45
          },
          {
            id: '2',
            name: 'فاطمة الطالبة',
            email: 'fatima@example.com',
            phone: '0509876543',
            role: 'طالب',
            gender: 'أنثى',
            status: 'نشط',
            joinDate: '1445-08-20',
            lastActive: '1446-03-20',
            circle: 'حلقة الفجر'
          },
        ]);
        setLoading(false);
        return;
      }

      // ✅ REAL: Fetch from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedUsers: ExtendedUser[] = (data || []).map((profile: Profile) => ({
        id: profile.id,
        name: profile.full_name,
        email: profile.email || '',
        phone: profile.phone || '',
        role: profile.role,
        gender: profile.gender === 'male' ? 'ذكر' : 'أنثى',
        status: profile.status === 'active' ? 'نشط' : profile.status === 'suspended' ? 'معلق' : 'قيد المراجعة',
        joinDate: new Date(profile.created_at).toLocaleDateString('ar-SA'),
        lastActive: new Date(profile.updated_at).toLocaleDateString('ar-SA'),
      }));

      setUsers(mappedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (!isDemoMode()) {
        toast.error('فشل تحميل المستخدمين');
      }
    } finally {
      setLoading(false);
    }
  };

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

  // ✅ FIXED: Add user with database persistence
  const handleAddUser = async () => {
    if (!newUser.full_name || !newUser.email || !newUser.gender) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);

      if (isDemoMode()) {
        // Demo: just update local state
        const user: ExtendedUser = {
          id: String(Date.now()),
          name: newUser.full_name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          gender: newUser.gender as 'ذكر' | 'أنثى',
          status: 'نشط',
          joinDate: new Date().toLocaleDateString('ar-SA'),
          lastActive: new Date().toLocaleDateString('ar-SA'),
        };
        setUsers([...users, user]);
        setNewUser({ full_name: '', email: '', phone: '', role: 'student', gender: '' });
        setIsAddDialogOpen(false);
        toast.success('تم إضافة المستخدم بنجاح (وضع العرض التوضيحي)');
        return;
      }

      // ✅ REAL: Create auth user + profile
      const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: newUser.full_name,
          role: newUser.role,
          organization_id: organizationId,
        },
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          organization_id: organizationId,
          full_name: newUser.full_name,
          email: newUser.email,
          phone: newUser.phone,
          gender: newUser.gender === 'ذكر' ? 'male' : 'female',
          role: newUser.role,
          status: 'active',
        });

      if (profileError) throw profileError;

      // ✅ Log the action
      await logAuditAction(
        organizationId,
        currentUserProfile?.id || '',
        currentUserProfile?.full_name || 'مدير',
        'USER_CREATED',
        {
          targetType: 'user',
          targetId: authData.user.id,
          targetName: newUser.full_name,
          newValue: { role: newUser.role, status: 'active' },
        }
      );

      toast.success('تم إضافة المستخدم بنجاح');
      setNewUser({ full_name: '', email: '', phone: '', role: 'student', gender: '' });
      setIsAddDialogOpen(false);
      
      // Refresh the list
      await fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      if (!isDemoMode()) {
        toast.error('فشل إضافة المستخدم: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Update user with database persistence
  const handleSaveEditUser = async () => {
    if (!selectedUser || !editFormData) return;

    try {
      setLoading(true);

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

      if (isDemoMode()) {
        // Demo: update local state only
        setUsers(users.map(u =>
          u.id === selectedUser.id
            ? { ...u, ...editFormData }
            : u
        ));
        toast.success('تم تحديث بيانات المستخدم بنجاح (وضع العرض التوضيحي)');
        setIsEditDialogOpen(false);
        return;
      }

      // ✅ REAL: Update database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editFormData.name,
          email: editFormData.email,
          phone: editFormData.phone,
          role: editFormData.role,
          status: editFormData.status === 'نشط' ? 'active' : editFormData.status === 'معلق' ? 'suspended' : 'pending',
          gender: editFormData.gender === 'ذكر' ? 'male' : 'female',
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      // ✅ Log role change
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

      // ✅ Log status change
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

      // Update local state
      setUsers(users.map(u =>
        u.id === selectedUser.id
          ? { ...u, ...editFormData }
          : u
      ));

      toast.success('تم تحديث بيانات المستخدم بنجاح');
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (!isDemoMode()) {
        toast.error('فشل تحديث بيانات المستخدم: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Delete user with database persistence
  const handleDeleteUser = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    const user = users.find(u => u.id === id);
    if (!user) return;

    try {
      setLoading(true);

      if (isDemoMode()) {
        // Demo: update local state
        setUsers(users.filter(u => u.id !== id));
        toast.success('تم حذف المستخدم (وضع العرض التوضيحي)');
        return;
      }

      // ✅ REAL: Delete from database
      // This will cascade delete the profile due to foreign key constraint
      const { error } = await supabase.auth.admin.deleteUser(id);

      if (error) throw error;

      // ✅ Log the deletion
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

      // Update local state
      setUsers(users.filter(u => u.id !== id));
      toast.success('تم حذف المستخدم');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      if (!isDemoMode()) {
        toast.error('فشل حذف المستخدم: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Suspend user with database persistence
  const handleSuspendUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    try {
      setLoading(true);

      if (isDemoMode()) {
        // Demo: update local state
        setUsers(users.map(u => u.id === id ? { ...u, status: 'معلق' as const } : u));
        toast.success('تم تعليق المستخدم (وضع العرض التوضيحي)');
        return;
      }

      // ✅ REAL: Update database
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended' })
        .eq('id', id);

      if (error) throw error;

      // ✅ Log the action
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

      // Update local state
      setUsers(users.map(u => u.id === id ? { ...u, status: 'معلق' as const } : u));
      toast.success('تم تعليق المستخدم');
    } catch (error: any) {
      console.error('Error suspending user:', error);
      if (!isDemoMode()) {
        toast.error('فشل تعليق المستخدم: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Activate user with database persistence
  const handleActivateUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    try {
      setLoading(true);

      if (isDemoMode()) {
        // Demo: update local state
        setUsers(users.map(u => u.id === id ? { ...u, status: 'نشط' as const } : u));
        toast.success('تم تفعيل المستخدم (وضع العرض التوضيحي)');
        return;
      }

      // ✅ REAL: Update database
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) throw error;

      // ✅ Log the action
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

      // Update local state
      setUsers(users.map(u => u.id === id ? { ...u, status: 'نشط' as const } : u));
      toast.success('تم تفعيل المستخدم');
    } catch (error: any) {
      console.error('Error activating user:', error);
      if (!isDemoMode()) {
        toast.error('فشل تفعيل المستخدم: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // [Rest of the render code stays the same as original...]
  // Just ensure these functions are called with the new async handlers

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

  const handleViewUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
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

  // Return the same JSX as before, but with updated handlers
  return (
    <div className="space-y-6">
      {/* All the UI code from original EnhancedUsersManagement.tsx */}
      {/* Just make sure to use the new async handlers above */}
      {/* Example: onClick={() => handleSuspendUser(user.id)} instead of local state update */}
    </div>
  );
}
```

---

## 🔧 KEY CHANGES SUMMARY

### Before (Broken)
```typescript
// ❌ Only updates local state
const handleSaveEditUser = async () => {
  setUsers(users.map(u =>
    u.id === selectedUser.id ? { ...u, ...editFormData } : u
  ));
  toast.success('تم تحديث بيانات المستخدم بنجاح');
};
```

### After (Fixed)
```typescript
// ✅ Updates database AND local state
const handleSaveEditUser = async () => {
  try {
    if (isDemoMode()) {
      setUsers(...);
      return;
    }
    
    // Update database
    const { error } = await supabase
      .from('profiles')
      .update({...})
      .eq('id', selectedUser.id);
    
    if (error) throw error;
    
    // Log the change
    await logAuditAction(...);
    
    // Update local state
    setUsers(...);
    
    toast.success('تم تحديث بيانات المستخدم بنجاح');
  } catch (error) {
    toast.error('فشل: ' + error.message);
  }
};
```

---

## ✅ VERIFICATION STEPS

After implementing the fix:

1. **Test Add User**
   ```
   - Click "إضافة مستخدم"
   - Fill form
   - Click "إضافة المستخدم"
   - Verify: User appears in list
   - Refresh page
   - Verify: User still there (from database)
   ```

2. **Test Edit User**
   ```
   - Click Edit button
   - Change role from "معلم" to "مشرف"
   - Click "حفظ التغييرات"
   - Verify: Role changes in list
   - Refresh page
   - Verify: Role is still "مشرف" (from database)
   ```

3. **Test Delete User**
   ```
   - Click Delete button
   - Click OK on confirmation
   - Verify: User removed from list
   - Refresh page
   - Verify: User still gone (deleted from database)
   ```

4. **Test Suspend User**
   ```
   - Click Suspend button (Ban icon)
   - Verify: Status changes to "معلق"
   - Refresh page
   - Verify: Status still "معلق" (from database)
   ```

---

## 🚀 NEXT STEPS

1. **Apply this fix** to EnhancedUsersManagement.tsx
2. **Delete UsersManagement.tsx** (it's redundant)
3. **Test with real Supabase** (set env variables)
4. **Verify audit logs** are saved to database
5. **Remove demo implementations** once confident

---

## 📌 IMPORTANT NOTES

- Always check `isDemoMode()` before making database calls
- Always wrap database operations in try-catch
- Always refresh the list after making changes
- Always log actions to audit log
- Always show appropriate error messages
- Test with and without Supabase connection

