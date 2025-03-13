
const nodemailer = require('nodemailer');

const {htmlToText} = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `SkyFlow <${process.env.EMAIL_FROM}>`;
    }

    newTransport(){
        //Producttion thì gửi thật còn developer thì gửi qua mail
        if(process.env.NODE_ENV === 'production') {
            // Sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            // Tùy chọn đăng nhập
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject){
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html, 
            text: htmlToText(html),
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset(){
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
    }
}


// Thêm thông tin cấu hình tùy chọn
// auth: {
//     type: "OAuth2",
//     clientId: process.env.EMAIL_CLIENT_ID,
//     clientSecret: process.env.EMAIL_CLIENT_SECRET,
//     refreshToken: process.env.EMAIL_REFRESH_TOKEN
// }