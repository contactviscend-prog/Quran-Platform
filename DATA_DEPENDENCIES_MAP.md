# 🔗 DATA INTERCONNECTEDNESS MAP
## Component-to-Database Dependencies Reference Guide

---

## 🗺️ I. DATABASE ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE SCHEMA                                │
└─────────────────────────────────────────────────────────────���───────────┘

                              organizations
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              [1:Many]        [1:Many]        [1:Many]
                    │               │               │
                    ▼               ▼               ▼
                profiles        circles        join_requests
                (users)            │                │
                    │              │                │
          [Roles]   │              │                │
        ┌─┬─┬─┬─┬─┐│         [FK: teacher_id]      │
        │ │ │ │ │ ││              │                │
        A S T St P ├─[1:Many]─────┘                │
        │ │ │ │ │ │                              [1:1]
        │ │ │ │ │ └──[1:Many]──────────────────────┘
        │ │ │ │ │
        │ │ │ │ └─ parent_children_links ◄──────┐
        │ │ │ │    (Many:Many junction)         │
        │ │ │ │           │                      │
        │ │ │ │      [FK: student_id]            │
        │ │ │ │      [FK: parent_id]─────────────┘
        │ │ │ │           │
        │ │ │ │           │
        │ │ │ │     circle_enrollments
        │ │ │ │     (Many:Many junction)
        │ │ │ │           │
        │ │ │ │      [FK: student_id]
        │ │ │ │      [FK: circle_id]
        │ │ │ │           │
        │ │ │ │    ┌──────┼──────┐
        │ │ │ │    │      │      │
        │ │ │ │    ▼      ▼      ▼
        │ │ │ │  attendance  recitations
        │ │ │ │    │            │
        │ │ │ │    │      [FK: student_id]
        │ │ │ │    │      [FK: teacher_id]
        │ │ │ │    │      [FK: circle_id]
        │ │ │ │    │            │
        │ │ │ │    └─[FK: circle_id]
        │ │ │ │              
        │ │ │ └─ notifications
        │ │ │    [FK: user_id]
        │ │ │
        │ │ └─ audit_logs (future)
        │ │ └─ assignments (future)
        │ └─ badges (future)
        │ └─ achievements (future)
        │
        ├─ teachers (many)
        ├─ supervisors (many)
        ├─ students (many)
        ├─ parents (many)
        └─ admins (many)

Legend:
A = admin, S = supervisor, T = teacher, St = student, P = parent
```

---

## 📊 II. DATA MODEL DEPENDENCY CHAINS

### Chain 1: Organization → Users → Roles → Access
```
Organization
  └─ id
     └─ profiles.organization_id
        └─ profile.role
           ├─ admin (view all org data)
           ├─ supervisor (view filtered data)
           ├─ teacher (view own circles)
           ├─ student (view own enrollment)
           └─ parent (view linked children)
```

### Chain 2: Circle → Students → Attendance & Recitations
```
Circle
  └─ id
     ├─ circle_enrollments.circle_id
     │  └─ circle_enrollments.student_id
     │     └─ profiles.id (student profile)
     │
     ├─ attendance.circle_id
     │  └─ Attendance Status for each circle session
     │
     └─ recitations.circle_id
        └─ Recitation records for each student in circle
           └─ Progress metrics calculated from these
```

### Chain 3: Student Progress Tracking
```
Student (Profile with role='student')
  ├─ circle_enrollments
  │  └─ which circles they're enrolled in
  │     ├─ attendance records per circle
  │     │  └─ presence statistics
  │     │
  │     └─ recitations per circle
  │        ├─ surah progress
  │        ├─ ayah range covered
  │        ├─ grades earned
  │        └─ mistakes tracked
  │
  └─ calculated metrics:
     ├─ total pages memorized
     ├─ total surahs memorized
     ├─ average grade
     ├─ attendance rate
     ├─ weekly progress
     └─ points earned
```

### Chain 4: Parent → Linked Children → Children's Data
```
Parent (Profile with role='parent')
  └─ parent_children_links.parent_id
     └─ parent_children_links.student_id
        └─ Student's Full Data:
           ├─ profile (name, level, etc)
           ├─ circle_enrollments
           │  └─ circles they're in
           ├─ attendance
           │  └─ when and if they attended
           ├─ recitations
           │  └─ what they've memorized
           └─ calculated progress
