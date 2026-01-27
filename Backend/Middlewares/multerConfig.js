import multer from "multer";
import path from "path"; // ✅ Critical for extracting extensions

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure this folder is in your root
    },
    filename: (req, file, cb) => {
        // 1. Create a unique ID
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        
        // 2. Extract the original format (e.g., .jpg, .png)
        const ext = path.extname(file.originalname); 
        
        // 3. Combine them: attachment-12345.jpg
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
});

export const upload = multer({ storage });