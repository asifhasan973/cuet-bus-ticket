import { useState } from 'react';
import { FaUser } from 'react-icons/fa';

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
      return 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md scale-105 ring-2 ring-primary-300';
    }
    return 'bg-gradient-to-br from-accent-400 to-accent-500 text-white hover:from-accent-500 hover:to-accent-600 cursor-pointer hover:scale-105 shadow-sm';
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Bus front */}
      <div className="flex justify-center mb-4">
        <div className="bg-dark-200 text-dark-500 text-xs font-bold px-8 py-2 rounded-t-xl tracking-wider uppercase">
          Front (Driver)
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-accent-400 to-accent-500" />
          <span className="text-xs text-dark-500 font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-danger-400 to-danger-500" />
          <span className="text-xs text-dark-500 font-medium">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-primary-400 to-primary-600" />
          <span className="text-xs text-dark-500 font-medium">Selected</span>
        </div>
      </div>

      {/* Bus body */}
      <div className="bg-dark-50 border-2 border-dark-200 rounded-2xl p-4 space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center justify-center gap-2">
            {/* Left pair (2 seats) */}
            <div className="flex gap-2">
              {row.slice(0, 2).map((seat) => (
                <button
                  key={seat.number}
                  disabled={seat.isBooked || readOnly}
                  onClick={() => !seat.isBooked && !readOnly && onSelectSeat?.(seat.number)}
                  onMouseEnter={() => setHoveredSeat(seat)}
                  onMouseLeave={() => setHoveredSeat(null)}
                  className={`
                    w-12 h-12 rounded-lg flex flex-col items-center justify-center
                    transition-all duration-200 text-xs font-bold relative
                    ${getSeatClass(seat)}
                  `}
                >
                  {seat.isBooked ? (
                    <FaUser className="text-sm" />
                  ) : (
                    <span>{getSeatLabel(seat.number)}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Aisle */}
            <div className="w-8 flex items-center justify-center">
              <div className="w-px h-8 bg-dark-200" />
            </div>

            {/* Right group (3 seats) */}
            <div className="flex gap-2">
              {row.slice(2, 5).map((seat) => (
                <button
                  key={seat.number}
                  disabled={seat.isBooked || readOnly}
                  onClick={() => !seat.isBooked && !readOnly && onSelectSeat?.(seat.number)}
                  onMouseEnter={() => setHoveredSeat(seat)}
                  onMouseLeave={() => setHoveredSeat(null)}
                  className={`
                    w-12 h-12 rounded-lg flex flex-col items-center justify-center
                    transition-all duration-200 text-xs font-bold relative
                    ${getSeatClass(seat)}
                  `}
                >
                  {seat.isBooked ? (
                    <FaUser className="text-sm" />
                  ) : (
                    <span>{getSeatLabel(seat.number)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredSeat && hoveredSeat.isBooked && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 bg-dark-800 text-white px-4 py-2 rounded-lg text-sm">
            <FaUser className="text-xs" />
            <span>{hoveredSeat.studentName || 'Student'}</span>
            {hoveredSeat.studentId && (
              <span className="text-dark-300">| ID: {hoveredSeat.studentId}</span>
            )}
          </div>
        </div>
      )}

      {/* Bus rear */}
      <div className="flex justify-center mt-4">
        <div className="bg-dark-200 text-dark-500 text-xs font-bold px-8 py-2 rounded-b-xl tracking-wider uppercase">
          Rear
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
