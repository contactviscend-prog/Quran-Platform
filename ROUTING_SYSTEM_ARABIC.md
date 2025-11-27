# 🗺️ نظام المسارات الكامل
## React Router + Slug-Based Organization Routing

---

## 📍 الوضع الحالي (مشكلة)

### البنية الحالية ❌
```
App.tsx (state-based routing)
├─ currentView = 'landing'
├─ currentView = 'org-selector'
├─ currentView = 'login'
├─ currentView = 'register'
└─ currentView = 'dashboard'

المشاكل:
❌ لا يوجد URLs حقيقية
❌ لا يمكن مشاركة الروابط
❌ زر الرجوع لا يعمل
❌ كل مؤسسة تستخدم نفس صفحة الدخول
❌ لا يمكن الدخول المباشر لمؤسسة معينة
```

---

## 🟢 الحل المطلوب (Slug-Based Routing)

### البنية الجديدة ✅
```
https://yourdomain.com/
  └─ /alnoor/login              → دخول مركز النور
  └─ /alnoor/register           → تسجيل في مركز النور
  └─ /alnoor/dashboard          → لوحة تحكم مركز النور
  
https://yourdomain.com/
  └─ /darhuda/login             → دخول دار الهدى
  └─ /darhuda/register          → تسجيل في دار الهدى
  └─ /darhuda/dashboard         → لوحة تحكم دار الهدى
```

**المميزات:**
✅ كل مؤسسة لها بوابة دخول خاصة
✅ يمكن مشاركة الروابط: `yourdomain.com/alnoor/login`
✅ زر الرجوع يعمل بشكل صحيح
✅ يمكن الدخول مباشرة من الرابط
✅ الاستضافة على Vercel تدعمها

---

## 📊 البوابات المنفصلة لكل مؤسسة

### الشرح التفصيلي

**الحالة الحالية:**
```
جميع المؤسسات → صفحة دخول واحدة موحدة
                ↓
            user@example.com + password
                ↓
            نفس الشاشة لكل المؤسسات
```

**الحالة الجديدة (المطلوبة):**
```
مركز النور (alnoor)
  └─ yourdomain.com/alnoor/login
     ├─ يمكن أن تكون شاشة مخصصة بألوان المؤسسة
     ├─ لوجو خاص بمركز النور
     └─ بيانات الدخول خاصة بمركز النور فقط

دار الهدى (darhuda)
  └─ yourdomain.com/darhuda/login
     ├─ يمكن أن تكون شاشة مخصصة بألوان دار الهدى
     ├─ لوجو خاص بدار الهدى
     └─ بيانات الدخول خاصة بدار الهدى فقط
```

**كيف يعمل الأمان:**
```
عندما يدخل المستخدم: yourdomain.com/alnoor/login
  ↓
يستخرج الـ slug: "alnoor"
  ↓
يبحث عن المؤسسة في قاعدة البيانات: WHERE slug = 'alnoor'
  ↓
إذا المؤسسة موجودة وفعالة (is_active = true)
  ✅ يظهر صفحة الدخول
  
إذا لم توجد أو غير فعالة
  ❌ يعرض صفحة خطأ "المؤسسة غير موجودة"
```

---

## ➕ إضافة مؤسسة جديدة في قائمة المؤسسات

### الخطوة 1: إدراج المؤسسة في قاعدة البيانات

أدخل سجل جديد في جدول `organizations`:

```sql
INSERT INTO organizations (
  name,
  slug,
  description,
  contact_email,
  contact_phone,
  address,
  is_active,
  created_at,
  updated_at
) VALUES (
  'مركز القرآن الكريم',           -- name
  'alquran-center',               -- slug (الرابط الخاص)
  'مركز متخصص في حفظ القرآن',    -- description
  'info@quran-center.com',        -- contact_email
  '0501234567',                   -- contact_phone
  'الرياض، السعودية',            -- address
  true,                           -- is_active (مهم جداً!)
  NOW(),                          -- created_at
  NOW()                           -- updated_at
);
```

**أهم شيء:** `is_active = true` و `slug` يجب أن يكون فريد وبدون مسافات.

### الخطوة 2: ستظهر المؤسسة تلقائياً ✅

عندما يفتح المستخدم صفحة اختيار المؤسسات:
```
1. OrganizationSelector fetches: 
   SELECT * FROM organizations WHERE is_active = true
   
2. تظهر المؤسسة الجديدة تلقائياً في القائمة
   
3. المستخدم يمكنه النقر عليها
   
4. ينتقل إلى: /alquran-center/login
```

