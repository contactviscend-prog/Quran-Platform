import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, Profile, Organization, isDemoMode } from '../lib/supabase';
import { mockUsers, setDemoSession, getDemoSession, clearDemoSession } from '../lib/mockData';
import { toast } from 'sonner';

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  organization: Organization | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 جاري جلب profile للمستخدم:', userId);

      // First, fetch the profile without nested select
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ خطأ في جلب profile:', profileError);
        console.error('خطأ الـ RLS - تحقق من الـ Policies في Supabase');
        throw profileError;
      }

      if (!profileData) {
        console.warn('⚠️ لم يتم جلب profile - قد لا يكون موجوداً');
        throw new Error('Profile not found');
      }

      console.log('✅ تم جلب profile:', profileData);

      // Set profile state FIRST
      setProfile(profileData);

      // Then, fetch the organization separately if needed
      if (profileData.organization_id) {
        console.log('🔍 جاري جلب organization:', profileData.organization_id);
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single();

        if (orgError) {
          console.error('❌ خطأ في جلب organization:', orgError);
          throw orgError;
        }

        if (!orgData) {
          console.warn('⚠️ لم يتم جلب organization - قد لا يكون موجوداً');
          throw new Error('Organization not found');
        }

        console.log('✅ تم جلب organization:', orgData);
        setOrganization(orgData);
      }

      console.log('✅ تم جلب جميع البيانات بنجاح');
    } catch (error: any) {
      console.error('❌ Error fetching profile:', error?.message || error);
      // Don't throw - let signIn handle it
    }
  };

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    let sessionChecked = false;

    const initializeAuth = async () => {
      try {
        // If in demo mode, check for stored session
        if (isDemoMode()) {
          const demoSession = getDemoSession();
          if (isMounted) {
            if (demoSession) {
              setUser(demoSession.user as any);
              setProfile(demoSession.profile);
              setOrganization(demoSession.organization);
            }
            setLoading(false);
          }
          return;
        }

        // Get initial session from Supabase
        if (!sessionChecked) {
          sessionChecked = true;
          const { data: { session } } = await supabase.auth.getSession();

          if (isMounted) {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
              await fetchProfile(session.user.id);
            }
            setLoading(false);
          }
        }
      } catch (error: any) {
        console.error('Error initializing auth:', error?.message || error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isMounted) {
          console.log('🔄 تغيير في حالة المصادقة:', event, session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            try {
              await fetchProfile(session.user.id);
              console.log('✅ تم جلب profile بعد تغيير حالة المصادقة');
            } catch (error: any) {
              console.error('⚠️ فشل جلب profile بعد auth change:', error);
              // لا نرمي خطأ هنا - نترك البيانات كما هي
            }
          } else {
            setProfile(null);
            setOrganization(null);
          }

          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      // Demo mode login
      if (isDemoMode()) {
        const mockUser = mockUsers[email];
        if (mockUser && mockUser.password === password) {
          const demoUser = {
            id: mockUser.profile.id,
            email: mockUser.email,
          };
          setUser(demoUser as any);
          setProfile(mockUser.profile);
          setOrganization(mockUser.profile.organization!);
          setDemoSession(email, mockUser.profile.organization_id);
          toast.success('تم تسجيل الدخول بنجاح (وضع العرض التوضيحي)');
          return;
        } else {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
      }

      // Real Supabase login
      console.log('🔐 جاري محاولة تسجيل الدخول:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('✅ نجح تسجيل الدخول للمستخدم:', data.user?.id);

      if (data.user) {
        console.log('🔐 تم تسجيل الدخول - جاري جلب البيانات...');
        await fetchProfile(data.user.id);
        console.log('✅ تم تسجيل الدخول والحصول على البيانات بنجاح');
        toast.success('تم تسجيل الدخول بنجاح');
      }
    } catch (error: any) {
      console.error('❌ Error signing in:', error.message);
      toast.error('خطأ في تسجيل الدخول: ' + error.message);
      throw error;
    }
  };

  // Sign up
  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      if (isDemoMode()) {
        toast.info('في وضع العرض التوضيحي، يُرجى استخدام الحسابات التجريبية المتاحة');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      toast.success('تم إنشاء الحساب بنجاح');
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      toast.error('خطأ في إنشاء الحساب: ' + error.message);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      if (isDemoMode()) {
        clearDemoSession();
        setUser(null);
        setProfile(null);
        setOrganization(null);
        toast.success('تم تسجيل الخروج بنجاح');
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setProfile(null);
      setOrganization(null);
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast.error('خطأ في تسجيل الخروج');
      throw error;
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      if (isDemoMode()) {
        // In demo mode, just retrieve from session
        const demoSession = getDemoSession();
        if (demoSession) {
          setProfile(demoSession.profile);
          setOrganization(demoSession.organization);
        }
      } else {
        await fetchProfile(user.id);
      }
    }
  };

  const value = {
    user,
    profile,
    organization,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
