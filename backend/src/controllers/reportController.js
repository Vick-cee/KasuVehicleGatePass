import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import VehiclePass from '../models/VehiclePass.js';
import Gate from '../models/Gate.js';
import GateOfficer from '../models/GateOfficer.js';
import ScanLog from '../models/ScanLog.js';

export const getDashboardStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalStudents,
      totalStaff,
      totalVisitors,
      totalVehicles,
      pendingVehicles,
      approvedVehicles,
      rejectedVehicles,
      suspendedVehicles,
      activePasses,
      activeGates,
      activeOfficers,
      entriesToday,
      exitsToday,
      recentScans,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['STUDENT', 'STAFF', 'VISITOR'] } }),
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'STAFF' }),
      User.countDocuments({ role: 'VISITOR' }),
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'PENDING' }),
      Vehicle.countDocuments({ status: 'APPROVED' }),
      Vehicle.countDocuments({ status: 'REJECTED' }),
      Vehicle.countDocuments({ status: 'SUSPENDED' }),
      VehiclePass.countDocuments({ status: 'ACTIVE' }),
      Gate.countDocuments({ status: 'ACTIVE' }),
      GateOfficer.countDocuments({ status: 'ON_DUTY' }),
      ScanLog.countDocuments({ direction: 'ENTRY', scannedAt: { $gte: startOfToday } }),
      ScanLog.countDocuments({ direction: 'EXIT', scannedAt: { $gte: startOfToday } }),
      ScanLog.find()
        .populate('gateId', 'name code')
        .populate('officerId', 'fullName')
        .sort({ scannedAt: -1 })
        .limit(10),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        usersBreakdown: {
          students: totalStudents,
          staff: totalStaff,
          visitors: totalVisitors,
        },
        totalVehicles,
        vehiclesBreakdown: {
          pending: pendingVehicles,
          approved: approvedVehicles,
          rejected: rejectedVehicles,
          suspended: suspendedVehicles,
        },
        activePasses,
        activeGates,
        activeOfficers,
        todayTraffic: {
          entries: entriesToday,
          exits: exitsToday,
          total: entriesToday + exitsToday,
        },
      },
      recentScans,
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalyticsBreakdown = async (req, res) => {
  try {
    // 1. Scans grouped by Gate
    const scansByGate = await ScanLog.aggregate([
      {
        $group: {
          _id: '$gateId',
          totalScans: { $sum: 1 },
          entries: { $sum: { $cond: [{ $eq: ['$direction', 'ENTRY'] }, 1, 0] } },
          exits: { $sum: { $cond: [{ $eq: ['$direction', 'EXIT'] }, 1, 0] } },
          validScans: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'VALID'] }, 1, 0] } },
          invalidScans: { $sum: { $cond: [{ $ne: ['$verificationStatus', 'VALID'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'gates',
          localField: '_id',
          foreignField: '_id',
          as: 'gateInfo',
        },
      },
      { $unwind: { path: '$gateInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          gateId: '$_id',
          gateName: { $ifNull: ['$gateInfo.name', 'Unknown Gate'] },
          gateCode: { $ifNull: ['$gateInfo.code', 'UNK'] },
          totalScans: 1,
          entries: 1,
          exits: 1,
          validScans: 1,
          invalidScans: 1,
        },
      },
    ]);

    // 2. Vehicles grouped by Type
    const vehiclesByType = await Vehicle.aggregate([
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] } },
        },
      },
      {
        $project: {
          vehicleType: '$_id',
          count: 1,
          approved: 1,
        },
      },
    ]);

    // 3. Scans grouped by User Role
    const scansByRole = await ScanLog.aggregate([
      {
        $group: {
          _id: '$ownerRole',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          role: { $ifNull: ['$_id', 'UNKNOWN'] },
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        scansByGate,
        vehiclesByType,
        scansByRole,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportReportsCSV = async (req, res) => {
  try {
    const { gateId, direction, verificationStatus, startDate, endDate } = req.query;

    const filter = {};
    if (gateId && gateId !== 'ALL') filter.gateId = gateId;
    if (direction && direction !== 'ALL') filter.direction = direction;
    if (verificationStatus && verificationStatus !== 'ALL') filter.verificationStatus = verificationStatus;
    if (startDate || endDate) {
      filter.scannedAt = {};
      if (startDate) filter.scannedAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.scannedAt.$lte = end;
      }
    }

    const logs = await ScanLog.find(filter)
      .populate('gateId', 'name code')
      .populate('officerId', 'fullName')
      .sort({ scannedAt: -1 })
      .limit(1000);

    // Build CSV string
    const headers = [
      'Scan ID',
      'Date & Time',
      'Gate Name',
      'Gate Code',
      'Direction',
      'Status',
      'License Plate',
      'Owner Name',
      'Owner Role',
      'Vehicle Type',
      'Vehicle Make/Model',
      'Officer Name',
      'Failure Reason',
    ];

    const rows = logs.map((log) => [
      `"${log._id}"`,
      `"${new Date(log.scannedAt).toISOString()}"`,
      `"${log.gateId?.name || 'N/A'}"`,
      `"${log.gateId?.code || 'N/A'}"`,
      `"${log.direction}"`,
      `"${log.verificationStatus}"`,
      `"${log.licensePlate || 'N/A'}"`,
      `"${log.ownerName || 'N/A'}"`,
      `"${log.ownerRole || 'N/A'}"`,
      `"${log.vehicleType || 'N/A'}"`,
      `"${log.vehicleMakeModel || 'N/A'}"`,
      `"${log.officerId?.fullName || 'N/A'}"`,
      `"${(log.failureReason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=university_gate_pass_report_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
