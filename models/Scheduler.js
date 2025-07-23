const cron = require("node-cron");
const emailModal = require("../models/EmailModel");
const pool = require("../config/dbConfig");
const moment = require("moment");

let scheduleTime = "*/1 * * * *"; // Schedule: Runs every 30 minutes
// // let scheduleTime = "0 * * * *"; // Schedule: Runs every hour
// // let scheduleTime = "0 10 * * *"; // Schedule: Runs every day at 10:00 AM
// // let scheduleTime = "0 0 * * 0"; // Schedule: Runs every Sunday at midnight
// // let scheduleTime = "*/15 * * * *"; // Schedule: Runs every 15 minutes

// Start job immediately on module load
const job = cron.schedule(scheduleTime, async () => {
  try {
    const now = moment();
    const date = now.format("yyyy-MM-DD");
    const time = now.format("HH:mm:ss");

    console.log("date", date, "time", time);
    const [getUsers] = await pool.query(
      `SELECT id, user_id, question_type_id, course_id FROM temp_test_link WHERE schedule_date = ? AND schedule_time = ? AND is_sent = 0`,
      [date, time]
    );

    if (getUsers.length > 0) {
      const updateData = getUsers.map((item) => {
        return {
          ...item,
          id: item.user_id,
          created_date: now.format("YYYY-MM-DD HH:mm:ss"),
        };
      });
      await emailModal.sendTestLinks(updateData);
    }

    console.log("⏰ Scheduled task running at:", new Date().toLocaleString());
  } catch (error) {
    throw new Error(error.message);
  }
});

console.log("✅ Scheduler initialized");

module.exports = job;
