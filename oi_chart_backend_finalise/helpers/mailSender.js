const nodemailer = require('nodemailer');

const gmailUser = process.env.GMAIL_USER

const sendMail = (to, subject, message) => {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: gmailUser,
                clientId: '13381586265-cg6cle3v6be1qo7kmmmls72k21v07rdr.apps.googleusercontent.com',
                clientSecret: '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',
                refreshToken: '1//04zxoRSlgepTnCgYIARAAGAQSNwF-L9Irq2OCRSewG8yu7iEZf1uvtzTTJsHCvpDY06m-s5d5gbGRmaZerzgs7R_mz4pxI8yfkhw',
                accessToken: 'ya29.a0AXooCgtICorrI4m_EWGkhHLiL3kYcvm5ZhU3lFQ5ZtQtMwtC65QRy_UcfVaumpHcw2L8peEwTcBBC_pIH9oCkrEV6va6Dbde8vv1vwAXaHhmsWxDiyyLHM5PzMSMMs3oNlsV8Yq0GqunNW5RrC_wlFYRPUYX1WKFpwgyaCgYKAeYSARMSFQHGX2MibPlHeJVXW4YT_4T3SfpC9Q0171'
            }
        });

        const mailOptions = {
            from: 'oimagic1992@gmail.com',
            to: to,
            subject: subject,
            html: message
        }

        transporter.sendMail(mailOptions)
            .then((res) => {
                resolve()
            })
            .catch((err) => {
                console.log(err)
            })
    })
}

module.exports = sendMail