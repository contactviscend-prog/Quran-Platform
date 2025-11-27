# 🗺️ PAGE ROUTES & API ARCHITECTURE
## Current Implementation & Recommended Structure

---

## 📍 CURRENT ROUTING SYSTEM

### Architecture Type: **State-Based Routing (NOT URL-Based)**

The app uses React component state for navigation, **not React Router**:

```typescript
// src/App.tsx
type AppView = 'landing' | 'org-selector' | 'login' | 'register' | 'dashboard';

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  // Navigation by changing state
  const handleGetStarted = () => {
    setCurrentView('org-selector');  // Navigate
  };

  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (currentView === 'org-selector') {
    return <OrganizationSelector onSelectOrg={handleOrgSelect} />;
  }

  if (currentView === 'login' && selectedOrg) {
    return <LoginPage organization={selectedOrg} />;
  }

  if (currentView === 'dashboard' && profile) {
    switch (profile.role) {
      case 'admin':
        return <AdminDashboard user={profile} organization={organization} />;
      case 'teacher':
        return <TeacherDashboard user={profile} organization={organization} />;
      // ... etc
    }
  }
}
```

---

## 🔄 COMPLETE NAVIGATION FLOW MAP

### 1. LANDING PAGE
```
URL: / (implicit)
Component: src/modules/site/LandingPage.tsx

Features:
├─ Hero Section (Charity banner)
├─ Features Grid (6 cards)
├─ Roles Overview (5 role cards)
├─ Statistics Section
├─ Calls to Action
│  ├─ "ابدأ الآن مجاناً" → org-selector
│  └─ "تعرف على المزيد" → Scroll
├─ Demo Mode Banner (if no DB)
└─ Footer

Navigation:
"ابدأ الآن مجاناً" button
  → setCurrentView('org-selector')
  → Shows OrganizationSelector

Condition:
- Shown when: user === null or profile === null
- Not authenticated state
```

---

### 2. ORGANIZATION SELECTOR
```
URL: / (implicit, state-based)
Component: src/modules/site/OrganizationSelector.tsx

Features:
├─ Organization List
│  ├─ Display active organizations
│  ├─ Search functionality
│  ├─ Filter by name
│  └─ Count badge
├─ Organization Cards
│  ├─ Logo (if exists)
│  ├─ Name
│  ├─ Description
│  ├─ Contact info
│  └─ Select button
└─ Loading state (while fetching)

Data Flow:
1. Component mounts
2. If demo mode:
   - Loads mock organizations from mockData.ts
3. If real mode:
   - Calls: supabase.from('organizations').select('*')
   - Filters: is_active = true

Navigation:
User clicks organization card
  → handleOrgSelect(org)
  → setSelectedOrg(org)
  → setCurrentView('login')
  → Shows LoginPage with selected org

State Management:
- organizations: Organization[] (from Supabase or mock)
- selectedOrg: Organization | null (parent state in App.tsx)
```

---

### 3. LOGIN PAGE
```
URL: / (implicit, state-based)
Component: src/modules/auth/LoginPage.tsx

Features:
├─ Organization Header
├─ Email input
├─ Password input
├─ Sign in button
├─ Demo Accounts Quick Access (if demo mode)
│  ├─ Admin account
│  ├─ Supervisor account
│  ├─ Teacher account
│  ├─ Student account
│  └─ Parent account
├─ "Register" link
└─ "Back to organizations" link

Auth Flow:
1. User enters email + password
2. Calls: useAuth().signIn(email, password)
3. AuthContext handles:
   - If demo mode:
     * Checks mockUsers
     * Sets demo session in localStorage
   - If real mode:
     * Calls: supabase.auth.signInWithPassword()
     * Fetches profile from 'profiles' table
     * Joins with organization data

Success:
- AuthContext updates: user, profile, organization
- App.tsx detects: user && profile && organization
- Automatically: setCurrentView('dashboard')

Navigation:
"تسجيل" (Register)
  → onRegister()
  → setCurrentView('register')
  → Shows JoinRequestForm

"العودة" (Back)
  → onBack()
  → setCurrentView('org-selector')
  → Shows OrganizationSelector
```

---

