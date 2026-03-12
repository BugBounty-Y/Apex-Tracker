import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import SectionCard from '../components/ui/SectionCard';
import { getTodayKey } from '../utils/helpers';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../components/ui/ToastProvider';

const steps = [
  { id: 'name', label: 'الاسم' },
  { id: 'exam', label: 'الامتحان' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { appData, completeOnboarding } = useAppData();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: appData.userProfile.name || '',
    examDate: appData.userProfile.examDate || '',
  });

  const progress = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep]);

  const handleNext = () => {
    if (currentStep === 0 && !formData.name.trim()) return;
    if (currentStep === 1 && !formData.examDate) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((value) => value + 1);
      return;
    }

    completeOnboarding({
      userProfile: {
        ...appData.userProfile,
        name: formData.name.trim(),
        examDate: formData.examDate,
        timezone: 'auto',
        hasCompletedOnboarding: true,
      },
    });

    showToast({
      tone: 'success',
      title: 'مرحباً بك في Apex Tracker',
      description: 'كل شيء جاهز الآن. يمكنك إضافة المواد وبدء أول جلسة خلال ثوانٍ.',
    });
    navigate('/dashboard', { replace: true });
  };

  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section
          className="rounded-[var(--radius-card)] border p-7 md:p-9"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="app-label" style={{ fontSize: '0.625rem' }}>
            First-run setup
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--c-text)', letterSpacing: '-0.02em' }}>
            إعداد سريع، واضح، ويأخذ أقل من دقيقة
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-7 md:text-[14px]" style={{ color: 'var(--c-text-muted)' }}>
            سنضبط لك الأساسيات فقط: من أنت ومتى الامتحان. المنطقة الزمنية ستعمل تلقائياً حسب جهازك، ويمكنك إضافة المواد لاحقاً من التطبيق.
          </p>

          <div className="mt-7 flex items-center gap-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold"
                  style={{
                    backgroundColor: index <= currentStep ? 'var(--c-accent-soft)' : 'var(--c-elevated)',
                    color: index <= currentStep ? 'var(--c-nav-active)' : 'var(--c-text-faint)',
                  }}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden h-px w-8 md:block" style={{ backgroundColor: 'var(--c-border)' }} />
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 app-progress">
            <div className="app-progress-bar" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-7">
            {currentStep === 0 && (
              <SectionCard title="اسم الطالب" subtitle="سيظهر في اللوحة وفي تقاريرك اليومية.">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData((currentValue) => ({ ...currentValue, name: event.target.value }))}
                  placeholder="مثال: يحيى"
                  className="app-control"
                  style={inputStyle}
                />
              </SectionCard>
            )}

            {currentStep === 1 && (
              <SectionCard title="تاريخ بداية الامتحان" subtitle="حتى يحسب لك العدّ التنازلي والمطلوب يومياً بشكل دقيق.">
                <input
                  type="date"
                  min={getTodayKey('auto')}
                  value={formData.examDate}
                  onChange={(event) => setFormData((currentValue) => ({ ...currentValue, examDate: event.target.value }))}
                  className="app-control"
                  style={inputStyle}
                />
              </SectionCard>
            )}
          </div>

          <div className="mt-7 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep((value) => Math.max(0, value - 1))}
              className="app-btn-secondary"
              disabled={currentStep === 0}
            >
              السابق
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="app-btn-primary"
            >
              {currentStep === steps.length - 1 ? 'ابدأ الآن' : 'التالي'}
              <Icons.ArrowRight />
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <SectionCard title="ماذا ستخرج به؟">
            <div className="space-y-3">
              {[
                'Dashboard جاهزة تشرح لك ماذا تفعل الآن.',
                'عدّ تنازلي دقيق مع منطقة زمنية تلقائية حسب جهازك.',
                'بداية أبسط بدون خطوات زائدة، ثم تضيف المواد وقتما تريد.',
                'إعدادات يمكنك تعديلها لاحقاً بدون تعقيد.',
              ].map((text, index) => (
                <div key={index} className="flex items-start gap-2.5 text-right text-[13px] leading-7" style={{ color: 'var(--c-text-muted)' }}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}>
                    {index + 1}
                  </span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="الخطوة الحالية" subtitle={steps[currentStep].label}>
            <div
              className="rounded-[var(--radius-lg)] border p-4"
              style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-[var(--radius-md)] p-2.5 shrink-0" style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}>
                  <Icons.Sparkles />
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-semibold" style={{ color: 'var(--c-text)' }}>
                    {steps[currentStep].label}
                  </div>
                  <div className="mt-1.5 text-[13px] leading-7" style={{ color: 'var(--c-text-muted)' }}>
                    {currentStep === 0 && 'ابدأ باسم واضح حتى تبدو الواجهة شخصية ومألوفة منذ البداية.'}
                    {currentStep === 1 && 'هذا التاريخ يحدد عدّك التنازلي وخطة التوزيع اليومية.'}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
