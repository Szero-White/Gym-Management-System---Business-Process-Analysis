import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AlertContext from '../../contexts/alert/alertContext';
import api from '../../utils/api';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  Check,
  Close,
  Schedule,
  FitnessCenter,
  Person,
  CalendarMonth,
  Cancel
} from '@mui/icons-material';

const MyRegistrations = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState({ open: false, registrationId: null });
  const [processingCancel, setProcessingCancel] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get('/service-registrations/my-registrations');
      setRegistrations(res.data);
      setLoading(false);
    } catch (err) {
      setAlert('Không thể tải danh sách đăng ký dịch vụ', 'error');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'pending': 'warning',
      'approved': 'primary',
      'rejected': 'error',
      'completed': 'success',
      'canceled': 'default'
    };
    return statusMap[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'approved': 'Đã xác nhận',
      'rejected': 'Từ chối',
      'completed': 'Hoàn thành',
      'canceled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    const statusMap = {
      'pending': <Schedule fontSize="small" />,
      'approved': <Check fontSize="small" />,
      'rejected': <Close fontSize="small" />,
      'completed': <Check fontSize="small" />,
      'canceled': <Cancel fontSize="small" />
    };
    return statusMap[status] || null;
  };

  const handleOpenCancelDialog = (registrationId) => {
    setCancelDialog({ open: true, registrationId });
  };

  const handleCloseCancelDialog = () => {
    setCancelDialog({ open: false, registrationId: null });
  };

  const handleCancelRegistration = async () => {
    if (!cancelDialog.registrationId) return;

    setProcessingCancel(true);
    try {
      await api.put(`/service-registrations/${cancelDialog.registrationId}/cancel`);
      setAlert('Đã hủy đăng ký dịch vụ thành công', 'success');
      fetchRegistrations(); // Refresh the list
    } catch (err) {
      setAlert(err.response?.data?.message || 'Có lỗi xảy ra khi hủy đăng ký', 'error');
    } finally {
      setProcessingCancel(false);
      handleCloseCancelDialog();
    }
  };

  const canCancelRegistration = (registration) => {
    return ['pending', 'approved'].includes(registration.status);
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h2">
            Đăng ký dịch vụ của tôi
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/services"
          >
            Đăng ký dịch vụ mới
          </Button>
        </Box>

        {registrations.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Bạn chưa đăng ký dịch vụ nào
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
              Hãy chọn một dịch vụ và đăng ký ngay để trải nghiệm
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/services"
            >
              Xem danh sách dịch vụ
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {registrations.map((registration) => (
              <Grid item xs={12} key={registration._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center">
                        <FitnessCenter color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {registration.service?.name}
                        </Typography>
                      </Box>
                      <Chip
                        icon={getStatusIcon(registration.status)}
                        label={getStatusLabel(registration.status)}
                        color={getStatusColor(registration.status)}
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Person sx={{ mr: 1, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Huấn luyện viên
                            </Typography>
                            <Box display="flex" alignItems="center">
                              <Avatar
                                src={registration.trainer?.user?.profileImage ? 
                                  `http://localhost:5000${registration.trainer.user.profileImage}` : ''}
                                alt={registration.trainer?.user?.fullName}
                                sx={{ width: 24, height: 24, mr: 1 }}
                              />
                              <Typography variant="body1">
                                {registration.trainer?.user?.fullName}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Lịch tập
                            </Typography>
                            <Typography variant="body1">
                              {registration.workSchedule?.dayOfWeek && 
                                `${registration.workSchedule.dayOfWeek}: ${registration.workSchedule.startTime} - ${registration.workSchedule.endTime}`}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <CalendarMonth sx={{ mr: 1, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Thời gian
                            </Typography>
                            <Typography variant="body1">
                              Bắt đầu: {formatDate(registration.startDate)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {registration.status === 'rejected' && registration.rejectionReason && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#fff4f4', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="error">
                          Lý do từ chối:
                        </Typography>
                        <Typography variant="body2">
                          {registration.rejectionReason}
                        </Typography>
                      </Box>
                    )}

                    {registration.status === 'approved' && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Tiến độ:
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <Box sx={{ flexGrow: 1, mr: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(registration.completedSessions / registration.numberOfSessions) * 100}
                              sx={{ height: 10, borderRadius: 5 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {registration.completedSessions}/{registration.numberOfSessions} buổi
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Typography variant="body1">
                      <strong>Tổng tiền:</strong> {formatCurrency(registration.totalPrice)}
                      {registration.numberOfSessions > 1 && ` (${registration.numberOfSessions} buổi)`}
                    </Typography>
                    
                    {canCancelRegistration(registration) && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleOpenCancelDialog(registration._id)}
                      >
                        Hủy đăng ký
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Dialog xác nhận hủy */}
      <Dialog
        open={cancelDialog.open}
        onClose={handleCloseCancelDialog}
      >
        <DialogTitle>Xác nhận hủy đăng ký</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn hủy đăng ký dịch vụ này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} disabled={processingCancel}>
            Không
          </Button>
          <Button 
            onClick={handleCancelRegistration} 
            color="error" 
            variant="contained"
            disabled={processingCancel}
          >
            {processingCancel ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận hủy'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyRegistrations;