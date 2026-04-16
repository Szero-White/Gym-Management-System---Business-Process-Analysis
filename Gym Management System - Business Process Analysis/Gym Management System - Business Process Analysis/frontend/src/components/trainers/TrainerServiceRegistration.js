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
  Chip
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ArrowBack, FitnessCenter, Person, CalendarMonth, Check } from '@mui/icons-material';
import viLocale from 'date-fns/locale/vi';
import { addDays } from 'date-fns';

const steps = ['Chọn dịch vụ', 'Chọn lịch làm việc', 'Xác nhận đăng ký'];

const TrainerServiceRegistration = () => {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dữ liệu
  const [trainer, setTrainer] = useState(null);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [workSchedules, setWorkSchedules] = useState([]);

  // Form data
  const [selectedService, setSelectedService] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [startDate, setStartDate] = useState(addDays(new Date(), 1));
  const [numberOfSessions, setNumberOfSessions] = useState(1);
  const [notes, setNotes] = useState('');

  // Tính tổng tiền
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load trainer information
        const trainerRes = await api.get(`/users/trainers/${trainerId}`);
        setTrainer(trainerRes.data);
        
        // Load trainer's available work schedules
        const schedulesRes = await api.get(`/work-schedules/available/${trainerId}`);
        setWorkSchedules(schedulesRes.data);
        
        // Load all services
        const servicesRes = await api.get('/services');
        
        // Filter active services
        const activeServices = servicesRes.data.filter(service => service.isActive);
        setServices(activeServices);
        
        // If trainer has specializations, filter services that match those specializations
        if (trainerRes.data.specializations && trainerRes.data.specializations.length > 0) {
          const trainerSpecs = trainerRes.data.specializations.map(spec => spec.toLowerCase());
          
          // Filter services that match trainer specializations
          // A service matches if its name, description, or specializations tag contains any of the trainer specializations
          const relevantServices = activeServices.filter(service => {
            // Check service name
            if (trainerSpecs.some(spec => service.name.toLowerCase().includes(spec))) return true;
            
            // Check service description
            if (trainerSpecs.some(spec => service.description.toLowerCase().includes(spec))) return true;
            
            // Check service specializations (if that field exists)
            if (service.specializations && Array.isArray(service.specializations)) {
              return service.specializations.some(serviceSpec => 
                trainerSpecs.includes(serviceSpec.toLowerCase())
              );
            }
            
            return false;
          });
          
          // If we have relevant services, only show those
          if (relevantServices.length > 0) {
            setFilteredServices(relevantServices);
          } else {
            // Otherwise fall back to all active services
            setFilteredServices(activeServices);
          }
        } else {
          // If trainer has no specializations, show all active services
          setFilteredServices(activeServices);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setAlert('Không thể tải thông tin cần thiết', 'error');
        navigate('/trainers');
      }
    };
    
    fetchData();
  }, [trainerId, navigate, setAlert]);

  // Cập nhật tổng tiền khi chọn dịch vụ hoặc số buổi thay đổi
  useEffect(() => {
    if (selectedService && numberOfSessions > 0) {
      const service = filteredServices.find(s => s._id === selectedService) || 
                      services.find(s => s._id === selectedService);
      if (service) {
        setTotalPrice(service.price);
      }
    } else {
      setTotalPrice(0);
    }
  }, [selectedService, numberOfSessions, services, filteredServices]);

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0 && !selectedService) {
      setAlert('Vui lòng chọn dịch vụ', 'error');
      return;
    }

    if (activeStep === 1 && !selectedSchedule) {
      setAlert('Vui lòng chọn lịch làm việc', 'error');
      return;
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedSchedule || !startDate || numberOfSessions < 1) {
      setAlert('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const registrationData = {
        trainerId,
        serviceId: selectedService,
        workScheduleId: selectedSchedule,
        startDate,
        numberOfSessions,
        notes
      };

      await api.post('/service-registrations', registrationData);
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

  const formatDuration = (weeks) => {
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

  // Hàm kiểm tra xem dịch vụ có phù hợp với chuyên môn của huấn luyện viên không
  const isServiceRelevant = (service) => {
    if (!trainer?.specializations || trainer.specializations.length === 0 || 
        !service.specializations || !Array.isArray(service.specializations)) {
      return false;
    }
    
    const trainerSpecs = trainer.specializations.map(spec => spec.toLowerCase());
    
    // Kiểm tra xem có sự trùng khớp giữa specializations của dịch vụ và huấn luyện viên không
    return service.specializations.some(serviceSpec => 
      trainerSpecs.includes(serviceSpec.toLowerCase())
    );
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
            onClick={() => navigate('/trainers')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h2">
            Đăng ký dịch vụ với huấn luyện viên
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

        {/* Step 1: Chọn dịch vụ */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Chọn dịch vụ
            </Typography>
            
            <Grid container spacing={3}>
              {filteredServices.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Không có dịch vụ nào phù hợp với chuyên môn của huấn luyện viên này.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vui lòng chọn huấn luyện viên khác hoặc liên hệ với chúng tôi để được tư vấn.
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                // Hiển thị các dịch vụ được lọc
                filteredServices.map((service) => (
                  <Grid item xs={12} md={4} key={service._id}>
                    <Card 
                      variant={selectedService === service._id ? "outlined" : "elevation"}
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedService === service._id ? 2 : isServiceRelevant(service) ? 1 : 0,
                        borderColor: selectedService === service._id ? 'primary.main' : isServiceRelevant(service) ? 'primary.light' : 'transparent',
                        backgroundColor: isServiceRelevant(service) ? 'rgba(25, 118, 210, 0.04)' : 'inherit',
                        '&:hover': {
                          boxShadow: 3
                        },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onClick={() => setSelectedService(service._id)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">
                            {service.name}
                          </Typography>
                          {isServiceRelevant(service) && (
                            <Chip 
                              size="small" 
                              color="primary" 
                              label="Phù hợp chuyên môn"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {service.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            size="small" 
                            label={service.category === 'personal' ? 'Cá nhân' : 
                                  service.category === 'group' ? 'Nhóm' : 'Đặc biệt'}
                            color={service.category === 'personal' ? 'primary' : 
                                  service.category === 'group' ? 'success' : 'secondary'}
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2">
                            <FitnessCenter sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 0.5 }} />
                            {formatDuration(service.duration)}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6" color="primary" sx={{ textAlign: 'right' }}>
                          {formatCurrency(service.price)}
                        </Typography>
                        
                        {/* Hiển thị các từ khóa chuyên môn liên quan */}
                        {service.specializations && service.specializations.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {service.specializations.map((spec, idx) => (
                              <Chip
                                key={idx}
                                label={spec}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                      </CardContent>
                      
                      {selectedService === service._id && (
                        <Box sx={{ 
                          p: 1, 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <Check sx={{ mr: 1 }} /> Đã chọn
                        </Box>
                      )}
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        )}

        {/* Step 2: Chọn lịch làm việc */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Chọn lịch làm việc
            </Typography>
            
            {workSchedules.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                Huấn luyện viên chưa đăng ký lịch làm việc. Vui lòng chọn huấn luyện viên khác.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="schedule-select-label">Lịch làm việc</InputLabel>
                    <Select
                      labelId="schedule-select-label"
                      value={selectedSchedule}
                      label="Lịch làm việc"
                      onChange={(e) => setSelectedSchedule(e.target.value)}
                    >
                      {workSchedules.map((schedule) => (
                        <MenuItem value={schedule._id} key={schedule._id}>
                          {translateDay(schedule.dayOfWeek)} ({schedule.startTime} - {schedule.endTime})
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      Chọn một khung giờ phù hợp với lịch trình của bạn
                    </FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
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
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số buổi"
                    type="number"
                    value={numberOfSessions}
                    onChange={(e) => setNumberOfSessions(Math.max(1, parseInt(e.target.value) || 1))}
                    inputProps={{ min: 1 }}
                  />
                  <FormHelperText>
                    Tổng số buổi bạn muốn đăng ký
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
                    {selectedService && (
                      <>
                        <Typography variant="body1">
                          {filteredServices.find(s => s._id === selectedService)?.name || 
                           services.find(s => s._id === selectedService)?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Thời lượng: {formatDuration(
                            filteredServices.find(s => s._id === selectedService)?.duration || 
                            services.find(s => s._id === selectedService)?.duration
                          )}
                        </Typography>
                      </>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      <CalendarMonth sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Thông tin lịch tập
                    </Typography>
                    {selectedSchedule && (
                      <>
                        <Typography variant="body1">
                          {translateDay(workSchedules.find(s => s._id === selectedSchedule)?.dayOfWeek)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {workSchedules.find(s => s._id === selectedSchedule)?.startTime} - {workSchedules.find(s => s._id === selectedSchedule)?.endTime}
                        </Typography>
                      </>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      <CalendarMonth sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Thời gian
                    </Typography>
                    <Typography variant="body1">
                      Bắt đầu từ: {startDate ? startDate.toLocaleDateString('vi-VN') : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Số buổi: {numberOfSessions}
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
                  {selectedService && `${
                    filteredServices.find(s => s._id === selectedService)?.name || 
                    services.find(s => s._id === selectedService)?.name
                  } x ${numberOfSessions} buổi`}
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

export default TrainerServiceRegistration;