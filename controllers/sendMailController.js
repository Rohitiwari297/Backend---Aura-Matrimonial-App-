import User from '../models/userSchema.js'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'

//send otp on email
export const sendMail = async (req, res) => {
    try {

        const { email } = req.body;
        console.log('user email:', email);

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check email in database
        const findMailInDb = await User.findOne({ email });
        if (!findMailInDb) {
            return res.status(400).json({
                success: false,
                message: 'Email does not exist'
            });
        }

        // Generate OTP
        const generateOtp = Math.floor(100000 + Math.random() * 900000);
        console.log("Generated OTP:", generateOtp);

        // Save OTP in DB (recommended)
         findMailInDb.otp = generateOtp;
         findMailInDb.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
         await findMailInDb.save();

        // Mail transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,                     // only for testing perpose
            //host: "smtp-relay.brevo.com",
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Send mail
        let info = await transporter.sendMail({
            from: '"Rohit RSS" <emmalee.schinner75@ethereal.email>',
            to: findMailInDb.email,
            subject: "OTP - Shyam Aura",
            text: `Your login OTP is ${generateOtp}. It is valid for 10 minutes.`,
            html: `<h3>Your OTP is: <b>${generateOtp}</b></h3>
                   <p>This OTP is valid for 10 minutes.</p>`
        });

        console.log("Message sent:", info.messageId);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            email: findMailInDb.email
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error sending email",
            error: error.message
        });
    }
};


// login with opt 
export const loginWithMailOtp = async  (req, res) => {
    const {email , otp } = req.body

    try {
         if (!email || !otp) {
            res.status(400).json({
                success: false,
                message: 'email & opt both required'
            })
         }

         const user = User.findOne({email})
         if (!user) {
            res.status(400).json({
                success: false,
                message: 'user Not exist'
            })
         }

         // compare both otp
         const compareOtp = toString(user.otp) === toString(otp)
         if (!compareOtp){
            res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            })
         }

         const token = jwt.sign(
            {userId: user._id},
            process.env.SECRET_KEY,
            // { expiresIn: process.env.JWT_EXPIRE || "7d" }
         )

         // remove otp
         user.otp = undefined;

         // send the response to the user
         res.status(200).json({
            success: true,
            message: 'User login successfully',
            token: token
         })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while login with opt',
            error: error.message
        })
    }
}
