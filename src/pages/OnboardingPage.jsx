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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section
          className="rounded-[28px] border p-8 md:p-10"
          style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--c-text-faint)' }}>
            First-run setup
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl" style={{ color: 'var(--c-text)' }}>
            إعداد سريع، واضح، ويأخذ أقل من دقيقة
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 md:text-[15px]" style={{ color: 'var(--c-text-muted)' }}>
            سنضبط لك الأساسيات فقط: من أنت ومتى الامتحان. المنطقة الزمنية ستعمل تلقائياً حسب جهازك، ويمكنك إضافة المواد لاحقاً من التطبيق.
          </p>

          <div className="mt-8 flex items-center gap-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: index <= currentStep ? 'rgba(139, 92, 246, 0.16)' : 'var(--c-elevated)',
                    color: index <= currentStep ? 'var(--c-nav-active)' : 'var(--c-text-faint)',
                  }}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden h-px w-10 md:block" style={{ backgroundColor: 'var(--c-border)' }} />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--c-elevated)' }}>
            <div className="h-full rounded-full bg-gradient-to-l from-violet-500 to-cyan-400 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-8">
            {currentStep === 0 && (
              <SectionCard title="اسم الطالب" subtitle="سيظهر في اللوحة وفي تقاريرك اليومية.">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData((currentValue) => ({ ...currentValue, name: event.target.value }))}
                  placeholder="مثال: يحيى"
                  className="w-full rounded-[12px] border px-4 py-3"
                  style={{ backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
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
                  className="w-full rounded-[12px] border px-4 py-3"
                  style={{ backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                />
              </SectionCard>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep((value) => Math.max(0, value - 1))}
              className="rounded-[12px] border px-4 py-2.5 text-sm font-semibold transition-colors"
              style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
              disabled={currentStep === 0}
            >
              السابق
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-[12px] bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
            >
              {currentStep === steps.length - 1 ? 'ابدأ الآن' : 'التالي'}
              <Icons.ArrowRight />
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <SectionCard title="ماذا ستخرج به؟">
            <div className="space-y-4 text-right text-sm leading-7" style={{ color: 'var(--c-text-muted)' }}>
              <div>1. Dashboard جاهزة تشرح لك ماذا تفعل الآن.</div>
              <div>2. عدّ تنازلي دقيق مع منطقة زمنية تلقائية حسب جهازك.</div>
              <div>3. بداية أبسط بدون خطوات زائدة، ثم تضيف المواد وقتما تريد.</div>
              <div>4. إعدادات يمكنك تعديلها لاحقاً بدون تعقيد.</div>
            </div>
          </SectionCard>

          <SectionCard title="الخطوة الحالية" subtitle={steps[currentStep].label}>
            <div
              className="rounded-[18px] border p-5"
              style={{ backgroundColor: 'var(--c-elevated)', borderColor: 'var(--c-border)' }}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-[14px] bg-violet-500/15 p-3 text-violet-300">
                  <Icons.Sparkles />
                </div>
                <div className="text-right">
                  <div className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>
                    {steps[currentStep].label}
                  </div>
                  <div className="mt-2 text-sm leading-7" style={{ color: 'var(--c-text-muted)' }}>
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
