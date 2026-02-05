import NumeroList from "../models/numeroListSchema.js";
import Numerology from "../models/numerologySchema.js";


// create numerology details
export const numerologyDetails = async (req, res) => {
  try {
    const userId = req.user?._id;
    const numeroListId = req.params.id;

    if (!userId || !numeroListId) {
      return res.status(400).json({
        success: false,
        message: "Invalid request"
      });
    }

    const {
      fullName,
      birthPlace,
      birthDate,
      birthTime,
      paymentStatus,
      paymentOf
    } = req.body;

    if (
      !fullName ||
      !birthPlace ||
      !birthDate ||
      !birthTime ||
      paymentOf == null ||
      paymentStatus === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled"
      });
    }

    const newDetails = await Numerology.create({
      userId,
      numeroListId,
      fullName,
      birthPlace,
      birthDate,
      birthTime,
      paymentStatus,
      paymentOf
    });

    return res.status(201).json({
      success: true,
      message: "Numerology details submitted successfully",
      data: newDetails
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while adding numerology details",
      error: error.message
    });
  }
};

// get all numerology details 
export const getAllNumerology = async (req, res) => {
    try {
        const allDetails = await Numerology.find()

        //validation
        if (!allDetails) {
            res.status(400).json({
                success: false,
                message: 'details are not exists'

            })
        } else {
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

// Create numero list ( For the Admin Portal)
export const createNumeroList = async (req, res) => {
    
  try {
    const userId = req.user?._id;
    const { title } = req.body;
    const price = Number(req.body.price);


    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!title || !price ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!"
      });
    }

    if (!req.file){
        return res.status(400).json({
            success: false,
            message: "Image field is required"
        })
    }

    const image = {
        url: req.file.path,
        public_id: req.file.filename
    }

    const numeroList = await NumeroList.create({
      title,
      price,
      image,        // string OR object (as per schema)
      createdBy: userId
    });

    return res.status(201).json({
      success: true,
      message: "Numero list created successfully",
      data: numeroList
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while saving the numero list details",
      error: error.message
    });
  }
};


//Get lists of numero list ( For the admin Portal)
export const getNumeroList = async (req, res) => {
    const user = req.user?._id
    try {
        const data = await NumeroList.find()

        if(!data || data.length <= 0){
            res.status(400).json({
                success: false,
                message: 'Data not found'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Data fetched successfully',
            data: data
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching the numero list data',
            error: error.message
        })
    }
}


