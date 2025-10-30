import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


//DB
import User from '../models/userSchema.js'

// User registration 
const userRegister = async (req, res) => {
  try {
    const {
      profileType,
      fullName,
      gender,
      age,
      height,
      dateOfBirth,
      email,
      phone,
      password,
      religion,
      caste,
      subcaste,
      manglik,
      education,
      otherQualification,
      annualIncome,
      occupation,
      location,
      workLocation,
      employedIn,
      maritalStatus,
      horoscope,
      familyDetails,
    } = req.body;

    // Validation for required fields (username not required)
    if (
      !profileType ||
      !fullName ||
      !gender ||
      !dateOfBirth ||
      !email ||
      !phone ||
      !password ||
      !age
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    // Check if user already exists by email or phone
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object
    const newUser = new User({
      profileType,
      fullName,
      gender,
      age,
      height,
      dateOfBirth,
      email,
      phone,
      password: hashedPassword,
      religion,
      caste,
      subcaste,
      manglik,
      education,
      otherQualification,
      annualIncome,
      occupation,
      location,
      workLocation,
      employedIn,
      maritalStatus,
      horoscope,
      familyDetails,
    });

    // Save user
    await newUser.save();

    // Respond success
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
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

// Login user with mobile number otp
const generateOtp = async (req, res) => {
  try {
    console.log('Printing req header:', req.headers);
    console.log('GenerateOtp called');
    console.log('Request body:', req.body);
    const { phone } = req.body;

    // Validate phone number
    if (!phone) {
      return res.status(400).json({
        message: 'Mobile number is required',
      });
    }

    // Check if user exists
    const user = await User.findOne({ phone });
    console.log('User found for OTP:', user);

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

    // Simulate sending OTP
    console.log(`Sending OTP ${otp} to ${phone}`);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otp, // remove this in production
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};


//Login user with received OTP
const receivedOtp = async (req, res) => {
  try {
    console.log('receivedOtp called');
    console.log('Request body:', req.body);

    const { phone, otp } = req.body;

    // Validate input
    if (!phone || !otp) {
      return res.status(400).json({
        message: 'Phone number and OTP are required',
      });
    }

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Compare OTP (convert to same type)
    if (String(user.otp) !== String(otp)) {
      return res.status(401).json({
        message: 'Invalid OTP',
      });
    }

    // OTP is valid → clear it from DB
    user.otp = undefined; // or null
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    console.log(`User ${user.phone} logged in successfully and OTP cleared`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
    });

  } catch (error) {
    console.error('Error in receivedOtp:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

//profile setup
const createProfile = async (req, res) => {
  try {
    console.log("profileSetup called");
    console.log("User from req.user:", req.user);

    const { about } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found in token" });
    }

    if (!about) {
      return res.status(400).json({ message: "About field is required" });
    }

    // Check for uploaded files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Fetch current user to check how many images already exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingImages = user.profilePhotos || [];

    // Build URLs for all uploaded images
    const newImageUrls = req.files.map(file =>
      `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    );

    // Enforce a maximum of 4 images total
    if (existingImages.length + newImageUrls.length > 4) {
      return res.status(400).json({
        message: `You can upload a maximum of 4 images. You already have ${existingImages.length}.`,
      });
    }

    // Update user profile (append new images)
    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      {
        about,
        $push: {
          profilePhotos: { $each: newImageUrls.map(url => ({ url })) },
        },
      },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile setup completed successfully",
      user: updatedProfile,
    });
  } catch (error) {
    console.error("Error in profileSetup:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get userProfile
const getUserProfile = async (req, res) => {

    try {
        
        //received query parameter 
        const userId = req.user?._id;
    
        console.log('fatching present user',userId);
    
        if(!userId){
            res.status(401).json({
                success: false,
                message: 'user not found, please login'
            })
        }
    
        const user = await User.findById(userId).select("-password");
    
        // If no user found
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User does not exist",
          });
        }
    
        return res.status(200).json({
          success: true,
          message: "Profile fetched successfully",
          user,
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
        });
    }

}

const partnerPreferences = async (req, res) => {
    const { age, heightRange, state, education, income, cast, language, manglik, city, occupation, religion } = req.body;

    //validations if any fields requred
    if(!age, !heightRange, !state, !education, !income, !cast, !language, !manglik, !city, !occupation, !religion){
        res.status(500).json({
            success: false,
            message: 'all fields are required'
        })
    }
    //try-catch
    try {
        //update on behalf of the userID
        const userId = req.user?.id;
        console.log('userid from the user', userId)

        if (!userId) {

            res.status(401).json({
                success: false,
                message: 'Unauthorized: User not found in token'
            })

        }

        //Update user partner preferences
        const updatePreference = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    partnerPreferences: {
                        ageRange: {
                            min: age.min || age, // supports single value or object {min, max}
                            max: age.max || age,
                        },
                        heightRange: {
                            min: heightRange.min || heightRange,
                            max: heightRange.max || heightRange,
                        },
                        religion,
                        caste: cast,
                        location: {
                            state,
                            city,
                        },
                        education,
                        occupation,
                        income,
                        language,
                        manglik,
                    },

                }
            },
            { new: true } // for returns updated document
        )

        //validations
        if (!updatePreference) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });

           

        }

         //send respons

        res.status(200).json({
            success: true,
            message: "Partner preferences updated successfully",
            data: updatePreference.partnerPreferences,
        });



    } catch (error) {
        console.error("Error updating partner preferences:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",

        });
    }

}

//send Follow Request
const sendFollowRequest = async (req, res) => {
  try {
    const usernameOne = req.user?._id; // requester (me)
    const usernameTwo = req.params.id; // target user

    console.log('Requester:', usernameOne);
    console.log('Target:', usernameTwo);

    if (!usernameOne || !usernameTwo) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    if (usernameOne === usernameTwo) {
      return res.status(400).json({ success: false, message: "You can't follow yourself" });
    }

    const targetUser = await User.findOne({ username: usernameTwo });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if already following or requested
    if (targetUser.followers.includes(usernameOne)) {
      return res.status(400).json({ success: false, message: 'Already following this user' });
    }

    if (targetUser.followRequests.includes(usernameOne)) {
      return res.status(400).json({ success: false, message: 'Follow request already sent' });
    }

    // Add follow request to receiver and sent request to sender
    await User.findOneAndUpdate(
      { username: usernameTwo },
      { $addToSet: { followRequests: usernameOne } },
      { new: true }
    );

    await User.findOneAndUpdate(
      { username: usernameOne },
      { $addToSet: { sentRequests: usernameTwo } },
      { new: true }
    );

    return res.status(200).json({ success: true, message: 'Follow request sent successfully' });
  } catch (error) {
    console.error('Error in sendFollowRequest:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


//accept Follow Request
const acceptFollowRequest = async (req, res) => {
  try {
    const usernameOne = req.user?.username; // me (the receiver)
    const usernameTwo = req.params.username; // sender of the request

    console.log('Receiver:', usernameOne);
    console.log('Sender:', usernameTwo);

    const user = await User.findOne({ username: usernameOne });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if request exists
    if (!user.followRequests.includes(usernameTwo)) {
      return res.status(400).json({ success: false, message: 'No follow request from this user' });
    }

    // Update both users
    await User.findOneAndUpdate(
      { username: usernameOne },
      {
        $pull: { followRequests: usernameTwo },
        $addToSet: { followers: usernameTwo },
      }
    );

    await User.findOneAndUpdate(
      { username: usernameTwo },
      {
        $pull: { sentRequests: usernameOne },
        $addToSet: { followings: usernameOne },
      }
    );

    return res.status(200).json({ success: true, message: 'Follow request accepted' });
  } catch (error) {
    console.error('Error in acceptFollowRequest:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


//reject Follow Request
const rejectFollowRequest = async (req, res) => {
  try {
    const usernameOne = req.user?.username; // me (the receiver)
    const usernameTwo = req.params.username; // sender of the request

    console.log('Receiver:', usernameOne);
    console.log('Sender:', usernameTwo);

    const user = await User.findOne({ username: usernameOne });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if request exists
    if (!user.followRequests.includes(usernameTwo)) {
      return res.status(400).json({ success: false, message: 'No follow request from this user' });
    }

    // Remove request from both users
    await User.findOneAndUpdate(
      { username: usernameOne },
      { $pull: { followRequests: usernameTwo } }
    );

    await User.findOneAndUpdate(
      { username: usernameTwo },
      { $pull: { sentRequests: usernameOne } }
    );

    return res.status(200).json({ success: true, message: 'Follow request rejected' });
  } catch (error) {
    console.error('Error in rejectFollowRequest:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

//Recommendations on behalf of preference
const getMatches = async (req, res) => {

    try {
        
        const userId = req.user?._id;
    
        // validation
        if(!userId){
            res.status(401).json({
                success: false,
                message: 'Unauthorized: Please login first'
            })    
        }
    
        //after that fetch login user's data
        const user = User.findById(userId).select("-password");
        //validations
        if(!user){
            res.status(404).json({
                success: false,
                message: 'User not fount'
            })
        }
    
        // fetch partner preference of user
        const pref = user.partnerPreferences || {} ;
        //create query variable
        const query = {};
    
        //apply query condition
        //1. gender preference for male -> female & for Female -> male
        if(user.gender === "Male"){
            query.gender = "Female";
        }else if(user.gender === "Female"){
            query.gender = "Male";
        }
    
        //2. Age range filter (convert to dateOfBirth)
        if(pref.ageRange?.min && pref.ageRange?.max){
            const currentYear = new Date().getFullYear();
            query.dateOfBirth = {
                $gte: new Date(currentYear - pref.ageRange.max, 0, 1),
                $lte: new Date(currentYear - pref.ageRange.min, 11, 31)
    
            }
        }
    
        //3. Religion
        if (pref.religion) query.religion = pref.religion;
    
        //4. Caste
        if (pref.caste) query.caste = pref.caste;
    
        //5. Location
        if (pref.location?.state) query["location.state"] = pref.location.state;
        if (pref.location?.city) query["location.city"] = pref.location.city;
    
        //6. Education & Occupation
        if (pref.education) query.education = pref.education;
        if (pref.occupation) query.occupation = pref.occupation;
    
        //7. Manglik & Language
        if (pref.manglik) query.manglik = pref.manglik;
        if (pref.language) query.language = pref.language;
    
        //Exclude self
        query._id = { $ne: userId };
    
        //Find matches
        const matches = await User.find(query).select(
          "fullName username gender dateOfBirth religion caste education occupation location profilePhotos about"
        );
    
        if (matches.length === 0) {
          return res.status(200).json({
            success: true,
            message: "No matches found based on your preferences",
            matches: [],
          });
        }
    
        //send response
        res.status(200).json({
          success: true,
          message: "Matched profiles fetched successfully",
          totalMatches: matches.length,
          matches,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        })
    }


}










// Export all controllers
export { userRegister, getUsers, loginUser, createProfile, generateOtp, receivedOtp, partnerPreferences, sendFollowRequest, acceptFollowRequest, rejectFollowRequest, getUserProfile, getMatches };
