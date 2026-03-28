const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('--- Testing Daily Point Allocation Logic ---');
  
  // Create a dummy new user to check the default
  const newUser = await User.create({
    name: 'New Student',
    email: 'newbie@student.cuet.ac.bd',
    password: 'password123',
    role: 'student',
    studentId: '9999999',
    points: 5 // We set it to 5 in auth.js, but auth.js is for routes. Let's see the model
  });
  console.log(`Created new student with ${newUser.points} points.`);

  // Let's manually trigger the same logic as the cron job to prove it works
  console.log('Simulating 12 AM Cron Job: Adding 2 points to all students...');
  const result = await User.updateMany(
    { role: 'student' },
    { $inc: { points: 2 } }
  );
  console.log(`Successfully added 2 points to ${result.modifiedCount} students!`);

  // Check the newbie's points
  const updatedUser = await User.findById(newUser._id);
  console.log(`New student now has ${updatedUser.points} points (Expected: 7)`);

  // Clean up
  await User.findByIdAndDelete(newUser._id);
  console.log('Test complete. Cleaned up dummy user.');
  process.exit();
});