### 4. REGISTER PAGE (Join Request Form)
```
URL: / (implicit, state-based)
Component: src/modules/site/JoinRequestForm.tsx

Features:
├─ Full Name input
├─ Email input
├─ Phone input
├─ Role selection
│  ├─ Student
│  ├─ Teacher
│  └─ Parent
├─ Guardian info (if role = student)
├─ Qualifications (if role = teacher)
├─ Submit button
└─ Terms & conditions

Submission:
1. User fills form
2. Validates all required fields
3. Creates join_request record

If demo mode:
- Stores in memory only
- Shows success message

If real mode:
- Calls: supabase.from('join_requests').insert()
- Stores in 'join_requests' table with status = 'pending'

Success Callback:
- Shows: "تم إرسال طلبك بنجاح"
- After delay: onSuccess()
- Redirects: setCurrentView('login')

Navigation:
"العودة" (Back)
  → onBack()
  → setCurrentView('login')
```

---

### 5. DASHBOARD (Role-Based)
```
URL: / (implicit, state-based)
Component: Depends on profile.role

Routing Logic (in App.tsx):
switch (profile.role) {
  case 'admin':
    return <AdminDashboard {...props} />;
  case 'supervisor':
    return <SupervisorDashboard {...props} />;
  case 'teacher':
    return <TeacherDashboard {...props} />;
  case 'student':
    return <StudentDashboard {...props} />;
  case 'parent':
    return <ParentDashboard {...props} />;
}

Props Passed:
- user: Profile (current user data)
- organization: Organization (current org data)
```

---

### 5.1 ADMIN DASHBOARD
```
URL: / (implicit, state-based)
Component: src/modules/admin/AdminDashboard.tsx

Navigation Menu:
├─ Overview (default)
├─ Users Management
├─ Circles Management
├─ Recitations
├─ Reports
├─ Parent-Child Links
├─ Join Requests
└─ Settings

Sub-Component Switching:
const [currentSection, setCurrentSection] = useState('overview');

Renders:
{currentSection === 'overview' && <OverviewStats ... />}
{currentSection === 'users' && <EnhancedUsersManagement ... />}
{currentSection === 'circles' && <CirclesManagement ... />}
{currentSection === 'recitations' && <RecitationsPage ... />}
{currentSection === 'reports' && <ReportsPage ... />}
{currentSection === 'parent-link' && <ParentStudentLink ... />}
{currentSection === 'join-requests' && <JoinRequestsManagement ... />}
{currentSection === 'settings' && <SettingsPage ... />}

ADMIN Features:
├─ Dashboard Overview
│  ├─ Total students count
│  ├─ Active circles
│  ├─ Total teachers
│  ├─ Total recitations
│  ├─ Today's attendance
│  ├─ Weekly recitations
│  ├─ Pending requests
│  └─ Recent activity
├─ Users Management
│  ├─ View all users
│  ├─ Add new user
│  ├─ Edit user (name, role, status)
│  ├─ Delete user
│  ├─ Suspend user
│  ├─ Approve join requests
│  └─ Filter/search users
├─ Circles Management
│  ├─ Create circle
│  ├─ Assign teacher to circle
│  ├─ Manage student enrollment
│  ├─ Edit circle details
│  └─ Delete circle
├─ Recitations Management
│  ├─ View all recitations
│  ├─ Filter by student/teacher/date
│  └─ Export reports
├─ Reports & Analytics
│  ├─ Student progress reports
│  ├─ Teacher performance
│  ├─ Circle statistics
│  └─ Export (CSV/PDF)
└─ Organization Settings
   ├─ Basic info
   ├─ Contact details
   └─ System settings
```

---

### 5.2 SUPERVISOR DASHBOARD
```
URL: / (implicit, state-based)
Component: src/modules/supervisor/SupervisorDashboard.tsx

Navigation Menu:
├─ Overview
├─ Teachers Management
├─ Circles Management
├─ Recitations
├─ Reports
└─ Settings

Features:
├─ View all teachers
├─ Monitor teacher performance
├─ Manage circles (all in org)
├─ View attendance patterns
├─ Generate reports
└─ System settings
```

---

### 5.3 TEACHER DASHBOARD
```
URL: / (implicit, state-based)
Component: src/modules/teacher/TeacherDashboard.tsx

Navigation Menu:
├─ Overview
├─ My Students
├─ My Circles
├─ Attendance Recorder
├─ Record Recitations
├─ Daily Assignments
├─ QR Code Scanner
└─ Settings

Features:
├─ View assigned circles
├─ Manage enrolled students
├─ Record attendance for circles
├─ Record student recitations
├─ Assign daily tasks
├─ Scan student QR codes
└─ View my statistics
```

---

