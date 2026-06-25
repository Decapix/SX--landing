import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type Body = {
  firstName?: string
  lastName?: string
  email?: string
  position?: string
  socialMedia?: string
  language?: string
  message?: string
  company?: string // honeypot
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_SERVER,
  port: Number(process.env.EMAIL_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function POST(req: Request) {
  try {
    const body: Body = await req.json()

    const {
      firstName = '',
      lastName = '',
      email = '',
      position = '',
      socialMedia = '',
      language = '',
      message = '',
      company = ''
    } = body || {}

    // Honeypot anti-spam: silently accept if filled
    if (company && company.trim() !== '') {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ success: false, message: 'Invalid email' }, { status: 400 })
    }

    if (message.length > 10000) {
      return NextResponse.json({ success: false, message: 'Message too long' }, { status: 400 })
    }

    const subject = `Nouveau message de contact - ${firstName} ${lastName}`
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Nouveau message de contact</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
          <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Position:</strong> ${position}</p>
          <p><strong>Réseaux sociaux:</strong> ${socialMedia || 'Non fourni'}</p>
          <p><strong>Langue:</strong> ${language}</p>
        </div>
        <div style="margin-top: 20px; padding: 20px; background-color: #fff; border-left: 4px solid #000;">
          <h3 style="margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: ['contact@inside-runway.com', 'tech@inside-runway.com'],
      replyTo: email,
      subject,
      html: htmlContent,
    })

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to send email'
    }, { status: 500 })
  }
}
