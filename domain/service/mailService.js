const { google } = require("googleapis");
const nodemailer = require("nodemailer");




const Mail = {
    sendMail: async (toMail, password) => {
        const CLIENT_ID = process.env.CLIENT_ID
        const CLIENT_SECRET = process.env.CLIENT_SECRET
        const REDIRECT_URI = process.env.REDIRECT_URI
        const REFRESH_TOKEN = process.env.REFRESH_TOKEN

        const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)
        oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })
        try {
            const accessToken = await oAuth2Client.getAccessToken();
            // console.log(accessToken);
            // let transporter = nodemailer.createTransport({
            //     host: "smtp.ethereal.email",
            //     port: 587,
            //     secure: false, // true for 465, false for other ports
            //     auth: {
            //       user:"quocthai2000xx@gmail.com", // generated ethereal user
            //       pass: "Thai123456", // generated ethereal password
            //     },
            //   });

            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    type: "OAuth2",
                    user: "quocthai2000xx@gmail.com",
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken,
                },
                // service: 'gmail',
                // auth: {
                //   type: 'OAuth2',
                //   user: process.env.MAIL_USERNAME,
                //   pass: process.env.MAIL_PASSWORD,
                //   clientId: process.env.OAUTH_CLIENTID,
                //   clientSecret: process.env.OAUTH_CLIENT_SECRET,
                //   refreshToken: process.env.OAUTH_REFRESH_TOKEN
                // }
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: 'Thai worknet',
                to: toMail,
                subject: 'Thư tạo tài khoản công ty',
                text: 'You recieved message from Thai worknet',
                html: '<p>You have got a new message</b><ul><li>Tên tài khoản:' + toMail + '</li><li>Password:' + password + '</li></ul>'
            });
            if(info){
                return true
            }else{
                throw new Error("Send fail")
            }
        } catch (error) {
            throw new Error(error);
        }
    }
}


module.exports = Mail