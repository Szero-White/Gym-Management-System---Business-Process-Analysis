import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NewsContext from '../../contexts/news/newsContext';
import AlertContext from '../../contexts/alert/alertContext';

import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Grid,
  IconButton
} from '@mui/material';

import { 
  Save, 
  ArrowBack,
  PhotoCamera,
  Clear
} from '@mui/icons-material';

const NewsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const newsContext = useContext(NewsContext);
  const alertContext = useContext(AlertContext);
  
  const { addNews, updateNews, getNewsById, currentNews, loading, clearNews } = newsContext;
  const { setAlert } = alertContext;
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'announcement',
    featured: false,
    active: true
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    // Clear previous news data
    clearNews();
    
    // If in edit mode, fetch news data
    if (isEditMode) {
      const fetchNews = async () => {
        try {
          await getNewsById(id);
        } catch (err) {
          setAlert('Không thể tải thông tin tin tức', 'error');
          navigate('/news');
        }
      };
      
      fetchNews();
    }
    
    return () => {
      // Clean up on unmount
      clearNews();
    };
    // eslint-disable-next-line
  }, [id, isEditMode]);
  
  // When currentNews changes, update form data
  useEffect(() => {
    if (isEditMode && currentNews) {
      setFormData({
        title: currentNews.title || '',
        content: currentNews.content || '',
        category: currentNews.category || 'announcement',
        featured: currentNews.featured || false,
        active: currentNews.active !== undefined ? currentNews.active : true
      });
      
      if (currentNews.image) {
        setImagePreview(`http://localhost:5000${currentNews.image}`);
      }
    }
  }, [isEditMode, currentNews]);
  
  const { title, content, category, featured, active } = formData;
  
  const onChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSwitchChange = e => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setAlert('Vui lòng chọn file hình ảnh (JPEG, PNG, GIF, WebP)', 'error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAlert('Kích thước file không được vượt quá 5MB', 'error');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    if (!title || !content) {
      setAlert('Vui lòng điền đầy đủ tiêu đề và nội dung', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formDataObj = new FormData();
      formDataObj.append('title', title);
      formDataObj.append('content', content);
      formDataObj.append('category', category);
      formDataObj.append('featured', featured);
      formDataObj.append('active', active);
      
      if (selectedFile) {
        formDataObj.append('newsImage', selectedFile);
      }
      
      if (isEditMode) {
        await updateNews(id, formDataObj);
        setAlert('Cập nhật tin tức thành công', 'success');
      } else {
        await addNews(formDataObj);
        setAlert('Thêm tin tức thành công', 'success');
      }
      
      navigate('/news');
    } catch (err) {
      setAlert(err.response?.data?.message || 'Lỗi khi lưu tin tức', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (isEditMode && loading) {
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
          <Typography variant="h4" component="h2">
            {isEditMode ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}
          </Typography>
        </Box>
        
        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề"
                name="title"
                value={title}
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  name="category"
                  value={category}
                  label="Danh mục"
                  onChange={onChange}
                >
                  <MenuItem value="announcement">Thông báo</MenuItem>
                  <MenuItem value="promotion">Khuyến mãi</MenuItem>
                  <MenuItem value="event">Sự kiện</MenuItem>
                  <MenuItem value="other">Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box display="flex" justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Switch
                      checked={featured}
                      onChange={handleSwitchChange}
                      name="featured"
                      color="primary"
                    />
                  }
                  label="Tin nổi bật"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={active}
                      onChange={handleSwitchChange}
                      name="active"
                      color="primary"
                    />
                  }
                  label="Hiển thị"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nội dung"
                name="content"
                value={content}
                onChange={onChange}
                multiline
                rows={12}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Ảnh đại diện
              </Typography>
              
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3,
                  border: '1px dashed',
                  borderColor: 'grey.400',
                  borderRadius: 1
                }}
              >
                {imagePreview ? (
                  <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, mb: 2 }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        maxHeight: 300, 
                        objectFit: 'contain',
                        borderRadius: 4
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        }
                      }}
                      onClick={handleClearImage}
                    >
                      <Clear />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Chưa có ảnh nào được chọn
                  </Typography>
                )}
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                >
                  Chọn ảnh
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                  />
                </Button>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Hỗ trợ định dạng: JPG, PNG, GIF, WebP. Kích thước tối đa: 5MB
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/news')}
                  disabled={submitting}
                >
                  Hủy
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={submitting ? <CircularProgress size={24} /> : <Save />}
                  disabled={submitting}
                >
                  {isEditMode ? 'Cập nhật' : 'Đăng tin'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default NewsForm;