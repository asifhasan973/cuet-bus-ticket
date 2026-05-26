import { HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="relative bg-white dark:bg-dark-900 rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="sticky top-0 bg-white dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
              <h3 className="font-bold text-lg text-dark-900 dark:text-white">{title}</h3>
              <motion.button
                onClick={onClose}
                className="p-1.5 rounded-lg text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <HiX className="text-lg" />
              </motion.button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
