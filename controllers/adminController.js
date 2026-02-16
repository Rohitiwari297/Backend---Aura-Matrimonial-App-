import User from "../models/userSchema.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

/**
 * ALL CONTROLLERS
 */

export const logInAdmin = async (req, res) => {
    const { email, password, roleType } = req.body;

    try {
        if (!email || !password || !roleType) {
            res.status(404).json({
                success: false,
                message: 'All fields are required'
            })
        }

        const user = await User.findOne({ email })
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized ! this email not registered'

            })
        }

        const comparePass = await bcrypt.compare(password.toString(), user.password.toString())
        if (!comparePass) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized ! invalide password '
            })
        }

        const accessToken = jwt.sign(
            { email, id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: process.env.EXPIRED_ID }
        )

        res.status(200).json({
            success: true,
            message: 'Admin loggedIn successfully',
            accessToken: accessToken,
            data: [
                {
                    name: user.name,
                    email: user.email,
                    photo: user.profilePhotos[0]
                }
            ]
        })

        //console.log("admin user",user)
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while loging the admin',
            error: error.message
        })
    }
}