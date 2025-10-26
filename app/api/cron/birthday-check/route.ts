import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'

const DATA_DIR = path.join(process.cwd(), 'data')
const EMPLOYEES_FILE = path.join(DATA_DIR, 'employees.json')
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json')

interface Employee {
  id: string
  name: string
  email: string
  designation: string
  team: string
  dob: string
  photo?: string
}

interface Template {
  id: string
  name: string
  url: string
}

async function readEmployees(): Promise<Employee[]> {
  try {
    if (!existsSync(EMPLOYEES_FILE)) {
      return []
    }
    const data = await readFile(EMPLOYEES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function readTemplates(): Promise<Template[]> {
  try {
    if (!existsSync(TEMPLATES_FILE)) {
      return []
    }
    const data = await readFile(TEMPLATES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function isBirthdayToday(dob: string): boolean {
  const today = new Date()
  const birthDate = new Date(dob)

  return (
    today.getMonth() === birthDate.getMonth() &&
    today.getDate() === birthDate.getDate()
  )
}

async function sendBirthdayEmail(employee: Employee, template?: Template) {
  const smtpHost = process.env.SMTP_HOST || 'smtp.office365.com'
  const smtpPort = parseInt(process.env.SMTP_PORT || '587')
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpUser || !smtpPass) {
    console.error('SMTP credentials not configured')
    return false
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    const photoHtml = employee.photo
      ? `<img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${employee.photo}" alt="${employee.name}" style="width: 200px; height: 200px; border-radius: 50%; object-fit: cover; margin: 20px 0;" />`
      : ''

    const templateHtml = template
      ? `<img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${template.url}" alt="Birthday Card" style="max-width: 600px; width: 100%; margin: 20px 0;" />`
      : ''

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px;
              border-radius: 10px;
              text-align: center;
              color: white;
            }
            .content {
              background: white;
              color: #333;
              padding: 30px;
              border-radius: 10px;
              margin-top: 20px;
            }
            h1 {
              font-size: 36px;
              margin: 0 0 20px 0;
            }
            .emoji {
              font-size: 48px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="emoji">🎉🎂🎈</div>
            <h1>Happy Birthday, ${employee.name}!</h1>
            <div class="content">
              ${photoHtml}
              ${templateHtml}
              <p style="font-size: 18px; margin: 20px 0;">
                Wishing you a wonderful birthday filled with joy and happiness!
              </p>
              <p style="color: #666;">
                <strong>Name:</strong> ${employee.name}<br>
                <strong>Designation:</strong> ${employee.designation}<br>
                <strong>Team:</strong> ${employee.team}
              </p>
              <p style="margin-top: 30px; color: #666;">
                From all of us at the company, we hope you have an amazing day!
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: smtpUser,
      to: employee.email,
      subject: `🎉 Happy Birthday ${employee.name}!`,
      html: htmlContent,
    })

    console.log(`Birthday email sent to ${employee.name} (${employee.email})`)
    return true
  } catch (error) {
    console.error(`Failed to send email to ${employee.email}:`, error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employees = await readEmployees()
    const templates = await readTemplates()

    const birthdayEmployees = employees.filter((emp) => isBirthdayToday(emp.dob))

    if (birthdayEmployees.length === 0) {
      return NextResponse.json({
        message: 'No birthdays today',
        count: 0,
      })
    }

    // Use the first template if available
    const template = templates.length > 0 ? templates[0] : undefined

    const results = await Promise.all(
      birthdayEmployees.map((emp) => sendBirthdayEmail(emp, template))
    )

    const successCount = results.filter((r) => r).length

    return NextResponse.json({
      message: `Processed ${birthdayEmployees.length} birthdays`,
      count: birthdayEmployees.length,
      successCount,
      employees: birthdayEmployees.map((emp) => ({
        name: emp.name,
        email: emp.email,
      })),
    })
  } catch (error) {
    console.error('Birthday check error:', error)
    return NextResponse.json(
      { error: 'Failed to process birthdays' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
