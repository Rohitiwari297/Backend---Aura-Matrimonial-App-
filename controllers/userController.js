// User registration controller
const userRegister = (req, res) => {
    res.send('User registered successfully');
};

// Get all users controller
const getUsers = (req, res) => {
    console.log('hello');
    res.send('Geting users');
};

// Export all controllers
export { userRegister, getUsers };
