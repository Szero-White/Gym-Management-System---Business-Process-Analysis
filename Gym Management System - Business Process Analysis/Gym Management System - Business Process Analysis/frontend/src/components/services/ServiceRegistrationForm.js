import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AlertContext from '../../contexts/alert/alertContext';
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
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  FormHelperText,
  Avatar,
  Chip,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ArrowBack, FitnessCenter, Person, CalendarMonth, AccessTime, Check } from '@mui/icons-material';
import viLocale from 'date-fns/locale/vi';
import { addDays } from 'date-fns';

const steps = ['Xác nhận dịch vụ', 'Chọn lịch làm việc', 'Xác nhận đăng ký'];

const ServiceRegistrationForm = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dữ liệu
  const [service, setService] = useState(null);
  const [trainer, setTrainer] = useState(null);
  const [workSchedules, setWorkSchedules] = useState([]);

  // Form data
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [startDate, setStartDate] = useState(addDays(new Date(), 1));
  const [notes, setNotes] = useState('');

  // Tính tổng tiền - giá dịch vụ x số lịch được chọn
  const [totalPrice, setTotalPrice] = useState(0);

  // Tối đa số lịch có thể chọn
  const MAX_SCHEDULES = 4;

  // Tải thông tin dịch vụ và huấn luyện viên khi component được tạo
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tải thông tin dịch vụ
        const serviceRes = await api.get(`/services/${serviceId}`);
        setService(serviceRes.data);
        
        // Kiểm tra nếu dịch vụ có trainerId
        if (serviceRes.data.trainerId) {
          // Tải thông tin huấn luyện viên
          const trainerId = serviceRes.data.trainerId._id;
          const trainerRes = await api.get(`/users/trainers/${trainerId}`);
          setTrainer(trainerRes.data);
          
          // Tải lịch làm việc của huấn luyện viên
          const schedulesRes = await api.get(`/work-schedules/available/${trainerId}`);
          setWorkSchedules(schedulesRes.data);
        } else {
          setAlert('Không thể xác định huấn luyện viên cho dịch vụ này', 'error');
          navigate('/services');
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setAlert('Không thể tải thông tin cần thiết', 'error');
        navigate('/services');
      }
    };
    
    fetchData();
  }, [serviceId, navigate, setAlert]);

  // Cập nhật tổng tiền khi chọn lịch
  useEffect(() => {
    if (service) {
      setTotalPrice(service.price);
    } else {
      setTotalPrice(0);
    }
  }, [service, selectedSchedules]);

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      if (!service) {
        setAlert('Không thể xác định dịch vụ', 'error');
        return;
      }
    }

    if (activeStep === 1) {
      if (selectedSchedules.length === 0) {
        setAlert('Vui lòng chọn ít nhất một lịch làm việc', 'error');
        return;
      }
      
      if (selectedSchedules.length > MAX_SCHEDULES) {
        setAlert(`Bạn chỉ có thể chọn tối đa ${MAX_SCHEDULES} lịch làm việc mỗi tuần`, 'error');
        return;
      }
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleScheduleToggle = (scheduleId) => {
    setSelectedSchedules(prevSelected => {
      if (prevSelected.includes(scheduleId)) {
        // Nếu đã chọn rồi thì bỏ chọn
        return prevSelected.filter(id => id !== scheduleId);
      } else {
        // Nếu chưa chọn và chưa đạt số lượng tối đa thì thêm vào
        if (prevSelected.length < MAX_SCHEDULES) {
          return [...prevSelected, scheduleId];
        }
        // Nếu đã đạt số lượng tối đa thì thông báo
        setAlert(`Bạn chỉ có thể chọn tối đa ${MAX_SCHEDULES} lịch làm việc mỗi tuần`, 'warning');
        return prevSelected;
      }
    });
  };

  const handleSubmit = async () => {
    if (!service || selectedSchedules.length === 0 || !startDate) {
      setAlert('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    setSubmitting(true);

    try {
      // Tạo một đăng ký dịch vụ cho mỗi lịch được chọn
      const registrationPromises = selectedSchedules.map(scheduleId => {
        const registrationData = {
          trainerId: trainer._id,
          serviceId: service._id,
          workScheduleId: scheduleId,
          startDate,
          numberOfSessions: 1, // Mỗi lịch được coi là 1 buổi
          notes
        };
        return api.post('/service-registrations', registrationData);
      });
      
      await Promise.all(registrationPromises);
      
      setAlert('Đăng ký dịch vụ thành công. Vui lòng chờ huấn luyện viên xác nhận.', 'success');
      navigate('/my-registrations');
    } catch (err) {
      setAlert(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký dịch vụ', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDuration = (minutes) => {
    // Chuyển từ phút sang tuần
    const weeks = Math.round(minutes / (7 * 24 * 60));
    return `${weeks} tuần`;
  };

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

  // Nhóm lịch làm việc theo ngày
  const groupSchedulesByDay = () => {
    const grouped = {};
    
    workSchedules.forEach(schedule => {
      if (!grouped[schedule.dayOfWeek]) {
        grouped[schedule.dayOfWeek] = [];
      }
      
      grouped[schedule.dayOfWeek].push(schedule);
    });
    
    // Sắp xếp theo thứ tự các ngày trong tuần
    const dayOrder = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 7
    };
    
    // Sắp xếp lịch trong mỗi ngày theo thời gian bắt đầu
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    
    // Trả về mảng đã sắp xếp theo thứ tự ngày
    return Object.keys(grouped)
      .sort((a, b) => dayOrder[a] - dayOrder[b])
      .map(day => ({
        day,
        schedules: grouped[day]
      }));
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
            onClick={() => navigate('/services')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h2">
            Đăng ký dịch vụ
          </Typography>
        </Box>

        <Box mb={4}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Thông tin huấn luyện viên */}
        {trainer && (
          <Box mb={4}>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={2}>
                    <Avatar
                      src={trainer?.user?.profileImage ? `http://localhost:5000${trainer.user.profileImage}` : ''}
                      alt={trainer?.user?.fullName}
                      sx={{ width: 100, height: 100, mx: 'auto' }}
                    />
                  </Grid>
                  <Grid item xs={12} md={10}>
                    <Typography variant="h5" gutterBottom>
                      {trainer?.user?.fullName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {trainer?.experience} năm kinh nghiệm
                    </Typography>
                    <Box>
                      {trainer?.specializations?.map((spec, index) => (
                        <Chip
                          key={index}
                          label={spec}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Step 1: Xác nhận dịch vụ */}
        {activeStep === 0 && service && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Thông tin dịch vụ
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">
                  {service.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  {service.description}
                </Typography>
                <Divider />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2">
                      <FitnessCenter sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 0.5 }} />
                      Thời lượng: {formatDuration(service.duration)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={service.category === 'personal' ? 'Cá nhân' : 
                              service.category === 'group' ? 'Nhóm' : 'Đặc biệt'}
                        color={service.category === 'personal' ? 'primary' : 
                              service.category === 'group' ? 'success' : 'secondary'}
                      />
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="primary.main">
                    {formatCurrency(service.price)} / buổi
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Step 2: Chọn lịch làm việc */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Chọn lịch làm việc (tối đa {MAX_SCHEDULES} lịch/tuần)
            </Typography>
            
            {workSchedules.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                Huấn luyện viên chưa đăng ký lịch làm việc. Vui lòng chọn dịch vụ khác.
              </Typography>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Chọn những khung giờ phù hợp với lịch trình của bạn. Bạn có thể chọn tối đa {MAX_SCHEDULES} lịch trong một tuần.
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                    Đã chọn: {selectedSchedules.length}/{MAX_SCHEDULES} lịch
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  {groupSchedulesByDay().map(({ day, schedules }) => (
                    <Grid item xs={12} md={6} key={day}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {translateDay(day)}
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          
                          <List dense>
                            {schedules.map((schedule) => (
                              <ListItem 
                                key={schedule._id}
                                sx={{
                                  backgroundColor: selectedSchedules.includes(schedule._id) 
                                    ? 'rgba(25, 118, 210, 0.1)' 
                                    : 'transparent',
                                  borderRadius: 1,
                                  mb: 1
                                }}
                              >
                                <ListItemIcon>
                                  <Checkbox
                                    edge="start"
                                    checked={selectedSchedules.includes(schedule._id)}
                                    onChange={() => handleScheduleToggle(schedule._id)}
                                    color="primary"
                                  />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={`${schedule.startTime} - ${schedule.endTime}`}
                                  secondary={schedule.note}
                                />
                                <AccessTime color="action" />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                
                  <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                      <DatePicker
                        label="Ngày bắt đầu"
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                        minDate={addDays(new Date(), 1)}
                      />
                    </LocalizationProvider>
                    <FormHelperText>
                      Ngày bắt đầu sử dụng dịch vụ, tối thiểu từ ngày mai
                    </FormHelperText>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ghi chú"
                      multiline
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Thông tin thêm về nhu cầu tập luyện, mục tiêu, vấn đề sức khỏe..."
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        )}

        {/* Step 3: Xác nhận đăng ký */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Xác nhận đăng ký
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Thông tin huấn luyện viên
                    </Typography>
                    <Typography variant="body1">
                      {trainer?.user?.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {trainer?.experience} năm kinh nghiệm
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      <FitnessCenter sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Dịch vụ
                    </Typography>
                    {service && (
                      <>
                        <Typography variant="body1">
                          {service.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Thời lượng: {formatDuration(service.duration)}
                        </Typography>
                      </>
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      <CalendarMonth sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Lịch tập đã chọn
                    </Typography>
                    
                    <List dense>
                      {selectedSchedules.map(scheduleId => {
                        const schedule = workSchedules.find(s => s._id === scheduleId);
                        return schedule ? (
                          <ListItem 
                            key={schedule._id}
                            sx={{
                              backgroundColor: 'rgba(25, 118, 210, 0.05)',
                              borderRadius: 1,
                              mb: 1
                            }}
                          >
                            <ListItemIcon>
                              <Check color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`${translateDay(schedule.dayOfWeek)}: ${schedule.startTime} - ${schedule.endTime}`}
                            />
                          </ListItem>
                        ) : null;
                      })}
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      <CalendarMonth sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Thời gian
                    </Typography>
                    <Typography variant="body1">
                      Bắt đầu từ: {startDate ? startDate.toLocaleDateString('vi-VN') : ''}
                    </Typography>
                  </Grid>
                  
                  {notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Ghi chú
                      </Typography>
                      <Typography variant="body2">
                        {notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
            
            <Box sx={{ bgcolor: '#f9f9f9', p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tổng chi phí
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body1">
                  {service && `${service.name} x ${selectedSchedules.length} buổi`}
                </Typography>
                <Typography variant="h5" color="primary">
                  {formatCurrency(totalPrice)}
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              * Lưu ý: Đăng ký sẽ được gửi đến huấn luyện viên để xem xét. 
              Bạn sẽ nhận được thông báo khi huấn luyện viên xác nhận hoặc từ chối yêu cầu.
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          {activeStep > 0 && (
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{ mr: 1 }}
              disabled={submitting}
            >
              Quay lại
            </Button>
          )}
          
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Tiếp theo
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận đăng ký'}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ServiceRegistrationForm;