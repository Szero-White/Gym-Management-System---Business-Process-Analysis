import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Avatar,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import { PhotoCamera, CheckCircle } from '@mui/icons-material';
import api from '../../utils/api';

const ProfileImageUpload = ({ userId, userType, currentImage, onImageUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Xác định endpoint dựa trên loại người dùng
  const getUploadEndpoint = () => {
    if (userType === 'staff') {
      return `/staff/${userId}/profile-image`;
    } else if (userType === 'trainer') {
      return `/users/trainers/${userId}/profile-image`;
    } else if (userType === 'customer') {
      return `/users/customers/${userId}/profile-image`;
    }
    return null;
  };

  // Xử lý khi chọn file
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Reset các state
      setError(null);
      setUploadSuccess(false);
      
      // Kiểm tra loại file
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Vui lòng chọn file hình ảnh (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Tạo URL preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý khi tải lên
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('profileImage', selectedFile);
      
      const endpoint = getUploadEndpoint();
      if (!endpoint) {
        throw new Error('Không xác định được endpoint tải lên');
      }
      
      const response = await api.put(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadSuccess(true);
      setUploading(false);
      
      // Thông báo cho component cha
      if (onImageUpload) {
        onImageUpload(response.data.profileImageUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải lên');
      setUploading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Ảnh đại diện
      </Typography>
      
      <Box display="flex" flexDirection="column" alignItems="center">
        {/* Hiển thị ảnh hiện tại hoặc preview */}
        <Avatar
          src={preview || currentImage || ''}
          alt="Ảnh đại diện"
          sx={{ width: 150, height: 150, mb: 2, border: '1px solid #ccc' }}
        />
        
        {/* Nút chọn file */}
        <Button
          variant="outlined"
          component="label"
          startIcon={<PhotoCamera />}
          sx={{ mb: 2 }}
          disabled={uploading}
        >
          Chọn ảnh
          <input
            type="file"
            hidden
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
          />
        </Button>
        
        {/* Hiển thị tên file đã chọn */}
        {selectedFile && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Đã chọn: {selectedFile.name}
          </Typography>
        )}
        
        {/* Nút tải lên */}
        {selectedFile && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={uploading}
            sx={{ mb: 2 }}
          >
            {uploading ? <CircularProgress size={24} /> : 'Tải lên'}
          </Button>
        )}
        
        {/* Thông báo lỗi */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        
        {/* Thông báo thành công */}
        {uploadSuccess && (
          <Alert 
            icon={<CheckCircle fontSize="inherit" />} 
            severity="success"
            sx={{ mb: 2, width: '100%' }}
          >
            Tải lên ảnh đại diện thành công!
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default ProfileImageUpload;