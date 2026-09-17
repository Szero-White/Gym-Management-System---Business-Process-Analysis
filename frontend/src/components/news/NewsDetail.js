import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import NewsContext from '../../contexts/news/newsContext';
import AlertContext from '../../contexts/alert/alertContext';
import AuthContext from '../../contexts/auth/authContext';

import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Avatar,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';

import {
  ArrowBack,
  Edit,
  Delete,
  Star,
  StarBorder,
  RemoveRedEye,
  VisibilityOff,
  CalendarToday,
  Person,
  Category as CategoryIcon,
} from '@mui/icons-material';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const newsContext = useContext(NewsContext);
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);
  
  const { currentNews, loading, getNewsById, deleteNews, toggleFeatured, toggleActive } = newsContext;
  const { setAlert } = alertContext;
  const { user } = authContext;
  
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: ''
  });
  
  // Check user permissions
  const isAdmin = user && user.role === 'admin';
  const isAuthor = currentNews && user && user.id === currentNews.author?._id;
  const canEdit = isAdmin || isAuthor;
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        await getNewsById(id);
      } catch (err) {
        setAlert('Không thể tải thông tin tin tức', 'error');
        navigate('/news');
      }
    };
    
    fetchNews();
    // eslint-disable-next-line
  }, [id]);
  
  const handleDeleteOpen = () => {
    setConfirmDialog({
      open: true,
      type: 'delete'
    });
  };
  
  const handleConfirmClose = () => {
    setConfirmDialog({
      open: false,
      type: ''
    });
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await deleteNews(id);
      setAlert('Xóa tin tức thành công', 'success');
      navigate('/news');
    } catch (err) {
      setAlert(err.response?.data?.message || 'Lỗi khi xóa tin tức', 'error');
    }
  };
  
  const handleToggleFeatured = async () => {
    try {
      const result = await toggleFeatured(id);
      setAlert(`Đã ${result.featured ? 'đánh dấu' : 'bỏ đánh dấu'} nổi bật cho tin tức`, 'success');
    } catch (err) {
      setAlert(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái nổi bật', 'error');
    }
  };
  
  const handleToggleActive = async () => {
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
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
  
  if (loading || !currentNews) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/news')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h2" sx={{ flexGrow: 1 }}>
            Chi tiết tin tức
          </Typography>
          
          {canEdit && (
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Edit />}
                component={Link}
                to={`/news/edit/${id}`}
                sx={{ mr: 1 }}
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDeleteOpen}
              >
                Xóa
              </Button>
            </Box>
          )}
        </Box>
        
        <Box sx={{ position: 'relative', mb: 4 }}>
          {currentNews.image ? (
            <Box
              component="img"
              src={`http://localhost:5000${currentNews.image}`}
              alt={currentNews.title}
              sx={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: 1
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '300px',
                backgroundColor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Không có ảnh
              </Typography>
            </Box>
          )}
          
          {/* Status chips */}
          <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
            {currentNews.featured && (
              <Chip
                icon={<Star />}
                label="Nổi bật"
                color="primary"
                variant="filled"
              />
            )}
            
            {!currentNews.active && (
              <Chip
                icon={<VisibilityOff />}
                label="Đã ẩn"
                color="error"
                variant="filled"
              />
            )}
          </Box>
        </Box>
        
        <Box mb={3}>
          <Typography variant="h4" gutterBottom>
            {currentNews.title}
          </Typography>
          
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
            <Chip
              icon={<CategoryIcon />}
              label={translateCategory(currentNews.category)}
              color={getCategoryColor(currentNews.category)}
              size="medium"
            />
            
            <Chip
              icon={<CalendarToday />}
              label={formatDate(currentNews.createdAt)}
              variant="outlined"
              size="medium"
            />
            
            <Chip
              icon={<RemoveRedEye />}
              label={`${currentNews.viewCount} lượt xem`}
              variant="outlined"
              size="medium"
            />
            
            {isAdmin && (
              <Box>
                <Tooltip title={currentNews.featured ? "Bỏ đánh dấu nổi bật" : "Đánh dấu nổi bật"}>
                  <IconButton 
                    color={currentNews.featured ? "warning" : "default"}
                    onClick={handleToggleFeatured}
                  >
                    {currentNews.featured ? <Star /> : <StarBorder />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={currentNews.active ? "Ẩn tin tức" : "Hiện tin tức"}>
                  <IconButton 
                    color={currentNews.active ? "success" : "error"}
                    onClick={handleToggleActive}
                  >
                    {currentNews.active ? <RemoveRedEye /> : <VisibilityOff />}
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
          {currentNews.content}
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Người đăng:
            </Typography>
            <Box display="flex" alignItems="center">
              <Avatar 
                src={currentNews.author?.profileImage ? `http://localhost:5000${currentNews.author.profileImage}` : ''}
                alt={currentNews.author?.fullName}
                sx={{ mr: 2 }}
              />
              <Box>
                <Typography variant="subtitle1">
                  {currentNews.author?.fullName || 'Không rõ'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đăng ngày {formatDate(currentNews.createdAt)}
                </Typography>
                {currentNews.createdAt !== currentNews.updatedAt && (
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật gần nhất: {formatDate(currentNews.updatedAt)}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
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

export default NewsDetail;