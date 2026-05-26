import { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const SeatGrid = ({ seats = [], onSelectSeat, selectedSeat, readOnly = false }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  
  // Arrange seats in bus layout: 2 seats | aisle | 3 seats per row
  const rows = [];
  for (let i = 0; i < seats.length; i += 5) {
    rows.push(seats.slice(i, i + 5));
  }

  const getSeatLabel = (number) => {
    const r = Math.floor((number - 1) / 5);
    const c = (number - 1) % 5 + 1;
    const rowLetter = String.fromCharCode(65 + r); // A, B, C...
    return `${rowLetter}${c}`;
  };

  const getSeatClass = (seat) => {
    if (seat.isBooked) {
      return 'bg-gradient-to-br from-danger-400 to-danger-500 text-white cursor-not-allowed shadow-sm';
    }
    if (selectedSeat === seat.number) {
      return 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md ring-2 ring-primary-300';
    }
    return 'bg-gradient-to-br from-accent-400 to-accent-500 text-white hover:from-accent-500 hover:to-accent-600 cursor-pointer shadow-sm';
  };

  const seatVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.015,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    }),
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Bus front */}
      <motion.div
        className="flex justify-center mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-dark-200 dark:bg-dark-800 text-dark-500 dark:text-dark-400 text-xs font-bold px-8 py-2 rounded-t-xl tracking-wider uppercase transition-colors">
          Front (Driver)
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        className="flex justify-center gap-6 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-accent-400 to-accent-500 shadow-sm" />
          <span className="text-xs text-dark-500 dark:text-dark-400 font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-danger-400 to-danger-500 shadow-sm" />
          <span className="text-xs text-dark-500 dark:text-dark-400 font-medium">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-primary-400 to-primary-600 shadow-sm" />
          <span className="text-xs text-dark-500 dark:text-dark-400 font-medium">Selected</span>
        </div>
      </motion.div>

      {/* Bus body */}
      <motion.div
        className="bg-dark-50 dark:bg-dark-900 border-2 border-dark-200 dark:border-dark-800/80 rounded-2xl p-4 space-y-2 transition-colors duration-250"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center justify-center gap-2">
            {/* Left pair (2 seats) */}
            <div className="flex gap-2">
              {row.slice(0, 2).map((seat) => (
                <motion.button
                  key={seat.number}
                  custom={seat.number}
                  variants={seatVariants}
                  initial="hidden"
                  animate="visible"
                  disabled={seat.isBooked || readOnly}
                  onClick={() => !seat.isBooked && !readOnly && onSelectSeat?.(seat.number)}
                  onMouseEnter={() => setHoveredSeat(seat)}
                  onMouseLeave={() => setHoveredSeat(null)}
                  whileHover={!seat.isBooked && !readOnly ? { scale: 1.12 } : {}}
                  whileTap={!seat.isBooked && !readOnly ? { scale: 0.95 } : {}}
                  className={`
                    w-12 h-12 rounded-lg flex flex-col items-center justify-center
                    transition-colors duration-200 text-xs font-bold relative
                    ${getSeatClass(seat)}
                  `}
                >
                  {selectedSeat === seat.number && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-primary-300"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  {seat.isBooked ? (
                    <FaUser className="text-sm" />
                  ) : (
                    <span>{getSeatLabel(seat.number)}</span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Aisle */}
            <div className="w-8 flex items-center justify-center">
              <div className="w-px h-8 bg-dark-200 dark:bg-dark-800" />
            </div>

            {/* Right group (3 seats) */}
            <div className="flex gap-2">
              {row.slice(2, 5).map((seat) => (
                <motion.button
                  key={seat.number}
                  custom={seat.number}
                  variants={seatVariants}
                  initial="hidden"
                  animate="visible"
                  disabled={seat.isBooked || readOnly}
                  onClick={() => !seat.isBooked && !readOnly && onSelectSeat?.(seat.number)}
                  onMouseEnter={() => setHoveredSeat(seat)}
                  onMouseLeave={() => setHoveredSeat(null)}
                  whileHover={!seat.isBooked && !readOnly ? { scale: 1.12 } : {}}
                  whileTap={!seat.isBooked && !readOnly ? { scale: 0.95 } : {}}
                  className={`
                    w-12 h-12 rounded-lg flex flex-col items-center justify-center
                    transition-colors duration-200 text-xs font-bold relative
                    ${getSeatClass(seat)}
                  `}
                >
                  {selectedSeat === seat.number && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-primary-300"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  {seat.isBooked ? (
                    <FaUser className="text-sm" />
                  ) : (
                    <span>{getSeatLabel(seat.number)}</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredSeat && hoveredSeat.isBooked && (
          <motion.div
            className="mt-3 text-center"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
          >
            <div className="inline-flex items-center gap-2 bg-dark-800 dark:bg-dark-900 border dark:border-dark-800 text-white px-4 py-2 rounded-lg text-sm shadow-md">
              <FaUser className="text-xs" />
              <span>{hoveredSeat.studentName || 'Student'}</span>
              {hoveredSeat.studentId && (
                <span className="text-dark-300 dark:text-dark-400">| ID: {hoveredSeat.studentId}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bus rear */}
      <motion.div
        className="flex justify-center mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-dark-200 dark:bg-dark-800 text-dark-500 dark:text-dark-400 text-xs font-bold px-8 py-2 rounded-b-xl tracking-wider uppercase transition-colors">
          Rear
        </div>
      </motion.div>
    </div>
  );
};

export default SeatGrid;
