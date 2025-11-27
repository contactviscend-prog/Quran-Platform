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
        throw profileError;
      }

      if (profileData) {
        console.log('✅ تم جلب profile:', profileData);
        setProfile(profileData);

        // Then, fetch the organization separately if needed
        if (profileData.organization_id) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', profileData.organization_id)
            .single();

          if (orgError) {
            console.warn('⚠️ تحذير في جلب organization:', orgError.message);
          } else if (orgData) {
            console.log('✅ تم جلب organization:', orgData);
            setOrganization(orgData);
          }
        }
      } else {
        console.warn('⚠️ لم يتم جلب profile - قد لا يكون موجوداً');
      }
    } catch (error: any) {
      console.error('❌ Error fetching profile:', error?.message || error);
      throw error; // أعد رفع الخطأ ليتم التعامل معه بشكل صحيح
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
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchProfile(session.user.id);
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
          throw new Error('البريد الإلكترون�� أو كلمة المرور غير صحيحة');
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
        try {
          await fetchProfile(data.user.id);
          console.log('✅ تم تسجيل الدخول والحصول على البيانات بنجاح');
          toast.success('تم تسجيل الدخول بنجاح');
        } catch (profileError: any) {
          console.error('⚠️ فشل جلب profile لكن تم تسجيل الدخول:', profileError);
          // حتى لو فشل جلب profile، نجح تسجيل الدخول
          // سيحاول نظام تحديث الحالة عرض البيانات
          toast.warning('تم تسجيل الدخول لكن حدثت مشكلة في جلب البيانات');
        }
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
