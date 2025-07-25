const cron = require("node-cron");
const emailModal = require("../models/EmailModel");
const pool = require("../config/dbConfig");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

let scheduleTime = "*/1 * * * *"; // Schedule: Runs every 30 minutes
// // let scheduleTime = "0 * * * *"; // Schedule: Runs every hour
// // let scheduleTime = "0 10 * * *"; // Schedule: Runs every day at 10:00 AM
// // let scheduleTime = "0 0 * * 0"; // Schedule: Runs every Sunday at midnight
// // let scheduleTime = "*/15 * * * *"; // Schedule: Runs every 15 minutes

// Start job immediately on module load
// const job = cron.schedule(scheduleTime, async () => {
//   try {
//     const now = moment();
//     const date = now.format("yyyy-MM-DD");
//     const time = now.format("HH:mm:ss");

//     const [getUsers] = await pool.query(
//       `SELECT tt.id, tt.user_id, tm.question_type_id, tt.course_id FROM temp_test_link_master AS tm INNER JOIN temp_test_link_trans AS tt ON tm.id = tt.temp_master_id WHERE tm.schedule_date = ? AND tm.schedule_time = ? AND tt.is_sent = 0`,
//       [date, time]
//     );

//     if (getUsers.length > 0) {
//       try {
//         // Process updates and prepare data for email
//         const processedUsers = await Promise.all(
//           getUsers.map(async (item) => {
//             // Update the record in database
//             await pool.query(
//               `UPDATE temp_test_link_trans SET is_sent = 1 WHERE id = ?`,
//               [item.id] // Note: added array brackets for parameterized query
//             );

//             // Return the transformed data for email
//             return {
//               id: item.user_id,
//               course_id: item.course_id,
//               question_type_id: item.question_type_id,
//               created_date: moment().format("YYYY-MM-DD HH:mm:ss"),
//             };
//           })
//         );

//         // Send emails with the processed user data
//         await emailModal.sendTestLinks(processedUsers);
//       } catch (error) {
//         console.error("Error processing users:", error);
//         throw error; // Or handle it differently
//       }
//     }
//   } catch (error) {
//     throw new Error(error.message);
//   }
// });
// End

// Configure log file path
const logFilePath = path.join(__dirname, "cron_job_logs.txt");

// Helper function to log messages
const logToFile = async (message) => {
  const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
  const logMessage = `[${timestamp}] ${message}\n`;

  try {
    fs.appendFileSync(logFilePath, logMessage);
    console.log(logMessage.trim()); // Also log to console for immediate feedback
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
};

const job = cron.schedule(scheduleTime, async () => {
  try {
    await logToFile("Cron job started execution");
    const now = moment();
    const date = now.format("yyyy-MM-DD");
    const time = now.format("HH:mm:ss");

    await logToFile(
      `Checking for users with schedule_date=${date} and schedule_time=${time}`
    );

    const [getUsers] = await pool.query(
      `SELECT tt.id, tt.user_id, tm.question_type_id, tt.course_id FROM temp_test_link_master AS tm INNER JOIN temp_test_link_trans AS tt ON tm.id = tt.temp_master_id WHERE tm.schedule_date = ? AND tm.schedule_time = ? AND tt.is_sent = 0`,
      [date, time]
    );

    await logToFile(`Found ${getUsers.length} users to process`);

    if (getUsers.length > 0) {
      try {
        await logToFile("Starting user processing");

        const processedUsers = await Promise.all(
          getUsers.map(async (item) => {
            await logToFile(
              `Processing user ID: ${item.user_id}, record ID: ${item.id}`
            );

            try {
              // Update the record in database
              await pool.query(
                `UPDATE temp_test_link_trans SET is_sent = 1 WHERE id = ?`,
                [item.id]
              );
              await logToFile(
                `Updated record ID ${item.id} for user ${item.user_id}`
              );

              // Return the transformed data for email
              return {
                id: item.user_id,
                course_id: item.course_id,
                question_type_id: item.question_type_id,
                created_date: moment().format("YYYY-MM-DD HH:mm:ss"),
              };
            } catch (updateError) {
              await logToFile(
                `ERROR updating record ID ${item.id}: ${updateError.message}`
              );
              throw updateError;
            }
          })
        );

        await logToFile("All users processed. Preparing to send emails.");

        // Send emails with the processed user data
        try {
          await emailModal.sendTestLinks(processedUsers);
          await logToFile(
            `Successfully sent emails to ${processedUsers.length} users`
          );
        } catch (emailError) {
          await logToFile(`ERROR sending emails: ${emailError.message}`);
          throw emailError;
        }
      } catch (processingError) {
        await logToFile(
          `ERROR during user processing: ${processingError.message}`
        );
        throw processingError;
      }
    } else {
      await logToFile("No users found to process");
    }

    await logToFile("Cron job completed successfully");
  } catch (error) {
    await logToFile(`CRITICAL ERROR in cron job: ${error.message}`);
    await logToFile(`Stack trace: ${error.stack}`);
    throw error;
  }
});

// Log when the job is first scheduled
logToFile(`Cron job scheduled to run at pattern: ${scheduleTime}`);

console.log("✅ Scheduler initialized");

module.exports = job;
