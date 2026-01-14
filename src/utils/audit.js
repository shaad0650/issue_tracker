import prisma from "../config/db.js";

export const logAudit = async ({
  entityType,
  entityId,
  action,
  oldValue,
  newValue,
  changedBy,
}) => {
  await prisma.auditLog.create({
    data: {
      entityType,
      entityId,
      action,
      oldValue: oldValue ?? null,
      newValue: newValue ?? null,
      changedBy,
    },
  });
};
