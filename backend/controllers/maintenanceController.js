const { validationResult } = require('express-validator');
const Maintenance = require('../models/Maintenance');
const Equipment = require('../models/Equipment');

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private (admin, receptionist)
exports.getAllMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.find()
      .populate('equipment', 'name type serialNumber')
      .sort({ scheduledDate: -1 });
      
    res.json(maintenance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Get maintenance by ID
// @route   GET /api/maintenance/:id
// @access  Private (admin, receptionist)
exports.getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('equipment');
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi bảo trì' });
    }
    
    res.json(maintenance);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi bảo trì' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Get maintenance records for specific equipment
// @route   GET /api/maintenance/equipment/:equipmentId
// @access  Private (admin, receptionist)
exports.getMaintenanceByEquipment = async (req, res) => {
  try {
    const maintenance = await Maintenance.find({ equipment: req.params.equipmentId })
      .populate('equipment', 'name type serialNumber')
      .sort({ scheduledDate: -1 });
      
    res.json(maintenance);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi bảo trì' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Add new maintenance record
// @route   POST /api/maintenance
// @access  Private (admin only)
exports.addMaintenance = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { 
    equipment,
    maintenanceType, 
    scheduledDate, 
    completedDate, 
    status,
    technician,
    cost,
    description,
    notes,
    partsReplaced
  } = req.body;

  try {
    // Verify the equipment exists
    const equipmentExists = await Equipment.findById(equipment);
    if (!equipmentExists) {
      return res.status(404).json({ message: 'Thiết bị không tồn tại' });
    }

    const newMaintenance = new Maintenance({
      equipment,
      maintenanceType,
      scheduledDate,
      completedDate,
      status: status || 'scheduled',
      technician,
      cost,
      description,
      notes,
      partsReplaced
    });

    const maintenance = await newMaintenance.save();

    // Update the equipment's next maintenance date if this is a completed maintenance
    if (status === 'completed' && completedDate) {
      equipmentExists.lastMaintenanceDate = completedDate;
      
      // Schedule next maintenance in 90 days by default (can be customized)
      const nextDate = new Date(completedDate);
      nextDate.setDate(nextDate.getDate() + 90);
      equipmentExists.nextMaintenanceDate = nextDate;
      
      await equipmentExists.save();
    }

    res.status(201).json(maintenance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Update maintenance record
// @route   PUT /api/maintenance/:id
// @access  Private (admin only)
exports.updateMaintenance = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { 
    maintenanceType, 
    scheduledDate, 
    completedDate, 
    status,
    technician,
    cost,
    description,
    notes,
    partsReplaced
  } = req.body;

  // Build maintenance object
  const maintenanceFields = {};
  if (maintenanceType) maintenanceFields.maintenanceType = maintenanceType;
  if (scheduledDate) maintenanceFields.scheduledDate = scheduledDate;
  if (completedDate) maintenanceFields.completedDate = completedDate;
  if (status) maintenanceFields.status = status;
  if (technician) maintenanceFields.technician = technician;
  if (cost) maintenanceFields.cost = cost;
  if (description) maintenanceFields.description = description;
  if (notes) maintenanceFields.notes = notes;
  if (partsReplaced) maintenanceFields.partsReplaced = partsReplaced;

  try {
    let maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi bảo trì' });
    }

    // Update
    maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { $set: maintenanceFields },
      { new: true }
    );

    // If maintenance record is being marked as completed with a completion date, 
    // always update the equipment record regardless of previous status
    if (status === 'completed' && completedDate) {
      const equipment = await Equipment.findById(maintenance.equipment);
      
      if (equipment) {
        // Always update the last maintenance date when a maintenance record is completed
        equipment.lastMaintenanceDate = completedDate;
        
        // Schedule next maintenance in 90 days by default
        const nextDate = new Date(completedDate);
        nextDate.setDate(nextDate.getDate() + 90);
        equipment.nextMaintenanceDate = nextDate;
        
        // If equipment was in maintenance status, change it back to in-use
        if (equipment.status === 'maintenance') {
          equipment.status = 'in-use';
        }
        
        await equipment.save();
      }
    }

    res.json(maintenance);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi bảo trì' });
    }
    res.status(500).send('Lỗi server');
  }
};

// @desc    Delete maintenance record
// @route   DELETE /api/maintenance/:id
// @access  Private (admin only)
exports.deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi bảo trì' });
    }

    await maintenance.remove();

    res.json({ message: 'Bản ghi bảo trì đã được xóa' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi bảo trì' });
    }
    res.status(500).send('Lỗi server');
  }
};

// @desc    Get upcoming maintenance (scheduled for next 7 days)
// @route   GET /api/maintenance/upcoming
// @access  Private (admin, receptionist)
exports.getUpcomingMaintenance = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    
    const maintenance = await Maintenance.find({
      scheduledDate: { $gte: today, $lte: sevenDaysLater },
      status: { $in: ['scheduled', 'in-progress'] }
    })
      .populate('equipment', 'name type serialNumber status location')
      .sort({ scheduledDate: 1 });
      
    res.json(maintenance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Get overdue maintenance
// @route   GET /api/maintenance/overdue
// @access  Private (admin, receptionist)
exports.getOverdueMaintenance = async (req, res) => {
  try {
    const today = new Date();
    
    const maintenance = await Maintenance.find({
      scheduledDate: { $lt: today },
      status: { $in: ['scheduled', 'in-progress'] }
    })
      .populate('equipment', 'name type serialNumber status location')
      .sort({ scheduledDate: 1 });
      
    res.json(maintenance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};