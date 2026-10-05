import AuditLog from '../models/AuditLog.js';

export const logAuditEvent = async ({
  actor = null,
  action,
  targetType,
  targetId = '',
  details = {},
  ipAddress = '127.0.0.1',
}) => {
  try {
    const actorId = actor?._id || null;
    const actorName = actor?.fullName || 'System';
    const actorRole = actor?.role || 'SYSTEM';

    await AuditLog.create({
      actorId,
      actorName,
      actorRole,
      action,
      targetType,
      targetId: String(targetId),
      details,
      ipAddress,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};
