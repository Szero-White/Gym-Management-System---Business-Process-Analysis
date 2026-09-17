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
  Divider,
  CircularProgress,
  Chip,
  Autocomplete,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { 
  Save, 
  ArrowBack, 
  Add, 
  Delete, 
  PhotoCamera,
  Schedule,
  AccessTime
} from '@mui/icons-material';
import ProfileImageUpload from '../common/ProfileImageUpload';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse } from 'date-fns';
import viLocale from 'date-fns/locale/vi';

const TrainerForm = () => {
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
    specializations: [],
    experience: 0,
    certifications: [],
    availability: []
  });
  
  // State riêng cho lịch làm việc
  const [scheduleItems, setScheduleItems] = useState([]);
  const [newScheduleItem, setNewScheduleItem] = useState({
    day: '',
    startTime: null,
    endTime: null
  });

  const [loading, setLoading] = useState(isEditMode);
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    issuedBy: '',
    year: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const specializations = [
    'Giảm cân', 'Tăng cơ', 'Cardio', 'Yoga', 'Pilates', 'Strength Training',
    'CrossFit', 'Bodybuilding', 'Calisthenics', 'HIIT', 'Kickboxing',
    'Boxing', 'MMA', 'Powerlifting', 'Olympic Weightlifting', 'Dinh dưỡng',
    'Phục hồi chấn thương'
  ];

  useEffect(() => {
    if (isEditMode) {
      const fetchTrainer = async () => {
        try {
          const res = await api.get(`/users/trainers/${id}`);
          const trainer = res.data;
          
          setFormData({
            username: trainer.user.username,
            email: trainer.user.email,
            fullName: trainer.user.fullName,
            phoneNumber: trainer.user.phoneNumber,
            specializations: trainer.specializations || [],
            experience: trainer.experience || 0,
            certifications: trainer.certifications || [],
            availability: trainer.availability || []
          });
          
          // Đồng bộ state scheduleItems với availability từ API
          if (trainer.availability && trainer.availability.length > 0) {
            setScheduleItems(trainer.availability);
          }
          
          // Lưu ảnh đại diện nếu có
          if (trainer.user.profileImage) {
            setProfileImage(`http://localhost:5000${trainer.user.profileImage}`);
          }
          
          setLoading(false);
        } catch (err) {
          setAlert('Không thể tải thông tin huấn luyện viên', 'error');
          navigate('/trainers');
        }
      };

      fetchTrainer();
    }
  }, [isEditMode, id, navigate, setAlert]);

  const {
    username,
    password,
    confirmPassword,
    email,
    fullName,
    phoneNumber,
    specializations: trainerSpecializations,
    experience,
    certifications
  } = formData;

  const onChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSpecializationChange = (event, newValue) => {
    setFormData({
      ...formData,
      specializations: newValue
    });
  };

  const handleCertificateChange = (e, index, field) => {
    const updatedCertifications = [...certifications];
    updatedCertifications[index][field] = e.target.value;
    setFormData({
      ...formData,
      certifications: updatedCertifications
    });
  };

  const addCertificate = () => {
    if (!newCertificate.name || !newCertificate.issuedBy || !newCertificate.year) {
      setAlert('Vui lòng điền đầy đủ thông tin chứng chỉ', 'error');
      return;
    }

    setFormData({
      ...formData,
      certifications: [...certifications, { ...newCertificate }]
    });

    setNewCertificate({
      name: '',
      issuedBy: '',
      year: ''
    });
  };

  const removeCertificate = (index) => {
    const updatedCertifications = [...certifications];
    updatedCertifications.splice(index, 1);
    setFormData({
      ...formData,
      certifications: updatedCertifications
    });
  };

  // Handle file selection for new trainer
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

  // Xử lý lịch làm việc
  const handleScheduleInputChange = (field, value) => {
    setNewScheduleItem({
      ...newScheduleItem,
      [field]: value
    });
  };

  const handleTimeChange = (field, time) => {
    setNewScheduleItem({
      ...newScheduleItem,
      [field]: time
    });
  };

  const addScheduleItem = () => {
    const { day, startTime, endTime } = newScheduleItem;
    
    if (!day || !startTime || !endTime) {
      setAlert('Vui lòng điền đầy đủ thông tin lịch làm việc', 'error');
      return;
    }
    
    // Kiểm tra thời gian bắt đầu phải trước thời gian kết thúc
    if (startTime >= endTime) {
      setAlert('Thời gian kết thúc phải sau thời gian bắt đầu', 'error');
      return;
    }
    
    // Format thời gian thành chuỗi HH:mm
    const formattedStartTime = format(new Date(startTime), 'HH:mm');
    const formattedEndTime = format(new Date(endTime), 'HH:mm');
    
    // Kiểm tra xung đột lịch
    const conflict = scheduleItems.some(item => 
      item.day === day && 
      ((formattedStartTime >= item.startTime && formattedStartTime < item.endTime) ||
       (formattedEndTime > item.startTime && formattedEndTime <= item.endTime) ||
       (formattedStartTime <= item.startTime && formattedEndTime >= item.endTime))
    );
    
    if (conflict) {
      setAlert('Lịch làm việc xung đột với lịch đã có', 'error');
      return;
    }
    
    const newItem = {
      day,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      _id: Date.now() // ID tạm thời cho việc xóa
    };
    
    const updatedScheduleItems = [...scheduleItems, newItem];
    setScheduleItems(updatedScheduleItems);
    
    // Cập nhật vào formData
    setFormData({
      ...formData,
      availability: updatedScheduleItems
    });
    
    // Reset form
    setNewScheduleItem({
      day: '',
      startTime: null,
      endTime: null
    });
  };

  const removeScheduleItem = (index) => {
    const updatedItems = [...scheduleItems];
    updatedItems.splice(index, 1);
    setScheduleItems(updatedItems);
    
    // Cập nhật vào formData
    setFormData({
      ...formData,
      availability: updatedItems
    });
  };

  // Chuyển đổi tên ngày tiếng Anh sang tiếng Việt
  const translateDay = (day) => {
    const dayMap = {
      'Monday': 'Thứ Hai',
      'Tuesday': 'Thứ Ba',
      'Wednesday': 'Thứ Tư',
      'Thursday': 'Thứ Năm',
      'Friday': 'Thứ Sáu',
      'Saturday': 'Thứ Bảy',
      'Sunday': 'Chủ Nhật'
    };
    
    return dayMap[day] || day;
  };

  const onSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    
    if (!isEditMode && password !== confirmPassword) {
      setAlert('Mật khẩu không khớp', 'error');
      setSubmitting(false);
      return;
    }

    try {
      let response;
      
      if (isEditMode) {
        response = await api.put(`/users/trainers/${id}`, formData);
        setAlert('Cập nhật huấn luyện viên thành công', 'success');
      } else {
        response = await api.post('/users/trainers', formData);
        
        // If we have a file to upload and the trainer was created successfully
        if (selectedFile && response.data && response.data.trainer && response.data.trainer._id) {
          const newTrainerId = response.data.trainer._id;
          
          // Create form data for file upload
          const formData = new FormData();
          formData.append('profileImage', selectedFile);
          
          // Upload the image
          await api.put(`/users/trainers/${newTrainerId}/profile-image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
        
        setAlert('Thêm huấn luyện viên thành công', 'success');
      }
      
      navigate('/trainers');
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
            onClick={() => navigate('/trainers')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h2">
            {isEditMode ? 'Chỉnh sửa thông tin huấn luyện viên' : 'Thêm huấn luyện viên mới'}
          </Typography>
        </Box>

        {/* Phần tải lên ảnh đại diện */}
        {isEditMode ? (
          // Use existing ProfileImageUpload component for edit mode
          <ProfileImageUpload
            userId={id}
            userType="trainer"
            currentImage={profileImage}
            onImageUpload={handleImageUpload}
          />
        ) : (
          // Simple image selection for new trainer
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
                Thông tin chuyên môn
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số năm kinh nghiệm"
                name="experience"
                type="number"
                value={experience}
                onChange={onChange}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                id="specializations"
                options={specializations}
                value={trainerSpecializations}
                onChange={handleSpecializationChange}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Chuyên môn"
                    placeholder="Thêm chuyên môn"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Chứng chỉ
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Tên chứng chỉ"
                      value={newCertificate.name}
                      onChange={(e) => setNewCertificate({...newCertificate, name: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Tổ chức cấp"
                      value={newCertificate.issuedBy}
                      onChange={(e) => setNewCertificate({...newCertificate, issuedBy: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Năm"
                      type="number"
                      value={newCertificate.year}
                      onChange={(e) => setNewCertificate({...newCertificate, year: e.target.value})}
                      inputProps={{ min: 1900, max: new Date().getFullYear() }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={addCertificate}
                      startIcon={<Add />}
                      sx={{ height: '100%' }}
                    >
                      Thêm
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {certifications.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Danh sách chứng chỉ
                  </Typography>
                  {certifications.map((cert, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Tên chứng chỉ"
                            value={cert.name}
                            onChange={(e) => handleCertificateChange(e, index, 'name')}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Tổ chức cấp"
                            value={cert.issuedBy}
                            onChange={(e) => handleCertificateChange(e, index, 'issuedBy')}
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            label="Năm"
                            type="number"
                            value={cert.year}
                            onChange={(e) => handleCertificateChange(e, index, 'year')}
                            inputProps={{ min: 1900, max: new Date().getFullYear() }}
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            onClick={() => removeCertificate(index)}
                            startIcon={<Delete />}
                          >
                            Xóa
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="textSecondary">
                  Chưa có chứng chỉ nào được thêm
                </Typography>
              )}
            </Grid>

            {/* Phần lịch làm việc */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Lịch làm việc
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="day-select-label">Ngày trong tuần</InputLabel>
                      <Select
                        labelId="day-select-label"
                        value={newScheduleItem.day}
                        label="Ngày trong tuần"
                        onChange={(e) => handleScheduleInputChange('day', e.target.value)}
                      >
                        <MenuItem value="Monday">Thứ Hai</MenuItem>
                        <MenuItem value="Tuesday">Thứ Ba</MenuItem>
                        <MenuItem value="Wednesday">Thứ Tư</MenuItem>
                        <MenuItem value="Thursday">Thứ Năm</MenuItem>
                        <MenuItem value="Friday">Thứ Sáu</MenuItem>
                        <MenuItem value="Saturday">Thứ Bảy</MenuItem>
                        <MenuItem value="Sunday">Chủ Nhật</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                      <TimePicker
                        label="Thời gian bắt đầu"
                        value={newScheduleItem.startTime}
                        onChange={(newTime) => handleTimeChange('startTime', newTime)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                        ampm={false}
                        minutesStep={5}
                      />
                    </LocalizationProvider>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                      <TimePicker
                        label="Thời gian kết thúc"
                        value={newScheduleItem.endTime}
                        onChange={(newTime) => handleTimeChange('endTime', newTime)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                        ampm={false}
                        minutesStep={5}
                      />
                    </LocalizationProvider>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={addScheduleItem}
                      startIcon={<Add />}
                      sx={{ height: '56px' }}
                    >
                      Thêm lịch
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {scheduleItems.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Danh sách lịch làm việc
                  </Typography>
                  <Grid container spacing={2}>
                    {scheduleItems.map((item, index) => (
                      <Grid item xs={12} md={6} lg={4} key={index}>
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            backgroundColor: 'rgba(25, 118, 210, 0.05)'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                            <Box>
                              <Typography variant="subtitle1">
                                {translateDay(item.day)}
                              </Typography>
                              <Typography variant="body2">
                                {item.startTime} - {item.endTime}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton 
                            color="error" 
                            onClick={() => removeScheduleItem(index)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Typography color="textSecondary">
                  Chưa có lịch làm việc nào được thêm
                </Typography>
              )}
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

export default TrainerForm;