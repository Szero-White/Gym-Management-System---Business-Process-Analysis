import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import NewsContext from '../../contexts/news/newsContext';
import AlertContext from '../../contexts/alert/alertContext';
import AuthContext from '../../contexts/auth/authContext';

import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Avatar,
  Tooltip
} from '@mui/material';

import {
  Add,
  Search,
  Edit,
  Delete,
  Star,
  StarBorder,
  VisibilityOff,
  CalendarToday,
  Category as CategoryIcon,
  RemoveRedEye
} from '@mui/icons-material';

const NewsList = () => {
  const newsContext = useContext(NewsContext);
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);

  const { news, loading, getNews, deleteNews, toggleFeatured, toggleActive } = newsContext;
  const { setAlert } = alertContext;
  const { user } = authContext;

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    id: null,
    type: ''
  });

  // Check user permissions
  const isAdmin = user && user.role === 'admin';
  const canCreateNews = user && (user.role === 'admin' || user.role === 'receptionist');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const filters = {};
        
        if (statusFilter === 'active') {
          filters.active = true;
        } else if (statusFilter === 'inactive') {
          filters.active = false;
        }
        
        if (categoryFilter !== 'all') {
          filters.category = categoryFilter;
        }
        
        await getNews(filters);
      } catch (err) {
        console.error('Error fetching news:', err);
      }
    };
    
    fetchNews();
    // eslint-disable-next-line
  }, [categoryFilter, statusFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };
  
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleDeleteOpen = (id) => {
    setConfirmDialog({
      open: true,
      id,
      type: 'delete'
    });
  };

  const handleConfirmClose = () => {
    setConfirmDialog({
      open: false,
      id: null,
      type: ''
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteNews(confirmDialog.id);
      setAlert('Xóa tin tức thành công', 'success');
      handleConfirmClose();
    } catch (err) {
      setAlert(err.response?.data?.message || 'Lỗi khi xóa tin tức', 'error');
      handleConfirmClose();
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const result = await toggleFeatured(id);
      setAlert(`Đã ${result.featured ? 'đánh dấu' : 'bỏ đánh dấu'} nổi bật cho tin tức`, 'success');
    } catch (err) {
      setAlert(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái nổi bật', 'error');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const result = await toggleActive(id);
      setAlert(`Đã ${result.active ? 'kích hoạt' : 'vô hiệu hóa'} tin tức`, 'success');
    } catch (err) {
      setAlert(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái hoạt động', 'error');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter news based on search term
  const filteredNews = news && news.filter(item => {
    return item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.content.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Translate category
  const translateCategory = (category) => {
    switch (category) {
      case 'announcement':
        return 'Thông báo';
      case 'promotion':
        return 'Khuyến mãi';
      case 'event':
        return 'Sự kiện';
      case 'other':
        return 'Khác';
      default:
        return category;
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'announcement':
        return 'primary';
      case 'promotion':
        return 'secondary';
      case 'event':
        return 'success';
      case 'other':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h2">
            Quản lý tin tức
          </Typography>
          {canCreateNews && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              component={Link}
              to="/news/add"
            >
              Thêm tin tức mới
            </Button>
          )}
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm tin tức..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={categoryFilter}
                label="Danh mục"
                onChange={handleCategoryChange}
              >
                <MenuItem value="all">Tất cả danh mục</MenuItem>
                <MenuItem value="announcement">Thông báo</MenuItem>
                <MenuItem value="promotion">Khuyến mãi</MenuItem>
                <MenuItem value="event">Sự kiện</MenuItem>
                <MenuItem value="other">Khác</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={handleStatusChange}
              >
                <MenuItem value="all">Tất cả trạng thái</MenuItem>
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="inactive">Đã vô hiệu</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {filteredNews && filteredNews.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary">
              Không có tin tức nào phù hợp với tìm kiếm
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredNews && filteredNews.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    opacity: item.active ? 1 : 0.7,
                    position: 'relative'
                  }}
                >
                  {item.featured && (
                    <Chip
                      icon={<Star />}
                      label="Nổi bật"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 1
                      }}
                    />
                  )}
                  
                  {!item.active && (
                    <Chip
                      icon={<VisibilityOff />}
                      label="Đã ẩn"
                      color="error"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        zIndex: 1
                      }}
                    />
                  )}
                  
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image ? `http://localhost:5000${item.image}` : 'https://via.placeholder.com/300x200?text=Không+có+ảnh'}
                    alt={item.title}
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Chip
                        size="small"
                        label={translateCategory(item.category)}
                        color={getCategoryColor(item.category)}
                        icon={<CategoryIcon />}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.createdAt)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" component="h3" gutterBottom>
                      {item.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.content.length > 100 
                        ? `${item.content.substring(0, 100)}...` 
                        : item.content}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={item.author?.profileImage ? `http://localhost:5000${item.author.profileImage}` : ''}
                          alt={item.author?.fullName}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        <Typography variant="caption">
                          {item.author?.fullName || 'Không rõ'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <RemoveRedEye fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {item.viewCount}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions>
                    <Button size="small" component={Link} to={`/news/${item._id}`}>
                      Xem chi tiết
                    </Button>
                    <Box flexGrow={1} />
                    
                    {/* Admin or author can edit */}
                    {(isAdmin || (user && user.id === item.author?._id)) && (
                      <Tooltip title="Chỉnh sửa">
                        <IconButton 
                          size="small" 
                          color="primary"
                          component={Link}
                          to={`/news/edit/${item._id}`}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {/* Only admin can toggle featured & active */}
                    {isAdmin && (
                      <>
                        <Tooltip title={item.featured ? "Bỏ đánh dấu nổi bật" : "Đánh dấu nổi bật"}>
                          <IconButton 
                            size="small" 
                            color={item.featured ? "warning" : "default"}
                            onClick={() => handleToggleFeatured(item._id)}
                          >
                            {item.featured ? <Star /> : <StarBorder />}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={item.active ? "Ẩn tin tức" : "Hiện tin tức"}>
                          <IconButton 
                            size="small" 
                            color={item.active ? "success" : "error"}
                            onClick={() => handleToggleActive(item._id)}
                          >
                            {item.active ? <RemoveRedEye /> : <VisibilityOff />}
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    
                    {/* Admin or author can delete */}
                    {(isAdmin || (user && user.id === item.author?._id)) && (
                      <Tooltip title="Xóa">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteOpen(item._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmClose}
      >
        <DialogTitle>
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa tin tức này không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NewsList;