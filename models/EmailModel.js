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
      const query = `SELECT id, email, name FROM admin WHERE id = ?`;
      const [result] = await pool.query(query, [user.id]);
      const recipientEmail = result[0].email;
      const candidateName = result[0].name;
      // 1. Generate time-sensitive token
      const token = generateToken(recipientEmail);
      const testLink = `${process.env.LINK_URL}/test-invite/${user.question_type_id}/${token}`;
      const today = new Date();

      const expiryDateFormatted = moment(today)
        .add(24, "hour")
        .format("MMM DD, YYYY, h:mm A");

      const expires_at = moment(today)
        .add(24, "hour")
        .format("YYYY-MM-DD HH:mm:ss");

      try {
        // 2. Send email
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: recipientEmail,
          subject: "ACTE has invited you to take an assessment!",
          html: `
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin:"10px 0 20px; font-family:""Poppins",Arial,sans-serif;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="20" cellspacing="0" style="background-color: #ffffff; margin: 14px; outline:1px solid #d6dbe2; border-radius:12px; box-shadow: 0 0 10px rgba(0,0,0,0.1); font-family: Arial, sans-serif;">
                  <tr>
                    <td>
                      <p style="font-size: 14px;">Hi ${candidateName},</p>
      
                      <p style="font-size: 14px;">I hope this email finds you well. We would like to invite you to participate in the <strong>Online assessment</strong> from <strong>ACTE</strong>. To get started, please click on the button below:</p>
      
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
        console.log("eee", expires_at);

        const query = `INSERT INTO assessment_link_log(user_id, test_link, expires_at, status, created_date) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await pool.query(query, [
          user.id,
          testLink,
          expires_at,
          "New",
          user.created_date,
        ]);
        return result;
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
    throw new Error(error.message);
  }
}

const readTestLink = async (id) => {
  try {
    const query = `UPDATE assessment_link_log SET status = 'Read' WHERE id = ?`;
    const [result] = await pool.query(query, [id]);
    return result.affectedRows;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getTestLinkByUser = async (user_id) => {
  try {
    const query = `SELECT
                    id,
                    user_id,
                    test_link,
                    status,
                    CASE WHEN is_completed = 1 THEN 1 ELSE 0 END AS is_completed,
                    created_date
                  FROM
                    assessment_link_log
                  WHERE
                    user_id = ? 
                  ORDER BY created_date;`;

    const [testLinks] = await pool.query(query, [user_id]);

    // Calculate counts
    const unreadCount = testLinks.filter(
      (link) => link.status === "New"
    ).length;
    const readCount = testLinks.filter((link) => link.status === "Read").length;

    // Transform the response structure
    const transformedResponse = {
      unread_count: unreadCount,
      read_count: readCount,
      links: testLinks.map((link) => ({
        id: link.id,
        user_id: link.user_id,
        test_link: link.test_link,
        status: link.status,
        is_completed: link.is_completed,
        created_date: link.created_date,
      })),
    };

    return transformedResponse;
  } catch (error) {
    throw new Error("Error while fetching test links: " + error.message);
  }
};

const sendOTP = async (email) => {
  try {
    const [getUser] = await pool.query(
      `SELECT id, email, name FROM admin WHERE email = ? AND is_active = 1`,
      [email]
    );
    if (getUser.length === 0) {
      throw new Error("Error! Your email is not available in the database.");
    }
    const recipientEmail = getUser[0].email;
    const candidateName = getUser[0].name;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tenMinutesInMs = 5 * 60 * 1000;
    const expiresAt = new Date(Date.now() + tenMinutesInMs);
    const localFormat = moment(expiresAt).format("YYYY-MM-DD HH:mm:ss");

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipientEmail,
      subject: "Your OTP Code",
      html: `<div>
            <p>Dear ${candidateName},</p>
            <p>Your One Time Password (OTP) is <span style=""font-weight: 600;margin-top:6px"">${otp}</span>. This OTP will be valid for next 5 mins.</p>

            <div style=""font-size: 14px;color:#222;"">
            <p style=""margin-bottom: 0px;"">Best Regards,</p>
            <p style=""margin-top: 2px;"">ACTE Placement</p>
            </div>
            </div>`,
    });

    await pool.query(
      "INSERT INTO otp_logs (user_id, email, otp_code, expires_at) VALUES (?, ?, ?, ?)",
      [getUser[0].id, email, otp, localFormat]
    );
  } catch (error) {
    throw new Error("Error while sending otp:" + error.message);
  }
};

const validateOTP = async (email, otp) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM otp_logs 
     WHERE email = ? AND otp_code = ? 
     ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    const otpEntry = rows[0];
    if (!otpEntry) throw new Error("Invalid OTP");

    if (otpEntry.is_used) throw new Error("OTP already used");

    if (new Date() > new Date(otpEntry.expires_at)) {
      // Optionally resend OTP
      throw new Error("OTP expired. Please request a new one.");
    }

    const [updateOTP] = await pool.query(
      `UPDATE otp_logs SET is_used = 1 WHERE id = ?`,
      [otpEntry.id]
    );
    return updateOTP.affectedRows;
  } catch (error) {
    throw new Error("Error while validating otp:" + error.message);
  }
};

const forgotPassword = async (password, email) => {
  try {
    const [checkEmail] = await pool.query(
      `SELECT email FROM admin WHERE email = ? AND is_active = 1`,
      [email]
    );
    if (checkEmail.length === 0) throw new Error("Invalid email");
    const [result] = await pool.query(
      `UPDATE admin SET password = ? WHERE email = ? AND is_active = 1`,
      [password, email]
    );
    return result.affectedRows;
  } catch (error) {
    throw new Error("Error while updating password:" + error.message);
  }
};

module.exports = {
  sendTestLinks,
  readTestLink,
  getTestLinkByUser,
  sendOTP,
  validateOTP,
  forgotPassword,
};
