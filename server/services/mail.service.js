const config = require('../../config/config');

function send(content, subject, email) {
    let nodemailer = require("nodemailer");
    let smtpTransport = require('nodemailer-smtp-transport');
    let transport = smtpTransport(config.smtp);
    let transporter = nodemailer.createTransport(transport);
    let message = {
        from: {
            name: 'Test API',
            address: config.mailInfo.fromAddress
        },
        to: email || config.mailInfo.to,
        subject: subject
    };
    message.html = content;
    return transporter.sendMail(message);
}
module.exports = {send};
