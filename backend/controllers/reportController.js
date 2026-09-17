// backend/controllers/reportController.js
const Customer = require('../models/Customer');
const ServiceRegistration = require('../models/ServiceRegistration');
const Service = require('../models/Service');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const mongoose = require('mongoose');

// Thống kê khách hàng đăng ký theo thời gian
exports.getCustomerRegistrationStats = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    // Xác định khoảng thời gian
    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();
    
    if (!startDate) {
      // Nếu không có ngày bắt đầu, thiết lập mặc định là đầu tháng hiện tại
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }
    
    if (!endDate) {
      // Nếu không có ngày kết thúc, thiết lập mặc định là ngày hiện tại
      end.setHours(23, 59, 59, 999);
    }
    
    // Tạo pipeline tổng hợp dữ liệu
    let timeGrouping;
    switch(period) {
      case 'day':
        timeGrouping = { 
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } 
        };
        break;
      case 'week':
        timeGrouping = { 
          $week: "$createdAt" 
        };
        break;
      case 'month':
        timeGrouping = { 
          $dateToString: { format: "%Y-%m", date: "$createdAt" } 
        };
        break;
      case 'year':
        timeGrouping = { 
          $dateToString: { format: "%Y", date: "$createdAt" } 
        };
        break;
      default:
        timeGrouping = { 
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } 
        };
    }
    
    // Thực hiện aggregation để lấy số lượng đăng ký theo thời gian
    const customerStats = await Customer.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: timeGrouping,
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.json(customerStats);
  } catch (err) {
    console.error('Error getting customer registration stats:', err);
    res.status(500).send('Lỗi server');
  }
};

// Thống kê dịch vụ được đăng ký nhiều nhất
exports.getServiceRegistrationStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Xác định khoảng thời gian
    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();
    
    if (!startDate) {
      // Nếu không có ngày bắt đầu, thiết lập mặc định là đầu tháng hiện tại
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }
    
    if (!endDate) {
      // Nếu không có ngày kết thúc, thiết lập mặc định là ngày hiện tại
      end.setHours(23, 59, 59, 999);
    }
    
    // Thống kê dịch vụ được đăng ký nhiều nhất
    const serviceStats = await ServiceRegistration.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$service",
          count: { $sum: 1 },
          totalSessions: { $sum: "$numberOfSessions" },
          revenue: { $sum: "$totalPrice" }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceInfo'
        }
      },
      {
        $unwind: "$serviceInfo"
      },
      {
        $lookup: {
          from: 'trainers',
          localField: 'serviceInfo.trainerId',
          foreignField: '_id',
          as: 'trainerInfo'
        }
      },
      {
        $unwind: {
          path: "$trainerInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'trainerInfo.user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $project: {
          serviceName: "$serviceInfo.name",
          serviceCategory: "$serviceInfo.category",
          count: 1,
          totalSessions: 1,
          revenue: 1,
          trainerName: {
            $arrayElemAt: ["$userInfo.fullName", 0]
          }
        }
      }
    ]);
    
    // Thống kê huấn luyện viên có nhiều đăng ký nhất
    const trainerStats = await ServiceRegistration.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$trainer",
          count: { $sum: 1 },
          totalSessions: { $sum: "$numberOfSessions" },
          revenue: { $sum: "$totalPrice" }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $lookup: {
          from: 'trainers',
          localField: '_id',
          foreignField: '_id',
          as: 'trainerInfo'
        }
      },
      {
        $unwind: "$trainerInfo"
      },
      {
        $lookup: {
          from: 'users',
          localField: 'trainerInfo.user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: "$userInfo"
      },
      {
        $project: {
          trainerName: "$userInfo.fullName",
          count: 1,
          totalSessions: 1,
          revenue: 1
        }
      }
    ]);
    
    res.json({
      serviceStats,
      trainerStats
    });
  } catch (err) {
    console.error('Error getting service registration stats:', err);
    res.status(500).send('Lỗi server');
  }
};