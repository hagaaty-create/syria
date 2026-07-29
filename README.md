# منصة حاجاتي الرقمية | HAGAATY DIGITAL STORE

منصة خدمات رقمية متكاملة (شحن ألعاب، تطبيقات، بطاقات رقمية، أرقام وهمية، وحوالات) مع دعم ربط الـ API، تسجيل الدخول عبر **Firebase Auth**، ولوحة أدمن مخصصة للمشرف `admin@gmail.com`.

---

## 🚀 خطوات الرفع على GitHub و Vercel:

### 1️⃣ الرفع على GitHub:
1. افتح موقع [GitHub.com](https://github.com) وقم بتسجيل الدخول.
2. أنشئ مستودع جديد (Create a new repository) باسم `hagaaty-digital-store`.
3. افتح موجه الأوامر (Terminal) في مجلد المشروع ونفذ الأوامر التالية:

```bash
git init
git add .
git commit -m "إطلاق منصة حاجاتي الرقمية مع Firebase ولوحة الأدمن"
git branch -M main
git remote add origin https://github.com/USERNAME/hagaaty-digital-store.git
git push -u origin main
```

---

### 2️⃣ النشر والرفع على Vercel:
1. اذهب إلى موقع [Vercel.com](https://vercel.com) وسجل الدخول باستخدام حساب GitHub الخاص بك.
2. اضغط على **"Add New"** ثم اختر **"Project"**.
3. اختر مستودع `hagaaty-digital-store` من قائمة مستودعات GitHub الخاصة بك.
4. اضغط على **"Deploy"** وسيتم نشر موقعك أونلاين خلال ثوانٍ معدودة برابط مباشر مجاني!

---

### 🔥 ضبط مفاتيح Firebase الخاصة بك (اختياري):
في حال أردت ربط مشروع Firebase خاص بك:
1. ادخل إلى [Firebase Console](https://console.firebase.google.com).
2. أنشئ مشروعاً جديداً وأضف تطبيق ويب (Web App).
3. انسخ المفاتيح وضعها في ملف [firebase-config.js](file:///C:/Users/RAM/.gemini/antigravity/scratch/alragheb_digital_store/firebase-config.js).

---

## 🔐 نظام الصلاحيات في HAGAATY:
- **الزائر غير المسجل**: يرى متجر حاجاتي فقط مع زر `سجل الآن / تسجيل الدخول`.
- **المستخدم العادي**: يرى متجر حاجاتي + `لوحة المستخدم` ومحفظته الشخصية.
- **مشرف النظام (`admin@gmail.com`)**: تظهر له تلقائياً **`لوحة الأدمن`** التي تحتوي على ربط الـ API، إدارة الأرصدة، التحكم بالطلبات، وإحصائيات المتجر.
