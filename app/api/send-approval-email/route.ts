import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { to, companyName, token } = await request.json();

    if (!to || !companyName || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const html = `
      <h2>Welcome to GoMoldova!</h2>
      <p>Dear ${companyName},</p>
      <p>Your registration has been approved. Please click the button below to create your password and access your account.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/reset-password" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">Create Password</a>
      <p>After setting up your password, you'll have access to:</p>
      <ul>
        <li>Bus route management</li>
        <li>Schedule updates</li>
        <li>Ticket sales monitoring</li>
        <li>Customer feedback</li>
      </ul>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The GoMoldova Team</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: to,
      subject: 'Welcome to GoMoldova - Registration Approved',
      html: html,
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 