```

### Chain 5: Teacher Authority
```
Teacher (Profile with role='teacher')
  ├─ circles WHERE teacher_id = profile.id
  │  ├─ circle_enrollments for this circle
  │  │  └─ student profiles
  │  │
  │  └─ attendance records for this circle
  │     └─ Which students attended when
  │
  └─ recitations WHERE teacher_id = profile.id
     └─ Records this teacher assessed
```

---

## 🔄 III. COMPONENT-TO-TABLE MAPPING

### AUTH FLOW
```
src/contexts/AuthContext.tsx
  ├─ Uses Table: auth.users (Supabase built-in)
  │  └─ signInWithPassword() → fetches user
  │
  ├─ Uses Table: profiles
  │  └─ fetchProfile() → gets profile data
  │     └─ includes: organization details
  │
  └─ Local Storage
     └─ demo_session (in demo mode)
```

### ADMIN DASHBOARD
```
src/modules/admin/AdminDashboard.tsx
  ├─ Fetches:
  │  ├─ profiles (all, filtered by organization)
  │  │  └─ count by role
  │  ├─ circles (all in organization)
  │  ├─ circle_enrollments (for enrollment counts)
  │  ├─ attendance (all in organization)
  │  ├─ recitations (all in organization)
  │  ├─ join_requests (pending)
  │  └─ recent_activity (generated from above)
  │
  └─ Aggregates:
     ├─ totalStudents (count profiles where role='student')
     ├─ activeCircles (count circles where is_active=true)
     ├─ totalTeachers (count profiles where role='teacher')
     ├─ totalRecitations (count recitations)
     ├─ todayAttendance (count attendance where date=today)
     ├─ pendingRequests (count join_requests where status='pending')
     └─ activeUsers (count profiles where status='active')
```

### ADMIN: CIRCLES MANAGEMENT
```
src/modules/admin/CirclesManagement.tsx
  ├─ Fetches:
  │  ├─ circles (all in organization)
  │  ├─ circle_enrollments (for each circle)
  │  │  └─ student count
  │  ├─ profiles WHERE role='teacher' (for assignment)
  │  └─ profiles WHERE role='student' (for enrollment)
  │
  └─ Actions:
     ├─ CREATE circle
     ├─ UPDATE circle
     ├─ DELETE circle (soft/hard)
     ├─ ASSIGN teacher to circle
     ├─ ADD students to circle
     └─ REMOVE students from circle
```

### ADMIN: USERS MANAGEMENT
```
src/modules/admin/EnhancedUsersManagement.tsx
  ├─ Fetches:
  │  ├─ profiles (all in organization)
  │  ├─ join_requests (pending)
  │  └─ parent_children_links (for parent verification)
  │
  └─ Actions:
     ├─ CREATE user (manual entry or from join request)
     ├─ UPDATE user profile
     ├─ CHANGE user role
     ├─ ACTIVATE/DEACTIVATE user
     └─ DELETE user
```

### ADMIN: JOIN REQUESTS MANAGEMENT
```
src/modules/admin/JoinRequestsManagement.tsx
  ├─ Fetches:
  │  └─ join_requests (all in organization)
  │
  └─ Actions:
     ├─ APPROVE join_request
     │  └─ CREATE new profile with request data
     ├─ REJECT join_request
     │  └─ UPDATE status + rejection_reason
     └─ VIEW request details
```

### TEACHER DASHBOARD
```
src/modules/teacher/TeacherDashboard.tsx
  ├─ Fetches:
  │  ├─ circles WHERE teacher_id = user.id
  │  ├─ circle_enrollments WHERE circle is mine
  │  │  └─ student profiles
  │  ├─ attendance WHERE circle is mine (today)
  │  ├─ recitations WHERE teacher_id = user.id (recent)
  │  └─ recent_activity (filtered)
  │
  └─ Aggregates:
     ├─ totalStudents (sum of all enrollments)
     ├─ todayRecitations (count recitations where date=today)
     ├─ todayAttendance (count attendance where date=today)
     └─ activeCircles (count circles where is_active=true)
```

### TEACHER: MY STUDENTS PAGE
```
src/modules/teacher/MyStudentsPage.tsx
  ├─ Fetches:
  │  ├─ circle_enrollments WHERE circle_id IN (my circles)
  │  │  └─ student profiles (joined)
  │  ├─ attendance FOR each student (recent)
  │  ├─ recitations FOR each student (recent)
  │  ���─ calculated metrics per student
  │
  └─ Displays:
     ├─ Student list with status badges
     ├─ Recent attendance records
     ├─ Recent recitations
     └─ Performance metrics
