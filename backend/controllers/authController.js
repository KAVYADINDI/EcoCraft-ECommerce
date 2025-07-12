import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import crypto from 'crypto'; // Node.js built-in module for generating random bytes
import User from '../models/User.js'; // Adjust path as per your file structure, assuming models/User.js

// --- Helper function to generate JWT token ---
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });
};

// Register a new user (admin, artist, customer)- POST /api/auth/register - Public
 
const registerUser = async (req, res) => {
    const { userID, email, password, role } = req.body;

    // Field Validation
    if (!userID || !email || !password || !role) {
        return res.status(400).json({ message: 'Please enter all required fields: User ID, Email, Password, and Role.' });
    }

    /*Validate role (ensure it's one of the allowed enums)
    const allowedRoles = ['admin', 'artist', 'customer'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified. Allowed roles are: admin, artist, customer.' });
    }*/

    // Password Validation: At least one lowercase, one uppercase, and one digit, minimum 8 characters
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one digit.'
        });
    }

    // Check if user already exists
    try {
        const userExists = await User.findOne({ $or: [{ userID }, { email }] });
        if (userExists) {
            return res.status(409).json({ message: 'User with this User ID or Email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt); 

        // Create new user
        const newUser = await User.create({
            userID,
            email,
            passwordHash,
            role,
            passwordHistory: [passwordHash], // Store initial password hash
        });

        if (newUser) {
            // Generate JWT token
            const token = generateToken(newUser._id, newUser.role);

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    _id: newUser._id,
                    userID: newUser.userID,
                    email: newUser.email,
                    role: newUser.role,
                },
                token,
            });
        } else {
            res.status(500).json({ message: 'Failed to register user.' });
        }
    } catch (error) {
        console.error('Error during user registration:', error.message, error.stack, error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};


// Authenticate a user & get token - POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Basic Validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password.' });
    }

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // For artists, only allow login if status is 'approved'
        if (user.role === 'artist' && user.status !== 'approved') {
            return res.status(403).json({ message: `Your account status is '${user.status.replace(/_/g, ' ')}'. Only approved artists can log in.` });
        }

        // 4. Generate JWT token
        const token = generateToken(user._id, user.role);

        // 5. Send response
        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                userID: user.userID,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error('Error during user login:', error.message, error.stack, error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};


// Password Reset - POST /api/auth/passwordReset - Public
const forgotPassword = async (req, res) => {
    const { userID, lastRememberedPassword } = req.body;

    // Basic Validation
    if (!userID || !lastRememberedPassword) {
        return res.status(400).json({ message: 'Please provide your User ID and a the last password you remember.' });
    }

    try {
        // Find user by userID
        const user = await User.findOne({ userID });

        if (!user) {
            // Send a generic success message even if user not found to prevent user ID enumeration
            return res.status(200).json({ message: 'If the provided credentials are valid, a password reset link has been sent to your registered email.' });
        }

        // Validate lastRememberedPassword against passwordHistory
        let isLastPasswordMatch = false;
        for (const historyHash of user.passwordHistory) {
            const match = await bcrypt.compare(lastRememberedPassword, historyHash);
            if (match) {
                isLastPasswordMatch = true;
                break; // Found a match, no need to check further
            }
        }

        if (!isLastPasswordMatch) {
            // Send a generic success message to avoid giving hints about valid user ID but wrong password
            return res.status(200).json({ message: 'If the provided credentials are valid, a password reset link has been sent to your registered email.' });
        }

        // 4. Generate a random token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash the token before saving it to the user document
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token expiry (e.g., 1 hour from now)
        const resetExpires = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        // --- IMPORTANT: Email Sending Logic (Conceptual) ---
        // In a real application, you would send an email to the user here.
        // The email would contain a link like:
        // `http://yourfrontend.com/reset-password?token=${resetToken}`
        // You would use a library like Nodemailer for this.

        console.log(`Password reset token for ${user.email} (User ID: ${user.userID}): ${resetToken}`); // For development/testing
        // Example of what an email link might look like:
        // const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
        // console.log(`Reset URL: ${resetUrl}`);

        res.status(200).json({ message: 'If the provided credentials are valid, a password reset link has been sent to your registered email.' });

    } catch (error) {
        console.error('Error during forgot password request:', error.message, error.stack, error);
        // Ensure token fields are cleared in case of an error after they might have been set
        if (user) { // Only attempt if user was found before the error
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
        }
        res.status(500).json({ message: 'Server error during password reset request.' });
    }
};

/**
 * @desc Reset user password using token
 * @route PUT /api/auth/reset-password/:token
 * @access Public
 * @param {string} token - The reset token received in the email link
 * @body {string} newPassword
 */
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    // 1. Basic Validation
    if (!newPassword) {
        return res.status(400).json({ message: 'Please enter a new password.' });
    }

    // 2. Password Validation for new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            message: 'New password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one digit.'
        });
    }

    // Hash the incoming token to compare with the stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        // 3. Find user by token and check expiry
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }, // Token must not be expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired password reset token.' });
        }

        // 4. Hash the new password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Optional: Check against password history
        const isPasswordInHistory = user.passwordHistory.some(hash => bcrypt.compareSync(newPassword, hash));
        if (isPasswordInHistory) {
            return res.status(400).json({ message: 'New password cannot be one of your recently used passwords.' });
        }

        // 5. Update user's password and clear reset token fields
        user.passwordHash = newPasswordHash;
        user.passwordHistory.push(newPasswordHash); // Add new password to history
        // Keep history limited, e.g., last 5 passwords
        if (user.passwordHistory.length > 5) {
            user.passwordHistory.shift(); // Remove the oldest password
        }
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been successfully reset.' });

    } catch (error) {
        console.error('Error during password reset:', error.message, error.stack, error);
        res.status(500).json({ message: 'Server error during password reset.' });
    }
};

// --- Export the functions ---
export {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
};