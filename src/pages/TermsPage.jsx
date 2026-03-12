import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

export default function TermsPage() {
  return (
    <div className="app-page">
      <PageHeader
        eyebrow="Terms"
        title="الشروط والأحكام"
        description="ملخص واضح لبنود الاستخدام الأساسية قبل الإطلاق العام."
      />

      <SectionCard title="الاستخدام المقبول">
        <div className="space-y-4 text-right text-sm leading-8" style={{ color: 'var(--c-text-muted)' }}>
          <p>يوفر Apex Tracker أدوات لتنظيم الدراسة وتتبع الجلسات والأهداف. أنت مسؤول عن دقة البيانات التي تدخلها وعن استخدام التطبيق بما لا يضر بالخدمة أو بالمستخدمين الآخرين.</p>
          <p>لا يجوز استخدام التطبيق في محاولات التحايل على أنظمة الحماية أو إساءة استخدام البنية السحابية أو إرسال بيانات مضللة عمدًا.</p>
        </div>
      </SectionCard>

      <SectionCard title="البيانات والنسخ الاحتياطي">
        <div className="space-y-4 text-right text-sm leading-8" style={{ color: 'var(--c-text-muted)' }}>
          <p>نحاول الحفاظ على بياناتك محليًا وسحابيًا مع آليات مزامنة ونسخ احتياطي، لكنك تظل مسؤولًا عن الاحتفاظ بنسخة JSON دورية خصوصًا قبل أي تغيير كبير أو قبل الانتقال إلى جهاز آخر.</p>
          <p>بعض خواص المزامنة أو الإشعارات قد تتأثر بالاتصال أو إعدادات المتصفح أو سياسات مزود الخدمة.</p>
        </div>
      </SectionCard>

      <SectionCard title="الاستقرار والمسؤولية">
        <div className="space-y-4 text-right text-sm leading-8" style={{ color: 'var(--c-text-muted)' }}>
          <p>نسعى إلى تقديم تجربة مستقرة وقابلة للاعتماد، لكن الخدمة تُقدّم كما هي مع تحسينات مستمرة. قد نضيف أو نعدّل بعض الخصائص لتحسين الأداء أو الأمان أو قابلية الاستخدام.</p>
          <p>إذا تم تفعيل telemetry endpoints في بيئة الإنتاج فقد تُرسل أحداث استخدام عامة وتقارير أخطاء تقنية بهدف تحسين الجودة ومراقبة الاستقرار فقط.</p>
        </div>
      </SectionCard>
    </div>
  );
}
