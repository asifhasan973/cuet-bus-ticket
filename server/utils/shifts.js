/**
 * CUET Bus Shift Configuration
 * 
 * Shift 1 — Morning (CUET-bound, weekdays only)
 * Shift 2 — Afternoon (Outbound, special route to Kaptai Rastar Matha)
 * Shift 3 — Evening (Outbound, normal routes, weekdays only)
 * Shift 4 — Night (CUET-bound, all from New Market)
 */

const SHIFT_LABELS = {
  1: 'Morning',
  2: 'Afternoon',
  3: 'Evening',
  4: 'Night',
};

const WEEKDAY_SHIFTS = {
  1: {
    label: 'Morning',
    departure: '6:30 AM',
    arrival: '8:00 AM',
    direction: 'inbound',
    directionLabel: 'CUET-bound',
    description: 'Each bus departs from its route endpoint to CUET',
    specialRoute: null,
  },
  2: {
    label: 'Afternoon',
    departure: '2:00 PM',
    arrival: '3:00 PM',
    direction: 'outbound',
    directionLabel: 'Outbound',
    description: 'All buses go to Kaptai Rastar Matha (special route)',
    specialRoute: 'CUET → Kaptai Rastar Matha',
  },
  3: {
    label: 'Evening',
    departure: '5:00 PM',
    arrival: '7:00 PM',
    direction: 'outbound',
    directionLabel: 'Outbound',
    description: 'Each bus follows its normal route from CUET',
    specialRoute: null,
  },
  4: {
    label: 'Night',
    departure: '9:00 PM',
    arrival: '10:30 PM',
    direction: 'inbound',
    directionLabel: 'CUET-bound',
    description: 'All buses depart from New Market to CUET',
    specialRoute: 'New Market → CUET',
  },
};

const WEEKEND_SHIFTS = {
  2: {
    label: 'Afternoon',
    departure: '2:30 PM',
    arrival: '3:30 PM',
    direction: 'outbound',
    directionLabel: 'Outbound',
    description: 'All buses go to Kaptai Rastar Matha (special route)',
    specialRoute: 'CUET → Kaptai Rastar Matha',
  },
  4: {
    label: 'Night',
    departure: '8:30 PM',
    arrival: '10:00 PM',
    direction: 'inbound',
    directionLabel: 'CUET-bound',
    description: 'All buses depart from New Market to CUET',
    specialRoute: 'New Market → CUET',
  },
};

/**
 * Check if a date string (YYYY-MM-DD) falls on Friday or Saturday
 */
function isWeekend(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const day = d.getUTCDay(); // 0=Sun, 5=Fri, 6=Sat
  return day === 5 || day === 6;
}

/**
 * Get the day name for a date string
 */
function getDayName(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}

/**
 * Get available shift numbers for a given date
 */
function getAvailableShifts(dateStr) {
  if (isWeekend(dateStr)) {
    return [2, 4];
  }
  return [1, 2, 3, 4];
}

/**
 * Get shift info for a specific shift number on a given date
 */
function getShiftInfo(shiftNumber, dateStr) {
  const weekend = isWeekend(dateStr);
  const shifts = weekend ? WEEKEND_SHIFTS : WEEKDAY_SHIFTS;
  
  if (!shifts[shiftNumber]) {
    return null;
  }
  
  return {
    shift: shiftNumber,
    ...shifts[shiftNumber],
    isWeekend: weekend,
    dayName: getDayName(dateStr),
  };
}

/**
 * Get all available shifts with info for a given date
 */
function getAllShiftsForDate(dateStr) {
  const shiftNumbers = getAvailableShifts(dateStr);
  return shiftNumbers.map(num => getShiftInfo(num, dateStr));
}

/**
 * Get the effective route description for a bus on a given shift
 * Shift 2: All buses go to Kaptai Rastar Matha (ignore normal route)
 * Shift 4: All buses depart from New Market (ignore normal route)
 * Shift 1: Bus departs from its own route endpoint toward CUET
 * Shift 3: Bus follows its normal route away from CUET
 */
function getRouteForShift(bus, shiftNumber, dateStr) {
  const shiftInfo = getShiftInfo(shiftNumber, dateStr);
  if (!shiftInfo) return null;

  if (shiftInfo.specialRoute) {
    return {
      name: shiftInfo.specialRoute,
      description: shiftInfo.description,
      isSpecial: true,
    };
  }

  // Normal route
  const stops = bus.route?.stops || [];
  if (shiftInfo.direction === 'inbound') {
    // Reverse direction: route endpoint → CUET
    return {
      name: `${stops[stops.length - 1]?.name || 'Endpoint'} → CUET`,
      description: shiftInfo.description,
      isSpecial: false,
    };
  } else {
    // Outbound: CUET → route endpoint
    return {
      name: bus.route?.name || 'CUET → Destination',
      description: shiftInfo.description,
      isSpecial: false,
    };
  }
}

module.exports = {
  SHIFT_LABELS,
  WEEKDAY_SHIFTS,
  WEEKEND_SHIFTS,
  isWeekend,
  getDayName,
  getAvailableShifts,
  getShiftInfo,
  getAllShiftsForDate,
  getRouteForShift,
};
