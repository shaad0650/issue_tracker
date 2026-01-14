import prisma from "../config/db.js";

export const loadIssue = async (req, res, next) => {
    try {
        const { id } = req.params;
        const issue = await prisma.issue.findUnique({ where: { id } });

        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        req.issue = issue; 
        next();
    } catch (error) {
        console.error("Load Issue Error:", error.message);
        return res.status(500).json({ message: "Internal server error during data fetch" });
    }
};

export const requireIssueOwnershipOrAdmin = async (req, res, next) => {
    try {
      
        const { role, userId } = req.user; 
        const issue = req.issue;

        
        if (role === "ADMIN") return next();

        if (issue.assigneeId !== userId) {
            return res.status(403).json({ message: "Forbidden: Not your assigned issue" });
        }

        next();
    } catch (error) {
        console.error("Ownership Check Error:", error.message);
        return res.status(500).json({ message: "Internal server error during permission check" });
    }
};