**كود المكون (OrganizationSelector.tsx):**
```typescript
const fetchOrganizations = async () => {
  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('is_active', true)  // ← يتم السحب تلقائياً
    .order('name');
  
  setOrganizations(data || []);
};
```

✅ **عند تسجيل مؤسسة جديدة في قاعدة البيانات تظهر فوراً في القائمة**

---

## 🛣️ جميع المسارات الكاملة

### المسارات الرئيسية

```
1. الصفحة الرئيسية
   Path: /
   Component: LandingPage.tsx
   Public: ✅
   Auth Required: ❌

2. اختيار المؤسسة
   Path: /organizations
   Component: OrganizationSelector.tsx
   Public: ✅
   Auth Required: ❌

3. دخول مؤسسة محددة
   Path: /:slug/login
   Component: LoginPage.tsx
   Public: ✅
   Auth Required: ❌
   Params:
     - slug: "alnoor", "darhuda", etc.

4. تسجيل جديد في مؤسسة
   Path: /:slug/register
   Component: JoinRequestForm.tsx
   Public: ✅
   Auth Required: ❌
   Params:
     - slug: organization slug

5. لوحة التحكم (محمية)
   Path: /dashboard
   Component: Depends on role
   Auth Required: ✅
   Sub-routes:
     
     5.1 الصفحة الرئيسية للوحة
         Path: /dashboard/overview
         
     5.2 المسارات حسب الدور:
     
     👑 ADMIN ROUTES:
         /dashboard/admin/users        → إدارة المستخدمين
         /dashboard/admin/circles      → إدارة الحلقات
         /dashboard/admin/recitations  → إدارة التسميع
         /dashboard/admin/reports      → التقارير
         /dashboard/admin/join-requests→ طلبات الانضمام
         /dashboard/admin/settings     → الإعدادات
     
     👔 SUPERVISOR ROUTES:
         /dashboard/supervisor/teachers    → إدارة المعلمين
         /dashboard/supervisor/circles     → الحلقات
         /dashboard/supervisor/recitations → التسميع
         /dashboard/supervisor/reports     → التقارير
         /dashboard/supervisor/settings    → الإعدادات
     
     📚 TEACHER ROUTES:
         /dashboard/teacher/students      → طلابي
         /dashboard/teacher/circles       → حلقاتي
         /dashboard/teacher/attendance    → تسجيل الحضور
         /dashboard/teacher/recitations   → التسميع
         /dashboard/teacher/assignments   → الواجبات اليومية
         /dashboard/teacher/qr-scanner    → ماسح QR
         /dashboard/teacher/settings      → الإعدادات
     
     📖 STUDENT ROUTES:
         /dashboard/student/memorization  → حفظي
         /dashboard/student/attendance    → حضوري
         /dashboard/student/recitations   → تسميعاتي
         /dashboard/student/assignments   → واجباتي
         /dashboard/student/qr-code       → رمز QR الخاص بي
         /dashboard/student/settings      → الإعدادات
     
     👨‍👩‍👧 PARENT ROUTES:
         /dashboard/parent/children       → أبنائي
         /dashboard/parent/progress       → متابعة التقدم
         /dashboard/parent/settings       → الإعدادات
```

---

## 🔧 التنفيذ التقني

### 1. الملفات التي يجب تعديلها

```
src/
├── App.tsx                          ← تحويل من state-based إلى Router-based
├── main.tsx                         ← إضافة BrowserRouter
├── contexts/
│   └── AuthContext.tsx              ← (بدون تغيير كبير)
└── modules/
    ├── site/
    │   ├── LandingPage.tsx          ← (بدون تغيير)
    │   ├── OrganizationSelector.tsx ← (بدون تغيير)
    │   ├── LoginPage.tsx            ← يحصل على slug من useParams
    │   ├── JoinRequestForm.tsx      ← يحصل على slug من useParams
    │   └── ProtectedRoute.tsx       ← NEW: Component للحماية
    └── dashboard/
        ├── DashboardLayout.tsx      ← (بدون تغيير)
        ├── admin/                   ← كل المكونات كما هي
        ├── teacher/                 ← كل المكونات كما هي
        ├── student/                 ← كل المكونات كما هي
        ├── supervisor/              ��� كل المكونات كما هي
        └── parent/                  ← كل المكونات كما هي
```

### 2. التعديل الأساسي

#### قبل (App.tsx - State-Based):
```typescript
type AppView = 'landing' | 'org-selector' | 'login' | 'register' | 'dashboard';
const [currentView, setCurrentView] = useState<AppView>('landing');

if (currentView === 'landing') {
  return <LandingPage ... />;
}
if (currentView === 'org-selector') {
  return <OrganizationSelector ... />;
}
```

#### بعد (App.tsx - Router-Based):
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/organizations" element={<OrganizationSelector />} />
      <Route path="/:slug/login" element={<LoginPage />} />
      <Route path="/:slug/register" element={<JoinRequestForm />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
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
```

### 3. الحصول على Slug في المكون

```typescript
import { useParams, useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // احصل على المؤسسة من الـ slug
  const fetchOrganization = async () => {
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();
    
    setOrganization(data);
  };

  // عند الدخول الناجح
  const handleSuccessfulLogin = () => {
    navigate('/dashboard'); // يعرف البيانات من AuthContext
  };
}
```

### 4. مثال: OrganizationSelector

```typescript
import { useNavigate } from 'react-router-dom';

export function OrganizationSelector() {
  const navigate = useNavigate();

  const handleOrgSelect = (org: Organization) => {
    // الانتقال إلى slug الخاص بالمؤسسة
    navigate(`/${org.slug}/login`);
  };

  return (
    <div>
      {/* Organization cards */}
      <Button 
        onClick={() => handleOrgSelect(org)}
      >
        الدخول إلى المنصة
      </Button>
    </div>
  );
}
```

---

## 🚀 الاستضافة على Vercel

### إعدادات Vercel

Vercel يدعم React Router تلقائياً، لكن تحتاج إضافة ملف واحد:

**ملف: `vercel.json`** (موجود بالفعل)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**ماذا يعني؟**
- أي رابط غير موجود في الخادم يعود إلى `index.html`
- React Router يتعامل مع باقي المسارات

### النشر على Vercel

```bash
# 1. Build
npm run build

# 2. Deploy
vercel deploy

# أو إذا كنت متصل برابط Vercel
git push origin main
# (Vercel ينشر تلقائياً)
```

---

## 🔐 حماية المسارات

### ProtectedRoute.tsx (مكون حماية جديد)

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // إذا لم يكن المستخدم مسجل دخول
  if (!user || !profile) {
    return <Navigate to="/organizations" replace />;
  }

  // السماح بالدخول
  return <Outlet />;
}
```

### RoleProtectedRoute.tsx (حماية حسب الدور)

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/supabase';

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
}

export function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const { profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
```

---

## 📋 المسارات بعد تسجيل الدخول

```typescript
// بعد تسجيل الدخول بنجاح
const handleSuccessfulLogin = () => {
  // AuthContext يحفظ البيانات تلقائياً
  
  // ثم الانتقال إلى Dashboard
  navigate('/dashboard');
};

// في Dashboard (App.tsx):
function Dashboard() {
  const { profile } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      
      {/* Admin */}
      {profile?.role === 'admin' && (
        <>
          <Route path="/admin/users" element={<EnhancedUsersManagement />} />
          <Route path="/admin/circles" element={<CirclesManagement />} />
          {/* ... */}
        </>
      )}

      {/* Teacher */}
      {profile?.role === 'teacher' && (
        <>
          <Route path="/teacher/students" element={<MyStudentsPage />} />
          <Route path="/teacher/circles" element={<TeacherCirclesPage />} />
          {/* ... */}
        </>
      )}

      {/* ... etc */}
    </Routes>
  );
}
```

---

## ✅ ملخص الفوائد

| الميزة | قبل | بعد |
|--------|------|------|
| URLs حقيقية | ❌ | ✅ |
| مشاركة الروابط | ❌ | ✅ |
| زر الرجوع | ❌ | ✅ |
| بوابات منفصلة | ❌ | ✅ |
| دخول مباشر | ❌ | ✅ |
| SEO-friendly | ❌ | ✅ |
| History API | ❌ | ✅ |

---

## 🎯 الخطوات القادمة

1. **تثبيت React Router:**
   ```bash
   npm install react-router-dom
   ```

2. **تعديل App.tsx وmain.tsx** (سأوفر الكود الكامل)

3. **تعديل المكونات الرئيسية:**
   - LoginPage.tsx (الحصول على slug)
   - JoinRequestForm.tsx (الحصول على slug)
   - OrganizationSelector.tsx (الملاحة)

4. **اختبار المسارات:**
   ```
   http://localhost:5173/
   http://localhost:5173/organizations
   http://localhost:5173/alnoor/login
   http://localhost:5173/darhuda/login
   http://localhost:5173/dashboard
   ```

5. **النشر على Vercel** - لا يحتاج تعديلات إضافية

هل تريد الآن الكود الكامل لتنفيذ هذا النظام؟
