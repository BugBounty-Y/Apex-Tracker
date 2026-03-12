import { Icons } from '../components/Icons';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

const faqs = [
  {
    title: 'كيف يعمل المؤقت؟',
    body: 'Pomodoro يستخدم جلسات تركيز وراحة، Custom Focus يعطيك جلسة واحدة ثابتة، وStopwatch مناسب للجلسات المفتوحة بدون مدة مسبقة.',
  },
  {
    title: 'كيف تُحسب الاستمرارية؟',
    body: 'اليوم يُحسب ضمن الـ streak إذا سجّل 25 دقيقة دراسة على الأقل، والحساب يعتمد على منطقتك الزمنية الحقيقية وليس UTC ثابتًا.',
  },
  {
    title: 'ما الذي يُسجّل في History؟',
    body: 'كل جلسة لها مادة، بداية، نهاية، مدة، ونمط. الجلسة المكتملة تظهر Completed، وأي جلسة تم إنهاؤها قبل اكتمالها تظهر Stopped.',
  },
  {
    title: 'هل بياناتي آمنة؟',
    body: 'التطبيق يحفظ محليًا فورًا ثم يزامن سحابيًا عند توفر الاتصال. يمكنك أيضًا تصدير نسخة احتياطية JSON من Settings.',
  },
];

export default function HelpPage() {
  return (
    <div className="app-page">
      <PageHeader
        eyebrow="Help"
        title="مركز المساعدة"
        description="شرح مختصر وواضح لكيفية عمل المؤقت، الاستمرارية، السجل، والمزامنة."
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="الأسئلة الشائعة">
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.title} className="rounded-[18px] border p-5"
                style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-[14px] bg-cyan-500/12 p-3 text-cyan-400">
                    <Icons.HelpCircle />
                  </div>
                  <div className="text-right">
                    <h3 className="text-base font-semibold">{faq.title}</h3>
                    <p className="mt-2 text-sm leading-7" style={{ color: 'var(--c-text-muted)' }}>{faq.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="نصائح سريعة">
          <div className="space-y-4 text-right text-sm leading-7" style={{ color: 'var(--c-text-muted)' }}>
            <div>1. اختر المادة والمهمة قبل بدء الجلسة حتى يصبح السجل والتحليلات أكثر فائدة.</div>
            <div>2. استخدم Custom Focus عندما تحتاج جلسة واحدة طويلة بدون breaks.</div>
            <div>3. راقب History وInsights نهاية كل يوم بدل فتحهما أثناء التركيز.</div>
            <div>4. صدّر نسخة احتياطية قبل أي تغيير كبير أو قبل النقل إلى جهاز آخر.</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
