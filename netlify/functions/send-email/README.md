# Send Email Netlify Function

This Netlify function provides email sending capabilities for the GoMoldova application.

## Usage

The function accepts POST requests with the following JSON body:

```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<p>Email HTML content</p>"
}
```

## Setup

1. Make sure all environment variables are set in the Netlify dashboard:
   - `SMTP_HOST`: Your SMTP server host (e.g., smtp.gmail.com)
   - `SMTP_PORT`: Your SMTP server port (e.g., 587 for TLS or 465 for SSL)
   - `SMTP_USER`: Your SMTP username/email
   - `SMTP_PASS`: Your SMTP password or app password
   - `SMTP_FROM`: The email address to send from (e.g., "GoMoldova <noreply@gomoldova.app>")

2. For Gmail, you'll need to create an "App Password" in your Google account:
   - Go to your Google Account settings
   - Navigate to Security > 2-Step Verification
   - Scroll down to "App passwords"
   - Select "Mail" as the app and your device name
   - Use the generated 16-character password as your `SMTP_PASS`

## Troubleshooting

If you're getting a 500 error from the function:

1. Check your Netlify function logs in the Netlify dashboard
2. Verify that all environment variables are set correctly
3. For Gmail, make sure you're using an App Password, not your regular account password
4. Try the `/test-email.html` page to test the function directly

## Testing

You can test the function by visiting `/test-email.html` on your site. 