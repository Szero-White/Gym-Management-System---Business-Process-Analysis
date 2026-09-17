const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const newsController = require('../controllers/newsController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const upload = require('../middlewares/upload');

// @route   GET api/news
// @desc    Get all news articles
// @access  Public
router.get('/', newsController.getAllNews);

// @route   GET api/news/:id
// @desc    Get news by ID
// @access  Public
router.get('/:id', newsController.getNewsById);

// @route   POST api/news
// @desc    Create a new news article
// @access  Private (admin, receptionist)
router.post(
  '/',
  [
    auth,
    roleCheck('admin', 'receptionist'),
    upload.single('newsImage'),
    [
      check('title', 'Tiêu đề là bắt buộc').not().isEmpty(),
      check('content', 'Nội dung là bắt buộc').not().isEmpty(),
      check('category', 'Danh mục không hợp lệ')
        .optional()
        .isIn(['announcement', 'promotion', 'event', 'other'])
    ]
  ],
  newsController.addNews
);

// @route   PUT api/news/:id
// @desc    Update a news article
// @access  Private (admin, or author)
router.put(
  '/:id',
  [
    auth,
    upload.single('newsImage'),
    [
      check('title', 'Tiêu đề không được để trống').optional().not().isEmpty(),
      check('content', 'Nội dung không được để trống').optional().not().isEmpty(),
      check('category', 'Danh mục không hợp lệ')
        .optional()
        .isIn(['announcement', 'promotion', 'event', 'other'])
    ]
  ],
  newsController.updateNews
);

// @route   DELETE api/news/:id
// @desc    Delete a news article
// @access  Private (admin, or author)
router.delete(
  '/:id',
  auth,
  newsController.deleteNews
);

// @route   PUT api/news/:id/featured
// @desc    Toggle featured status
// @access  Private (admin only)
router.put(
  '/:id/featured',
  [auth, roleCheck('admin')],
  newsController.toggleFeatured
);

// @route   PUT api/news/:id/active
// @desc    Toggle active status
// @access  Private (admin only)
router.put(
  '/:id/active',
  [auth, roleCheck('admin')],
  newsController.toggleActive
);

// @route   PUT api/news/:id/image
// @desc    Upload news image
// @access  Private (admin, or author)
router.put(
  '/:id/image',
  [auth, upload.single('newsImage')],
  newsController.uploadNewsImage
);

module.exports = router;