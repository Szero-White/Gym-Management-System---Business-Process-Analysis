// frontend/src/components/feedback/FeedbackForm.js
import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Rating,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import FeedbackContext from '../../contexts/feedback/feedbackContext';
import AlertContext from '../../contexts/alert/alertContext';

const FeedbackForm = ({ open, onClose }) => {
  const feedbackContext = useContext(FeedbackContext);
  const alertContext = useContext(AlertContext);
  
  const { addFeedback, loading } = feedbackContext;
  const { setAlert } = alertContext;
  
  const [formData, setFormData] = useState({
    content: '',
    rating: 5
  });
  
  const { content, rating } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleRatingChange = (event, newValue) => {
    setFormData({ ...formData, rating: newValue });
  };
  
  const onSubmit = async () => {
    if (!content.trim()) {
      setAlert('Vui lòng nhập nội dung phản hồi', 'error');
      return;
    }
    
    try {
      await addFeedback(formData);
      setAlert('Gửi phản hồi thành công! Cảm ơn bạn đã đóng góp ý kiến.', 'success');
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleClose = () => {
    setFormData({
      content: '',
      rating: 5
    });
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Đóng góp ý kiến</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography component="legend">Đánh giá của bạn</Typography>
          <Rating
            name="rating"
            value={rating}
            onChange={handleRatingChange}
            size="large"
            precision={1}
          />
        </Box>
        
        <TextField
          autoFocus
          margin="dense"
          name="content"
          label="Nội dung phản hồi"
          type="text"
          fullWidth
          multiline
          rows={5}
          value={content}
          onChange={onChange}
          variant="outlined"
          placeholder="Nhập ý kiến đóng góp của bạn tại đây..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button 
          onClick={onSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Gửi phản hồi'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackForm;