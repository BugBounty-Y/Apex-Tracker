import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

export default function PrivacyPage() {
  return (
    <div className="app-page">
      <PageHeader
        eyebrow="Privacy"
        title="سياسة الخصوصية"
        description="ملخص واضح لما يُخزَّن، لماذا يُخزَّن، وما الذي يمكنك التحكم فيه داخل المنتج."
      />

      <SectionCard title="ما الذي نخزنه؟">
        <div className="space-y-4 text-right text-sm leading-8" style={{ color: 'var(--c-text-muted)' }}>
          <p>نخزن بيانات الدراسة التي تنشئها بنفسك مثل المواد، المهام، السجل، الإعدادات، والأهداف.</p>
          <p>إذا كانت telemetry endpoints مفعّلة في بيئة الإنتاج، فقد تُرسل أحداث استخدام عامة وأخطاء تقنية لتحسين الجودة ومراقبة الاستقرار.</p>
        </div>
      </SectionCard>

      <SectionCard title="ما الذي يمكنك فعله؟">
        <div className="space-y-4 text-right text-sm leading-8" style={{ color: 'var(--c-text-muted)' }}>
          <p>يمكنك تصدير نسخة احتياطية JSON من إعدادات التطبيق، أو استيراد نسخة موجودة، أو مسح بياناتك بالكامل من قسم Danger Zone.</p>
          <p>الإشعارات، الصوت، والتذكيرات كلها قابلة للتعطيل من الإعدادات.</p>
        </div>
      </SectionCard>
    </div>
  );
}
