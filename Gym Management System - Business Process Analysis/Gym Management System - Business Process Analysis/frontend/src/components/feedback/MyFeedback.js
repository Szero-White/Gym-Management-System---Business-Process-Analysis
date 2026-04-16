// frontend/src/components/feedback/MyFeedback.js
import React, { useEffect, useContext, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Rating,
  Divider,
  Chip,
  CircularProgress,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { format } from 'date-fns';
import FeedbackContext from '../../contexts/feedback/feedbackContext';
import FeedbackForm from './FeedbackForm';

const MyFeedback = () => {
  const feedbackContext = useContext(FeedbackContext);
  const { myFeedback, loading, getMyFeedback } = feedbackContext;
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);
  
  useEffect(() => {
    getMyFeedback();
    // eslint-disable-next-line
  }, []);
  
  const handleOpenDialog = (feedback) => {
    setSelectedFeedback(feedback);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleOpenFeedbackForm = () => {
    setFeedbackFormOpen(true);
  };
  
  const handleCloseFeedbackForm = () => {
    setFeedbackFormOpen(false);
    // Reload feedback after submitting
    getMyFeedback();
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm - dd/MM/yyyy');
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={3}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h3">
          Phản hồi của tôi
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleOpenFeedbackForm}
        >
          Gửi phản hồi mới
        </Button>
      </Box>
      
      {(!myFeedback || myFeedback.length === 0) ? (
        <Box py={3} textAlign="center">
          <Typography color="textSecondary">
            Bạn chưa gửi phản hồi nào. Hãy chia sẻ ý kiến của bạn để chúng tôi có thể phục vụ bạn tốt hơn.
          </Typography>
        </Box>
      ) : (
        <List>
          {myFeedback.map((feedback, index) => (
            <React.Fragment key={feedback._id}>
              {index > 0 && <Divider />}
              <ListItem 
                button 
                onClick={() => handleOpenDialog(feedback)}
                sx={{ py: 2 }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        Phản hồi {index + 1}
                      </Typography>
                      <Rating value={feedback.rating} readOnly size="small" />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                        sx={{ display: 'block', mb: 1 }}
                      >
                        {feedback.content.length > 100 
                          ? `${feedback.content.substring(0, 100)}...` 
                          : feedback.content
                        }
                      </Typography>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(feedback.createdAt)}
                        </Typography>
                        <Chip 
                          label={feedback.isRead ? "Đã đọc" : "Chưa đọc"} 
                          color={feedback.isRead ? "success" : "default"}
                          size="small"
                        />
                      </Box>
                    </>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
      
      {/* Chi tiết phản hồi dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedFeedback && (
          <>
            <DialogTitle>Chi tiết phản hồi</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography component="legend">Đánh giá của bạn</Typography>
                <Rating value={selectedFeedback.rating} readOnly />
              </Box>
              <Typography variant="body1" gutterBottom>
                {selectedFeedback.content}
              </Typography>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Typography variant="caption" color="textSecondary">
                  Gửi lúc: {formatDate(selectedFeedback.createdAt)}
                </Typography>
                <Chip 
                  label={selectedFeedback.isRead ? "Đã được xem" : "Chưa được xem"} 
                  color={selectedFeedback.isRead ? "success" : "default"}
                  size="small"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Đóng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Form gửi phản hồi */}
      <FeedbackForm 
        open={feedbackFormOpen} 
        onClose={handleCloseFeedbackForm} 
      />
    </Paper>
  );
};

export default MyFeedback;