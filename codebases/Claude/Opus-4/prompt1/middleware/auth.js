// Authentication middleware
const requireAuth = (req, res, next) => {
    // Check if user is logged in
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    
    // Optional: Regenerate session ID on each request for security
    // This helps prevent session fixation attacks
    if (req.session.regenerate) {
        const userId = req.session.userId;
        const email = req.session.email;
        const computerType = req.session.computerType;
        
        req.session.regenerate((err) => {
            if (err) {
                console.error('Session regeneration error:', err);
                return res.redirect('/login');
            }
            
            // Restore user data
            req.session.userId = userId;
            req.session.email = email;
            req.session.computerType = computerType;
            next();
        });
    } else {
        next();
    }
};

module.exports = {
    requireAuth
};