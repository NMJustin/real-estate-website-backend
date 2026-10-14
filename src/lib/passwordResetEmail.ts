import nodemailer from 'nodemailer';

interface MailConfig {
  frontendUrl: string;
  from: string;
  transporter: nodemailer.Transporter;
}

const getMailConfig = (): MailConfig | null => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, FRONTEND_URL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM || !FRONTEND_URL) return null;

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid port number.');
  }

  return {
    frontendUrl: FRONTEND_URL.replace(/\/+$/, ''),
    from: SMTP_FROM,
    transporter: nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    }),
  };
};

export const isEmailConfigured = () => getMailConfig() !== null;
export const isPasswordResetEmailConfigured = isEmailConfigured;

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const config = getMailConfig();
  if (!config) throw new Error('Password reset email is not configured.');

  const resetUrl = new URL('/portal/reset-password', `${config.frontendUrl}/`);
  resetUrl.searchParams.set('token', token);

  try {
    await config.transporter.sendMail({
      from: config.from,
      to: email,
      subject: 'Reset your Ingata account password',
      text: `Use this link to reset your password. The link expires in 30 minutes and can only be used once:\n\n${resetUrl.toString()}\n\nIf you did not request this, you can ignore this email.`,
      html: `<p>Use the link below to reset your password. It expires in 30 minutes and can only be used once.</p><p><a href="${resetUrl.toString()}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email. Please check your SMTP configuration.');
  }
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

export const sendContactReplyEmail = async ({
  to,
  subject,
  message,
}: {
  to: string;
  subject: string;
  message: string;
}) => {
  const config = getMailConfig();
  if (!config) throw new Error('Email delivery is not configured.');

  try {
    await config.transporter.sendMail({
      from: config.from,
      to,
      subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.5; white-space: pre-wrap">${escapeHtml(message)}</div>`,
    });
  } catch (error) {
    console.error('Failed to send contact reply email:', error);
    throw new Error('Failed to send email. Please check your SMTP configuration.');
  }
};
