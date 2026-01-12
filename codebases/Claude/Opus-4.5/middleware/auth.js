/**
 * Authentication Middleware
 * 
 * Educational Notes:
 * - Middleware functions run before route handlers
 * - They can check authentication, validate input, log requests, etc.
 * - Always verify session server-side, never trust client data
 */

/**
 * Check if user is authenticated
 * Redirects to login if not authenticated
 */
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        // User is authenticated, continue to next middleware/route
        return next();
    }
    
    // Store the originally requested URL to redirect after login
    req.session.returnTo = req.originalUrl;
    
    // Not authenticated, redirect to login
    res.redirect('/login');
}

/**
 * Check if user is NOT authenticated
 * Useful for login/register pages - redirect logged in users away
 */
function isNotAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return res.redirect('/inbox');
    }
    next();
}

/**
 * Add user data to response locals for use in templates
 * This runs on every request after session is established
 */
function addUserToLocals(req, res, next) {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = !!req.session.userId;
    next();
}

module.exports = {
    isAuthenticated,
    isNotAuthenticated,
    addUserToLocals
};
