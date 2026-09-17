const { validationResult } = require('express-validator');
const Equipment = require('../models/Equipment');
const Maintenance = require('../models/Maintenance');

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private (admin, receptionist)
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Get equipment by ID
// @route   GET /api/equipment/:id
// @access  Private (admin, receptionist)
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }
    
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Add new equipment
// @route   POST /api/equipment
// @access  Private (admin only)
exports.addEquipment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { 
    name, 
    type, 
    serialNumber, 
    status, 
    description, 
    purchaseDate, 
    warrantyEndDate,
    cost,
    location,
    notes 
  } = req.body;

  try {
    // Check if equipment with serial number already exists (if provided)
    if (serialNumber) {
      const existingEquipment = await Equipment.findOne({ serialNumber });
      if (existingEquipment) {
        return res.status(400).json({ message: 'Thiết bị với số serial này đã tồn tại' });
      }
    }

    const newEquipment = new Equipment({
      name,
      type,
      serialNumber,
      status: status || 'new',
      description,
      purchaseDate: purchaseDate || Date.now(),
      warrantyEndDate,
      cost,
      location,
      notes
    });

    const equipment = await newEquipment.save();
    res.status(201).json(equipment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private (admin only)
exports.updateEquipment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { 
    name, 
    type, 
    serialNumber, 
    status, 
    description, 
    purchaseDate, 
    warrantyEndDate,
    cost,
    location,
    lastMaintenanceDate,
    nextMaintenanceDate,
    notes 
  } = req.body;

  // Build equipment object
  const equipmentFields = {};
  if (name) equipmentFields.name = name;
  if (type) equipmentFields.type = type;
  if (serialNumber) equipmentFields.serialNumber = serialNumber;
  if (status) equipmentFields.status = status;
  if (description) equipmentFields.description = description;
  if (purchaseDate) equipmentFields.purchaseDate = purchaseDate;
  if (warrantyEndDate) equipmentFields.warrantyEndDate = warrantyEndDate;
  if (cost) equipmentFields.cost = cost;
  if (location) equipmentFields.location = location;
  if (lastMaintenanceDate) equipmentFields.lastMaintenanceDate = lastMaintenanceDate;
  if (nextMaintenanceDate) equipmentFields.nextMaintenanceDate = nextMaintenanceDate;
  if (notes) equipmentFields.notes = notes;

  try {
    let equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }

    // Check if updating to a serial number that already exists
    if (serialNumber && serialNumber !== equipment.serialNumber) {
      const existingEquipment = await Equipment.findOne({ serialNumber });
      if (existingEquipment) {
        return res.status(400).json({ message: 'Thiết bị với số serial này đã tồn tại' });
      }
    }

    // Update
    equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { $set: equipmentFields },
      { new: true }
    );

    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }
    res.status(500).send('Lỗi server');
  }
};

// @desc    Update equipment status
// @route   PATCH /api/equipment/:id/status
// @access  Private (admin only)
exports.updateEquipmentStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status } = req.body;

  try {
    let equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }

    equipment.status = status;
    await equipment.save();

    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }
    res.status(500).send('Lỗi server');
  }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private (admin only)
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }

    // Also delete any associated maintenance records
    await Maintenance.deleteMany({ equipment: req.params.id });

    await equipment.remove();

    res.json({ message: 'Thiết bị đã được xóa' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }
    res.status(500).send('Lỗi server');
  }
};

// @desc    Upload equipment image
// @route   PUT /api/equipment/:id/image
// @access  Private (admin only)
exports.uploadEquipmentImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }

    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }
    
    // Save image path
    const imagePath = `/uploads/${req.file.filename}`;
    equipment.image = imagePath;
    await equipment.save();

    res.json({ 
      message: 'Tải lên ảnh thiết bị thành công',
      imageUrl: imagePath 
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Get equipment that needs maintenance soon (within next 30 days)
// @route   GET /api/equipment/maintenance-required
// @access  Private (admin, receptionist)
exports.getEquipmentNeedingMaintenance = async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const today = new Date();
    
    const equipment = await Equipment.find({
      nextMaintenanceDate: { $gte: today, $lte: thirtyDaysFromNow },
      status: { $ne: 'retired' }
    }).sort({ nextMaintenanceDate: 1 });
    
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Get equipment for customers
// @route   GET /api/equipment/customer
// @access  Private (customer)
exports.getCustomerEquipment = async (req, res) => {
  try {
    // Return equipment that's in use or new and not marked as damaged, maintenance, or retired
    const equipment = await Equipment.find({ 
      status: { $in: ['in-use', 'new'] }
    }).sort({ type: 1, name: 1 });
    
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};