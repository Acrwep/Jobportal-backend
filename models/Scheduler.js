const cron = require("node-cron");
const emailModal = require("../models/EmailModel");
const pool = require("../config/dbConfig");
const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");

const scheduleTime = "*/30 * * * *"; // Runs every 30 minute (change as needed)

// Configure log file path
const logFilePath = path.join(__dirname, "cron_job_logs.txt");

// Helper function to log messages
const logToFile = async (message) => {
  const timestamp = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
  const logMessage = `[${timestamp}] ${message}\n`;

  try {
    fs.appendFileSync(logFilePath, logMessage);
    console.log(logMessage.trim());
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
};

// Cron Job Definition
const job = cron.schedule(scheduleTime, async () => {
  try {
    await logToFile("Cron job started execution");

    // Use IST (Indian Standard Time)
    const now = moment().tz("Asia/Kolkata");
    const date = now.format("YYYY-MM-DD");
    const time = now.format("HH:mm:ss");

    await logToFile(
      `Checking for users with schedule_date=${date} and schedule_time=${time}`
    );

    const [getUsers] = await pool.query(
      `SELECT tt.id, tt.user_id, tm.question_type_id, tt.course_id
       FROM temp_test_link_master AS tm
       INNER JOIN temp_test_link_trans AS tt ON tm.id = tt.temp_master_id
       WHERE tm.schedule_date = ? AND tm.schedule_time = ? AND tt.is_sent = 0`,
      [date, time]
    );

    await logToFile(`Found ${getUsers.length} users to process`);

    if (getUsers.length > 0) {
      const processedUsers = await Promise.all(
        getUsers.map(async (item) => {
          await logToFile(
            `Processing user ID: ${item.user_id}, record ID: ${item.id}`
          );

          try {
            // Mark as sent
            await pool.query(
              `UPDATE temp_test_link_trans SET is_sent = 1 WHERE id = ?`,
              [item.id]
            );

            await logToFile(
              `Updated record ID ${item.id} for user ${item.user_id}`
            );

            // Return data for email
            return {
              id: item.user_id,
              course_id: item.course_id,
              question_type_id: item.question_type_id,
              created_date: now.format("YYYY-MM-DD HH:mm:ss"),
            };
          } catch (updateError) {
            await logToFile(
              `ERROR updating record ID ${item.id}: ${updateError.message}`
            );
            throw updateError;
          }
        })
      );

      try {
        await emailModal.sendTestLinks(processedUsers);
        await logToFile(
          `Successfully sent emails to ${processedUsers.length} users`
        );
      } catch (emailError) {
        await logToFile(`ERROR sending emails: ${emailError.message}`);
        throw emailError;
      }
    } else {
      await logToFile("No users found to process");
    }

    await logToFile("Cron job completed successfully");
  } catch (error) {
    await logToFile(`CRITICAL ERROR in cron job: ${error.message}`);
    await logToFile(`Stack trace: ${error.stack}`);
  }
});

// Log when the job is scheduled
logToFile(`Cron job scheduled to run at pattern: ${scheduleTime}`);
console.log("✅ Scheduler initialized");

module.exports = job;