```

### TEACHER: CIRCLES PAGE
```
src/modules/teacher/TeacherCirclesPage.tsx
  ├─ Fetches:
  │  ├─ circles WHERE teacher_id = user.id
  │  ├─ circle_enrollments FOR each circle
  │  │  └─ student count
  │  └─ recent attendance per circle
  │
  └─ Actions:
     ├─ VIEW circle details
     ├─ MANAGE enrollments
     └─ VIEW attendance summary
```

### TEACHER: RECITATIONS PAGE
```
src/modules/shared/EnhancedRecitationPage.tsx
  ├─ Fetches:
  │  ├─ circle_enrollments WHERE circle_id IN (my circles)
  │  │  └─ student profiles
  │  └─ quran_data (surah & ayah info)
  │
  └─ Actions:
     ├─ SELECT student
     ├─ SELECT surah & ayah range
     ├─ RATE performance (grade)
     ├─ COUNT mistakes
     └─ SAVE recitation
        └─ INSERT into recitations table
```

### TEACHER: ATTENDANCE RECORDER
```
src/modules/shared/AttendanceRecorder.tsx
  ├─ Fetches:
  │  ├─ circles WHERE teacher_id = user.id
  │  ├─ circle_enrollments FOR selected circle
  │  │  └─ student profiles
  │  └─ existing attendance for date
  │
  └─ Actions:
     ├─ SELECT circle
     ├─ FOR each student: mark status
     ├─ SAVE attendance
     └─ Each record inserts to attendance table
```

### STUDENT DASHBOARD
```
src/modules/student/StudentDashboard.tsx
  ├─ Fetches:
  │  ├─ circle_enrollments WHERE student_id = user.id
  │  │  └─ circles data (from joined table)
  │  │     └─ teacher name
  │  ├─ attendance WHERE student_id = user.id
  │  ├─ recitations WHERE student_id = user.id
  │  └─ calculated metrics
  │
  └─ Displays:
     ├─ Current circle
     ├─ Current teacher
     ├─ Total recitations count
     ├─ Weekly progress
     ├─ Attendance rate
     ├─ Points earned
     └─ Recent recitation grades
```

### STUDENT: MEMORIZATION PAGE
```
src/modules/student/StudentMemorizationPage.tsx
  ├─ Fetches:
  │  ├─ recitations WHERE student_id = user.id
  │  ├─ quran_data (for surah references)
  │  └─ calculated progress
  │
  └─ Displays:
     ├─ Total pages memorized
     ├─ Total surahs memorized
     ├─ Recent recitation history
     ├─ Grade distribution
     └─ Progress timeline
