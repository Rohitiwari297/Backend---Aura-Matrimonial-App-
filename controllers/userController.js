//imports
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

//update profile
import fs from "fs";
import path from "path";

//DB
import User from '../models/userSchema.js';
import SocialMedia from '../models/followRequestSchema.js';

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
// Get all users with plan details
export const getUsers = async (req, res) => {
    try {

        // Getting gender and userId from query parameters
        let userTypeRequest = req.query.gender;
        let userIdRequest = req.query._id;

        // Create query object
        let queryObj = {};

        if (userTypeRequest) {
          queryObj.gender = userTypeRequest;
        }

        console.log("Query Object : ", queryObj);
        console.log("Query id : ", queryObj);

        const users = await User.aggregate([
            {
              $match : queryObj  // ⬅ filter users by gender
            },
            {
                $lookup: {
                    from: "subscriptiondetails",           // collection name in DB
                    localField: "_id",       // user._id
                    foreignField: "user_id", // plan.user_id
                    as: "planDetails" // kis name se field dikhni chahiye in frontend
                },
                
            },
            {
                $project: {
                    password: 0 // remove password from output
                }
            },
            // {
            //   $addFields : {
            //      planCount: { $size: "$planDetails" }
            //   }
            // }
        ]);

        res.status(200).json({
            message: 'Users fetched successfully',
            users: users
        });

    } catch (error) {
        res.status(500).json({
            message: 'server error',
            error: error.message
        });
    }
};


//Get user details by id
export const getUserById = async (req, res) => {
  const user = req.params.id;
  try {
    if(!user) {
      res.state(400).json({
        success: false,
        message: 'User id Required'
      })
    }
    const userDetais = await User.findById({_id: user})
    if (!userDetais) {
      res.state(400).json({
        success: false,
        message: 'User not exist'
      })
    }

    // send response to the user
    res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      data: userDetais
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Server error while getting the user by id'
    })
  }
}


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

/**
 * NEW ADDITION
 * CHANGE PASSWOR API
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user?._id; // Logged-in user ID from auth middleware
    const { oldPassword, newPassword } = req.body;

    // Check required fields
    if (!oldPassword || !newPassword ) {
      return res.status(400).json({
        message: "Old password and new password are required",
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

///Recommendations on behalf of partner preference
export const getMatches = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch social data for exclusions
    const social = await SocialMedia.findOne({ userId });
    const excludedIds = [
      ...(social?.followers || []),
      ...(social?.followings || []),
      ...(social?.sentRequests || []), 
      ...(social?.sortListUser || []),
      userId,
    ];

    const pref = user.partnerPreferences || {};

    // 1. Required: Opposite gender filter
    const genderFilter =
      user.gender === "MALE" ? "FEMALE" : "MALE";

    let candidates = await User.find({
      gender: genderFilter,
      _id: { $nin: excludedIds },
    }).select("-password");

    if (!candidates.length) {
      return res.status(200).json({
        success: true,
        message: "No matches found",
        matches: [],
      });
    }

    // --------------------------------------------
    //  PRIORITY SCORE SYSTEM
    // --------------------------------------------
    const weights = {
      religion: 20,
      caste: 15,
      location: 15,
      ageRange: 15,
      education: 10,
      occupation: 10,
      income: 5,
      language: 5,
      manglik: 5,
    };

    function calculateScore(candidate) {
      let score = 0;

      // Religion
      if (pref.religion && candidate.religion === pref.religion) {
        score += weights.religion;
      }

      // Caste
      if (pref.caste && candidate.caste === pref.caste) {
        score += weights.caste;
      }

      // State/City
      if (
        pref.location?.state &&
        candidate.location?.state === pref.location.state
      ) {
        score += weights.location;
      }
      if (
        pref.location?.city &&
        candidate.location?.city === pref.location.city
      ) {
        score += weights.location;
      }

      // Education
      if (pref.education && candidate.education === pref.education) {
        score += weights.education;
      }

      // Occupation
      if (pref.occupation && candidate.occupation === pref.occupation) {
        score += weights.occupation;
      }

      // Income
      if (pref.income && candidate.income === pref.income) {
        score += weights.income;
      }

      // Language
      if (pref.language && candidate.language === pref.language) {
        score += weights.language;
      }

      // Manglik
      if (pref.manglik && candidate.manglik === pref.manglik) {
        score += weights.manglik;
      }

      // Age range
      if (pref.ageRange?.min && pref.ageRange?.max) {
        const currentYear = new Date().getFullYear();
        const candAge =
          currentYear - new Date(candidate.dateOfBirth).getFullYear();

        if (
          candAge >= pref.ageRange.min &&
          candAge <= pref.ageRange.max
        ) {
          score += weights.ageRange;
        }
      }

      return score;
    }

    // Assign score to every candidate
    candidates = candidates.map((c) => ({
      ...c._doc,
      matchScore: calculateScore(c),
    }));

    // Sort by score descending
    candidates.sort((a, b) => b.matchScore - a.matchScore);

    // If all users have score === 0 → they still show (gender-based)
    const hasGoodMatches = candidates.some((c) => c.matchScore > 0);

    return res.status(200).json({
      success: true,
      message: hasGoodMatches
        ? "Matches sorted by best compatibility"
        : "No strong matches found. Showing gender-based matches only.",
      totalMatches: candidates.length,
      matches: candidates,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

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
  try {
    const { about } = req.body;
    const userId = req.user?._id;
    const imageId = req.params.id; // _id of image in profilePhotos array

    console.log("about:", about);
    console.log("requesting userId:", userId);
    console.log("requesting imageId:", imageId);
    console.log("uploaded files:", req.files);

    // ===== VALIDATION =====
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found in token",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ===== UPDATE ABOUT =====
    if (about) {
      user.about = about;
    }

    // ===== UPDATE IMAGE (if provided) =====
    if (req.files && req.files.length > 0) {
      if (!imageId) {
        return res.status(400).json({
          success: false,
          message: "Image ID is required to replace an existing photo",
        });
      }

      const imageIndex = user.profilePhotos.findIndex(
        (photo) => photo._id.toString() === imageId
      );

      if (imageIndex === -1) {
        return res.status(400).json({
          success: false,
          message: "Invalid image ID. Image not found in user's profile.",
        });
      }

      // Build new image URL
      const newImageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.files[0].filename}`;

      // Delete old image (optional)
      try {
        const oldImagePath = path.join(
          "uploads",
          path.basename(user.profilePhotos[imageIndex].url)
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("Old image deleted:", oldImagePath);
        }
      } catch (err) {
        console.warn("Failed to delete old image file:", err.message);
      }

      // Replace image URL
      user.profilePhotos[imageIndex].url = newImageUrl;
    }

    // ===== IF NOTHING TO UPDATE =====
    if (!about && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "No data provided to update",
      });
    }

    // ===== SAVE CHANGES =====
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message:
        about && req.files?.length
          ? "Profile image and about updated successfully"
          : about
          ? "About updated successfully"
          : "Profile image updated successfully",
      user: {
        about: updatedUser.about,
        profilePhotos: updatedUser.profilePhotos,
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
