const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    console.log('Function started, parsing request body');
    const { to, subject, html } = JSON.parse(event.body);

    // Validate inputs
    if (!to || !subject || !html) {
      console.log('Missing required fields:', { to, subject, htmlPresent: !!html });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    console.log('Creating transporter with credentials');
    // Log environment variables (without revealing full values)
    console.log('Environment check:', { 
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? 'Set' : 'Not set',
      pass: process.env.SMTP_PASS ? 'Set' : 'Not set' 
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    console.log('Sending email');
    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'GoMoldova <noreply@gomoldova.app>',
      to,
      subject,
      html
    });

    console.log('Email sent successfully:', info.messageId);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Email sent successfully',
        messageId: info.messageId
      })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message,
        stack: error.stack
      })
    };
  }
}; 