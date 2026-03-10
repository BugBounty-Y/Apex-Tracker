// ==========================================
// CONSTANTS & SYSTEM DATA
// ==========================================
export const EXAM_DATE = new Date('2026-06-06T00:00:00');
export const START_DATE = new Date('2026-03-10T00:00:00');

/**
 * Calculates remaining days from today to exam date.
 * Falls back to at least 1 to avoid division by zero.
 */
export function getRemainingDays(examDateStr) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const examDate = new Date(examDateStr || '2026-06-06T00:00:00');
  const diff = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
}

/**
 * Returns the total plan days (from start to exam).
 */
export function getTotalPlanDays() {
  return Math.ceil((EXAM_DATE - START_DATE) / (1000 * 60 * 60 * 24));
}

// Complete color theme map — avoids dynamic Tailwind class construction
export const COLOR_THEMES = {
  red: {
    base: 'red',
    light: 'bg-red-50',
    text: 'text-red-900',
    border: 'border-red-500',
    fill: 'bg-red-500',
    ring: 'ring-red-500/20',
    hoverBorder: 'hover:border-red-400',
    icon: 'text-red-500',
    glow: 'bg-red-400/10',
    hoverLight: 'hover:bg-red-50',
    hoverText: 'hover:text-red-900',
    groupHoverText: 'group-hover:text-red-900',
    groupHoverBorder: 'group-hover:border-red-500',
    groupHoverIcon: 'group-hover:text-red-500',
    groupHoverLight: 'group-hover:bg-red-50',
    shadow: 'shadow-red-500/10',
  },
  blue: {
    base: 'blue',
    light: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-500',
    fill: 'bg-blue-500',
    ring: 'ring-blue-500/20',
    hoverBorder: 'hover:border-blue-400',
    icon: 'text-blue-500',
    glow: 'bg-blue-400/10',
    hoverLight: 'hover:bg-blue-50',
    hoverText: 'hover:text-blue-900',
    groupHoverText: 'group-hover:text-blue-900',
    groupHoverBorder: 'group-hover:border-blue-500',
    groupHoverIcon: 'group-hover:text-blue-500',
    groupHoverLight: 'group-hover:bg-blue-50',
    shadow: 'shadow-blue-500/10',
  },
  indigo: {
    base: 'indigo',
    light: 'bg-indigo-50',
    text: 'text-indigo-900',
    border: 'border-indigo-500',
    fill: 'bg-indigo-500',
    ring: 'ring-indigo-500/20',
    hoverBorder: 'hover:border-indigo-400',
    icon: 'text-indigo-500',
    glow: 'bg-indigo-400/10',
    hoverLight: 'hover:bg-indigo-50',
    hoverText: 'hover:text-indigo-900',
    groupHoverText: 'group-hover:text-indigo-900',
    groupHoverBorder: 'group-hover:border-indigo-500',
    groupHoverIcon: 'group-hover:text-indigo-500',
    groupHoverLight: 'group-hover:bg-indigo-50',
    shadow: 'shadow-indigo-500/10',
  },
  green: {
    base: 'green',
    light: 'bg-green-50',
    text: 'text-green-900',
    border: 'border-green-500',
    fill: 'bg-green-500',
    ring: 'ring-green-500/20',
    hoverBorder: 'hover:border-green-400',
    icon: 'text-green-500',
    glow: 'bg-green-400/10',
    hoverLight: 'hover:bg-green-50',
    hoverText: 'hover:text-green-900',
    groupHoverText: 'group-hover:text-green-900',
    groupHoverBorder: 'group-hover:border-green-500',
    groupHoverIcon: 'group-hover:text-green-500',
    groupHoverLight: 'group-hover:bg-green-50',
    shadow: 'shadow-green-500/10',
  },
  yellow: {
    base: 'yellow',
    light: 'bg-yellow-50',
    text: 'text-yellow-900',
    border: 'border-yellow-500',
    fill: 'bg-yellow-500',
    ring: 'ring-yellow-500/20',
    hoverBorder: 'hover:border-yellow-400',
    icon: 'text-yellow-500',
    glow: 'bg-yellow-400/10',
    hoverLight: 'hover:bg-yellow-50',
    hoverText: 'hover:text-yellow-900',
    groupHoverText: 'group-hover:text-yellow-900',
    groupHoverBorder: 'group-hover:border-yellow-500',
    groupHoverIcon: 'group-hover:text-yellow-500',
    groupHoverLight: 'group-hover:bg-yellow-50',
    shadow: 'shadow-yellow-500/10',
  },
  amber: {
    base: 'amber',
    light: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-500',
    fill: 'bg-amber-500',
    ring: 'ring-amber-500/20',
    hoverBorder: 'hover:border-amber-400',
    icon: 'text-amber-500',
    glow: 'bg-amber-400/10',
    hoverLight: 'hover:bg-amber-50',
    hoverText: 'hover:text-amber-900',
    groupHoverText: 'group-hover:text-amber-900',
    groupHoverBorder: 'group-hover:border-amber-500',
    groupHoverIcon: 'group-hover:text-amber-500',
    groupHoverLight: 'group-hover:bg-amber-50',
    shadow: 'shadow-amber-500/10',
  },
  cyan: {
    base: 'cyan',
    light: 'bg-cyan-50',
    text: 'text-cyan-900',
    border: 'border-cyan-500',
    fill: 'bg-cyan-500',
    ring: 'ring-cyan-500/20',
    hoverBorder: 'hover:border-cyan-400',
    icon: 'text-cyan-500',
    glow: 'bg-cyan-400/10',
    hoverLight: 'hover:bg-cyan-50',
    hoverText: 'hover:text-cyan-900',
    groupHoverText: 'group-hover:text-cyan-900',
    groupHoverBorder: 'group-hover:border-cyan-500',
    groupHoverIcon: 'group-hover:text-cyan-500',
    groupHoverLight: 'group-hover:bg-cyan-50',
    shadow: 'shadow-cyan-500/10',
  },
  purple: {
    base: 'purple',
    light: 'bg-purple-50',
    text: 'text-purple-900',
    border: 'border-purple-500',
    fill: 'bg-purple-500',
    ring: 'ring-purple-500/20',
    hoverBorder: 'hover:border-purple-400',
    icon: 'text-purple-500',
    glow: 'bg-purple-400/10',
    hoverLight: 'hover:bg-purple-50',
    hoverText: 'hover:text-purple-900',
    groupHoverText: 'group-hover:text-purple-900',
    groupHoverBorder: 'group-hover:border-purple-500',
    groupHoverIcon: 'group-hover:text-purple-500',
    groupHoverLight: 'group-hover:bg-purple-50',
    shadow: 'shadow-purple-500/10',
  },
  pink: {
    base: 'pink',
    light: 'bg-pink-50',
    text: 'text-pink-900',
    border: 'border-pink-500',
    fill: 'bg-pink-500',
    ring: 'ring-pink-500/20',
    hoverBorder: 'hover:border-pink-400',
    icon: 'text-pink-500',
    glow: 'bg-pink-400/10',
    hoverLight: 'hover:bg-pink-50',
    hoverText: 'hover:text-pink-900',
    groupHoverText: 'group-hover:text-pink-900',
    groupHoverBorder: 'group-hover:border-pink-500',
    groupHoverIcon: 'group-hover:text-pink-500',
    groupHoverLight: 'group-hover:bg-pink-50',
    shadow: 'shadow-pink-500/10',
  },
  teal: {
    base: 'teal',
    light: 'bg-teal-50',
    text: 'text-teal-900',
    border: 'border-teal-500',
    fill: 'bg-teal-500',
    ring: 'ring-teal-500/20',
    hoverBorder: 'hover:border-teal-400',
    icon: 'text-teal-500',
    glow: 'bg-teal-400/10',
    hoverLight: 'hover:bg-teal-50',
    hoverText: 'hover:text-teal-900',
    groupHoverText: 'group-hover:text-teal-900',
    groupHoverBorder: 'group-hover:border-teal-500',
    groupHoverIcon: 'group-hover:text-teal-500',
    groupHoverLight: 'group-hover:bg-teal-50',
    shadow: 'shadow-teal-500/10',
  },
};

