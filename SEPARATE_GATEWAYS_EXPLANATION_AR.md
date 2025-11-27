# 🚪 البوابات المنفصلة لكل مؤسسة
## شرح تفصيلي + كيفية الإضافة

---

## ❓ السؤال: هل لكل مؤسسة بوابة دخول خاصة مستقلة؟

### الجواب على الوضع الحالي: **❌ لا**

**الحالة الحالية:**
```
مسار واحد للجميع:
localhost:5173/

عند اختيار أي مؤسسة:
- نفس صفحة الدخول
- نفس الشاشة
- نفس التص��يم

المشكلة: المستخدم يمكنه دخول بيانات مؤسسة أخرى!
```

**مثال المشكلة:**
```
1. يفتح صفحة الدخول لـ "مركز النور" (alnoor)
2. لكن يدخل بريد طالب من "دار الهدى" (darhuda)
3. النظام قد يقبلها إذا كانت بنفس البيانات!
```

---

## ✅ الحل الجديد: بوابات منفصلة

### كيف يعمل:

```
مركز النور (alnoor)
  ↓
localhost:5173/alnoor/login
  ├─ يحمل الـ slug: "alnoor"
  ├─ يبحث عن: WHERE organizations.slug = 'alnoor'
  ├─ يتحقق من: is_active = true
  └─ ينقل الـ slug إلى LoginPage

دار الهدى (darhuda)
  ↓
localhost:5173/darhuda/login
  ├─ يحمل الـ slug: "darhuda"
  ├─ يبحث عن: WHERE organizations.slug = 'darhuda'
  ├─ يتحقق من: is_active = true
  └─ ينقل الـ slug إلى LoginPage
```

### الكود (مثال):

```typescript
// LoginPage.tsx
import { useParams } from 'react-router-dom';

export function LoginPage() {
  const { slug } = useParams<{ slug: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState<Organization | null>(null);

  // عند فتح الصفحة: احصل على بيانات المؤسسة من الـ slug
  useEffect(() => {
    fetchOrganizationBySlug();
  }, [slug]);

  const fetchOrganizationBySlug = async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)        // ← الـ slug من الـ URL
      .eq('is_active', true)   // ← تحقق من أنها فعالة
      .single();

    if (error || !data) {
      // المؤسسة غير موجودة
      navigate('/organizations'); // عد للقائمة
      toast.error('المؤسسة غير موجودة');
      return;
    }

    setOrganization(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // تحقق من أن المؤسسة موجودة
    if (!organization) {
      toast.error('المؤسسة غير موجودة');
      return;
    }

    try {
      // ادخل البريد والكلمة
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // تحقق من أن المستخدم من نفس المؤسسة
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .eq('organization_id', organization.id)  // ← التحقق المهم!
        .single();

      if (!profile) {
        // المستخدم لا ينتمي لهذه المؤسسة
        await supabase.auth.signOut();
        toast.error('هذا الحساب لا ينتمي لهذه المؤسسة');
        return;
      }

      // نجح الدخول - انتقل إلى Dashboard
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('خطأ في تسجيل الدخول');
    }
  };

  // إذا لم تحمل المؤسسة بعد
  if (!organization) {
    return <LoadingScreen />;
  }

  // يمكنك هنا تخصيص الشاشة حسب المؤسسة
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* عرض بيانات المؤسسة الخاصة */}
      <div className="text-center mb-8">
        <img 
          src={organization.logo} 
          alt={organization.name}
          className="w-24 h-24 mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold">{organization.name}</h1>
      </div>

      {/* نموذج الدخول */}
      <form onSubmit={handleLogin}>
        {/* ... form fields ... */}
      </form>
    </div>
  );
}
```

---

## ➕ كيفية إضافة مؤسسة جديدة

