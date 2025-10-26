# Birthday Wishing App

A comprehensive company birthday management system that automatically sends personalized birthday wishes via Outlook email.

## Features

- **Employee Management**: Add employees with name, designation, team, DOB, and profile picture
- **Template Management**: Upload and manage custom birthday card templates
- **Automated Emails**: Automatically sends birthday wishes via Outlook on employee birthdays
- **Visual Dashboard**: View all employees with upcoming birthday countdown
- **Custom Messages**: Personalized emails with employee details and photos

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Nodemailer (for email)
- File-based storage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:

Create a `.env.local` file with your Outlook SMTP credentials:

```env
# Outlook SMTP Configuration
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your_email@company.com
SMTP_PASS=your_password

# Optional: Base URL for production
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Cron job security
CRON_SECRET=your-secure-random-string
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-651c69ca
```

## Usage

1. **Add Employees**: Navigate to "Add Employee" and fill in details
2. **Upload Templates**: Go to "Templates" to upload birthday card designs
3. **Monitor Birthdays**: View employee list with birthday countdown
4. **Automated Emails**: System automatically sends emails on birthdays at 9 AM daily