const SLATE_FALLBACK = {
  base: 'slate',
  light: 'bg-slate-50',
  text: 'text-slate-900',
  border: 'border-slate-500',
  fill: 'bg-slate-500',
  ring: 'ring-slate-500/20',
  hoverBorder: 'hover:border-slate-400',
  icon: 'text-slate-500',
  glow: 'bg-slate-400/10',
  hoverLight: 'hover:bg-slate-50',
  hoverText: 'hover:text-slate-900',
  groupHoverText: 'group-hover:text-slate-900',
  groupHoverBorder: 'group-hover:border-slate-500',
  groupHoverIcon: 'group-hover:text-slate-500',
  groupHoverLight: 'group-hover:bg-slate-50',
  shadow: 'shadow-slate-500/10',
};

/**
 * Resolves a color string (e.g. "bg-blue-50 text-blue-800") to a full theme object.
 * Uses pre-built class names — no dynamic Tailwind class construction.
 */
export function getColorTheme(colorString) {
  const key = Object.keys(COLOR_THEMES).find(k => colorString.includes(k));
  return key ? COLOR_THEMES[key] : SLATE_FALLBACK;
}

// Available color keys for random assignment
export const COLOR_KEYS = Object.keys(COLOR_THEMES);

/**
 * Color string (used in subject data) for a given color key.
 */
