/**
 * Get human-readable seat label from seat number
 * Layout: 2 seats | aisle | 3 seats (5 seats per row)
 * Row A = seats 1-5, Row B = seats 6-10, etc.
 *
 * @param {number} number - Seat number (1-indexed)
 * @returns {string} Seat label like "A1", "B3", "C5"
 */
export const getSeatLabel = (number) => {
  if (!number) return '';
  const rowIndex = Math.floor((number - 1) / 5);
  const columnNumber = ((number - 1) % 5) + 1;
  const rowLetter = String.fromCharCode(65 + rowIndex); // A, B, C...
  return `${rowLetter}${columnNumber}`;
};
