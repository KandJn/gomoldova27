# GoMoldova

A modern web application for bus ticket booking in Moldova.

## Features

- User authentication with Supabase
- Bus ticket booking system
- Real-time notifications
- Multi-language support
- Responsive design

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Google Maps API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site Configuration
VITE_SITE_URL=http://localhost:5173

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Supabase Configuration

1. Create a new project in Supabase
2. Go to Authentication > Email Templates
3. Configure the following templates:

### Confirm Signup Template
```html
<h2>Confirm your signup</h2>
<p>Hello,</p>
<p>Thank you for signing up for GoMoldova. Please click the button below to confirm your email address:</p>
<a href="{{ .ConfirmationURL }}" style="background-color: #4285F4; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Confirm Email</a>
<p>If you didn't create an account, you can safely ignore this email.</p>
<p>Thanks,<br>GoMoldova Team</p>
```

### Reset Password Template
```html
<h2>Reset Your Password</h2>
<p>Hello,</p>
<p>Click the button below to reset your password:</p>
<a href="{{ .ConfirmationURL }}" style="background-color: #4285F4; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Reset Password</a>
<p>If you didn't request this, please ignore this email.</p>
<p>Thanks,<br>GoMoldova Team</p>
```

4. Configure Email Settings:
   - Go to Project Settings > Authentication
   - Set Site URL to your application URL
   - Add these Redirect URLs:
     ```
     http://localhost:5173/reset-password/confirm
     http://localhost:5173/auth/confirm
     ```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gomoldova.git
cd gomoldova
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Building for Production

```bash
npm run build
# or
yarn build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.