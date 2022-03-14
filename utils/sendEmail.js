const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp-mail.outlook.com',
            port: 587,
            auth: {
                user: "GameSavePasswordRecovery@outlook.com",
                pass: "9)'fuvg4-ZmbHAfz"
            }
        });

        await transporter.sendMail({
            from: "GameSavePasswordRecovery@outlook.com",
            to: email,
            subject: subject,
            html: '<p>Click <a href=' + html + '>here</a> to reset your password</p>',
        });

    } catch (error) {
    }
};

module.exports = sendEmail;