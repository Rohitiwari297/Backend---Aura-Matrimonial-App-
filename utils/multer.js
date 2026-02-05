import multer from "multer";
import path from "path";

// Configure storage (local upload for now)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure 'uploads' folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },

});

const upload = multer({ storage });
export default upload;
