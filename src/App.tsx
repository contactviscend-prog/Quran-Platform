import { useState, useEffect } from 'react';
import { LandingPage } from './modules/site/LandingPage';
import { OrganizationSelector } from './modules/site/OrganizationSelector';
import { LoginPage } from './modules/auth/LoginPage';
import { AdminDashboard } from './modules/admin/AdminDashboard';
import { SupervisorDashboard } from './modules/supervisor/SupervisorDashboard';
import { TeacherDashboard } from './modules/teacher/TeacherDashboard';
import { StudentDashboard } from './modules/student/StudentDashboard';
import { ParentDashboard } from './modules/parent/ParentDashboard';
import { JoinRequestForm } from './modules/site/JoinRequestForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Organization, UserRole } from './lib/supabase';
import { Toaster } from './components/ui/sonner';

export type { UserRole, Organization };

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  avatar?: string;
}

type AppView = 'landing' | 'org-selector' | 'login' | 'register' | 'dashboard';

function AppContent() {
  const { user, profile, organization, loading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  // إذا كان المستخدم مسجل دخول وله profile، انتقل للوحة التحكم
  useEffect(() => {
    if (user && profile && organization) {
      setCurrentView('dashboard');
      setSelectedOrg(organization);
    }
  }, [user, profile, organization]);

  const handleGetStarted = () => {
    setCurrentView('org-selector');
  };

  const handleOrgSelect = (org: Organization) => {
    setSelectedOrg(org);
    setCurrentView('login');
  };

  const handleGoToRegister = () => {
    setCurrentView('register');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  const handleBackToOrgSelector = () => {
    setSelectedOrg(null);
    setCurrentView('org-selector');
  };

  const handleBackToLanding = () => {
    setSelectedOrg(null);
    setCurrentView('landing');
  };

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (currentView === 'org-selector') {
    return <OrganizationSelector onSelectOrg={handleOrgSelect} />;
  }

  if (currentView === 'login' && selectedOrg) {
    return (
      <LoginPage
        organization={selectedOrg}
        onBack={handleBackToOrgSelector}
        onRegister={handleGoToRegister}
      />
    );
  }

  if (currentView === 'register' && selectedOrg) {
    return (
      <JoinRequestForm
        organization={selectedOrg}
        onBack={handleBackToLogin}
        onSuccess={handleBackToLogin}
      />
    );
  }

  if (currentView === 'dashboard' && profile && organization) {
    const userProps = {
      user: profile,
      organization: organization,
    };

    switch (profile.role) {
      case 'admin':
        return <AdminDashboard {...userProps} />;
      case 'supervisor':
        return <SupervisorDashboard {...userProps} />;
      case 'teacher':
        return <TeacherDashboard {...userProps} />;
      case 'student':
        return <StudentDashboard {...userProps} />;
      case 'parent':
        return <ParentDashboard {...userProps} />;
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  }

  return <LandingPage onGetStarted={handleGetStarted} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-center" dir="rtl" />
    </AuthProvider>
  );
}

export default App;