```

### PARENT DASHBOARD
```
src/modules/parent/ParentDashboard.tsx
  ├─ Fetches:
  │  ├─ parent_children_links WHERE parent_id = user.id
  │  │  └─ student_id array
  │  ├─ For EACH child:
  │  │  ├─ profiles (child data)
  │  │  ├─ circle_enrollments
  │  │  │  └─ circles data
  │  │  ├─ attendance (child's records)
  │  │  ├─ recitations (child's records)
  │  │  └─ calculated metrics per child
  │  │
  │  └─ Aggregate all children's data
  │
  └─ Displays:
     ├─ List of linked children
     ├─ Each child's circle
     ├─ Each child's teacher
     ├─ Each child's recitations count
     ├─ Each child's attendance count
     └─ Overall progress dashboard
```

### PARENT: CHILDREN PAGE
```
src/modules/parent/ParentChildrenPage.tsx
  ├─ Fetches:
  │  ├─ parent_children_links WHERE parent_id = user.id
  │  ├─ For EACH linked child:
  │  │  ├─ full profile
  │  │  ├─ circle_enrollments
  │  │  │  └─ circle details
  │  │  ├─ recent attendance
  │  │  └─ recent recitations
  │  │
  │  └─ Display detailed info per child
  │
  └─ Actions:
     ├─ VIEW child details
     ├─ VIEW child's circle
     └─ VIEW child's progress
```

### SUPERVISOR DASHBOARD
```
src/modules/supervisor/SupervisorDashboard.tsx
  ├─ Fetches:
  │  ├─ profiles WHERE role='teacher' (in organization)
  │  ├─ circles (all in organization)
  │  ├─ circle_enrollments (for stats)
  │  ├─ attendance (all in organization)
  │  ├─ recitations (all in organization)
  │  └─ calculated aggregates
  │
  └─ Displays:
     ├─ Teacher list with status
     ├─ Circle list with capacity
     ├─ Attendance statistics
     ├─ Recitation statistics
     └─ Performance reports
```

### SHARED: ATTENDANCE PAGE
```
src/modules/shared/AttendancePage.tsx
  ├─ Filter by:
  │  ├─ organizationId
  │  ├─ userRole (admin/supervisor/teacher/student)
  │  └─ selectedDate
  │
  ├─ Fetches:
  │  └─ attendance WHERE organization_id & date
  │     ├─ student_id → joined profiles
  │     └─ circle_id → joined circles
  │
  └─ Displays:
     ├─ Attendance records by date
     ├─ Student names & status
     ├─ Notes per record
     └─ Filtered by role access
```

### SHARED: RECITATIONS PAGE
```
src/modules/shared/RecitationsPage.tsx
  ├─ Fetches:
  │  ├─ recitations WHERE organization_id & filters
  │  ├��� student_id → joined profiles
  │  ├─ teacher_id → joined profiles
  │  ├─ circle_id → joined circles
  │  └─ quran_data (for surah references)
  │
  └─ Displays:
     ├─ Recitation history
     ├─ Student/teacher names
     ├─ Surah & ayah range
     ├─ Grade & mistakes
     └─ Date & notes
```

### SHARED: REPORTS PAGE
```
src/modules/shared/ReportsPage.tsx
  ├─ Fetches:
  │  ├─ attendance (organization-wide or filtered)
  │  ├─ recitations (organization-wide or filtered)
  │  ├─ profiles (for statistics)
  │  └─ Aggregates for:
  │     ├─ Attendance rates per student
  │     ├─ Grade distributions
  │     ├─ Progress per circle
  │     ├─ Teacher performance
  │     └─ Student achievement
  │
  └─ Exports:
     ├─ CSV format
     └─ PDF format
```

---

## 🎯 IV. ROLE-BASED DATA ACCESS MATRIX

```
┌─────────────┬───────┬───────────┬────────────┬────────────┬─────────┐
│ Resource    │ Admin │Supervisor │  Teacher   │  Student   │ Parent  │
├─────────────┼───────┼───────────┼────────────┼────────────┼─────────┤
│ All Profiles│  ✅   │ Teachers  │  Students  ���  Own Only  │ Linked  │
│             │       │ in Org    │ in Circles │            │ Children│
├─────────────┼───────┼───────────┼────────────┼────────────┼─────────┤
│ All Circles │  ✅   │    ✅     │  Own Only  │  Own Only  │  N/A    │
├─────────────┼───────┼───────────┼────────────┼────────────┼─────────┤
│ Attendance  │ All   │    All    │ Own Circle │   Own      │  Child  │
│             │       │    Org    │ Students   │ Records    │ Records │
├─────────────┼───────┼───────────┼────────────┼────────────┼─────────┤
│ Recitations │ All   │    All    │ Own        │   Own      │  Child  │
│             │       │    Org    │ Records    │ Records    │ Records │
├─────────────┼───────┼───────────┼────────────┼��───────────┼─────────┤
│ Join Req.   │ Full  │    ❌     │    ❌      │    ❌      │   ❌    │
├─────────────┼───────┼───────────┼────────────┼────────────┼─────────┤
│ Enroll.     │  ✅   │    ✅     │ View Own   │  View Own  │   N/A   │
│             │  (All)│  (All)    │ Only       │ Only       │         │
├─────────────┼───────┼───────────┼────────────┼────────────┼─────────┤
│ Notify.     │  Own  │    Own    │    Own     │    Own     │  Own    │
└─────────────┴───────┴───────────┴────────────┴────────────┴─────────┘

✅ = Full Access
Specific = Limited Access
❌ = No Access
```

---

## 📈 V. QUERY PATTERNS BY COMPONENT

### Pattern 1: Admin Fetch Organization Data
```typescript
// Get all org users
supabase
  .from('profiles')
  .select('*')
  .eq('organization_id', org.id)

// Get user counts by role
supabase
  .from('profiles')
  .select('role')
  .eq('organization_id', org.id)
  // then group by role

// Get all circles with enrollment stats
supabase
  .from('circles')
  .select(`*, 
    circle_enrollments(id)
  `)
  .eq('organization_id', org.id)
  // then count enrollments
```

### Pattern 2: Teacher Fetch Their Data
```typescript
// Get my circles
supabase
  .from('circles')
  .select('*')
  .eq('teacher_id', user.id)

// Get my students (via enrollments)
supabase
  .from('circle_enrollments')
  .select(`
    circle_id,
    student:profiles(*)
  `)
  .in('circle_id', myCircleIds)

// Get my recent recitations
supabase
  .from('recitations')
  .select(`
    *,
    student:profiles(full_name)
  `)
  .eq('teacher_id', user.id)
  .order('date', { ascending: false })
  .limit(10)
```

### Pattern 3: Student Fetch Their Progress
```typescript
// Get my enrollment
supabase
  .from('circle_enrollments')
  .select(`
    circle:circles(*)
  `)
  .eq('student_id', user.id)
  .single()

// Get my attendance
supabase
  .from('attendance')
  .select('*')
  .eq('student_id', user.id)

// Get my recitations
supabase
  .from('recitations')
  .select('*')
  .eq('student_id', user.id)
  .order('date', { ascending: false })
```

### Pattern 4: Parent Fetch Children Data
```typescript
// Get linked children
supabase
  .from('parent_children_links')
  .select(`
    student_id,
    student:profiles(*)
  `)
  .eq('parent_id', user.id)

// For each child, get their data
supabase
  .from('circle_enrollments')
  .select(`
    circle:circles(name, teacher_id)
  `)
  .eq('student_id', childId)

// Get child's attendance
supabase
  .from('attendance')
  .select('*')
  .eq('student_id', childId)

// Get child's recitations
supabase
  .from('recitations')
  .select('*')
  .eq('student_id', childId)
```

---

## 🔐 VI. REQUIRED RLS POLICIES

### Organizations Table
```sql
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Anyone can read active organizations
CREATE POLICY org_select_active
ON organizations FOR SELECT
USING (is_active = true);

-- Only admins in org can update
CREATE POLICY org_update_admin
ON organizations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = organizations.id
    AND profiles.role = 'admin'
  )
);
```

### Profiles Table
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Can read profiles in same org (with role restrictions)
CREATE POLICY profile_read_org
ON profiles FOR SELECT
USING (
  organization_id = (
    SELECT organization_id FROM profiles
    WHERE id = auth.uid()
  )
);

-- Can only update own profile
CREATE POLICY profile_update_own
ON profiles FOR UPDATE
USING (id = auth.uid());
```

