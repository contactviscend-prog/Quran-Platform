import { ReactNode, useState, useRef } from 'react';
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
import { Profile, Organization, getRoleLabel, UserRole } from '../lib/supabase';

interface DashboardLayoutProps {
  user: Profile;
  organization: Organization;
  role: UserRole;
  children: ReactNode;
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

export function DashboardLayout({ user, organization, role, children, currentSection = 'overview', onSectionChange }: DashboardLayoutProps) {
  const { signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navScrollRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getRoleColor = (role: UserRole) => {
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
          <div className="flex items-center gap-2">
            {/* Menu Button - Next to Logo */}
            <div className="lg:hidden relative z-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              {/* Dropdown Menu - Positioned above header */}
              {isMenuOpen && (
                <div className="fixed left-0 right-0 top-0 bg-white shadow-2xl z-40 max-h-screen overflow-y-auto">
                  {/* Close button area */}
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h3 className="text-base font-semibold">{organization.name}</h3>
                    <div className="w-6" />
                  </div>

                  {/* Organization info */}
                  <div className="px-4 py-4 border-b">
                    <p className="text-sm text-gray-600">منصة تحفيظ القرآن الكريم</p>
                  </div>

                  {/* Dashboard button */}
                  <div className="px-4 py-2">
                    <button
                      onClick={() => {
                        if (onSectionChange) {
                          onSectionChange('overview');
                        }
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>لوحة التحكم</span>
                    </button>
                  </div>

                  {/* Menu items */}
                  <div className="px-4 py-2 space-y-1">
                    {currentMenuItems.slice(1).map((item, index) => (
                      <button
                        key={index}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-right rounded-lg transition-colors ${
                          currentSection === item.section
                            ? 'bg-emerald-50 text-emerald-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (onSectionChange) {
                            onSectionChange(item.section);
                          }
                          setIsMenuOpen(false);
                        }}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Logout button */}
                  <div className="px-4 py-4 border-t mt-4">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-end gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      <span>تسجيل الخروج</span>
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

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

      {/* Mobile Horizontal Navigation */}
      <div className="lg:hidden bg-white border-b sticky top-[73px] z-30 overflow-x-auto">
        <nav
          ref={navScrollRef}
          className="flex gap-2 p-3 overflow-x-auto scrollbar-hide"
        >
          {currentMenuItems.map((item, index) => (
            <Button
              key={index}
              variant={currentSection === item.section ? 'default' : 'outline'}
              size="sm"
              className={`flex-shrink-0 whitespace-nowrap ${
                currentSection === item.section ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600' : ''
              }`}
              onClick={() => {
                if (onSectionChange) {
                  onSectionChange(item.section);
                }
              }}
            >
              <item.icon className="w-4 h-4 ml-2" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            hidden lg:block sticky top-[73px] right-0 h-[calc(100vh-73px)] bg-white border-l w-64 overflow-y-auto
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

        {/* Main Content */}
        <main className="flex-1 w-full min-h-screen overflow-x-hidden">
          <div className="px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8 w-full">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
