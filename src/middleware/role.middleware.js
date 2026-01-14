export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const { role } = req.user;

            if (!allowedRoles.includes(role)) {
                return res.status(403).json({ message: "Forbidden" });
            }

            next();
        } catch (error) {
            console.error("Role Middleware Error:", error.message);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
};