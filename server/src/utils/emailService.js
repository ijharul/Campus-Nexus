import nodemailer from 'nodemailer';

/**
 * @desc    Configure SMTP transporter
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * @desc    Notify Super Admin of new college onboarding request
 * @param   {Object} data - { collegeName, requesterEmail }
 */
export const sendCollegeRequestAlert = async ({ collegeName, requesterEmail }) => {
  if (!process.env.GMAIL_USER) return console.log('📧 Email service inactive - no credentials');

  const mailOptions = {
    from: `"Nexus Step AI" <${process.env.GMAIL_USER}>`,
    to: process.env.SUPER_ADMIN_EMAIL || process.env.GMAIL_USER,
    subject: '🚨 Action Required: New Institute Onboarding Request',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0ea5e9;">Institute Onboarding Request</h2>
        <p>A new user has requested to onboard an institute that is not currently in the database.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p><strong>Institute:</strong> ${collegeName}</p>
        <p><strong>Requester:</strong> ${requesterEmail}</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/admin/super/requests" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Review Request</a>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Alert email sent to Super Admin');
  } catch (err) {
    console.error('❌ Email Alert Error:', err);
  }
};

/**
 * @desc    Notify User when their college is approved
 */
export const sendApprovalNotification = async ({ userEmail, collegeName }) => {
  if (!process.env.GMAIL_USER) return;

  const mailOptions = {
    from: `"Nexus Step AI" <${process.env.GMAIL_USER}>`,
    to: userEmail,
    subject: '🎉 Your Institute has been Onboarded!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #10b981;">Onboarding Confirmed</h2>
        <p>Excellent news! Your request to add <strong>${collegeName}</strong> to the platform has been approved by the platform intelligence board.</p>
        <p>Your profile has been automatically updated to reflect your institute membership.</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/login" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Sign In to Nexus IQ</a>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent to user');
  } catch (err) {
    console.error('❌ Email Notification Error:', err);
  }
};
