import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

serve(async (req) => {
  try {
    const { to, companyName, token } = await req.json()

    if (!to || !companyName || !token) {
      throw new Error('Missing required fields')
    }

    // Log the environment variables for debugging
    console.log("Environment variables check:");
    console.log("SMTP_HOST:", Deno.env.get("SMTP_HOST"));
    console.log("SMTP_PORT:", Deno.env.get("SMTP_PORT"));
    console.log("SMTP_USER:", Deno.env.get("SMTP_USER") ? "Set" : "Not set");
    console.log("SMTP_PASS:", Deno.env.get("SMTP_PASS") ? "Set" : "Not set");
    console.log("SMTP_FROM:", Deno.env.get("SMTP_FROM"));
    console.log("NEXT_PUBLIC_SITE_URL:", Deno.env.get("NEXT_PUBLIC_SITE_URL"));

    const client = new SmtpClient()

    const connectConfig = {
      hostname: Deno.env.get("SMTP_HOST") || "",
      port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
      username: Deno.env.get("SMTP_USER") || "",
      password: Deno.env.get("SMTP_PASS") || "",
    }

    await client.connectTLS(connectConfig)

    const siteUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") || "http://localhost:5173"
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
      from: Deno.env.get("SMTP_FROM") || "",
      to: to,
      subject: "Welcome to GoMoldova - Registration Approved",
      content: html,
    })

    await client.close()

    return new Response(JSON.stringify({ 
      message: "Email sent successfully",
      to: to,
      resetLink: resetLink
    }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: unknown) {
    console.error("Error sending email:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      stack: errorStack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}) 