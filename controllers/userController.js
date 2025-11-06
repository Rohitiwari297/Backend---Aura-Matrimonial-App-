//imports
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

//update profile
import fs from "fs";
import path from "path";

//DB
import User from '../models/userSchema.js';

//controllers 

// User registration 
export const userRegister = async (req, res) => {
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
export const getUsers = async (req, res) => {
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
export const loginUser = async (req, res) => {
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
                // { expiresIn: process.env.EXPIRED_ID } //only user for web not for mobile app
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

// Logout user
export const logoutUser = async (req, res) => {
    try {
        const userId = req.user?._id;

        // Validate user ID
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User not found in token" });
        }

        // Remove user from active sessions (if applicable)
        // This is just a placeholder, implement your session management logic
        await User.findByIdAndUpdate(userId, { $set: { isLoggedIn: false } });

        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// update user details 
export const updateUser = async (req, res) => {
    try {
      // Get user ID from auth middleware
      const userId = req.user?._id;

      // Validate user ID
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User not found in token" });
      }

      // Extract fields to update from request body
      const {
        profileType,
        fullName,
        gender,
        age,
        height,
        dateOfBirth,
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

      //  validations for required fields
      
      
      // Find user by ID and update details
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          profileType,
          fullName,
          gender,
          age,
          height,
          dateOfBirth,
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
          familyDetails
        },
        { new: true }
      );

      if (!updatedUser) {

        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.status(201).json({
        success: true,
        message: "User updated successfully",
        data: {
          profileType,
          fullName,
          gender,
          age,
          height,
          dateOfBirth,
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
        },
      });
    } catch (error) {
      console.error("Error in updateUser:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }

    

}

///Recommendations on behalf of partner preference
export const getMatches = async (req, res) => {

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
        const matches = await User.find(query).select("-password");
    
        if (matches.length === 0) {
          return res.status(200).json({
            success: true,
            message: "No matches found based on your preferences",
            matches: [],
          });
        }

        console.log('matches Lists :', matches)
    
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

// Login user with mobile number otp
export const generateOtp = async (req, res) => {
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
export const receivedOtp = async (req, res) => {
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
export const createProfile = async (req, res) => {
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
      return res.status(400).json({ 
        success: false,
        message: "Image file is required" 
      });
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
      success: true,
      message: "Profile setup completed successfully",
      user: updatedProfile,
    });
  } catch (error) {
    console.error("Error in profileSetup:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message });
  }
};

//update profile
export const updateProfile = async (req, res) => {
  console.log("Received files:", req.files);

  try {
    const { about } = req.body;
    const userId = req.user?._id;

    // Expecting image IDs in an array (from frontend)
    // Example: req.body.imageIds = ["id1", "id2", "id3", "id4"]
    const imageIds = req.body.imageIds
      ? Array.isArray(req.body.imageIds)
        ? req.body.imageIds
        : JSON.parse(req.body.imageIds)
      : [];

    console.log("About:", about);
    console.log("User ID:", userId);
    console.log("Image IDs:", imageIds);

    // ===== VALIDATION =====
    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found in token",
      });

    if (!about)
      return res.status(400).json({
        success: false,
        message: "About field is required",
      });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({
        success: false,
        message: "At least one image file is required",
      });

    // ===== FETCH USER =====
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    // ===== REPLACE IMAGES =====
    for (let i = 0; i < req.files.length; i++) {
      const newFile = req.files[i];
      const newImageUrl = `${req.protocol}://${req.get("host")}/uploads/${newFile.filename}`;

      // Find matching image index in profilePhotos array
      const imageId = imageIds[i];
      const imageIndex = user.profilePhotos.findIndex(
        (photo) => photo._id.toString() === imageId
      );

      // If the image exists — replace it, else append as new
      if (imageIndex !== -1) {
        // Delete old image from server
        try {
          const oldImagePath = path.join(
            "uploads",
            path.basename(user.profilePhotos[imageIndex].url)
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("Deleted old image:", oldImagePath);
          }
        } catch (err) {
          console.warn("Failed to delete old image:", err.message);
        }

        // Replace image URL
        user.profilePhotos[imageIndex].url = newImageUrl;
      } else {
        // If no old image ID found, add new
        user.profilePhotos.push({ url: newImageUrl });
      }
    }

    // ===== UPDATE ABOUT FIELD =====
    user.about = about;

    // ===== SAVE CHANGES =====
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        about: updatedUser.about,
        images: updatedUser.profilePhotos,
      },
    });
  } catch (error) {
    console.error("Error in updateProfile:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error in update profile",
      error: error.message,
    });
  }
};


