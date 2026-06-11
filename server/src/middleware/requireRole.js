/* Middleware factory function that takes the required role as an argument and
returns a middleware function */
function requireRole(requiredRole) {
    /* Middleware function to check if the user has the required role */
    return function (req, res, next) {
        /* Check if the user has the required role */
        if (!req.session || req.session.role !== requiredRole) {
            return res.status(403).json({ error : "Forbidden: You do not have the required role to access this resource." });
        }
        /* User has the required role, proceed to the next middleware or route handler */
        next();
    };
}

module.exports = requireRole;