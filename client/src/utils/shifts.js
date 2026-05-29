/**
 * Shared shift display constants for consistent UI across all pages
 */

export const SHIFT_ICONS = {
  1: '',
  2: '',
  3: '',
  4: '',
};

export const SHIFT_LABELS = {
  1: 'Morning',
  2: 'Afternoon',
  3: 'Evening',
  4: 'Night',
};

export const SHIFT_COLORS = {
  1: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
  2: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
  3: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
  4: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

export const SHIFT_GRADIENTS = {
  1: 'from-teal-400 to-teal-600',
  2: 'from-sky-400 to-blue-500',
  3: 'from-indigo-400 to-purple-500',
  4: 'from-slate-600 to-slate-800',
};

export const SHIFT_BG = {
  1: 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800 hover:border-amber-400',
  2: 'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800 hover:border-sky-400',
  3: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400',
  4: 'bg-slate-50 dark:bg-dark-800/40 border-slate-200 dark:border-dark-600 hover:border-slate-400',
};

export const SHIFT_SELECTED = {
  1: 'bg-teal-500 border-amber-500 text-white shadow-lg shadow-amber-500/25',
  2: 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/25',
  3: 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/25',
  4: 'bg-slate-700 border-slate-700 text-white shadow-lg shadow-slate-700/25',
};

export const SHIFT_SCHEDULE = [
  {
    shift: 1,
    icon: '',
    label: 'Morning',
    time: '6:30 AM → 8:00 AM',
    dir: 'CUET-bound',
    note: 'Weekdays',
    color: 'from-teal-400 to-teal-600',
  },
  {
    shift: 2,
    icon: '',
    label: 'Afternoon',
    time: '2:00 PM → 3:00 PM',
    dir: 'Outbound',
    note: 'All days',
    color: 'from-sky-400 to-blue-500',
  },
  {
    shift: 3,
    icon: '',
    label: 'Evening',
    time: '5:00 PM → 7:00 PM',
    dir: 'Outbound',
    note: 'Weekdays',
    color: 'from-indigo-400 to-purple-500',
  },
  {
    shift: 4,
    icon: '',
    label: 'Night',
    time: '9:00 PM → 10:30 PM',
    dir: 'CUET-bound',
    note: 'All days',
    color: 'from-slate-600 to-slate-800',
  },
];
