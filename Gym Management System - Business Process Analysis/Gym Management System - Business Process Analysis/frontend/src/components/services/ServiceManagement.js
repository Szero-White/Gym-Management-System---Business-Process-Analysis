import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AlertContext from '../../contexts/alert/alertContext';
import AuthContext from '../../contexts/auth/authContext';
import api from '../../utils/api';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  FitnessCenter,
  ArrowBack
} from '@mui/icons-material';

const ServiceManagement = () => {
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);

  const { setAlert } = alertContext;
  const { user } = authContext;

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'personal',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load services when component mounts
  useEffect(() => {
    fetchServices();
  }, []);

  // Function to fetch services
  const fetchServices = async () => {
    setLoading(true);
    try {
      let response;
      if (user && user.role === 'trainer') {
        // Khi người dùng là huấn luyện viên, chỉ lấy dịch vụ của họ
        response = await api.get('/services', {
          params: { trainerId: user.id }
        });
      } else {
        // Khi là admin, lấy tất cả dịch vụ
        response = await api.get('/services');
      }
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setAlert('Không thể tải danh sách dịch vụ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (service = null) => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        isActive: service.isActive
      });
      setSelectedService(service);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: 'personal',
        isActive: true
      });
      setSelectedService(null);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenDeleteDialog = (service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedService(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Tên dịch vụ không được để trống';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Mô tả dịch vụ không được để trống';
    }
    
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      errors.price = 'Giá dịch vụ phải là số dương';
    }
    
    if (!formData.duration || isNaN(formData.duration) || Number(formData.duration) < 1) {
      errors.duration = 'Thời lượng dịch vụ phải ít nhất 1 tuần';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const serviceData = {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration)
      };
      
      // Add trainer ID if trainer is logged in
      if (user && user.role === 'trainer') {
        serviceData.trainerId = user.id;
      }
      
      if (selectedService) {
        // Update existing service
        await api.put(`/services/${selectedService._id}`, serviceData);
        setAlert('Dịch vụ đã được cập nhật', 'success');
      } else {
        // Add new service
        await api.post('/services', serviceData);
        setAlert('Dịch vụ mới đã được thêm', 'success');
      }
      
      handleCloseDialog();
      
      // Làm mới danh sách dịch vụ
      fetchServices();
    } catch (err) {
      setAlert(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    
    setSubmitting(true);
    
    try {
      await api.delete(`/services/${selectedService._id}`);
      setAlert('Dịch vụ đã được xóa', 'success');
      handleCloseDeleteDialog();
      
      // Làm mới danh sách dịch vụ
      fetchServices();
    } catch (err) {
      setAlert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa dịch vụ', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDuration = (weeks) => {
    return `${weeks} tuần`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <Button
              component={Link}
              to="/dashboard"
              startIcon={<ArrowBack />}
              sx={{ mr: 2 }}
            >
              Quay lại
            </Button>
            <Typography variant="h4" component="h2">
              Quản lý dịch vụ
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Thêm dịch vụ mới
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {services.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body1" align="center" sx={{ py: 4 }}>
                  Chưa có dịch vụ nào được tạo. Hãy thêm dịch vụ mới.
                </Typography>
              </Grid>
            ) : (
              services.map((service) => (
                <Grid item xs={12} sm={6} md={4} key={service._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" component="h3" gutterBottom>
                          {service.name}
                        </Typography>
                        <Chip
                          label={service.isActive ? 'Đang hoạt động' : 'Đã vô hiệu'}
                          color={service.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {service.description}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2">
                          <FitnessCenter fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          {formatDuration(service.duration)}
                        </Typography>
                        <Chip
                          label={
                            service.category === 'personal' ? 'Cá nhân' :
                            service.category === 'group' ? 'Nhóm' : 'Đặc biệt'
                          }
                          color={
                            service.category === 'personal' ? 'primary' :
                            service.category === 'group' ? 'success' : 'secondary'
                          }
                          size="small"
                        />
                      </Box>
                      <Typography variant="h6" color="primary.main" sx={{ mt: 2, textAlign: 'right' }}>
                        {formatCurrency(service.price)}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        startIcon={<Edit />}
                        size="small"
                        onClick={() => handleOpenDialog(service)}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        startIcon={<Delete />}
                        color="error"
                        size="small"
                        onClick={() => handleOpenDeleteDialog(service)}
                      >
                        Xóa
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Paper>

      {/* Add/Edit Service Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên dịch vụ"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name}
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
                rows={3}
                error={Boolean(formErrors.description)}
                helperText={formErrors.description}
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
                error={Boolean(formErrors.price)}
                helperText={formErrors.price}
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
                error={Boolean(formErrors.duration)}
                helperText={formErrors.duration}
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
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Trạng thái</InputLabel>
                <Select
                  labelId="status-label"
                  name="isActive"
                  value={formData.isActive}
                  label="Trạng thái"
                  onChange={handleChange}
                >
                  <MenuItem value={true}>Đang hoạt động</MenuItem>
                  <MenuItem value={false}>Vô hiệu hóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa dịch vụ "{selectedService?.name}"? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={submitting}>
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ServiceManagement;