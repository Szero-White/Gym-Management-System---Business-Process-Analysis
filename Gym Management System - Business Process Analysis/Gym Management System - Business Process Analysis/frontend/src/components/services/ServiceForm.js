import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertContext from '../../contexts/alert/alertContext';
import api from '../../utils/api';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  FormHelperText,
  CircularProgress,
  InputAdornment,
  IconButton,
  Switch,
  FormControlLabel,
  Autocomplete // Thêm import Autocomplete
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';

// Thêm mảng specializations
const specializations = [
  'Weight Loss', 'Muscle Gain', 'Cardio', 'Yoga', 'Pilates', 'Strength Training',
  'CrossFit', 'Bodybuilding', 'Calisthenics', 'HIIT', 'Kickboxing',
  'Boxing', 'MMA', 'Powerlifting', 'Olympic Weightlifting', 'Nutrition',
  'Injury Recovery'
];

const ServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'personal',
    isActive: true,
    specializations: [] // Thêm trường specializations vào state
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const fetchService = async () => {
        try {
          const res = await api.get(`/services/${id}`);
          const service = res.data;
          
          setFormData({
            name: service.name,
            description: service.description,
            price: service.price,
            // Chuyển đổi từ phút sang tuần
            duration: Math.round(service.duration / (7 * 24 * 60)),
            category: service.category,
            isActive: service.isActive,
            specializations: service.specializations || []
          });
          
          setLoading(false);
        } catch (err) {
          setAlert('Không thể tải thông tin dịch vụ', 'error');
          navigate('/services');
        }
      };
  
      fetchService();
    }
  }, [isEditMode, id, navigate, setAlert]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên dịch vụ không được để trống';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả dịch vụ không được để trống';
    }
    
    if (!formData.price) {
      newErrors.price = 'Giá dịch vụ không được để trống';
    } else if (isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = 'Giá dịch vụ phải là số dương';
    }
    
    if (!formData.duration) {
      newErrors.duration = 'Thời lượng dịch vụ không được để trống';
    } else if (isNaN(formData.duration) || formData.duration < 1) {
      newErrors.duration = 'Thời lượng dịch vụ phải ít nhất 1 tuần';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlert('Vui lòng kiểm tra lại thông tin', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration) 
      };
      
      if (isEditMode) {
        await api.put(`/services/${id}`, serviceData);
        setAlert('Cập nhật dịch vụ thành công', 'success');
      } else {
        await api.post('/services', serviceData);
        setAlert('Thêm dịch vụ mới thành công', 'success');
      }
      
      navigate('/services/manage');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra';
      setAlert(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };  

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton 
            onClick={() => navigate('/services')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h2">
            {isEditMode ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
          </Typography>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên dịch vụ"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={Boolean(errors.name)}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                error={Boolean(errors.description)}
                helperText={errors.description}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giá (VNĐ)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                }}
                error={Boolean(errors.price)}
                helperText={errors.price}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thời lượng (tuần)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">tuần</InputAdornment>,
                }}
                error={Boolean(errors.duration)}
                helperText={errors.duration}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Danh mục</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  label="Danh mục"
                  onChange={handleChange}
                >
                  <MenuItem value="personal">Cá nhân</MenuItem>
                  <MenuItem value="group">Nhóm</MenuItem>
                  <MenuItem value="special">Đặc biệt</MenuItem>
                </Select>
                <FormHelperText>
                  Chọn danh mục phù hợp cho dịch vụ
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Dịch vụ đang hoạt động"
              />
              <FormHelperText>
                Chỉ những dịch vụ đang hoạt động mới được hiển thị và đăng ký
              </FormHelperText>
            </Grid>
            
            {/* Thêm component Autocomplete cho specializations */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                id="specializations"
                options={specializations}
                value={formData.specializations || []}
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    specializations: newValue
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chuyên môn liên quan"
                    placeholder="Chọn chuyên môn"
                  />
                )}
              />
              <FormHelperText>
                Chọn các chuyên môn liên quan đến dịch vụ này
              </FormHelperText>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/services')}
                  sx={{ mr: 2 }}
                  disabled={submitting}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    isEditMode ? 'Cập nhật' : 'Lưu'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ServiceForm;