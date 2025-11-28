import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Organization, UserRole, supabase, isDemoMode } from './lib/supabase';
import { Toaster } from './components/ui/sonner';

const LandingPage = lazy(() => import('./modules/site/LandingPage').then(m => ({ default: m.LandingPage })));
const OrganizationSelector = lazy(() => import('./modules/site/OrganizationSelector').then(m => ({ default: m.OrganizationSelector })));
const LoginPage = lazy(() => import('./modules/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const JoinRequestForm = lazy(() => import('./modules/site/JoinRequestForm').then(m => ({ default: m.JoinRequestForm })));
const AdminDashboard = lazy(() => import('./modules/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const SupervisorDashboard = lazy(() => import('./modules/supervisor/SupervisorDashboard').then(m => ({ default: m.SupervisorDashboard })));
const TeacherDashboard = lazy(() => import('./modules/teacher/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const StudentDashboard = lazy(() => import('./modules/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const ParentDashboard = lazy(() => import('./modules/parent/ParentDashboard').then(m => ({ default: m.ParentDashboard })));

export type { UserRole, Organization };

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  avatar?: string;
}

// Loading Component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );
}

// Protected Route - for authenticated users only
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, organization, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !profile || !organization) {
    return <Navigate to="/organizations" replace />;
  }

  return <>{children}</>;
}

// Landing Route
function LandingRoute() {
  const { user, profile, organization, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user && profile && organization) {
      navigate(`/${organization.slug}/dashboard`, { replace: true });
    }
  }, [user, profile, organization, loading, navigate]);

  if (loading) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <LandingPage onGetStarted={() => navigate('/organizations')} />
    </Suspense>
  );
}

// Organization Selector Route
function OrganizationsRoute() {
  const { user, profile, organization, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user && profile && organization) {
      navigate(`/${organization.slug}/dashboard`, { replace: true });
    }
  }, [user, profile, organization, loading, navigate]);

  if (loading) return <LoadingScreen />;

  const handleOrgSelect = (org: Organization) => {
    navigate(`/login/${org.slug}`);
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <OrganizationSelector onSelectOrg={handleOrgSelect} />
    </Suspense>
  );
}

// Login Route
function LoginRoute() {
  const navigate = useNavigate();
  const { user, profile, organization: authOrg } = useAuth();
  const pathname = window.location.pathname;
  const orgSlug = pathname.split('/')[2]; // /login/:orgSlug

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && profile && authOrg) {
      navigate(`/${authOrg.slug}/dashboard`, { replace: true });
    }
  }, [user, profile, authOrg, navigate]);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginPageWrapper orgSlug={orgSlug} onBack={() => navigate('/organizations')} onRegister={() => navigate(`/register/${orgSlug}`)} />
    </Suspense>
  );
}

function LoginPageWrapper({ orgSlug, onBack, onRegister }: { orgSlug: string; onBack: () => void; onRegister: () => void }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!orgSlug) {
        onBack();
        return;
      }

      try {
        if (isDemoMode()) {
          setOrganization({
            id: 'demo-org',
            name: 'مؤسسة النور للتحفيظ',
            slug: orgSlug,
            description: 'مؤسسة تجريبية',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Organization);
        } else {
          const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('slug', orgSlug)
            .eq('is_active', true)
            .single();

          if (error || !data) {
            onBack();
            return;
          }

          setOrganization(data as Organization);
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
        onBack();
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [orgSlug, onBack]);

  if (loading || !organization) {
    return <LoadingScreen />;
  }

  return <LoginPage organization={organization} onBack={onBack} onRegister={onRegister} />;
}

// Register/Join Request Route
function RegisterRoute() {
  const navigate = useNavigate();
  const { user, profile, organization: authOrg } = useAuth();
  const pathname = window.location.pathname;
  const orgSlug = pathname.split('/')[2]; // /register/:orgSlug

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && profile && authOrg) {
      navigate(`/${authOrg.slug}/dashboard`, { replace: true });
    }
  }, [user, profile, authOrg, navigate]);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <RegisterPageWrapper orgSlug={orgSlug} onBack={() => navigate(`/login/${orgSlug}`)} onSuccess={() => navigate(`/login/${orgSlug}`)} />
    </Suspense>
  );
}

function RegisterPageWrapper({ orgSlug, onBack, onSuccess }: { orgSlug: string; onBack: () => void; onSuccess: () => void }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!orgSlug) {
        onBack();
        return;
      }

      try {
        if (isDemoMode()) {
          setOrganization({
            id: 'demo-org',
            name: 'مؤسسة النور للتحفيظ',
            slug: orgSlug,
            description: 'مؤسسة تجريبية',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Organization);
        } else {
          const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('slug', orgSlug)
            .eq('is_active', true)
            .single();

          if (error || !data) {
            onBack();
            return;
          }

          setOrganization(data as Organization);
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
        onBack();
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [orgSlug, onBack]);

  if (loading || !organization) {
    return <LoadingScreen />;
  }

  return <JoinRequestForm organization={organization} onBack={onBack} onSuccess={onSuccess} />;
}

// Dashboard Route - renders appropriate dashboard based on role
function DashboardRoute() {
  const { profile, organization, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!profile || !organization) {
    return <Navigate to="/organizations" replace />;
  }

  const userProps = {
    user: profile,
    organization: organization,
  };

  switch (profile.role) {
    case 'admin':
      return (
        <Suspense fallback={<LoadingScreen />}>
          <AdminDashboard {...userProps} />
        </Suspense>
      );
    case 'supervisor':
      return (
        <Suspense fallback={<LoadingScreen />}>
          <SupervisorDashboard {...userProps} />
        </Suspense>
      );
    case 'teacher':
      return (
        <Suspense fallback={<LoadingScreen />}>
          <TeacherDashboard {...userProps} />
        </Suspense>
      );
    case 'student':
      return (
        <Suspense fallback={<LoadingScreen />}>
          <StudentDashboard {...userProps} />
        </Suspense>
      );
    case 'parent':
      return (
        <Suspense fallback={<LoadingScreen />}>
          <ParentDashboard {...userProps} />
        </Suspense>
      );
    default:
      return <Navigate to="/organizations" replace />;
  }
}

function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingRoute />} />
      <Route path="/organizations" element={<OrganizationsRoute />} />
      <Route path="/login/:orgSlug" element={<LoginRoute />} />
      <Route path="/register/:orgSlug" element={<RegisterRoute />} />

      {/* Protected Organization Routes with slug-based URLs */}
      <Route
        path="/:orgSlug/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRoute />
          </ProtectedRoute>
        }
      />

      {/* Redirect legacy /dashboard to /:orgSlug/dashboard */}
      <Route path="/dashboard" element={<DashboardRedirectRoute />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function DashboardRedirectRoute() {
  const { organization } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (organization) {
      navigate(`/${organization.slug}/dashboard`, { replace: true });
    } else {
      navigate('/organizations', { replace: true });
    }
  }, [organization, navigate]);

  return <LoadingScreen />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-center" dir="rtl" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
