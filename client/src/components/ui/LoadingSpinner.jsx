import { motion } from 'framer-motion';
import { FaBus } from 'react-icons/fa';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative">
        {/* Pulsing ring */}
        <motion.div
          className={`${sizes[size]} rounded-full border-3 border-primary-100`}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: -4 }}
        />
        {/* Spinning ring */}
        <motion.div
          className={`${sizes[size]} border-3 border-dark-200 border-t-primary-500 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        {/* Centered bus icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ y: [-1, 1, -1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <FaBus className="text-primary-500 text-[10px]" />
        </motion.div>
      </div>
      {text && (
        <motion.p
          className="text-sm text-dark-400 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
