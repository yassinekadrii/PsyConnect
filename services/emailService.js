/**
 * @file services/emailService.js
 * @description Service for sending emails using nodemailer.
 */

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    const transporterConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    };

    // Optimization for Gmail
    if (process.env.SMTP_HOST === 'smtp.gmail.com') {
        delete transporterConfig.host;
        delete transporterConfig.port;
        transporterConfig.service = 'gmail';
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // If credentials are placeholders, just log the email content
    if (process.env.SMTP_USER === 'your-email@gmail.com' || !process.env.SMTP_PASS) {
        console.log('\n==========================================');
        console.log('📬  EMAIL SIMULATION (No real email sent)');
        console.log(`To:      ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`OTP:     ${options.message.match(/\d{6}/)?.[0] || 'N/A'}`);
        console.log('==========================================\n');

        // Also log to a file for the user to see easily
        const fs = require('fs');
        const logEntry = `[${new Date().toISOString()}] EMAIL TO: ${options.email} | OTP: ${options.message.match(/\d{6}/)?.[0] || 'N/A'}\n`;
        fs.appendFileSync('email-logs.log', logEntry);

        return { success: true, simulated: true };
    }

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Nodemailer Error:', error);
        const fs = require('fs');
        const errorLog = `[${new Date().toISOString()}] EMAIL ERROR to ${options.email}: ${error.message}\n${error.stack}\n\n`;
        fs.appendFileSync('email-errors.log', errorLog);
        throw error;
    }
};

/**
 * Send Verification OTP Email
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP code
 */
const sendVerificationEmail = async (email, otp) => {
    const message = `Votre code de vérification pour PsyConnect est : ${otp}. Ce code expirera dans 10 minutes.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #6366f1; text-align: center;">Vérification PsyConnect</h2>
            <p>Bonjour,</p>
            <p>Merci de vous être inscrit sur PsyConnect. Voici votre code de vérification à usage unique :</p>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e293b; border-radius: 5px; margin: 20px 0;">
                ${otp}
            </div>
            <p>Ce code est valable pendant <strong>10 minutes</strong>. Si vous n'avez pas demandé ce code, veuillez ignorer cet e-mail.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b; text-align: center;">
                © 2024 PsyConnect. Made with Yassine Kadri.
            </p>
        </div>
    `;

    return await sendEmail({
        email,
        subject: 'Code de vérification PsyConnect',
        message,
        html
    });
};

module.exports = {
    sendEmail,
    sendVerificationEmail
};
