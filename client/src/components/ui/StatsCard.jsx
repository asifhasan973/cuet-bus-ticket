import { motion } from 'framer-motion';
import { AnimatedCounter } from './AnimatedComponents';

const StatsCard = ({ icon: Icon, label, value, color = 'primary', trend }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400',
    danger: 'bg-danger-50 text-danger-600 dark:bg-danger-950/40 dark:text-danger-400',
    warning: 'bg-warning-50 text-warning-500 dark:bg-warning-950/40 dark:text-warning-400',
  };

  return (
    <motion.div
      className="card group"
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-dark-400 dark:text-dark-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-dark-900 dark:text-white mt-1">
            <AnimatedCounter value={value} duration={1} />
          </p>
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend > 0 ? 'text-accent-500' : 'text-danger-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <motion.div
          className={`p-3 rounded-xl ${colorClasses[color]}`}
          whileHover={{ scale: 1.15, rotate: 10 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon className="text-2xl" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
