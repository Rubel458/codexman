import nodemailer from "nodemailer"

function transporter() {
  const port = Number(process.env.SMTP_PORT || 587)
  if (!process.env.SMTP_HOST) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
}

export async function notifyNewLead(lead: { name?: string | null; company?: string | null; phone?: string | null; email?: string | null; message: string }) {
  const mailer = transporter()
  if (!mailer || !process.env.ADMIN_NOTIFICATION_EMAIL) return
  await mailer.sendMail({
    from: process.env.SMTP_FROM || "IT Lab BD <no-reply@itlabbd.com>",
    to: process.env.ADMIN_NOTIFICATION_EMAIL,
    subject: "New website enquiry",
    text: `A visitor submitted a new website enquiry.\n\n${lead.message}`,
  })
}

export async function sendPasswordReset(email: string, resetUrl: string) {
  const mailer = transporter()
  if (!mailer) return false
  await mailer.sendMail({
    from: process.env.SMTP_FROM || "IT Lab BD <no-reply@itlabbd.com>",
    to: email,
    subject: "Reset your IT Lab BD admin password",
    text: `Open this secure link to reset your password. It expires in 30 minutes: ${resetUrl}`,
  })
  return true
}

export async function sendLeadReply(to: string, subject: string, message: string) {
  const mailer = transporter()
  if (!mailer) return false
  await mailer.sendMail({ from: process.env.SMTP_FROM || "IT Lab BD <no-reply@itlabbd.com>", to, subject, text: message })
  return true
}
