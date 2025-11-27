import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { LandingPage } from './modules/site/LandingPage';
import { OrganizationSelector } from './modules/site/OrganizationSelector';
import { LoginPage } from './modules/auth/LoginPage';
import { JoinRequestForm } from './modules/site/JoinRequestForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Organization, UserRole, supabase, isDemoMode } from './lib/supabase';
import { Toaster } from './components/ui/sonner';
import { useState } from 'react';

export type { UserRole, Organization };

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  avatar?: string;
}

// Handle 404 redirect
function useRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);
}

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const { user, profile, organization, loading } = useAuth();
  const navigate = useNavigate();
  const { orgSlug } = useParams();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/organizations');
    } else if (!loading && profile && allowedRoles && !allowedRoles.includes(profile.role)) {
      navigate(`/${organization?.slug || 'org'}/dashboard`);
    } else if (!loading && organization && orgSlug && organization.slug !== orgSlug) {
      // التأكد من أن المستخدم في المؤسسة الصحيحة
      navigate(`/${organization.slug}/dashboard`);
    }
  }, [user, profile, loading, navigate, allowedRoles, organization, orgSlug]);

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

  if (!user || !profile || !organization) {
    return null;
  }

  return <>{children}</>;
}

// Landing Page Route
function LandingRoute() {
  const navigate = useNavigate();
  const { user, profile, organization } = useAuth();

  useEffect(() => {
    if (user && profile && organization) {
      navigate(`/${organization.slug}/dashboard`);
    }
  }, [user, profile, organization, navigate]);

  return <LandingPage onGetStarted={() => navigate('/organizations')} />;
}

// Organization Selector Route
function OrganizationsRoute() {
  const navigate = useNavigate();
  const { user, profile, organization } = useAuth();
  
  useEffect(() => {
    if (user && profile && organization) {
      navigate(`/${organization.slug}/dashboard`);
    }
  }, [user, profile, organization, navigate]);

  const handleOrgSelect = (org: Organization) => {
    navigate(`/login/${org.slug}`);
  };

  return <OrganizationSelector onSelectOrg={handleOrgSelect} />;
}

// Login Route
function LoginRoute() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      const userOrg = (profile as any).organization;
      if (userOrg) {
        navigate(`/${userOrg.slug}/dashboard`);
      }
      return;
    }

    const fetchOrganization = async () => {
      if (!orgSlug) {
        navigate('/organizations');
        return;
      }

      try {
        if (isDemoMode()) {
          setOrganization({
            id: 'demo-org',
            name: 'مؤسسة النور للتحفيظ',
            slug: orgSlug,
            description: 'مؤسسة تجريبية',
            logo_url: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('slug', orgSlug)
            .eq('is_active', true)
            .single();

          if (error || !data) {
            navigate('/organizations');
            return;
          }

          setOrganization(data);
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
        navigate('/organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [orgSlug, navigate, user, profile]);

  if (loading || !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <LoginPage
      organization={organization}
      onBack={() => navigate('/organizations')}
      onRegister={() => navigate(`/register/${orgSlug}`)}
    />
  );
}

// Register/Join Request Route
function RegisterRoute() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      const userOrg = (profile as any).organization;
      if (userOrg) {
        navigate(`/${userOrg.slug}/dashboard`);
      }
      return;
    }

    const fetchOrganization = async () => {
      if (!orgSlug) {
        navigate('/organizations');
        return;
      }

      try {
        if (isDemoMode()) {
          setOrganization({
            id: 'demo-org',
            name: 'مؤسسة النور للتحفيظ',
            slug: orgSlug,
            description: 'مؤسسة تجريبية',
            logo_url: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('slug', orgSlug)
            .eq('is_active', true)
            .single();

          if (error || !data) {
            navigate('/organizations');
            return;
          }

          setOrganization(data);
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
        navigate('/organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [orgSlug, navigate, user, profile]);

  if (loading || !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <JoinRequestForm
      organization={organization}
      onBack={() => navigate(`/login/${orgSlug}`)}
      onSuccess={() => navigate(`/login/${orgSlug}`)}
    />
  );
}

// Organization Layout - wraps all org-specific routes
function OrganizationLayout() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { organization, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && organization && organization.slug !== orgSlug) {
      // المستخدم في مؤسسة مختلفة
      navigate(`/${organization.slug}/dashboard`, { replace: true });
    }
  }, [organization, orgSlug, loading, navigate]);

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

  if (!organization || !profile) {
    return <Navigate to="/organizations" replace />;
  }

  // Render the child routes (dashboard pages)
  return <Outlet />;
}

// Dashboard Routes - renders appropriate dashboard based on role
function DashboardRoutes() {
  const { profile, organization } = useAuth();
  
  // Lazy load dashboards
  const AdminDashboard = require('./modules/admin/AdminDashboard').AdminDashboard;
  const SupervisorDashboard = require('./modules/supervisor/SupervisorDashboard').SupervisorDashboard;
  const TeacherDashboard = require('./modules/teacher/TeacherDashboard').TeacherDashboard;
  const StudentDashboard = require('./modules/student/StudentDashboard').StudentDashboard;
  const ParentDashboard = require('./modules/parent/ParentDashboard').ParentDashboard;

  if (!profile || !organization) {
    return <Navigate to="/organizations" replace />;
  }

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
      return <Navigate to="/organizations" replace />;
  }
}

function AppContent() {
  useRedirectHandler();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingRoute />} />
      <Route path="/organizations" element={<OrganizationsRoute />} />
      <Route path="/login/:orgSlug" element={<LoginRoute />} />
      <Route path="/register/:orgSlug" element={<RegisterRoute />} />

      {/* Protected Organization Routes */}
      <Route
        path="/:orgSlug"
        element={
          <ProtectedRoute>
            <OrganizationLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - main entry point for each org */}
        <Route path="dashboard" element={<DashboardRoutes />} />
        
        {/* Redirect /:orgSlug to /:orgSlug/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Legacy route support - redirect /dashboard to /:orgSlug/dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Helper component to redirect /dashboard to /:orgSlug/dashboard
function DashboardRedirect() {
  const { organization } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (organization) {
      navigate(`/${organization.slug}/dashboard`, { replace: true });
    }
  }, [organization, navigate]);

  return null;
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
