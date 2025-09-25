const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Get token from the 'Authorization' header (e.g., "Bearer YOUR_TOKEN")
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication failed: No token provided." });
        }

        // Verify the token using the secret key
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user data to the request for other routes to use
        req.userData = { userId: decodedToken.id };
        
        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Handle errors like expired or invalid tokens
        res.status(401).json({ message: "Authentication failed!" });
    }
};

module.exports = authMiddleware;

