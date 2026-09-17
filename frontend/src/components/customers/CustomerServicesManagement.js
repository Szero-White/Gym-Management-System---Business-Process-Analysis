import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Search,
  Add,
  Person,
  FitnessCenter,
  Schedule,
  Delete,
  ArrowForward
} from '@mui/icons-material';

const CustomerServicesManagement = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    registrationId: null 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tải danh sách khách hàng
        const customersRes = await api.get('/users/customers');
        setCustomers(customersRes.data);
        
        // Tải tất cả đăng ký dịch vụ
        const registrationsRes = await api.get('/service-registrations');
        setRegistrations(registrationsRes.data);
        
        setLoading(false);
      } catch (err) {
        setAlert('Không thể tải dữ liệu', 'error');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [setAlert]);

  const handleDeleteConfirmOpen = (registrationId) => {
    setConfirmDialog({ open: true, registrationId });
  };

  const handleDeleteConfirmClose = () => {
    setConfirmDialog({ open: false, registrationId: null });
  };

  const handleDeleteRegistration = async () => {
    try {
      // Sửa endpoint gọi API - sửa thành đúng API endpoint
      await api.delete(`/customer-services/${confirmDialog.registrationId}`);
      
      // Cập nhật danh sách registrations sau khi xóa
      setRegistrations(registrations.filter(
        reg => reg._id !== confirmDialog.registrationId
      ));
      
      setAlert('Xóa đăng ký dịch vụ thành công', 'success');
      handleDeleteConfirmClose();
    } catch (err) {
      setAlert(err.response?.data?.message || 'Lỗi khi xóa đăng ký dịch vụ', 'error');
      handleDeleteConfirmClose();
    }
  };

  const filteredRegistrations = registrations.filter(registration => {
    // Lọc theo search term
    const customerName = registration.customer?.user?.fullName?.toLowerCase() || '';
    const customerEmail = registration.customer?.user?.email?.toLowerCase() || '';
    const serviceName = registration.service?.name?.toLowerCase() || '';
    const trainerName = registration.trainer?.user?.fullName?.toLowerCase() || '';
    
    const matchesSearch = 
      searchTerm === '' || 
      customerName.includes(searchTerm.toLowerCase()) ||
      customerEmail.includes(searchTerm.toLowerCase()) ||
      serviceName.includes(searchTerm.toLowerCase()) ||
      trainerName.includes(searchTerm.toLowerCase());
    
    // Lọc theo trạng thái
    const matchesStatus = 
      statusFilter === 'all' || 
      registration.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
            Quản lý dịch vụ khách hàng
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên khách hàng, email, dịch vụ, huấn luyện viên..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="pending">Chờ xác nhận</MenuItem>
                <MenuItem value="approved">Đã xác nhận</MenuItem>
                <MenuItem value="completed">Hoàn thành</MenuItem>
                <MenuItem value="rejected">Từ chối</MenuItem>
                <MenuItem value="canceled">Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Khách hàng
          </Typography>
          <Grid container spacing={2}>
            {customers.slice(0, 5).map((customer) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={customer._id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar 
                        src={customer.user?.profileImage ? `http://localhost:5000${customer.user.profileImage}` : ''} 
                        alt={customer.user?.fullName} 
                        sx={{ mr: 1, width: 30, height: 30 }}
                      />
                      <Typography variant="subtitle1" noWrap>
                        {customer.user?.fullName}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {customer.user?.email}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        component={Link} 
                        to={`/customers/${customer._id}/services`}
                        endIcon={<ArrowForward />}
                      >
                        Xem dịch vụ
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  border: '1px dashed grey'
                }}
              >
                <CardContent>
                  <Button 
                    component={Link} 
                    to="/customers" 
                    color="primary"
                  >
                    Xem tất cả khách hàng
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom>
          Đăng ký dịch vụ gần đây
        </Typography>
        {filteredRegistrations.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 4 }}>
            Không tìm thấy đăng ký dịch vụ nào
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Dịch vụ</TableCell>
                  <TableCell>Huấn luyện viên</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRegistrations.slice(0, 10).map((registration) => (
                  <TableRow key={registration._id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          src={registration.customer?.user?.profileImage ? 
                            `http://localhost:5000${registration.customer.user.profileImage}` : ''} 
                          alt={registration.customer?.user?.fullName}
                          sx={{ width: 30, height: 30, mr: 1 }}
                        />
                        <Box>
                          <Typography variant="body2">
                            {registration.customer?.user?.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {registration.customer?.user?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{registration.service?.name}</TableCell>
                    <TableCell>
                      {registration.trainer?.user?.fullName}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(registration.startDate)}
                      </Typography>
                      {registration.endDate && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Đến: {formatDate(registration.endDate)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(registration.status)}
                        color={getStatusColor(registration.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatCurrency(registration.totalPrice)}
                    </TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/customers/${registration.customer?._id}/services`}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Chi tiết
                      </Button>
                      <Button
                        color="error"
                        size="small"
                        onClick={() => handleDeleteConfirmOpen(registration._id)}
                      >
                        <Delete fontSize="small" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleDeleteConfirmClose}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa đăng ký dịch vụ này? 
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose}>Hủy</Button>
          <Button onClick={handleDeleteRegistration} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomerServicesManagement;