import { motion } from 'framer-motion';

// Base Skeleton pulse wrapper
export const SkeletonPulse = ({ children, className = '' }) => (
  <motion.div
    className={`animate-pulse bg-dark-200 dark:bg-dark-800 rounded-lg ${className}`}
    initial={{ opacity: 0.6 }}
    animate={{ opacity: [0.6, 1, 0.6] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

// Simple line skeleton
export const SkeletonLine = ({ className = 'h-4 w-full', variant = 'default' }) => {
  const variants = {
    default: 'bg-dark-200 dark:bg-dark-800',
    primary: 'bg-primary-100 dark:bg-primary-950/40',
    accent: 'bg-accent-100 dark:bg-accent-950/40',
  };
  return <SkeletonPulse className={`${variants[variant]} ${className}`} />;
};

// Card skeleton for dashboards or buses
export const SkeletonCard = () => (
  <div className="card space-y-4">
    <div className="flex justify-between items-center">
      <SkeletonLine className="h-4 w-2/5" />
      <SkeletonPulse className="w-10 h-10 rounded-xl" />
    </div>
    <SkeletonLine className="h-8 w-1/3" />
    <SkeletonLine className="h-3 w-3/5" />
  </div>
);

// Grid of cards
export const SkeletonCardGrid = ({ count = 4, className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' }) => (
  <div className={className}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Table rows skeleton
export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="card !p-0 overflow-hidden dark:border-dark-600">
    <div className="px-6 py-4 border-b border-dark-100 dark:border-dark-600">
      <SkeletonLine className="h-5 w-48" />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-dark-50 dark:bg-dark-800">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <SkeletonLine className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-100 dark:divide-dark-600">
          {Array.from({ length: rows }).map((_, rIndex) => (
            <tr key={rIndex}>
              {Array.from({ length: cols }).map((_, cIndex) => (
                <td key={cIndex} className="px-6 py-4">
                  <SkeletonLine className={`h-4 ${cIndex === 0 ? 'w-28' : 'w-16'}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Bus Grid / Seat Selector page skeleton
export const SkeletonSeatBooking = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <SkeletonLine className="h-7 w-64" />
      <SkeletonLine className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="card space-y-6">
          <SkeletonLine className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonPulse className="h-14 rounded-xl" />
            <SkeletonPulse className="h-14 rounded-xl" />
            <SkeletonPulse className="h-14 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 border-t border-dark-100 dark:border-dark-600">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonPulse key={i} className="h-10 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="card space-y-4">
          <SkeletonLine className="h-6 w-32" />
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-5/6" />
          <div className="h-32 bg-dark-50 dark:bg-dark-800/40 rounded-xl flex items-center justify-center border border-dark-100 dark:border-dark-600">
            <SkeletonPulse className="w-16 h-16 rounded-full" />
          </div>
          <SkeletonPulse className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);
