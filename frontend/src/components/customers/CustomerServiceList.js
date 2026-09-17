import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerServiceContext from '../../contexts/customerService/customerServiceContext';
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
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add,
  ArrowBack,
  Delete,
  Edit,
  Check,
  Cancel,
  History,
  Assessment,
  Person,
  FitnessCenter
} from '@mui/icons-material';

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-service-tabpanel-${index}`}
      aria-labelledby={`customer-service-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CustomerServiceList = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const customerServiceContext = useContext(CustomerServiceContext);
  const alertContext = useContext(AlertContext);

  const { 
    customerServices, 
    serviceSummary, 
    loading, 
    getCustomerServices, 
    getServiceSummary,
    updateCustomerService,
    deleteCustomerService 
  } = customerServiceContext;
  const { setAlert } = alertContext;

  const [customer, setCustomer] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [updateData, setUpdateData] = useState({
    numberOfSessions: 0,
    completedSessions: 0,
    notes: ''
  });

  // Load customer info and services
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load customer info
        const customerRes = await api.get(`/users/customers/${customerId}`);
        setCustomer(customerRes.data);
        setLoadingCustomer(false);
        
        // Load customer services
        await getCustomerServices(customerId);
        
        // Load service summary
        await getServiceSummary(customerId);
      } catch (err) {
        setAlert('Không thể tải thông tin khách hàng', 'error');
        navigate('/customers');
      }
    };
    
    loadData();
  }, [customerId, getCustomerServices, getServiceSummary, setAlert, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDeleteDialog = (service) => {
    setSelectedService(service);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedService(null);
  };

  const handleOpenUpdateDialog = (service) => {
    setSelectedService(service);
    setUpdateData({
      numberOfSessions: service.numberOfSessions,
      completedSessions: service.completedSessions,
      notes: service.notes || ''
    });
    setOpenUpdateDialog(true);
  };

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
    setSelectedService(null);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData({
      ...updateData,
      [name]: name === 'notes' ? value : parseInt(value)
    });
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;
    
    setProcessingAction(true);
    try {
      await deleteCustomerService(selectedService._id);
      setAlert('Xóa dịch vụ thành công', 'success');
      handleCloseDeleteDialog();
    } catch (err) {
      setAlert(err.response?.data?.message || 'Lỗi khi xóa dịch vụ', 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;
    
    setProcessingAction(true);
    try {
      await updateCustomerService(selectedService._id, updateData);
      setAlert('Cập nhật dịch vụ thành công', 'success');
      handleCloseUpdateDialog();
    } catch (err) {
      setAlert(err.response?.data?.message || 'Lỗi khi cập nhật dịch vụ', 'error');
    } finally {
      setProcessingAction(false);
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

  // Filter services based on tab
  const getFilteredServices = () => {
    if (!customerServices) return [];
    
    switch (tabValue) {
      case 0: // All
        return customerServices;
      case 1: // Active (approved)
        return customerServices.filter(service => service.status === 'approved');
      case 2: // Completed
        return customerServices.filter(service => service.status === 'completed');
      case 3: // Canceled/Rejected
        return customerServices.filter(service => ['canceled', 'rejected'].includes(service.status));
      default:
        return customerServices;
    }
  };

  if (loading || loadingCustomer) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
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
            Quản lý dịch vụ của khách hàng
          </Typography>
        </Box>
        
        {/* Customer Info */}
        {customer && (
          <Box mb={4}>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Box display="flex" alignItems="center">
                      <Person sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                      <Box>
                        <Typography variant="h5">{customer.user?.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {customer.user?.email} | {customer.user?.phoneNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Gói thành viên:
                      </Typography>
                      <Typography variant="body1">
                        <Chip 
                          label={
                            customer.membershipType === 'basic' ? 'Cơ bản' :
                            customer.membershipType === 'standard' ? 'Tiêu chuẩn' : 'Cao cấp'
}
color={
customer.membershipType === 'basic' ? 'default' :
customer.membershipType === 'standard' ? 'primary' : 'secondary'
}
size="small"
/>
</Typography>
<Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
Hết hạn:
</Typography>
<Typography variant="body1">
<Chip
label={formatDate(customer.membershipEndDate)}
color={new Date(customer.membershipEndDate) < new Date() ? 'error' : 'success'}
size="small"
/>
</Typography>
</Box>
</Grid>
</Grid>
</CardContent>
</Card>
</Box>
)}
{/* Service Summary */}
{serviceSummary && (
      <Box mb={4}>
        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
              Tổng quan dịch vụ
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4">{serviceSummary.totalRegistrations}</Typography>
                  <Typography variant="body2">Tổng đăng ký</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4">{serviceSummary.activeRegistrations}</Typography>
                  <Typography variant="body2">Đang hoạt động</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4">{serviceSummary.completedSessions}/{serviceSummary.totalSessions}</Typography>
                  <Typography variant="body2">Hoàn thành</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4">{formatCurrency(serviceSummary.totalSpending)}</Typography>
                  <Typography variant="body2">Tổng chi tiêu</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    )}
    
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h5" component="h3">
        <FitnessCenter sx={{ mr: 1, verticalAlign: 'middle' }} />
        Dịch vụ đã đăng ký
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => navigate(`/customers/${customerId}/services/add`)}
      >
        Thêm dịch vụ mới
      </Button>
    </Box>
    
    {/* Tabs */}
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="service tabs">
        <Tab label="Tất cả" />
        <Tab label="Đang hoạt động" />
        <Tab label="Đã hoàn thành" />
        <Tab label="Đã hủy/Từ chối" />
      </Tabs>
    </Box>
    
    {/* All Services Tab */}
    <TabPanel value={tabValue} index={0}>
      {renderServiceList(getFilteredServices())}
    </TabPanel>
    
    {/* Active Services Tab */}
    <TabPanel value={tabValue} index={1}>
      {renderServiceList(getFilteredServices())}
    </TabPanel>
    
    {/* Completed Services Tab */}
    <TabPanel value={tabValue} index={2}>
      {renderServiceList(getFilteredServices())}
    </TabPanel>
    
    {/* Canceled/Rejected Services Tab */}
    <TabPanel value={tabValue} index={3}>
      {renderServiceList(getFilteredServices())}
    </TabPanel>
  </Paper>
  
  {/* Delete Confirmation Dialog */}
  <Dialog
    open={openDeleteDialog}
    onClose={handleCloseDeleteDialog}
  >
    <DialogTitle>Xác nhận xóa dịch vụ</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Bạn có chắc chắn muốn xóa dịch vụ {selectedService?.service?.name} này không? 
        Hành động này không thể hoàn tác.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseDeleteDialog} disabled={processingAction}>
        Hủy
      </Button>
      <Button 
        onClick={handleDeleteService} 
        color="error" 
        variant="contained" 
        disabled={processingAction}
      >
        {processingAction ? <CircularProgress size={24} /> : 'Xóa'}
      </Button>
    </DialogActions>
  </Dialog>
  
  {/* Update Service Dialog */}
  <Dialog
    open={openUpdateDialog}
    onClose={handleCloseUpdateDialog}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>Cập nhật dịch vụ</DialogTitle>
    <DialogContent>
      <Box mt={2} mb={3}>
        <Typography variant="subtitle1">
          Dịch vụ: {selectedService?.service?.name}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Huấn luyện viên: {selectedService?.trainer?.user?.fullName}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Tổng số buổi"
            name="numberOfSessions"
            type="number"
            value={updateData.numberOfSessions}
            onChange={handleUpdateChange}
            inputProps={{ min: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Số buổi đã hoàn thành"
            name="completedSessions"
            type="number"
            value={updateData.completedSessions}
            onChange={handleUpdateChange}
            inputProps={{ min: 0, max: updateData.numberOfSessions }}
            helperText={`Tối đa: ${updateData.numberOfSessions} buổi`}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Ghi chú"
            name="notes"
            multiline
            rows={3}
            value={updateData.notes}
            onChange={handleUpdateChange}
          />
        </Grid>
      </Grid>
      
      {selectedService && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Tiến độ buổi tập:
          </Typography>
          <Box display="flex" alignItems="center">
            <LinearProgress
              variant="determinate"
              value={(updateData.completedSessions / updateData.numberOfSessions) * 100}
              sx={{ height: 10, borderRadius: 5, flexGrow: 1, mr: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {updateData.completedSessions}/{updateData.numberOfSessions} buổi
            </Typography>
          </Box>
        </Box>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseUpdateDialog} disabled={processingAction}>
        Hủy
      </Button>
      <Button 
        onClick={handleUpdateService} 
        color="primary" 
        variant="contained" 
        disabled={processingAction}
      >
        {processingAction ? <CircularProgress size={24} /> : 'Cập nhật'}
      </Button>
    </DialogActions>
  </Dialog>
</Container>
);
function renderServiceList(services) {
if (!services || services.length === 0) {
return (
<Box textAlign="center" py={4}>
<Typography variant="body1" color="text.secondary">
Không có dịch vụ nào trong danh mục này
</Typography>
</Box>
);
}
return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Dịch vụ</TableCell>
            <TableCell>Huấn luyện viên</TableCell>
            <TableCell>Ngày bắt đầu</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Tiến độ</TableCell>
            <TableCell>Tổng tiền</TableCell>
            <TableCell>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service._id}>
              <TableCell>
                <Typography variant="body1">
                  {service.service?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {service.service?.category === 'personal' ? 'Cá nhân' :
                   service.service?.category === 'group' ? 'Nhóm' : 'Đặc biệt'}
                </Typography>
              </TableCell>
              <TableCell>{service.trainer?.user?.fullName}</TableCell>
              <TableCell>{formatDate(service.startDate)}</TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(service.status)}
                  color={getStatusColor(service.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(service.completedSessions / service.numberOfSessions) * 100}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">
                      {service.completedSessions}/{service.numberOfSessions}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{formatCurrency(service.totalPrice)}</TableCell>
              <TableCell>
                <Box>
                  <Tooltip title="Cập nhật">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenUpdateDialog(service)}
                      disabled={service.status === 'canceled' || service.status === 'rejected'}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton 
                      color="error" 
                      onClick={() => handleOpenDeleteDialog(service)}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
};
export default CustomerServiceList;