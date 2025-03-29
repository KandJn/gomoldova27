import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

serve(async (req) => {
  try {
    const { to, companyName, token } = await req.json()

    if (!to || !companyName || !token) {
      throw new Error('Missing required fields')
    }

    const client = new SmtpClient()

    const connectConfig = {
      hostname: Deno.env.get("SMTP_HOSTNAME") || "",
      port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
      username: Deno.env.get("SMTP_USERNAME") || "",
      password: Deno.env.get("SMTP_PASSWORD") || "",
    }

    await client.connectTLS(connectConfig)

    const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "http://localhost:3000"
    const resetLink = `${siteUrl}/reset-password?token=${token}`

    const html = `
      <h2>Welcome to GoMoldova!</h2>
      <p>Dear ${companyName},</p>
      <p>Your registration has been approved. Please click the button below to create your password and access your account.</p>
      <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">Create Password</a>
      <p>After setting up your password, you'll have access to:</p>
      <ul>
        <li>Bus route management</li>
        <li>Schedule updates</li>
        <li>Ticket sales monitoring</li>
        <li>Customer feedback</li>
      </ul>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The GoMoldova Team</p>
    `

    await client.send({
      from: Deno.env.get("SMTP_FROM_EMAIL") || "",
      to: to,
      subject: "Welcome to GoMoldova - Registration Approved",
      html: html,
    })

    await client.close()

    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}) 