### 5.4 STUDENT DASHBOARD
```
URL: / (implicit, state-based)
Component: src/modules/student/StudentDashboard.tsx

Navigation Menu:
├─ Overview
├─ My Memorization
├─ My Assignments
├─ My Attendance
├─ My QR Code
└─ Settings

Features:
├─ View enrolled circle
├─ View attendance records
├─ View recitation history
├─ Track memorization progress
├─ View achievements
└─ Generate personal QR code
```

---

### 5.5 PARENT DASHBOARD
```
URL: / (implicit, state-based)
Component: src/modules/parent/ParentDashboard.tsx

Navigation Menu:
├─ Overview
├─ My Children
├─ Progress Tracking
└─ Settings

Features:
├─ View linked children list
├─ View each child's circle
├─ View each child's teacher
├─ Track child's progress
├─ View attendance for each child
└─ View child's achievements
```

---

## 📡 API STRUCTURE (Currently Missing)

### Current Implementation: ⚠️ DIRECT SUPABASE CALLS

```typescript
// No REST API - Direct client-side calls to Supabase
const response = await supabase
  .from('profiles')
  .select('*')
  .eq('organization_id', org_id);
```

### Problems:
1. ❌ No validation server-side
2. ❌ No request logging
3. ❌ No rate limiting
4. ❌ No business logic isolation
5. ❌ Auth keys exposed in frontend code (secure by RLS, but not ideal)

---

## 🎯 RECOMMENDED ARCHITECTURE (Production)

### Option 1: Keep Direct Supabase (Current)
```
Frontend (React)
  ↓ Direct Supabase Client
Supabase (PostgreSQL + Auth)
  ↓ RLS Policies enforce security
Database
```

**Pros:**
- ✅ Simple, no backend needed
- ✅ Real-time possible (Realtime subscriptions)
- ✅ Fast, low latency
- ✅ Cheap (no server costs)

**Cons:**
- ❌ No server-side validation
- ❌ No custom business logic
- ❌ No request logging/audit trail
- ❌ Limited to Supabase features

---

### Option 2: Add Node.js/Express Backend (Recommended for Scale)
```
Frontend (React)
  ↓ HTTP REST API
Backend (Node.js/Express)
  ↓ Validation + Business Logic
  ↓ Supabase Client (with service key)
Supabase (PostgreSQL + Auth)
  ↓ RLS policies (secondary defense)
Database
```

**Endpoints would be:**
```
POST   /api/v1/users
GET    /api/v1/users
GET    /api/v1/users/:userId
PUT    /api/v1/users/:userId
DELETE /api/v1/users/:userId
PATCH  /api/v1/users/:userId/role

POST   /api/v1/circles
GET    /api/v1/circles
PUT    /api/v1/circles/:circleId
DELETE /api/v1/circles/:circleId

POST   /api/v1/attendance
GET    /api/v1/attendance
PUT    /api/v1/attendance/:attendanceId

POST   /api/v1/recitations
GET    /api/v1/recitations
PUT    /api/v1/recitations/:recitationId

GET    /api/v1/reports/dashboard
GET    /api/v1/reports/student/:studentId
GET    /api/v1/reports/teacher/:teacherId
GET    /api/v1/reports/circle/:circleId

POST   /api/v1/audit-logs
GET    /api/v1/audit-logs

POST   /api/v1/auth/login
POST   /api/v1/auth/signup
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
```

---

## 🔐 AUTHENTICATION FLOW

### Current: Supabase Auth (Direct)

```
User enters credentials
  ↓
LoginPage calls: useAuth().signIn(email, password)
  ↓
AuthContext calls: supabase.auth.signInWithPassword()
  ↓
Supabase returns: User + Session
  ↓
onAuthStateChange callback fires
  ↓
AuthContext fetches: profile from 'profiles' table
  ↓
Joins with: organization data
  ↓
Updates Context state: user, profile, organization
  ↓
App.tsx detects: user && profile
  ↓
Automatically navigates to dashboard (by role)
```

### Session Management:
```typescript
// Stored by Supabase Auth (in localStorage)
{
  access_token: "...",
  refresh_token: "...",
  user: {
    id: "...",
    email: "...",
    role: "..." // in user_metadata
  }
}
```

---

## 🗺️ SITE MAP

