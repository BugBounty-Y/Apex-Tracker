import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const onboardingMocks = vi.hoisted(() => ({
  completeOnboarding: vi.fn(),
  navigate: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => onboardingMocks.navigate,
  };
});

vi.mock('../contexts/AppDataContext', () => ({
  useAppData: () => ({
    appData: {
      userProfile: {
        name: '',
        examDate: '',
        timezone: 'Africa/Cairo',
      },
    },
    completeOnboarding: onboardingMocks.completeOnboarding,
  }),
}));

vi.mock('../components/ui/ToastProvider', () => ({
  useToast: () => ({
    showToast: onboardingMocks.showToast,
  }),
}));

import OnboardingPage from './OnboardingPage';

describe('OnboardingPage', () => {
  beforeEach(() => {
    onboardingMocks.completeOnboarding.mockReset();
    onboardingMocks.navigate.mockReset();
    onboardingMocks.showToast.mockReset();
  });

  it('completes onboarding with automatic timezone and no subject selection step', () => {
    const { container } = render(<OnboardingPage />);

    expect(screen.queryAllByRole('combobox')).toHaveLength(0);

    const nameInput = container.querySelector('input[type="text"]');
    expect(nameInput).not.toBeNull();
    fireEvent.change(nameInput, { target: { value: 'يحيى' } });

    fireEvent.click(screen.getByRole('button', { name: 'التالي' }));

    expect(screen.queryAllByRole('combobox')).toHaveLength(0);

    const dateInput = container.querySelector('input[type="date"]');
    expect(dateInput).not.toBeNull();
    fireEvent.change(dateInput, { target: { value: '2026-06-20' } });

    fireEvent.click(screen.getByRole('button', { name: 'ابدأ الآن' }));

    expect(onboardingMocks.completeOnboarding).toHaveBeenCalledWith({
      userProfile: expect.objectContaining({
        name: 'يحيى',
        examDate: '2026-06-20',
        timezone: 'auto',
        hasCompletedOnboarding: true,
      }),
    });
    expect(onboardingMocks.showToast).toHaveBeenCalledTimes(1);
    expect(onboardingMocks.navigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });
});
