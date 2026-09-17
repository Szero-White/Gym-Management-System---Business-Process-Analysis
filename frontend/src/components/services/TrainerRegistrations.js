import React, { useState, useEffect, useContext } from 'react';
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
  TextField,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Check,
  Close,
  Schedule,
  FitnessCenter,
  Person,
  CalendarMonth,
  ExpandMore,
  ExpandLess,
  Notifications
} from '@mui/icons-material';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`registration-tabpanel-${index}`}
      aria-labelledby={`registration-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TrainerRegistrations = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [expandedIds, setExpandedIds] = useState([]);
  const [lastCheckedTime, setLastCheckedTime] = useState(null);
  const [newRegistrations, setNewRegistrations] = useState(0);

  // Dialog states
  const [approveDialog, setApproveDialog] = useState({ open: false, registration: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, registration: null, reason: '' });
  // Đã loại bỏ state sessionDialog vì không cần nữa
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRegistrations();
    
    // Thiết lập interval để kiểm tra định kỳ (mỗi 2 phút)
    const interval = setInterval(() => {
      checkNewRegistrations();
    }, 2 * 60 * 1000);
    
    // Dọn dẹp interval khi component bị hủy
    return () => clearInterval(interval);
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get('/service-registrations/my-customers');
      setRegistrations(res.data);
      setLoading(false);
      
      // Lưu thời gian kiểm tra hiện tại
      setLastCheckedTime(new Date());
      
      // Kiểm tra số đăng ký mới (chờ xác nhận)
      const pendingCount = res.data.filter(reg => reg.status === 'pending').length;
      if (pendingCount > 0) {
        // Hiển thị thông báo chỉ khi có đăng ký chờ xác nhận
        setNewRegistrations(pendingCount);
        setAlert(`Bạn có ${pendingCount} đăng ký mới chờ xác nhận`, 'info');
      }
    } catch (err) {
      setAlert('Không thể tải danh sách đăng ký dịch vụ', 'error');
      setLoading(false);
    }
  };
  
  const checkNewRegistrations = async () => {
    if (!lastCheckedTime) return;
    
    try {
      const res = await api.get('/service-registrations/my-customers');
      
      // Lọc các đăng ký mới sau lần kiểm tra cuối cùng
      const newPendingRegistrations = res.data.filter(reg => 
        reg.status === 'pending' && 
        new Date(reg.createdAt) > lastCheckedTime
      );
      
      // Nếu có đăng ký mới, hiển thị thông báo
      if (newPendingRegistrations.length > 0) {
        setAlert(`Bạn có ${newPendingRegistrations.length} đăng ký mới chờ xác nhận`, 'info');
        setRegistrations(res.data);
        setNewRegistrations(res.data.filter(reg => reg.status === 'pending').length);
      }
      
      // Cập nhật thời gian kiểm tra
      setLastCheckedTime(new Date());
    } catch (err) {
      console.error('Lỗi khi kiểm tra đăng ký mới:', err);
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
      'canceled': <Close fontSize="small" />
    };
    return statusMap[status] || null;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleToggleExpand = (id) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter registrations based on tab
  const getFilteredRegistrations = () => {
    switch (tabValue) {
      case 0: // All
        return registrations;
      case 1: // Pending
        return registrations.filter(reg => reg.status === 'pending');
      case 2: // Approved
        return registrations.filter(reg => reg.status === 'approved');
      case 3: // Completed/Rejected/Canceled
        return registrations.filter(reg => ['completed', 'rejected', 'canceled'].includes(reg.status));
      default:
        return registrations;
    }
  };

  // Handle approve registration
  const handleOpenApproveDialog = (registration) => {
    setApproveDialog({ open: true, registration });
  };

  const handleCloseApproveDialog = () => {
    setApproveDialog({ open: false, registration: null });
  };

  const handleApproveRegistration = async () => {
    if (!approveDialog.registration) return;

    setProcessing(true);
    try {
      await api.put(`/service-registrations/${approveDialog.registration._id}/status`, {
        status: 'approved'
      });
      setAlert('Đã xác nhận đăng ký dịch vụ thành công', 'success');
      await fetchRegistrations(); // Refresh the list
    } catch (err) {
      setAlert(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận đăng ký', 'error');
    } finally {
      setProcessing(false);
      handleCloseApproveDialog();
    }
  };

  // Handle reject registration
  const handleOpenRejectDialog = (registration) => {
    setRejectDialog({ open: true, registration, reason: '' });
  };

  const handleCloseRejectDialog = () => {
    setRejectDialog({ open: false, registration: null, reason: '' });
  };

  const handleRejectRegistration = async () => {
    if (!rejectDialog.registration || !rejectDialog.reason.trim()) {
      setAlert('Vui lòng nhập lý do từ chối', 'error');
      return;
    }

    setProcessing(true);
    try {
      await api.put(`/service-registrations/${rejectDialog.registration._id}/status`, {
        status: 'rejected',
        rejectionReason: rejectDialog.reason
      });
      setAlert('Đã từ chối đăng ký dịch vụ', 'success');
      await fetchRegistrations(); // Refresh the list
    } catch (err) {
      setAlert(err.response?.data?.message || 'Có lỗi xảy ra khi từ chối đăng ký', 'error');
    } finally {
      setProcessing(false);
      handleCloseRejectDialog();
    }
  };

  // Đánh dấu hoàn thành dịch vụ
  const handleCompleteService = async (registration) => {
    setProcessing(true);
    try {
      // Cập nhật số buổi đã hoàn thành bằng tổng số buổi (đánh dấu đã hoàn thành tất cả)
      await api.put(`/service-registrations/${registration._id}/sessions`, {
        completedSessions: registration.numberOfSessions
      });
      setAlert('Đã đánh dấu dịch vụ hoàn thành', 'success');
      await fetchRegistrations(); // Refresh the list
    } catch (err) {
      setAlert(err.response?.data?.message || 'Có lỗi xảy ra khi hoàn thành dịch vụ', 'error');
    } finally {
      setProcessing(false);
    }
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
            Khách hàng đăng ký dịch vụ
          </Typography>
          <Badge 
            badgeContent={newRegistrations} 
            color="error"
            sx={{ 
              '& .MuiBadge-badge': {
                animation: newRegistrations > 0 ? 'pulse 1.5s infinite' : 'none'
              }
            }}
          >
            <Notifications color="action" />
          </Badge>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="registration tabs"
          variant="fullWidth"
        >
          <Tab label="Tất cả" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Chờ xác nhận
                {registrations.filter(r => r.status === 'pending').length > 0 && (
                  <Chip 
                    label={registrations.filter(r => r.status === 'pending').length} 
                    color="error" 
                    size="small" 
                    sx={{ 
                      ml: 1,
                      animation: 'pulse 1.5s infinite' 
                    }} 
                  />
                )}
              </Box>
            } 
          />
          <Tab label="Đang thực hiện" />
          <Tab label="Đã hoàn thành/Từ chối/Hủy" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <RenderRegistrationList 
            registrations={getFilteredRegistrations()} 
            expandedIds={expandedIds}
            handleToggleExpand={handleToggleExpand}
            handleOpenApproveDialog={handleOpenApproveDialog}
            handleOpenRejectDialog={handleOpenRejectDialog}
            handleCompleteService={handleCompleteService}
            processing={processing}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <RenderRegistrationList 
            registrations={getFilteredRegistrations()} 
            expandedIds={expandedIds}
            handleToggleExpand={handleToggleExpand}
            handleOpenApproveDialog={handleOpenApproveDialog}
            handleOpenRejectDialog={handleOpenRejectDialog}
            handleCompleteService={handleCompleteService}
            processing={processing}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <RenderRegistrationList 
            registrations={getFilteredRegistrations()} 
            expandedIds={expandedIds}
            handleToggleExpand={handleToggleExpand}
            handleOpenApproveDialog={handleOpenApproveDialog}
            handleOpenRejectDialog={handleOpenRejectDialog}
            handleCompleteService={handleCompleteService}
            processing={processing}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <RenderRegistrationList 
            registrations={getFilteredRegistrations()} 
            expandedIds={expandedIds}
            handleToggleExpand={handleToggleExpand}
            handleOpenApproveDialog={handleOpenApproveDialog}
            handleOpenRejectDialog={handleOpenRejectDialog}
            handleCompleteService={handleCompleteService}
            processing={processing}
          />
        </TabPanel>
      </Paper>

      {/* Approve Dialog */}
      <Dialog
        open={approveDialog.open}
        onClose={handleCloseApproveDialog}
      >
        <DialogTitle>Xác nhận đăng ký dịch vụ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xác nhận đăng ký dịch vụ từ khách hàng{' '}
            <strong>{approveDialog.registration?.customer?.user?.fullName}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveDialog} disabled={processing}>
            Hủy
          </Button>
          <Button 
            onClick={handleApproveRegistration} 
            color="primary" 
            variant="contained"
            disabled={processing}
          >
            {processing ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog.open}
        onClose={handleCloseRejectDialog}
      >
        <DialogTitle>Từ chối đăng ký dịch vụ</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Vui lòng nhập lý do từ chối đăng ký dịch vụ từ khách hàng{' '}
            <strong>{rejectDialog.registration?.customer?.user?.fullName}</strong>:
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="Lý do từ chối"
            multiline
            rows={3}
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog} disabled={processing}>
            Hủy
          </Button>
          <Button 
            onClick={handleRejectRegistration} 
            color="error" 
            variant="contained"
            disabled={processing || !rejectDialog.reason.trim()}
          >
            {processing ? <CircularProgress size={24} color="inherit" /> : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Đã loại bỏ Update Sessions Dialog và thay thế bằng logic đánh dấu hoàn thành */}
    </Container>
  );
};

// Helper component to render registration list
const RenderRegistrationList = ({ 
  registrations, 
  expandedIds,
  handleToggleExpand,
  handleOpenApproveDialog,
  handleOpenRejectDialog,
  handleCompleteService,
  processing
}) => {
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
      'canceled': <Close fontSize="small" />
    };
    return statusMap[status] || null;
  };

  if (registrations.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Không có đăng ký dịch vụ nào trong danh mục này
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {registrations.map((registration) => (
        <Grid item xs={12} key={registration._id}>
          <Card 
            variant="outlined" 
            sx={{
              ...(registration.status === 'pending' && {
                boxShadow: '0 0 8px rgba(255, 152, 0, 0.5)',
                border: '1px solid #ff9800'
              })
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <Avatar
                    src={registration.customer?.user?.profileImage ? 
                      `http://localhost:5000${registration.customer.user.profileImage}` : ''}
                    alt={registration.customer?.user?.fullName}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">
                      {registration.customer?.user?.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {registration.customer?.user?.email} | {registration.customer?.user?.phoneNumber}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  icon={getStatusIcon(registration.status)}
                  label={getStatusLabel(registration.status)}
                  color={getStatusColor(registration.status)}
                  sx={{
                    ...(registration.status === 'pending' && {
                      animation: 'pulse 1.5s infinite'
                    })
                  }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <FitnessCenter sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Dịch vụ
                      </Typography>
                      <Typography variant="body1">
                        {registration.service?.name}
                      </Typography>
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

                {registration.status === 'approved' && (
                  <Grid item xs={12}>
                    <Box sx={{ mt: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" gutterBottom>
                          Tiến độ:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {registration.completedSessions}/{registration.numberOfSessions} buổi
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(registration.completedSessions / registration.numberOfSessions) * 100}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Expanded content */}
              {expandedIds.includes(registration._id) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  
                  {registration.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Ghi chú từ khách hàng:
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        "{registration.notes}"
                      </Typography>
                    </Box>
                  )}
                  
                  {registration.status === 'rejected' && registration.rejectionReason && (
                    <Box sx={{ p: 2, bgcolor: '#fff4f4', borderRadius: 1, mb: 2 }}>
                      <Typography variant="subtitle2" color="error">
                        Lý do từ chối:
                      </Typography>
                      <Typography variant="body2">
                        {registration.rejectionReason}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">
                      <strong>Tổng chi phí:</strong> {formatCurrency(registration.totalPrice)}
                      {registration.numberOfSessions > 1 && ` (${registration.numberOfSessions} buổi)`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đăng ký lúc: {new Date(registration.createdAt).toLocaleString('vi-VN')}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>

            <Divider />

            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Button
                startIcon={expandedIds.includes(registration._id) ? <ExpandLess /> : <ExpandMore />}
                onClick={() => handleToggleExpand(registration._id)}
              >
                {expandedIds.includes(registration._id) ? 'Thu gọn' : 'Xem thêm'}
              </Button>

              <Box>
                {registration.status === 'pending' && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleOpenRejectDialog(registration)}
                      sx={{ mr: 1 }}
                    >
                      Từ chối
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenApproveDialog(registration)}
                    >
                      Xác nhận
                    </Button>
                  </>
                )}

                {registration.status === 'approved' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Check />}
                    onClick={() => handleCompleteService(registration)}
                    disabled={processing}
                  >
                    {processing ? <CircularProgress size={24} color="inherit" /> : 'Đánh dấu hoàn thành'}
                  </Button>
                )}
              </Box>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default TrainerRegistrations;