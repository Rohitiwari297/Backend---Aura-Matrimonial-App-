import User from "../models/userSchema.js";

// Controllers

// gender wise user // not is used <--
export const getFilteredUsers = async (req, res) => {

    // filtered user
    const userQueryRequest = req.query.gender
    let queryObj = {};
    if (userQueryRequest) {
        queryObj = {gender: userQueryRequest}  
        // queryObj = queryObj.userQueryRequest  
    }

    console.log("Query Object : ", queryObj);

    const users = await User.find(queryObj)

    if(!users && users.lengh <= 0) {
        res.statu(404).json({
            success: false,
            message: 'Users list is empty'
        })
    }else{
        res.status(200).json({
            success: true,
            message: 'Users list fetched successfully',
            data: users
        })
    }

} 

// plan wise api

// export const getPlanWiseUsers = async (req, res) => {
//     // take the value which shared by the user
//     const userQueryRequest = req.query.activeUser
//      console.log(`user by plan :`, user)

//      //validations
//      if ( !userQueryRequest ) {
//         res.status(404).json({
//             success: false,
//             message:
//         })
//      }
// }