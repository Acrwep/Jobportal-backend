const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const pool = require("../config/dbConfig");
require("dotenv").config();
const moment = require("moment");

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
      const testLink = `${process.env.LINK_URL}/test-invite/${token}`;
      const today = new Date();

      const expiryDateFormatted = moment(today)
        .add(24, "hour")
        .format("MMM DD, YYYY, h:mm A");

      try {
        // 2. Send email
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: recipientEmail,
          subject: "Your Test Invitation",
          html: `
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin:"10px 0 20px; font-family:""Poppins",Arial,sans-serif;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="20" cellspacing="0" style="background-color: #ffffff; margin: 14px; outline:1px solid #d6dbe2; border-radius:12px; box-shadow: 0 0 10px rgba(0,0,0,0.1); font-family: Arial, sans-serif;">
                  <tr>
                    <td>
                      <p style="font-size: 14px;">Hi ${candidateName},</p>
      
                      <p style="font-size: 14px;">I hope this email finds you well. We would like to invite you to participate in the <strong>Senior React Developer</strong> assessment from <strong>ACTE</strong>. To get started, please click on the button below:</p>
      
                      <p>
                        <a href="${testLink}" style="
                          display: inline-block;
                          padding: 5px 16px;
                          background-color: #0056b3;
                          color: #ffffff;
                          text-decoration: none;
                          border-radius: 7px;
                          font-weight: bold;
                        ">
                          Start
                        </a>
                      </p>
      
                      <p style="font-size: 14px;">If for any reason the above link does not work, please copy and paste the below URL into your web browser:</p>
      
                      <p style="word-break: break-all; font-size: 14px;"><a href="${testLink}">${testLink}</a></p>
      
                      <p style="font-size: 14px;"><strong>Assessment is valid until ${expiryDateFormatted} (IST)</strong></p>
      
                      <p style="font-size: 14px;">All the best,<br/>Team ACTE</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
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
