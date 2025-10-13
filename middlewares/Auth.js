import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";

const authMiddleware = async (req, res, next) => {
  console.log(" authMiddleware called"); // debug log

  try {
    const authHeader = req.headers.authorization;
    console.log("Authorization header:", authHeader); // debug log

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log(" No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log(" Token verified, payload:", decoded);
    } catch (err) {
      console.log(" Invalid or expired token");
      return res.status(401).json({ message: "Invalid or expired token", error: err.message });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log(" User not found in DB");
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // attach user to request
    console.log(" Auth successful, user attached to req.user:", user._id);

    next(); // pass control to next middleware/controller

  } catch (error) {
    console.error(" AuthMiddleware error:", error.message);
    return res.status(500).json({ message: "Server error in auth middleware", error: error.message });
  }
};

export default authMiddleware;