### الطريقة 1️⃣: إضافة عبر SQL مباشرة

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
  'مركز القرآن الكريم',
  'alquran-center',
  'مركز متخصص في حفظ القرآن الكريم',
  'info@alquran.com',
  '0501234567',
  'الرياض، السعودية',
  true,
  NOW(),
  NOW()
);
```

### الطريقة 2️⃣: إضافة عبر واجهة المنصة (Admin Panel)

**ستحتاج إلى صفحة "إدارة المؤسسات" في Admin Dashboard:**

```typescript
// admin/OrganizationsManagement.tsx (مكون جديد)
export function OrganizationsManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
  });

  // احصل على المؤسسات
  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });
    setOrganizations(data || []);
  };

  // أضف مؤسسة جديدة
  const handleAddOrganization = async () => {
    if (!newOrg.name || !newOrg.slug) {
      toast.error('الاسم و slug مطلوبان');
      return;
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .insert({
          name: newOrg.name,
          slug: newOrg.slug.toLowerCase().replace(/\s+/g, '-'),
          description: newOrg.description,
          contact_email: newOrg.contact_email,
          contact_phone: newOrg.contact_phone,
          address: newOrg.address,
          is_active: true,
        });

      if (error) throw error;

      toast.success('تم إضافة المؤسسة بنجاح');
      setNewOrg({
        name: '',
        slug: '',
        description: '',
        contact_email: '',
        contact_phone: '',
        address: '',
      });
      setIsAddDialogOpen(false);
      
      // أعد تحميل القائمة
      await fetchOrganizations();
    } catch (error: any) {
      toast.error('فشل إضافة المؤسسة: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة المؤسسات</h2>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-emerald-600"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة مؤسسة جديدة
        </Button>
      </div>

      {/* جدول المؤسسات */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>الـ Slug</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id}>
              <TableCell>{org.name}</TableCell>
              <TableCell dir="ltr">{org.slug}</TableCell>
              <TableCell>
                <Badge className={org.is_active ? 'bg-green-600' : 'bg-red-600'}>
                  {org.is_active ? 'فعالة' : 'معطلة'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">تعديل</Button>
                <Button variant="ghost" size="sm">حذف</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* مودال إضافة مؤسسة */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة مؤسسة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>اسم المؤسسة</Label>
              <Input
                placeholder="مثال: مركز النور"
                value={newOrg.name}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
              />
            </div>

            <div>
              <Label>الـ Slug (رابط المؤسسة)</Label>
              <Input
                placeholder="مثال: alnoor"
                dir="ltr"
                value={newOrg.slug}
                onChange={(e) => {
                  // حول تلقائياً إلى lowercase وبدون مسافات
                  const slug = e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');
                  setNewOrg({ ...newOrg, slug });
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                الرابط سيكون: yourdomain.com/{newOrg.slug}/login
              </p>
            </div>

            <div>
              <Label>الوصف</Label>
              <Input
                placeholder="وصف المؤسسة"
                value={newOrg.description}
                onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
              />
            </div>

            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                placeholder="info@organization.com"
                value={newOrg.contact_email}
                onChange={(e) => setNewOrg({ ...newOrg, contact_email: e.target.value })}
              />
            </div>

            <div>
              <Label>رقم الهاتف</Label>
              <Input
                placeholder="0501234567"
                value={newOrg.contact_phone}
                onChange={(e) => setNewOrg({ ...newOrg, contact_phone: e.target.value })}
              />
            </div>

            <div>
              <Label>العنوان</Label>
              <Input
                placeholder="��لرياض، السعودية"
                value={newOrg.address}
                onChange={(e) => setNewOrg({ ...newOrg, address: e.target.value })}
              />
            </div>

            <Button
              onClick={handleAddOrganization}
              className="w-full bg-emerald-600"
            >
              إضافة المؤسسة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## 🔄 تدفق العملية

### عند إضافة مؤسسة جديدة:

```
1. Admin يفتح صفحة "إدارة المؤسسات"
   Path: /dashboard/admin/organizations
   
2. يملأ البيانات:
   - الاسم: "مركز القرآن الكريم"
   - Slug: "alquran-center"
   - الوصف: "مركز متخصص..."
   - البريد: "info@alquran.com"
   
3. يضغط "إضافة المؤسسة"
   ↓
   INSERT INTO organizations...
   
4. تظهر فوراً في:
   - قائمة المؤسسات الداخلية
   ✅ المؤسسة الجديدة تظهر
   
5. عندما يفتح مستخدم عام: localhost:5173/organizations
   ↓
   OrganizationSelector يسحب: SELECT * FROM organizations WHERE is_active = true
   ↓
   تظهر المؤسسة الجديدة تلقا��ياً! ✅
   
6. يمكنه النقر عليها
   ↓
   ينتقل إلى: localhost:5173/alquran-center/login
   ↓
   يدخل البيانات ويسجل الدخول
```

---

## 🎯 الخصائص المهمة للـ Slug

```typescript
// ✅ صيغ صحيحة:
alnoor              // بسيط
darhuda             // بسيط
alquran-center      // مع dash
islamic_institute   // مع underscore

// ❌ صيغ خاطئة:
Alnoor              // Capital letters (تحول إلى alnoor)
al noor             // مع مسافات (تحول إلى al-noor)
مركز النور          // عربي (يجب يكون لاتيني)
al/noor             // مع special characters
```

### الكود الصحيح للتحويل:

```typescript
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()                    // تحويل إلى حروف صغيرة
    .trim()                           // إزالة الفراغات الزائدة
    .replace(/\s+/g, '-')             // استبدال المسافات بـ dash
    .replace(/[^a-z0-9-]/g, '')       // إزالة أي أحرف غير صالحة
    .replace(/-+/g, '-')              // استبدال dashes المتعددة بـ dash واحد
    .replace(/^-+|-+$/g, '');         // إزالة dashes م�� البداية والنهاية
};

// أمثلة:
generateSlug('مركز النور')         → ''         (المشكلة: عربي!)
generateSlug('Al Noor Center')     → 'al-noor-center'
generateSlug('Islamic_Institute')  → 'islamicinstitute'
```

---

## 🔐 التحقق الأماني

عند الدخول، تحقق من ثلاثة أشياء:

```typescript
const handleLogin = async () => {
  // 1. تحقق من وجود المؤسسة
  if (!organization) {
    return toast.error('المؤسسة غير موجودة');
  }

  // 2. تحقق من أن المؤسسة فعالة
  if (!organization.is_active) {
    return toast.error('هذه المؤسسة غير مفعلة حالياً');
  }

  // 3. تحقق من أن المستخدم ينتمي للمؤسسة
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .eq('organization_id', organization.id)
    .single();

  if (!profile) {
    return toast.error('أنت لا تنتمي لهذه المؤسسة');
  }
};
```

---

## ✅ الملخص

| السؤال | الإجابة |
|--------|---------|
| هل لكل مؤسسة بوابة منفصلة؟ | ✅ في النظام الجديد - نعم |
| كيف تضاف مؤسسة جديدة؟ | عبر SQL أو Admin Panel |
| متى تظهر في القائمة؟ | فوراً عند تعيين `is_active = true` |
| هل يجب تحديث اليدوي؟ | ❌ لا - تظهر تلقائياً |
| كيف تكون الرابط؟ | `/slug/login` حيث slug من قاعدة البيانات |

---

الآن هل تريد الكود الكامل لتنفيذ هذا النظام؟