// get userProfile
export const getUserProfile = async (req, res) => {

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

// create partner preference
export const partnerPreferences = async (req, res) => {
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

// update partner preference
export const updatePartnerPreferences = async (req, res) => {
  console.log("request body:", req.body);

  try {
    const {
      age,
      heightRange,
      state,
      education,
      income,
      caste,
      language,
      manglik,
      city,
      occupation,
      religion,
    } = req.body;

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found in token",
      });
    }

    // Update user partner preferences
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          partnerPreferences: {
            ageRange: {
              min: age?.min || age,
              max: age?.max || age,
            },
            heightRange: {
              min: heightRange?.min || heightRange,
              max: heightRange?.max || heightRange,
            },
            religion,
            caste,
            location: { state, city },
            education,
            occupation,
            income,
            language,
            manglik,
          },
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Partner preferences updated successfully",
      data: updatedUser.partnerPreferences,
    });
  } catch (error) {
    console.error("Error updating partner preferences:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating partner preferences",
      error: error.message,
    });
  }
};

//send Follow Request
export const sendFollowRequest = async (req, res) => {
  try {
    const userOneId = req.user?._id; // requester
    const userTwoId = req.params.id; // target user id

    if (!userOneId || !userTwoId) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    // console.log('Requester without using toString():', userOneId);
    // console.log('Target User with toString():', userTwoId.toString());


    // Prevent self-following 
    if (userOneId.toString() === userTwoId.toString()) {
      return res.status(400).json({ success: false, message: "You can't follow yourself" });
    }


    /** Check if target user exists in easy words we can say userTwo exists or not if not then return error, 
     * means this type of user is not present in db/ 
     * not registered that's why we anaable to send follow request 
     * */
    const targetUser = await User.findById(userTwoId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if already following or request sent
    if (targetUser.followers.includes(userOneId)) {
      return res.status(400).json({ success: false, message: 'Already following this user' });
    }

    if (targetUser.followRequests.includes(userOneId)) {
      return res.status(400).json({ success: false, message: 'Follow request already sent' });
    }

    await User.findByIdAndUpdate(
      userTwoId,
      { $addToSet: { followRequests: userOneId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userOneId,
      { $addToSet: { sentRequests: userTwoId } },
      { new: true }
    );

    return res.status(200).json({ success: true, message: 'Follow request sent successfully' });
  } catch (error) {
    console.error('Error in sendFollowRequest:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
  
//accept Follow Request
export const acceptFollowRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;        // me (receiver)
    const senderId = req.params.id;         // sender

    console.log('Receiver:', receiverId);
    console.log('Sender:', senderId);

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }

    // Check if request exists
    if (!receiver.followRequests.includes(senderId)) {
      return res.status(400).json({ success: false, message: 'No follow request from this user' });
    }

    // Update both users
    await User.findByIdAndUpdate(receiverId, {
      $pull: { followRequests: senderId },
      $addToSet: { followers: senderId },
    });

    await User.findByIdAndUpdate(senderId, {
      $pull: { sentRequests: receiverId },
      $addToSet: { followings: receiverId },
    });

    return res.status(200).json({ success: true, message: 'Follow request accepted' });
  } catch (error) {
    console.error('Error in acceptFollowRequest:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

//reject Follow Request
export const rejectFollowRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // me (the receiver)
    const targetUserId = req.params.id; // sender of the request

    console.log('Receiver:', loggedInUserId);
    console.log('Sender:', targetUserId);

    // validate target user existence
    const targetUser = await User.findOne({ _id: targetUserId });


    const user = await User.findOne({ _id: targetUserId});
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if request exists
    if (!user.sentRequests.includes(loggedInUserId)) {
      return res.status(400).json({ success: false, message: 'No follow request from this user' });
    }

    // Remove request from both users
    await User.findOneAndUpdate(
      { _id: loggedInUserId },
      { $pull: { followRequests: targetUserId } }
    );

    await User.findOneAndUpdate(
      { _id: targetUserId },
      { $pull: { sentRequests: loggedInUserId } }
    );

    return res.status(200).json({ success: true, message: 'Follow request rejected' });
  } catch (error) {
    console.error('Error in rejectFollowRequest:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

//Cancel Follow Request
export const cancelSendRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // me (the requester sender )
    const targetUserId = req.params.id; // target user
    console.log('Requester:', loggedInUserId);
    console.log('Target User:', targetUserId);

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if already sent request
    if (!targetUser.sentRequests.includes(loggedInUserId)) {
      return res.status(400).json({
        success: false,
        message: 'No follow request sent to this user'
      })
    }

    // Remove request from both users
    await User.findByIdAndUpdate(
      targetUserId,
      { $pull: {sentRequests: loggedInUserId } } // remove from sentRequests of target user
    );

    await User.findByIdAndUpdate(
      loggedInUserId,
      { $pull: { followRequests: targetUserId } } // remove from followRequests of logged-in user
    )

    //send response
    return res.status(200).json({
      success: true,
      message: 'Follow request cancelled successfully'
    })

  } catch (error) {
    res.status(500).json({
        success: false,
        error: error.message,
    })
  }
}

// unfollow user
export const unfollowRequest = async (req, res) => {
  try {

    // Get logged-in user and target user IDs
    const loggedInUserId = req.user._id; // me (the follower)
    const targetUserId = req.params.id; // target user

    console.log('loggedInUser', loggedInUserId)
    console.log('targetUser', targetUserId)

    // Check if target user exists in the db
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if already following or not
    if (!targetUser.followers.includes(loggedInUserId)) {
      return res.status (400).json({
        success: false,
        message: 'User not in your follower List'
      })
    }else{
      // Remove follower and following relationship
      await User.findByIdAndUpdate(
        targetUserId,
        { $pull: { followers: loggedInUserId } } // remove from followers of target user
      );
    }

    // Remove following relationship from logged-in user
    await User.findByIdAndUpdate(
      loggedInUserId,
      { $pull: { following: targetUserId } } // remove from following of logged-in user
    );
    //send response
    return res.status(200).json({
      success: true,
      message: 'Unfollowed user successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}


//Block User
export const blockUserRequest = async (req, res) => {
    
  try {
    const loggedInUserId = req.user._id; // me (the blocker)
    const targetUserId = req.params.id; // target user

    console.log('LoggedInUserId', loggedInUserId);
    console.log('targetUserId', targetUserId)

    // Check if target user exists
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // check user already in follower list or not
    if (!user.followings.includes(loggedInUserId)) {
      res.status(404).json({
        success: false,
        message: 'user not in your follower list'
      })
    }else{
      await User.findByIdAndUpdate(
        loggedInUserId,
        {$pull: {followers: targetUserId}}
      )

      await User.findByIdAndUpdate(
        targetUserId,
        {$pull: {followings: loggedInUserId}}
      )

      // add to block list
      await User.findByIdAndUpdate(
        loggedInUserId,
        {$addToSet: {blockedUsers: targetUserId}}
      )

      return res.status(200).json({
        success: true,
        message: 'User blocked successfully'
      })
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}


// Unblock User
export const unblockUserRequest = async (req, res) => {};


// profile view history
export const profileViewHistory = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // me (the viewer)
    const targetUserId = req.params.id; // target user  

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Add to profile view history
    await User.findByIdAndUpdate(
      loggedInUserId,
      { $addToSet: { profileViewHistory: targetUserId } }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile view recorded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
};

//---------------------------------- End of Controllers ----------------------------------//














// Export all controllers
//export { userRegister, getUsers, loginUser, createProfile, generateOtp, receivedOtp, partnerPreferences, sendFollowRequest, acceptFollowRequest, rejectFollowRequest, cancelSendRequest, unfollowRequest, getUserProfile, getMatches, updateUser };
