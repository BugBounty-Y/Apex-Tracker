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
    <div className="app-page animate-fade-in">
      <PageHeader
        eyebrow="Help"
        title="مركز المساعدة"
        description="شرح مختصر وواضح لكيفية عمل المؤقت، الاستمرارية، السجل، والمزامنة."
      />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="الأسئلة الشائعة">
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.title}
                className="rounded-[var(--radius-lg)] border p-4"
                style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-[var(--radius-md)] p-2.5 shrink-0" style={{ backgroundColor: 'var(--c-info-soft)', color: 'var(--c-info)' }}>
                    <Icons.HelpCircle />
                  </div>
                  <div className="text-right">
                    <h3 className="text-[14px] font-semibold">{faq.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-7" style={{ color: 'var(--c-text-muted)' }}>{faq.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="نصائح سريعة">
          <div className="space-y-3 text-right text-[13px] leading-7" style={{ color: 'var(--c-text-muted)' }}>
            <div className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}>1</span>
              <span>اختر المادة والمهمة قبل بدء الجلسة حتى يصبح السجل والتحليلات أكثر فائدة.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}>2</span>
              <span>استخدم Custom Focus عندما تحتاج جلسة واحدة طويلة بدون breaks.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}>3</span>
              <span>راقب History وInsights نهاية كل يوم بدل فتحهما أثناء التركيز.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}>4</span>
              <span>صدّر نسخة احتياطية قبل أي تغيير كبير أو قبل النقل إلى جهاز آخر.</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
