const { validationResult } = require('express-validator');
const News = require('../models/News');

// Get all news articles
exports.getAllNews = async (req, res) => {
  try {
    // Parse query parameters
    const featured = req.query.featured === 'true';
    const active = req.query.active === 'true' || req.query.active === undefined;
    const category = req.query.category;
    const limit = parseInt(req.query.limit) || 0;
    
    // Build query
    const query = {};
    
    if (req.query.featured !== undefined) {
      query.featured = featured;
    }
    
    if (req.query.active !== undefined) {
      query.active = active;
    }
    
    if (category) {
      query.category = category;
    }
    
    // Find news articles and populate author info
    let newsQuery = News.find(query)
      .populate({
        path: 'author',
        select: 'fullName profileImage'
      })
      .sort({ createdAt: -1 });
    
    // Apply limit if provided
    if (limit > 0) {
      newsQuery = newsQuery.limit(limit);
    }
    
    const news = await newsQuery;
    
    res.json(news);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Get news by ID
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate({
        path: 'author',
        select: 'fullName profileImage'
      });
    
    if (!news) {
      return res.status(404).json({ message: 'Không tìm thấy tin tức này' });
    }
    
    // Increment view count
    news.viewCount += 1;
    await news.save();
    
    res.json(news);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy tin tức này' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// Create new news article
exports.addNews = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { title, content, category, featured } = req.body;
  
  try {
    const newNews = new News({
      title,
      content,
      category,
      featured: featured || false,
      author: req.user.id
    });
    
    // If there's an image uploaded, set the path
    if (req.file) {
      newNews.image = `/uploads/${req.file.filename}`;
    }
    
    await newNews.save();
    
    res.status(201).json(newNews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Update news article
exports.updateNews = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { title, content, category, featured, active } = req.body;
  
  try {
    let news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'Không tìm thấy tin tức này' });
    }
    
    // Only admin can edit any news, others can only edit their own
    if (req.user.role !== 'admin' && news.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa tin tức này' });
    }
    
    // Update fields
    if (title) news.title = title;
    if (content) news.content = content;
    if (category) news.category = category;
    if (featured !== undefined) news.featured = featured;
    if (active !== undefined) news.active = active;
    
    // If there's a new image uploaded, update the path
    if (req.file) {
      news.image = `/uploads/${req.file.filename}`;
    }
    
    await news.save();
    
    res.json(news);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy tin tức này' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// Delete news article
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'Không tìm thấy tin tức này' });
    }
    
    // Only admin can delete any news, others can only delete their own
    if (req.user.role !== 'admin' && news.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền xóa tin tức này' });
    }
    
    await News.findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Đã xóa tin tức thành công' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy tin tức này' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// Toggle featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'Không tìm thấy tin tức này' });
    }
    
    // Only admin can toggle featured status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ quản trị viên mới có quyền thay đổi trạng thái nổi bật' });
    }
    
    news.featured = !news.featured;
    await news.save();
    
    res.json(news);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy tin tức này' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// Toggle active status
exports.toggleActive = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'Không tìm thấy tin tức này' });
    }
    
    // Only admin can toggle active status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ quản trị viên mới có quyền thay đổi trạng thái hoạt động' });
    }
    
    news.active = !news.active;
    await news.save();
    
    res.json(news);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy tin tức này' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// Upload news image
exports.uploadNewsImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }

    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'Không tìm thấy tin tức này' });
    }
    
    // Only admin or author can update image
    if (req.user.role !== 'admin' && news.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền cập nhật ảnh cho tin tức này' });
    }
    
    // Update image path
    news.image = `/uploads/${req.file.filename}`;
    await news.save();

    res.json({ 
      message: 'Tải lên ảnh thành công',
      imageUrl: news.image 
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy tin tức này' });
    }
    
    res.status(500).send('Lỗi server');
  }
};