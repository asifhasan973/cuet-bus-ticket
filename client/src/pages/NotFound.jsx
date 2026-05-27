import { Link } from 'react-router-dom';
import { FaBus } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-8xl font-black bg-gradient-to-br from-primary-400 to-primary-700 bg-clip-text text-transparent">
            404
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaBus className="text-2xl text-primary-500" />
            </motion.div>
          </div>

          <h1 className="text-2xl font-extrabold text-dark-900 dark:text-white mb-2">
            Page Not Found
          </h1>
          <p className="text-dark-500 dark:text-dark-400 text-sm mb-8">
            Looks like this bus route doesn't exist. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="group bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              Go Home
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/routes"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm transition-colors"
            >
              View Routes
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
