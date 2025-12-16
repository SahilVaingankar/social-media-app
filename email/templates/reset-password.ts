export const PASSWORD_RESET_TEMPLATE = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
  <h2>Password Reset Request</h2>
  <p>Hello {{user}},</p>
  <p>Your OTP for resetting your password is:</p>
  <div style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #333;">
    <span id="otp">{{otp}}</span>
    <span 
      title="Copy OTP" 
      onclick="copyOTP()" 
      style="cursor: pointer; margin-left: 8px; color: #007BFF;"
    >⧉</span>
  </div>
  <p>Please use this OTP to proceed with resetting your password.</p>
  <p>If you didn’t request this, please ignore this email.</p>
  <br />
  <p>Regards,<br/>Your App Team</p>
</div>

<script>
  function copyOTP() {
    const otp = document.getElementById("otp").textContent.trim();
    if (navigator.clipboard && window.isSecureContext) {
      // Modern browsers
      navigator.clipboard.writeText(otp).then(
        () => alert("OTP copied to clipboard!"),
        (err) => alert("Failed to copy OTP: " + err)
      );
    } else {
      // Fallback for older mobile browsers
      const textarea = document.createElement("textarea");
      textarea.value = otp;
      textarea.style.position = "fixed";  // Prevent scrolling to bottom on iOS
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const successful = document.execCommand("copy");
        alert(successful ? "OTP copied to clipboard!" : "Copy failed");
      } catch (err) {
        alert("Fallback copy failed: " + err);
      }
      document.body.removeChild(textarea);
    }
  }
</script>`;
