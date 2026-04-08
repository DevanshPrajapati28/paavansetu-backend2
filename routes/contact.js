const express = require('express');
const router = express.Router();
// const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── SMTP TRANSPORTER ─────────────────────────────────────
const dns = require('dns');

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   lookup: (hostname, options, callback) => {
//     return dns.lookup(hostname, { family: 4 }, callback); // 🔥 FORCE IPv4
//   },
// });
// Verify transporter

// transporter.verify((error) => {
//   if (error) {
//     console.error('SMTP Error:', error);
//   } else {
//     console.log('SMTP Server is ready');
//   }
// });

// ─── POST /api/contact ────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required.',
      });
    }

    // 🚀 SEND EMAIL FIRST (IMPORTANT)
    const adminResponse = await resend.emails.send({
      from: 'Paavan Setu <onboarding@resend.dev>',
      to: process.env.EMAIL_USER,
      subject: `New Contact - ${service || 'General'}`,
      html: `
        <h2>New Contact Submission</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Email:</b> ${email || 'N/A'}</p>
        <p><b>Service:</b> ${service || 'N/A'}</p>
        <p><b>Message:</b> ${message || 'N/A'}</p>
      `,
    });

    console.log("Admin email:", adminResponse);

    if (email) {
      const replyResponse = await resend.emails.send({
        from: 'paavan.setu@gmail.com',
        to: email,
        subject: "We've received your message ✅",
        html: `
          <p>Hi ${name},</p>
          <p>Thank you for reaching out.</p>
          <p>${message || ''}</p>
        `,
      });

      console.log("Auto reply:", replyResponse);
    }

    // ✅ SEND RESPONSE AFTER EMAIL
    res.status(201).json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (err) {
    console.error("Resend error:", err);

    res.status(500).json({
      success: false,
      message: "Email failed",
    });
  }
});

// ─── GET (REMOVED DB LOGIC) ───────────────────────────────
// Since no database, this route is not useful anymore
router.get('/', async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'No database connected',
  });
});

module.exports = router;
