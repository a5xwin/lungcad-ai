import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', // Brevo SMTP server
    port: 587, // Port 587 uses STARTTLS
    secure: false, // Required for STARTTLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

export default transporter;
 