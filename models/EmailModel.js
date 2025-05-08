const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const pool = require("../config/dbConfig");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_HOST,
  auth: {
    user: process.env.SMTP_FROM, // Replace with your email
    pass: process.env.SMTP_PASS, // Replace with your email password or app password for Gmail
  },
});

const generateToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: process.env.LINK_TOKEN_EXPIRY,
  });
};

async function sendTestLinks(users) {
  try {
    const mailPromises = users.map(async (user) => {
      const query = `SELECT id, email, CONCAT(firstName, ' ', lastName) AS name FROM candidates WHERE id = ?`;
      const [result] = await pool.query(query, [user.id]);
      const recipientEmail = result[0].email;
      const candidateName = result[0].name;
      // 1. Generate time-sensitive token
      const token = generateToken(recipientEmail);
      const testLink = `${process.env.FRONTEND_URL}/test?token=${token}`;

      try {
        // 2. Send email
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: recipientEmail,
          subject: "Your Test Invitation",
          html: `<p>Hi ${candidateName},</p>
               <p>Your test link is below (expires in 1 hour):</p>
               <a href="${testLink}">Begin Test</a>
               <p><a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a></p>
               `,
        });

        // Log successful email to database
        await pool.query(
          `INSERT INTO email_logs (recipient_email, subject, status, user_id, course_id) 
           VALUES (?, ?, 'sent', ?, ?)`,
          [recipientEmail, "Your Test Invitation", user.id, user.course_id]
        );
      } catch (error) {
        // Log failed email to database
        await pool.query(
          `INSERT INTO email_logs (recipient_email, subject, status, error_message, user_id, course_id) 
           VALUES (?, ?, 'failed', ?, ?, ?)`,
          [
            recipientEmail,
            "Your Test Invitation",
            error.message,
            user.id,
            user.course_id,
          ]
        );
      }
    });

    await Promise.all(mailPromises);
  } catch (error) {
    throw new Error("Error while sending test links:" + error.message);
  }
}

module.exports = { sendTestLinks };
