import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


//DB
import User from '../models/userSchema.js'

// User registration 
const userRegister = async (req, res) => {
    // res.send('User registered successfully');
    try {
        const {
            profileType,
            fullName,
            gender,
            dateOfBirth,
            email,
            phone,
            password,
            religion,
            caste,
            education,
            occupation,
            location,
            about,
            partnerPreferences,
        } = req.body;


        // Check required fields
        if (!profileType || !fullName || !gender || !dateOfBirth || !email || !phone || !password) {
            return res.status(400).json({ message: "All required fields must be filled" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        //if new user then we have to encrypt the pass
        const hashedPassword = await bcrypt.hash(password, 10);

        //hold all the user detials in a veriable
        const newUser = new User({
            profileType,
            fullName,
            gender,
            dateOfBirth,
            email,
            phone,
            password: hashedPassword,
            religion,
            caste,
            education,
            occupation,
            location,
            about,
            partnerPreferences,
        })

        //use save method
        await newUser.save()

        //send response the to user
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                phone: newUser.phone,
            },
        })
    } catch (error) {
        res.status(500).json({
            message: 'server error',
            error: error.message
        })
    }
};

// Get all users 
const getUsers = async (req, res) => {
    console.log('hello')
    //fetch all the users
    try {
        //find the users and without password
        const users = await User.find().select("-password");
        res.status(200).json({
            message: 'Users fetched successfully',
            users: users,
        })
    } catch (error) {
        res.status(500).json({
            message: 'server error',
            error: error.message
        })
    }
};

// Login user with email & password
const loginUser = async (req, res) => {
    //received data from the user
    const { email, password } = req.body;



    //vailidations
    if (!email, !password) {
        res.status(400).json({
            message: "Email and Password can't be empty",
        })
    }

    //after validation match the details from the db
    let user = await User.findOne({ email })
    //validations
    if (!user) {
        res.status(500).json({
            message: 'email not registered'
        })
    }

    if (user) {
        //console.log("user from db:",user.password)

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign(
                { email, id: user._id },
                process.env.SECRET_KEY,
                { expiresIn: process.env.EXPIRED_ID }
            );

            res.status(200).json({
                message: "User login successful",
                token,
                user,
            });

        } else {
            res.status(401).json({ message: "Invalid password" });
        }
    } else {
        res.status(404).json({ message: "User not found" });
    }



}

//Login user with mobile number otp
const loginWithOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!phone) {
      return res.status(400).json({
        message: 'Mobile number is required',
      });
    }

    // Validate the number in DB
    const user = await User.findOne({ phone }); // <-- await is important

    if (!user) {
      return res.status(404).json({
        message: 'This number is not registered',
      });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Save OTP to DB 
    user.otp = otp;
    await user.save();

    // (For now) simulate sending OTP via SMS API
    console.log(`Sending OTP ${otp} to ${phone}`);

    // Send response
    return res.status(200).json({
      message: 'OTP sent successfully',
      otp, // remove this in production for security
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};


    

// Export all controllers
export { userRegister, getUsers, loginUser, loginWithOtp };
