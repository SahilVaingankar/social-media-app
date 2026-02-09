export const EMAIL_VERIFY_TEMPLATE = `<div style="font-family: Arial, sans-serif; color: #333; padding: 20px; line-height: 1.6;">
      <h2 style="color: #4CAF50;">Account Verification</h2>
      <p>Dear user,</p>
      <p>Thank you for signing up. Please use the following One-Time Password (OTP) to verify your account:</p>
      <p style="font-size: 24px; font-weight: bold; color: #000;">OTP: {{otp}}</p>
      <p>This code is valid for a limited time. Please do not share it with anyone.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <br>
      <p>Best regards,<br><strong>social-media-application</strong></p>
    </div>`;
