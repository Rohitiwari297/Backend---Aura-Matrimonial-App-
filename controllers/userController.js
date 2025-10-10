//DB
import User from '../models/userSchema.js'

// User registration 
const userRegister = async (req, res) => {
    res.send('User registered successfully');
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
    if (!profileType|| !fullName || !gender || !dateOfBirth || !email || !phone || !password) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //if new user then we have to encrypt the pass
    // const hashedPassword = await bcrypt.hash(password, 10);

    //hold all the user detials in a veriable
    const newUser = new User ({
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
            users: finalUsers,   
        })
    } catch(error) {
        res.status(500).json({
            message: 'server error',
            error: error.message
        })
    }
};

// Export all controllers
export { userRegister, getUsers };
