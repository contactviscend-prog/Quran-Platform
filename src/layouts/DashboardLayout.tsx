import { ReactNode, useState } from 'react';
import { Button } from '../components/ui/button';
import { 
  BookOpen, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UserCircle, 
  Settings, 
  Bell, 
  Building2, 
  ClipboardList, 
  CheckCircle, 
  Calendar, 
  QrCode,
  Target,
  Award,
  Trophy,
  RotateCcw,
  BarChart3,
  MessageSquare,
  Library
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { Profile, Organization, getRoleLabel } from '../lib/supabase';

interface DashboardLayoutProps {
  user: Profile;
  organization: Organization;
  role: string;
  children: ReactNode;
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

export function DashboardLayout({ user, organization, role, children, currentSection = 'overview', onSectionChange }: DashboardLayoutProps) {
  const { signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'supervisor':
        return 'bg-indigo-100 text-indigo-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-emerald-100 text-emerald-800';
      case 'parent':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const menuItems: Record<string, Array<{ icon: any; label: string; section: string }>> = {
    admin: [
      { icon: LayoutDashboard, label: 'لوحة التحكم', section: 'overview' },
      { icon: Users, label: 'إدارة المستخدمين', section: 'users' },
      { icon: BookOpen, label: 'الحلقات', section: 'circles' },
      { icon: ClipboardList, label: 'التسميع', section: 'recitations' },
      { icon: UserCircle, label: 'ربط أولياء الأمور', section: 'parent-link' },
      { icon: GraduationCap, label: 'التقارير', section: 'reports' },
      { icon: Settings, label: 'الإعدادات', section: 'settings' },
    ],
    supervisor: [
      { icon: LayoutDashboard, label: 'لوحة التحكم', section: 'overview' },
      { icon: Users, label: 'المعلمون', section: 'teachers' },
      { icon: BookOpen, label: 'الحلقات', section: 'circles' },
      { icon: ClipboardList, label: 'التسميع', section: 'recitations' },
      { icon: GraduationCap, label: 'التقارير', section: 'reports' },
      { icon: Settings, label: 'الإعدادات', section: 'settings' },
    ],
    teacher: [
      { icon: LayoutDashboard, label: 'لوحة التحكم', section: 'overview' },
      { icon: Users, label: 'طلابي', section: 'students' },
      { icon: BookOpen, label: 'حلقاتي', section: 'circles' },
      { icon: CheckCircle, label: 'تسجيل الحضور', section: 'attendance-recorder' },
      { icon: ClipboardList, label: 'التسميع', section: 'recitations' },
      { icon: Calendar, label: 'التكليف اليومي', section: 'assignments' },
      { icon: QrCode, label: 'مسح QR', section: 'qr-scanner' },
      { icon: Settings, label: 'الإعدادات', section: 'settings' },
    ],
    student: [
      { icon: LayoutDashboard, label: 'لوحة التحكم', section: 'overview' },
      { icon: BookOpen, label: 'حفظي', section: 'memorization' },
      { icon: Calendar, label: 'التكليفات', section: 'assignments' },
      { icon: QrCode, label: 'رمزي QR', section: 'qr-code' },
      { icon: Settings, label: 'الإعدادات', section: 'settings' },
    ],
    parent: [
      { icon: LayoutDashboard, label: 'لوحة التحكم', section: 'overview' },
      { icon: Users, label: 'أبنائي', section: 'children' },
      { icon: Settings, label: 'الإعدادات', section: 'settings' },
    ],
  };

  const currentMenuItems = menuItems[role] || [];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="mx-auto w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">{organization.name}</h1>
                <p className="text-xs text-gray-500">منصة تحفيظ القرآن</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center gap-2 border-r pr-3">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">{user.full_name}</p>
                <Badge className={`text-xs ${getRoleColor(role)}`}>
                  {getRoleLabel(role)}
                </Badge>
              </div>
              <Avatar>
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {user.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-[73px] right-0 h-[calc(100vh-73px)] bg-white border-l w-64 z-30
            transition-transform duration-300 lg:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-2">
            {currentMenuItems.map((item, index) => (
              <Button
                key={index}
                variant={currentSection === item.section ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  currentSection === item.section ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                }`}
                onClick={() => {
                  if (onSectionChange) {
                    onSectionChange(item.section);
                  }
                  if (isSidebarOpen) {
                    setIsSidebarOpen(false);
                  }
                }}
              >
                <item.icon className="w-5 h-5 ml-3" />
                {item.label}
              </Button>
            ))}
            <div className="pt-4 mt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 ml-3" />
                تسجيل الخروج
              </Button>
            </div>
          </nav>

          <div className="absolute bottom-4 right-4 left-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
              <p className="text-xs text-emerald-800">طوّرت بواسطة</p>
              <p className="text-sm text-emerald-900 font-medium">فِسند للتطوير الرقمي</p>
              <p className="text-xs text-emerald-700 mt-1">م. محمد معياد</p>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
