# Apex Tracker 🚀

**Apex Tracker** هو تطبيق ويب متطور مصمم خصيصاً لمساعدة الطلاب على تتبع أوقات المذاكرة، إدارة المقررات، والحفاظ على زخم الدراسة (Streak) بطريقة احترافية تعتمد على تقنية Pomodoro.

## 🌟 الميزات الرئيسية (Features)

- **تتبع حقيقي للإنجاز**: لوحة تحكم ذكية تعرض نسبة الإنجاز والوقت المتبقي للامتحان مع رسائل تحفيزية.
- **مؤقت بومودورو متقدم (Advanced Timer)**: جلسات تركيز (25 دقيقة) وفترات راحة معدة مسبقاً، مع إشعارات صوتية وتنبيهات سطح المكتب لتنبيهك بانتهاء الوقت.
- **نظام حساب الاستمرارية (Streaks)**: يشجع الطالب على الدراسة يومياً، مع احترام دقيق للمناطق الزمنية لحساب بداية ونهاية كل يوم بشكل صحيح.
- **التخزين الهجين (Hybrid Storage)**: يتم حفظ البيانات محلياً (LocalStorage) للعمل السلس والسريع، ومزامنتها في الخلفية مع قاعدة البيانات السحابية (Firestore).
- **إدارة كاملة للمواد**: إمكانية إضافة وتعديل المواد الدراسية، تحديد هدف زمني لكل مادة، وتحديث ساعات الدراسة المنجزة بدقة الثواني المتبقية لعدم ضياع أي مجهود.
- **واجهة مستخدم خلابة (Premium UI)**: واجهة استجابية داعمة للوضع الليلي والنهاري (Dark/Light Modes) وتأثيرات بصرية غنية مثل (Glassmorphism & Gradients).

## 🛠️ التقنيات المستخدمة (Tech Stack)

تم بناء المشروع باستخدام أحدث تقنيات الويب والأدوات لعام 2026:
- **React 19**: لإدارة المكونات (Components) والحالة (State).
- **Vite 7**: منشئ سريع جداً.
- **Tailwind CSS v4**: للتصميم السريع والاستجابي بانتظام.
- **Firebase v12**: لإدارة مصادقة المستخدمين (Authentication) وقواعد البيانات الآنية (Firestore).

## 🚀 كيفية التثبيت والتشغيل (Getting Started)

### المتطلبات الأساسية
- بيئة **Node.js**.
- مشروع **Firebase** مفعل فيه (Authentication) مع خيار (Email/Password و Google)، و (Firestore Database).

### خطوات التشغيل

1. **تحميل المشروع**
   ```bash
   git clone https://github.com/yourusername/apex-tracker.git
   cd apex-tracker
   ```

2. **تثبيت الحزم (Dependencies)**
   ```bash
   npm install
   ```

3. **إعداد متغيرات البيئة (Environment Variables)**
   قم بإنشاء ملف `.env` في جذور المشروع وأضف مفاتيح Firebase الخاصة بك كما يلي:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_DATABASE_URL=your_database_url
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **التشغيل للبيئة التطويرية (Development)**
   ```bash
   npm run dev
   ```

5. **بناء المشروع للإنتاج (Production Build)**
   ```bash
   npm run build
   ```

## 🔒 حماية البيانات (Privacy & Data Handling)
تم بناء التطبيق مع وضع الخصوصية في الاعتبار. يمكن للمستخدم إزالة كافة بيانات الدورة التدريبية وسجل دراسته بنقرة زر، أو طلب "حذف الحساب نهائياً" وبذلك يتم إتلاف كافة مستنداته من قواعد البيانات السحابية وتُزال أي بيانات مسجلة في المتصفح تلقائياً. 
