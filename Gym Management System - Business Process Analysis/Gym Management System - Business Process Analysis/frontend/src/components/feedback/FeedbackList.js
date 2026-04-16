// frontend/src/components/feedback/FeedbackList.js
import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Rating,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  MarkEmailRead,
  Search,
  ArrowBack
} from '@mui/icons-material';
import { format } from 'date-fns';
import { viLocale } from 'date-fns/locale/vi';
import FeedbackContext from '../../contexts/feedback/feedbackContext';
import AlertContext from '../../contexts/alert/alertContext';
import { useNavigate } from 'react-router-dom';

const FeedbackList = () => {
  const feedbackContext = useContext(FeedbackContext);
  const alertContext = useContext(AlertContext);
  const navigate = useNavigate();
  
  const { 
    feedback, 
    loading, 
    error, 
    getAllFeedback, 
    markFeedbackAsRead 
  } = feedbackContext;
  const { setAlert } = alertContext;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  
  useEffect(() => {
    getAllFeedback();
    // eslint-disable-next-line
  }, []);
  
  const handleOpenDialog = (feedback) => {
    setSelectedFeedback(feedback);
    setDialogOpen(true);
    
    // Đánh dấu là đã đọc nếu chưa đọc
    if (!feedback.isRead) {
      markFeedbackAsRead(feedback._id);
    }
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await markFeedbackAsRead(id);
      setAlert('Đã đánh dấu phản hồi là đã đọc', 'success');
    } catch (err) {
      console.error(err);
    }
  };
  
  // Lọc phản hồi theo từ khóa tìm kiếm
  const filteredFeedback = feedback ? feedback.filter(f => {
    const searchText = searchTerm.toLowerCase();
    return (
      f.content.toLowerCase().includes(searchText) ||
      f.customer?.user?.fullName?.toLowerCase().includes(searchText) ||
      f.customer?.user?.email?.toLowerCase().includes(searchText)
    );
  }) : [];
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm - dd/MM/yyyy');
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
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h2" sx={{ flexGrow: 1 }}>
            Danh sách phản hồi từ khách hàng
          </Typography>
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm phản hồi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {filteredFeedback.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary">
              {searchTerm 
                ? 'Không tìm thấy phản hồi nào phù hợp' 
                : 'Chưa có phản hồi nào từ khách hàng'}
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredFeedback.map((item, index) => (
              <React.Fragment key={item._id}>
                {index > 0 && <Divider variant="inset" component="li" />}
                <ListItem 
                  alignItems="flex-start"
                  button
                  onClick={() => handleOpenDialog(item)}
                  sx={{
                    bgcolor: item.isRead ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      bgcolor: item.isRead 
                        ? 'rgba(0, 0, 0, 0.04)' 
                        : 'rgba(25, 118, 210, 0.15)'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      src={item.customer?.user?.profileImage 
                        ? `http://localhost:5000${item.customer.user.profileImage}` 
                        : ''
                      }
                      alt={item.customer?.user?.fullName}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography 
                          variant="subtitle1" 
                          component="span"
                          sx={{ 
                            fontWeight: item.isRead ? 'normal' : 'bold',
                            flexGrow: 1
                          }}
                        >
                          {item.customer?.user?.fullName || 'Khách hàng'}
                        </Typography>
                        <Rating 
                          value={item.rating} 
                          readOnly 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                        {!item.isRead && (
                          <Chip 
                            label="Chưa đọc" 
                            color="primary" 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textPrimary"
                          sx={{ 
                            display: 'block',
                            fontWeight: item.isRead ? 'normal' : 'medium',
                            mb: 0.5
                          }}
                        >
                          {item.content.length > 100 
                            ? `${item.content.substring(0, 100)}...` 
                            : item.content
                          }
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="textSecondary"
                        >
                          {formatDate(item.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {!item.isRead && (
                      <IconButton 
                        edge="end" 
                        aria-label="mark as read"
                        onClick={(e) => handleMarkAsRead(e, item._id)}
                        title="Đánh dấu đã đọc"
                      >
                        <MarkEmailRead />
                      </IconButton>
                    )}
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Chi tiết phản hồi */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedFeedback && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Avatar 
                  src={selectedFeedback.customer?.user?.profileImage 
                    ? `http://localhost:5000${selectedFeedback.customer.user.profileImage}` 
                    : ''
                  }
                  alt={selectedFeedback.customer?.user?.fullName}
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">
                    {selectedFeedback.customer?.user?.fullName || 'Khách hàng'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {selectedFeedback.customer?.user?.email}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography component="legend">Đánh giá</Typography>
                <Rating value={selectedFeedback.rating} readOnly />
              </Box>
              <Typography variant="body1" gutterBottom>
                {selectedFeedback.content}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                Gửi lúc: {formatDate(selectedFeedback.createdAt)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Đóng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default FeedbackList;