const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateRegistration = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email is too long'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }
            return true;
        }),
    
    body('firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name is required and must be less than 50 characters')
        .matches(/^[A-Za-z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),
    
    body('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name is required and must be less than 50 characters')
        .matches(/^[A-Za-z\s]+$/)
        .withMessage('Last name can only contain letters and spaces')
];

// Validation rules for user login
const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Validation rules for messaging
const validateMessage = [
    body('recipientId')
        .isInt({ min: 1 })
        .withMessage('Valid recipient is required'),
    
    body('subject')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Subject is required and must be less than 255 characters'),
    
    body('content')
        .trim()
        .isLength({ min: 1, max: 10000 })
        .withMessage('Message content is required and must be less than 10,000 characters')
];

// Validation rules for password change
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    
    body('confirmNewPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('New password confirmation does not match new password');
            }
            return true;
        })
];

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))
        });
    }
    next();
};

// Custom validation for message ID
const validateMessageId = (req, res, next) => {
    const messageId = parseInt(req.params.id);
    if (isNaN(messageId) || messageId < 1) {
        return res.status(400).json({
            error: 'Invalid message ID'
        });
    }
    req.params.id = messageId;
    next();
};

// Custom validation for user ID
const validateUserId = (req, res, next) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId) || userId < 1) {
        return res.status(400).json({
            error: 'Invalid user ID'
        });
    }
    req.params.userId = userId;
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateMessage,
    validatePasswordChange,
    handleValidationErrors,
    validateMessageId,
    validateUserId
};