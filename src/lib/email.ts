import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email – Nablascha blummers",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #e11d48;">Nablascha blummers</h2>
        <p>Thanks for signing up! Please verify your email address to get started.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#e11d48;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">Verify Email</a>
        <p style="color:#6b7280;font-size:12px;margin-top:16px;">This link expires in 1 hour. If you didn't sign up, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset your password – Nablascha blummers",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #e11d48;">Nablascha blummers</h2>
        <p>You requested a password reset. Click below to set a new password.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#e11d48;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">Reset Password</a>
        <p style="color:#6b7280;font-size:12px;margin-top:16px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
