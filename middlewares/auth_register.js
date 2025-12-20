export const validateUserRegistration = (req, res, next) => {
    const {profileType, fullName, gender, dateOfBirth, email, phone, password} = req.body;

    // Basic validation
    if (!profileType || !fullName || !gender || !dateOfBirth || !email || !phone || !password) {
        return res.status(400).json({ message: "All required fields must be filled." });
    }
    // Additional validations can be added here (e.g., email format, password strength)

    next(); // proceed to next middleware/controller
}