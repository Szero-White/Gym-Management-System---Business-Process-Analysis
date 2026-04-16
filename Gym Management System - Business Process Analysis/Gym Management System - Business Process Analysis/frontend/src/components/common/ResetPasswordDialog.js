// src/components/common/ResetPasswordDialog.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Typography
} from '@mui/material';
import api from '../../utils/api';

const ResetPasswordDialog = ({ open, onClose, userId, userType, userName }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate passwords
    if (!password) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }
    
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Determine the endpoint based on userType
      const endpoint = `/users/${userType}s/${userId}/reset-password`;
      
      await api.put(endpoint, { password });
      
      // Call the onClose with a success message
      onClose({ success: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose({ success: false })}>
      <DialogTitle>Đặt lại mật khẩu cho {userName}</DialogTitle>
      
      <DialogContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Nhập mật khẩu mới cho tài khoản này.
        </Typography>
        
        <TextField
          fullWidth
          margin="normal"
          label="Mật khẩu mới"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <TextField
          fullWidth
          margin="normal"
          label="Xác nhận mật khẩu"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          error={Boolean(error && password && confirmPassword && password !== confirmPassword)}
          helperText={error && password && confirmPassword && password !== confirmPassword ? error : ''}
        />
        
        {error && error !== 'Mật khẩu xác nhận không khớp' && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={() => onClose({ success: false })} 
          disabled={loading}
        >
          Hủy
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Đặt lại mật khẩu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordDialog;