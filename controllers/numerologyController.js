import Numerology from "../models/numerologySchema.js";
import User from "../models/userSchema.js";

// create numerology details
export const numerologyDetails = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID not found"
            });
        }

        const { fullName, birthPlace, birthDate, birthTime, paymentStatus, paymentOf, pdfUrl } = req.body;

        // Validation
        if (!fullName || !birthPlace || !birthDate || !birthTime || !paymentStatus || !paymentOf || !pdfUrl) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // CREATE new numerology details (POST)
        const newDetails = await Numerology.create({
            userId,
            fullName,
            birthPlace,
            birthDate,
            birthTime,
            paymentStatus,
            paymentOf,
            pdfUrl
        });

        return res.status(201).json({
            success: true,
            message: "Data saved successfully",
            data: newDetails
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while adding the numerology details",
            error: error.message
        });
    }
};

// get all numerology details 
export const getAllNumerology = async (req, res) => {
    try {
        const allDetails = await Numerology.find()

        //validation
        if (! allDetails ){
            res.status(400).json({
                success: false,
                message: 'details are not exists'

            })
        }else{
            res.status(200).json({
                success: true,
                message: 'Details fetched successfully',
                data: allDetails
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error while fetching all numerology details',
            error: error.message
        })
    }
}