### Circles Table
```sql
-- Enable RLS
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;

-- Can read circles in same org
CREATE POLICY circles_read_org
ON circles FOR SELECT
USING (
  organization_id = (
    SELECT organization_id FROM profiles
    WHERE id = auth.uid()
  )
);

-- Teachers can only create in their org
CREATE POLICY circles_create_admin
ON circles FOR INSERT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'supervisor')
  )
);
```

### Circle Enrollments
```sql
-- Enable RLS
ALTER TABLE circle_enrollments ENABLE ROW LEVEL SECURITY;

-- Students can only see their enrollments
CREATE POLICY enrollment_read
ON circle_enrollments FOR SELECT
USING (
  student_id = auth.uid()
  OR
  -- Teachers can see enrollments in their circles
  (SELECT teacher_id FROM circles 
   WHERE id = circle_id) = auth.uid()
  OR
  -- Admins/supervisors in org can see all
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'supervisor')
  )
);
```

### Attendance Table
```sql
-- Enable RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Students see only their records
-- Teachers see circle records
-- Admins see all
CREATE POLICY attendance_read
ON attendance FOR SELECT
USING (
  student_id = auth.uid()
  OR
  (SELECT teacher_id FROM circles 
   WHERE id = circle_id) = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'supervisor')
  )
);

-- Only teachers in circle can insert
CREATE POLICY attendance_insert
ON attendance FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM circles
    WHERE id = circle_id
    AND teacher_id = auth.uid()
  )
);
```

### Recitations Table
```sql
-- Enable RLS  
ALTER TABLE recitations ENABLE ROW LEVEL SECURITY;

-- Similar to attendance - read own or in role
CREATE POLICY recitations_read
ON recitations FOR SELECT
USING (
  student_id = auth.uid()
  OR
  teacher_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'supervisor')
  )
);
```

