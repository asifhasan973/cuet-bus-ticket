const cron = require('node-cron');
const User = require('../models/User');

const setupCronJobs = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running daily point allocation job...');
      const result = await User.updateMany(
        { role: 'student' },
        { $inc: { points: 2 } }
      );
      console.log(`Successfully added 2 points to ${result.modifiedCount} students.`);
    } catch (error) {
      console.error('Error in daily point allocation cron job:', error);
    }
  });
};

module.exports = setupCronJobs;