export function colorStringForKey(key) {
  const t = COLOR_THEMES[key];
  return t ? `${t.light} ${t.text}` : 'bg-slate-50 text-slate-900';
}

// Default subjects
export const initialSubjects = {
  'الكيمياء': { goalHours: 120, studiedSeconds: 0, sessions: 0, color: 'bg-blue-50 text-blue-800' },
  'الفيزياء': { goalHours: 150, studiedSeconds: 0, sessions: 0, color: 'bg-indigo-50 text-indigo-800' },
  'الرياضيات (التفاضل والتكامل)': { goalHours: 100, studiedSeconds: 0, sessions: 0, color: 'bg-indigo-50 text-indigo-800' },
  'الرياضيات (الجبر والهندسة)': { goalHours: 90, studiedSeconds: 0, sessions: 0, color: 'bg-indigo-50 text-indigo-800' },
  'الرياضيات (الميكانيكا)': { goalHours: 100, studiedSeconds: 0, sessions: 0, color: 'bg-indigo-50 text-indigo-800' },
  'الأحياء': { goalHours: 110, studiedSeconds: 0, sessions: 0, color: 'bg-green-50 text-green-800' },
  'اللغة الإنجليزية': { goalHours: 80, studiedSeconds: 0, sessions: 0, color: 'bg-yellow-50 text-yellow-800' },
  'الفقه': { goalHours: 60, studiedSeconds: 0, sessions: 0, color: 'bg-amber-50 text-amber-800' },
  'الحديث': { goalHours: 50, studiedSeconds: 0, sessions: 0, color: 'bg-amber-50 text-amber-800' },
  'التفسير': { goalHours: 50, studiedSeconds: 0, sessions: 0, color: 'bg-amber-50 text-amber-800' },
  'التوحيد': { goalHours: 40, studiedSeconds: 0, sessions: 0, color: 'bg-amber-50 text-amber-800' },
  'التجويد': { goalHours: 20, studiedSeconds: 0, sessions: 0, color: 'bg-amber-50 text-amber-800' },
  'النحو': { goalHours: 70, studiedSeconds: 0, sessions: 0, color: 'bg-cyan-50 text-cyan-800' },
  'الصرف': { goalHours: 50, studiedSeconds: 0, sessions: 0, color: 'bg-cyan-50 text-cyan-800' },
  'البلاغة': { goalHours: 50, studiedSeconds: 0, sessions: 0, color: 'bg-cyan-50 text-cyan-800' },
  'الأدب والنصوص': { goalHours: 40, studiedSeconds: 0, sessions: 0, color: 'bg-cyan-50 text-cyan-800' },
  'المطالعة والإنشاء': { goalHours: 20, studiedSeconds: 0, sessions: 0, color: 'bg-cyan-50 text-cyan-800' },
};
