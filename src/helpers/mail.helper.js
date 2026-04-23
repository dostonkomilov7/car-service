import transporter from "../configs/mail.config.js"

export const sendEmail = (to, subject, content) => {
    transporter.sendMail({
        to,
        subject,
        text: content,
    }, (err, info) => {
        if(err) throw new Error("Mail yuborishda xatolik")
    })
}