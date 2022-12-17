const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const welcomeEmail = (email, name) => {
    sgMail
        .send({
            to: email, // Change to your recipient
            from: 'fawadk2543@gmail.com', // Change to your verified sender
            subject: 'Weclome',
            text: `Welcome ${name}`,
            html: '<strong>Thanks for joining us.</strong>',
        })
}

const goodByeEmail = (email, name) => {
    sgMail
        .send({
            to: email, // Change to your recipient
            from: 'fawadk2543@gmail.com', // Change to your verified sender
            subject: 'Goodbye',
            text: `Goodbye ${name}`,
            html: '<strong>Hope you enjoy our services.</strong>',
        })
}

module.exports = {
    welcomeEmail, goodByeEmail
}