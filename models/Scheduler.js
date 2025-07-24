const cron = require("node-cron");
const emailModal = require("../models/EmailModel");
const pool = require("../config/dbConfig");
const moment = require("moment");

let scheduleTime = "*/30 * * * *"; // Schedule: Runs every 30 minutes
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

    const [getUsers] = await pool.query(
      `SELECT tt.id, tt.user_id, tm.question_type_id, tm.course_id FROM temp_test_link_master AS tm INNER JOIN temp_test_link_trans AS tt ON tm.id = tt.temp_master_id WHERE tm.schedule_date = ? AND tm.schedule_time = ? AND tt.is_sent = 0`,
      [date, time]
    );

    if (getUsers.length > 0) {
      try {
        // Process updates and prepare data for email
        const processedUsers = await Promise.all(
          getUsers.map(async (item) => {
            // Update the record in database
            await pool.query(
              `UPDATE temp_test_link_trans SET is_sent = 1 WHERE id = ?`,
              [item.id] // Note: added array brackets for parameterized query
            );

            // Return the transformed data for email
            return {
              id: item.user_id,
              course_id: item.course_id,
              question_type_id: item.question_type_id,
              created_date: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
          })
        );

        // Send emails with the processed user data
        await emailModal.sendTestLinks(processedUsers);
      } catch (error) {
        console.error("Error processing users:", error);
        throw error; // Or handle it differently
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

console.log("✅ Scheduler initialized");

module.exports = job;
