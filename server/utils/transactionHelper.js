const mongoose = require('mongoose');

/**
 * Runs the provided work function inside a MongoDB transaction session.
 * If transactions are not supported by the current MongoDB deployment (e.g., standalone instance),
 * it falls back to executing the work function without a transaction session.
 *
 * @param {Function} workFn - Async function (session) => Promise<any>
 * @returns {Promise<any>}
 */
const runInTransaction = async (workFn) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await workFn(session);
    });
    return result;
  } catch (error) {
    const isUnsupported =
      error.code === 20 ||
      error.message.includes('replica set') ||
      error.message.includes('transaction') ||
      error.message.includes('sessions');

    if (isUnsupported) {
      console.warn(
        '⚠️ MongoDB Transactions not supported (standalone instance). Falling back to non-transactional execution.'
      );
      return await workFn(null);
    }
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = { runInTransaction };
