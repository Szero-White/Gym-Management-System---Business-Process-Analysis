import React, { useState, useContext, useEffect } from 'react';
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
  CircularProgress,
  Avatar,
  IconButton,
} from '@mui/material';
import { Save, ArrowBack, PhotoCamera } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import viLocale from 'date-fns/locale/vi';
import ProfileImageUpload from '../common/ProfileImageUpload';

const CustomerForm = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    membershipType: 'basic',
    membershipEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    healthInformation: {
      height: '',
      weight: '',
      medicalConditions: '',
      allergies: ''
    },
    trainingGoals: ''
  });

  const [loading, setLoading] = useState(isEditMode);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await api.get('/users/trainers');
        setTrainers(res.data);
      } catch (err) {
        console.error('Error fetching trainers:', err);
      }
    };

    fetchTrainers();

    if (isEditMode) {
      const fetchCustomer = async () => {
        try {
          const res = await api.get(`/users/customers/${id}`);
          const customer = res.data;
          
          setFormData({
            username: customer.user.username,
            email: customer.user.email,
            fullName: customer.user.fullName,
            phoneNumber: customer.user.phoneNumber,
            membershipType: customer.membershipType,
            membershipEndDate: new Date(customer.membershipEndDate),
            healthInformation: {
              height: customer.healthInformation?.height || '',
              weight: customer.healthInformation?.weight || '',
              medicalConditions: customer.healthInformation?.medicalConditions?.join(', ') || '',
              allergies: customer.healthInformation?.allergies?.join(', ') || ''
            },
            trainingGoals: customer.trainingGoals?.join(', ') || ''
          });
          
          if (customer.assignedTrainer) {
            setSelectedTrainer(customer.assignedTrainer._id);
          }
          
          // Lưu ảnh đại diện nếu có
          if (customer.user.profileImage) {
            setProfileImage(`http://localhost:5000${customer.user.profileImage}`);
          }
          
          setLoading(false);
        } catch (err) {
          setAlert('Không thể tải thông tin khách hàng', 'error');
          navigate('/customers');
        }
      };

      fetchCustomer();
    }
  }, [isEditMode, id, navigate, setAlert]);

  const {
    username,
    password,
    confirmPassword,
    email,
    fullName,
    phoneNumber,
    membershipType,
    membershipEndDate,
    healthInformation,
    trainingGoals
  } = formData;

  const onChange = e => {
    const { name, value } = e.target;
    
    if (name.startsWith('healthInformation.')) {
      const healthField = name.split('.')[1];
      setFormData({
        ...formData,
        healthInformation: {
          ...healthInformation,
          [healthField]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, membershipEndDate: date });
  };

  // Handle file selection for new customer
  const handleFileChange = (event) => {
    const file = event.target.files[0];
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

  // Xử lý khi tải lên ảnh thành công (chỉ trong edit mode)
  const handleImageUpload = (imageUrl) => {
    setProfileImage(`http://localhost:5000${imageUrl}`);
  };

  const onSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    
    if (!isEditMode && password !== confirmPassword) {
      setAlert('Mật khẩu không khớp', 'error');
      setSubmitting(false);
      return;
    }

    const customerData = {
      ...formData,
      healthInformation: {
        ...healthInformation,
        medicalConditions: healthInformation.medicalConditions
          ? healthInformation.medicalConditions.split(',').map(item => item.trim())
          : [],
        allergies: healthInformation.allergies
          ? healthInformation.allergies.split(',').map(item => item.trim())
          : []
      },
      trainingGoals: trainingGoals
        ? trainingGoals.split(',').map(item => item.trim())
        : []
    };

    if (selectedTrainer) {
      customerData.assignedTrainer = selectedTrainer;
    }

    try {
      let response;
      
      if (isEditMode) {
        response = await api.put(`/users/customers/${id}`, customerData);
        if (response.data) {
          setAlert('Cập nhật khách hàng thành công', 'success');
        }
      } else {
        response = await api.post('/users/customers', customerData);
        
        // If we have a file to upload and the customer was created successfully
        if (selectedFile && response.data && response.data.customer && response.data.customer._id) {
          const newCustomerId = response.data.customer._id;
          
          // Create form data for file upload
          const formData = new FormData();
          formData.append('profileImage', selectedFile);
          
          // Upload the image
          await api.put(`/users/customers/${newCustomerId}/profile-image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
        
        setAlert('Thêm khách hàng thành công', 'success');
      }
      
      navigate('/customers');
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/customers')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h2">
            {isEditMode ? 'Chỉnh sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
          </Typography>
        </Box>

        {/* Phần tải lên ảnh đại diện */}
        {isEditMode ? (
          // Use existing ProfileImageUpload component for edit mode
          <ProfileImageUpload
            userId={id}
            userType="customer"
            currentImage={profileImage}
            onImageUpload={handleImageUpload}
          />
        ) : (
          // Simple image selection for new customer
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ảnh đại diện
            </Typography>
            
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={imagePreview}
                alt="Ảnh đại diện"
                sx={{ width: 150, height: 150, mb: 2, border: '1px solid #ccc' }}
              />
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mb: 2 }}
                disabled={submitting}
              >
                Chọn ảnh
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                />
              </Button>
              
              {selectedFile && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Đã chọn: {selectedFile.name}
                </Typography>
              )}
            </Box>
          </Paper>
        )}

        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Thông tin cơ bản
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="fullName"
                value={fullName}
                onChange={onChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="phoneNumber"
                value={phoneNumber}
                onChange={onChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                name="username"
                value={username}
                onChange={onChange}
                required
                disabled={isEditMode}
              />
            </Grid>

            {!isEditMode && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu"
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={onChange}
                    required
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Thông tin thành viên
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gói thành viên</InputLabel>
                <Select
                  name="membershipType"
                  value={membershipType}
                  label="Gói thành viên"
                  onChange={onChange}
                >
                  <MenuItem value="basic">Cơ bản</MenuItem>
                  <MenuItem value="standard">Tiêu chuẩn</MenuItem>
                  <MenuItem value="premium">Cao cấp</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                <DatePicker
                  label="Ngày hết hạn"
                  value={membershipEndDate}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Huấn luyện viên</InputLabel>
                <Select
                  value={selectedTrainer}
                  label="Huấn luyện viên"
                  onChange={(e) => setSelectedTrainer(e.target.value)}
                >
                  <MenuItem value="">Không chọn</MenuItem>
                  {trainers.map((trainer) => (
                    <MenuItem key={trainer._id} value={trainer._id}>
                      {trainer.user.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Thông tin sức khỏe
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chiều cao (cm)"
                name="healthInformation.height"
                value={healthInformation.height}
                onChange={onChange}
                type="number"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cân nặng (kg)"
                name="healthInformation.weight"
                value={healthInformation.weight}
                onChange={onChange}
                type="number"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Các vấn đề y tế (phân cách bằng dấu phẩy)"
                name="healthInformation.medicalConditions"
                value={healthInformation.medicalConditions}
                onChange={onChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dị ứng (phân cách bằng dấu phẩy)"
                name="healthInformation.allergies"
                value={healthInformation.allergies}
                onChange={onChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mục tiêu tập luyện (phân cách bằng dấu phẩy)"
                name="trainingGoals"
                value={trainingGoals}
                onChange={onChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  size="large"
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    isEditMode ? 'Cập nhật' : 'Thêm mới'
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

export default CustomerForm;