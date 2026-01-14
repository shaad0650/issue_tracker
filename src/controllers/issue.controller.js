import prisma from "../config/db.js";
import { ALLOWED_TRANSITIONS } from "../utils/issueStateMachine.js";
import { logAudit } from "../utils/audit.js";

export const createIssue = async (req, res) => {
    try {
        const { title, description, projectId, assigneeId } = req.body;

        if (!title || !projectId) {
            return res.status(400).json({ message: "Missing title or projectId" });
        }

        const issue = await prisma.issue.create({
            data: {
                title,
                description: description || "", 
                projectId,
                createdBy: req.user.userId,
                // If assigneeId is undefined in req.body, it remains null in DB
                assigneeId: assigneeId || null 
            }
        });

        return res.status(201).json(issue);

    } catch (error) {
        console.error("Create Issue Error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getIssues = async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(issues);
  } catch (error) {
    console.error("Failed to fetch issues:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const issue = await prisma.issue.findUnique({ 
      where: {
        id: req.params.id, 
      },
    });

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (error) {
    console.error("Error fetching issue by ID:", error);
    
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const updateIssue = async (req, res) => {
  try {
    const issue = req.issue;
    const { status, priority, assigneeId } = req.body;

    // 1. Business Logic Validations
    if (status && !ALLOWED_TRANSITIONS[issue.status].includes(status)) {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    if (req.user.role === "DEV" && priority === "CRITICAL") {
      return res.status(403).json({ message: "DEV cannot set critical priority" });
    }

    // 2. Database Operation
    const updated = await prisma.issue.update({
      where: { id: issue.id },
      data: { status, priority, assigneeId }
    });


    const userId = req.user.userId;

    if (status && status !== issue.status) {
    await logAudit({
      entityType: "ISSUE",
      entityId: issue.id,
      action: "STATUS_CHANGED",
      oldValue: issue.status,
      newValue: status,
      changedBy: userId,
    });

     if (priority && priority !== issue.priority) {
    await logAudit({
      entityType: "ISSUE",
      entityId: issue.id,
      action: "PRIORITY_CHANGED",
      oldValue: issue.priority,
      newValue: priority,
      changedBy: userId,
    });
  }

  if (assigneeId !== undefined && assigneeId !== issue.assigneeId) {
    await logAudit({
      entityType: "ISSUE",
      entityId: issue.id,
      action: "ASSIGNED",
      oldValue: issue.assigneeId ?? "",
      newValue: assigneeId ?? "",
      changedBy: userId,
    });
  }
  }


    res.json(updated);

  } catch (error) {
    console.error("Update Error:", error);

    // Handle specific Prisma Foreign Key errors
    if (error.code === 'P2002') {
        return res.status(400).json({ error: "Constraint violation (unique field error)" });
    }
    
    if (error.code === 'P2003') {
        return res.status(400).json({ error: "Invalid assigneeId: User does not exist" });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};