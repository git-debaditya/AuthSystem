// Middleware to check if the user is authenticated
// before allowing access to certain routes

function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next(); //User is authenticated, proceed to the next middleware/route handler
    } else {
        res.status(401).json({error: "Unauthorized access"});
    }
}

module.exports = requireAuth;