### Parent-Children Links
```sql
-- Enable RLS
ALTER TABLE parent_children_links ENABLE ROW LEVEL SECURITY;

-- Parents can only see links they own
CREATE POLICY parent_links_read
ON parent_children_links FOR SELECT
USING (parent_id = auth.uid());

-- Admins can create links
CREATE POLICY parent_links_insert
ON parent_children_links FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

---

## 💾 VII. INDEXES FOR PERFORMANCE

```sql
-- Frequently queried columns
CREATE INDEX idx_profiles_org_role 
  ON profiles(organization_id, role);

CREATE INDEX idx_circles_org_teacher 
  ON circles(organization_id, teacher_id);

CREATE INDEX idx_circle_enrollments_circle 
  ON circle_enrollments(circle_id);

CREATE INDEX idx_circle_enrollments_student 
  ON circle_enrollments(student_id);

CREATE INDEX idx_attendance_org_date 
  ON attendance(organization_id, date);

CREATE INDEX idx_attendance_student_date 
  ON attendance(student_id, date);

CREATE INDEX idx_recitations_student 
  ON recitations(student_id);

CREATE INDEX idx_recitations_teacher 
  ON recitations(teacher_id);

CREATE INDEX idx_join_requests_org_status 
  ON join_requests(organization_id, status);

CREATE INDEX idx_parent_links_parent 
  ON parent_children_links(parent_id);

CREATE INDEX idx_parent_links_student 
  ON parent_children_links(student_id);
```

---

## 📋 VIII. DATA VALIDATION RULES

### Profiles
- `full_name`: Required, 3-100 chars
- `email`: Valid email format, unique per org
- `phone`: Valid format, 7-15 digits
- `role`: Must be one of admin|supervisor|teacher|student|parent
- `status`: Must be one of active|inactive|pending|suspended
- `organization_id`: Must exist in organizations

### Circles
- `name`: Required, 3-100 chars
- `organization_id`: Must exist
- `teacher_id`: If set, must be valid teacher in org
- `level`: Must be beginner|intermediate|advanced
- `max_students`: Must be > 0
- `is_active`: Boolean

### Attendance
- `student_id`: Must exist & be student role
- `circle_id`: Must exist
- `organization_id`: Must match circle's org
- `date`: Valid date
- `status`: Must be present|absent|late|excused
- `recorded_by`: If set, must be teacher

### Recitations
- `student_id`: Must exist & be student
- `teacher_id`: Must exist & be teacher
- `circle_id`: Must exist
- `surah_number`: 1-114
- `from_ayah`: Must be valid
- `to_ayah`: Must be ≥ from_ayah
- `grade`: Must be excellent|very_good|good|acceptable|needs_improvement
- `mistakes_count`: Must be ≥ 0

### Join Requests
- `full_name`: Required
- `email`: Valid email
- `phone`: Valid format
- `requested_role`: Must be student|teacher|parent
- `status`: Must be pending|approved|rejected

---

## 🔄 IX. SYNC & REAL-TIME PATTERNS

### Currently Missing (Demo Mode Only)
```typescript
// These should use Supabase real-time subscriptions:
supabase
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'attendance',
      filter: `organization_id=eq.${orgId}`
    },
    (payload) => {
      // Update local state with new data
      refreshAttendanceData();
    }
  )
  .subscribe();
```

### To Enable Real-Time:
1. Enable Realtime in Supabase dashboard
2. Subscribe to table changes in each component
3. Update local state when data changes
4. Remove setInterval polling

---

## 🎯 X. SUMMARY TABLE

| Aspect | Current | Needed | Status |
|--------|---------|--------|--------|
| Entities Designed | 9 | 9 | ✅ |
| Relationships | 20+ | 20+ | ✅ |
| RLS Policies | 0 | 15+ | ❌ |
| Indexes | 0 | 10+ | ❌ |
| Validations | Code | DB | ⚠️ |
| Real-time | No | Yes | ❌ |
| Audit Logging | Code Only | DB Triggers | ❌ |
| Component Integration | 38/38 | 38/38 | ✅ |
| Database | Designed | Not Created | ❌ |

---

This map provides a complete reference for understanding how all 38 components interconnect with the 9-table database design. All the pieces are in place; only the actual Supabase connection needs to be established.