```
Application Hierarchy:

ROOT (App.tsx)
├── State: currentView, selectedOrg, user, profile, organization
├── AuthProvider wrapper
└── Conditional rendering by currentView:

    1. LANDING PAGE
       └─ LandingPage.tsx
          ├─ Hero Section
          ├─ Features Grid
          ├─ Roles Overview
          ├─ Statistics
          └─ Call to Action buttons

    2. ORGANIZATION SELECTOR
       └─ OrganizationSelector.tsx
          └─ Organization List (from Supabase or mock)

    3. LOGIN PAGE
       └─ LoginPage.tsx
          ├─ Email/Password form
          ├─ Demo quick access
          ├─ Register link
          └─ Back button

    4. REGISTER PAGE
       └─ JoinRequestForm.tsx
          ├─ User info form
          ├─ Role selection
          ├─ Guardian info (student)
          └─ Qualifications (teacher)

    5. DASHBOARD (by role)
       ├─ AdminDashboard.tsx
       │  ├─ Layout (sidebar + content)
       │  └─ Section components:
       │     ├─ Overview stats
       │     ├─ EnhancedUsersManagement.tsx
       │     ├─ CirclesManagement.tsx
       │     ├─ RecitationsPage.tsx
       │     ├─ ReportsPage.tsx
       │     ├─ ParentStudentLink.tsx
       │     ├─ JoinRequestsManagement.tsx
       │     └─ SettingsPage.tsx
       │
       ├─ SupervisorDashboard.tsx
       │  ├─ Layout
       │  └─ Filtered view of admin features
       │
       ├─ TeacherDashboard.tsx
       │  ├─ Layout
       │  └─ Teacher-specific sections:
       │     ├─ MyStudentsPage.tsx
       │     ├─ TeacherCirclesPage.tsx
       │     ├─ AttendanceRecorder.tsx
       │     ├─ EnhancedRecitationPage.tsx
       │     ├─ DailyAssignmentsPage.tsx
       │     └─ QRCodeScanner.tsx
       │
       ├─ StudentDashboard.tsx
       │  ├─ Layout
       │  └─ Student-specific sections:
       │     ├─ StudentMemorizationPage.tsx
       │     ├─ StudentAssignmentsPage.tsx
       │     ├─ AttendancePage.tsx
       │     └─ StudentQRCode.tsx
       │
       └─ ParentDashboard.tsx
          ├─ Layout
          └─ Parent-specific sections:
             ├─ ParentChildrenPage.tsx
             └─ Progress tracking

    6. SHARED COMPONENTS (used across roles)
       ├─ DashboardLayout.tsx
       ├─ AttendancePage.tsx
       ├─ RecitationsPage.tsx
       ├─ ReportsPage.tsx
       ├─ SettingsPage.tsx
       ├─ CirclesManagement.tsx
       ├─ EnhancedRecitationPage.tsx
       ├─ DailyAssignmentsPage.tsx
       ├─ QRCodeScanner.tsx
       └─ IndividualStudentReports.tsx
```

---

## 🚀 MIGRATION TO URL-BASED ROUTING

If you want to add proper URL-based routing with React Router:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/organizations" element={<OrganizationSelector />} />
    <Route path="/auth/login" element={<LoginPage />} />
    <Route path="/auth/register" element={<JoinRequestForm />} />

    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="overview" element={<Overview />} />
        
        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route path="users" element={<EnhancedUsersManagement />} />
          <Route path="circles" element={<CirclesManagement />} />
          <Route path="recitations" element={<RecitationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* Teacher routes */}
        <Route element={<TeacherRoute />}>
          <Route path="students" element={<MyStudentsPage />} />
          <Route path="circles" element={<TeacherCirclesPage />} />
          <Route path="attendance" element={<AttendanceRecorder />} />
        </Route>

        {/* Student routes */}
        <Route element={<StudentRoute />}>
          <Route path="memorization" element={<StudentMemorizationPage />} />
          <Route path="assignments" element={<StudentAssignmentsPage />} />
        </Route>

        {/* Parent routes */}
        <Route element={<ParentRoute />}>
          <Route path="children" element={<ParentChildrenPage />} />
        </Route>
      </Route>
    </Route>

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

**Benefits:**
- ✅ Browser back button works
- ✅ Shareable links
- ✅ Browser history
- ✅ SEO (if needed)
- ✅ Easier debugging

---

## 📊 SUMMARY

| Aspect | Current | Issues | Recommended |
|--------|---------|--------|-------------|
| **Routing** | State-based | No browser history | URL-based (React Router) |
| **API** | Direct Supabase | No middleware | REST API + validation |
| **Auth** | Supabase Auth | Simple but limited | Keep Supabase + add refresh logic |
| **Navigation** | Manual setters | Error-prone | Use useNavigate() hook |
| **Protected Routes** | Manual checks | Can be bypassed | Route guards |
| **Session** | localStorage | Auto-managed | Improve refresh token handling |

