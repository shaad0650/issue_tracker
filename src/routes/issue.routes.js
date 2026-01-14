import express from "express"
import { requireAuth } from "../middleware/auth.middleware.js";
import { loadIssue,requireIssueOwnershipOrAdmin } from "../middleware/ownership.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {createIssue, getIssueById, getIssues, updateIssue} from "../controllers/issue.controller.js"


const router=express.Router();


router.post("/",requireAuth,requireRole("ADMIN","DEV"),createIssue)
router.get("/",requireAuth,getIssues)
router.get("/:id",requireAuth,getIssueById)

router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "DEV"),
  loadIssue,
  requireIssueOwnershipOrAdmin,
  updateIssue
);


router.get("/:id/audit", requireAuth, loadIssue, async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    where: { entityType: "ISSUE", entityId: req.params.id },
    orderBy: { createdAt: "desc" },
  });

  res.json(logs);
});



export default router;