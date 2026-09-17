import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AlertContext from '../../contexts/alert/alertContext';
import AuthContext from '../../contexts/auth/authContext';
import api from '../../utils/api';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  Add,
  Block,
  CheckCircle,
  LockReset,
  FitnessCenter
} from '@mui/icons-material';
import ResetPasswordDialog from '../common/ResetPasswordDialog';

const CustomerList = () => {
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);
  const { setAlert } = alertContext;
  const { user } = authContext;

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionType, setActionType] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState({ 
    open: false, 
    customer: null 
  });

  const canManageCustomers = user && (user.role === 'admin' || user.role === 'receptionist');

  useEffect(() => {
    getCustomers();
  }, []);

  const getCustomers = async () => {
    try {
      const res = await api.get('/users/customers');
      setCustomers(res.data);
      setLoading(false);
    } catch (err) {
      setAlert('Không thể tải danh sách khách hàng', 'error');
      setLoading(false);
    }
  };

  const handleOpenDialog = (customer, action) => {
    setSelectedCustomer(customer);
    setActionType(action);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
    setActionType('');
  };

  const handleOpenResetPasswordDialog = (customer) => {
    setResetPasswordDialog({
      open: true,
      customer
    });
  };

  const handleCloseResetPasswordDialog = (result) => {
    setResetPasswordDialog({
      open: false,
      customer: null
    });
    
    // Show success message if password was reset
    if (result && result.success) {
      setAlert(result.message, 'success');
    }
  };

  const handleConfirmAction = async () => {
    try {
      setProcessingAction(true);
      
      if (actionType === 'activate') {
        await api.put(`/users/customers/${selectedCustomer._id}/activate`);
        setAlert('Kích hoạt tài khoản thành công', 'success');
      } else if (actionType === 'deactivate') {
        await api.delete(`/users/customers/${selectedCustomer._id}`);
        setAlert('Vô hiệu hóa tài khoản thành công', 'success');
      }
      
      handleCloseDialog();
      getCustomers();
    } catch (err) {
      setAlert(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  const getDialogContent = () => {
    if (!selectedCustomer) return {};

    const contents = {
      activate: {
        title: 'Xác nhận kích hoạt tài khoản',
        content: `Bạn có chắc chắn muốn kích hoạt tài khoản của khách hàng ${selectedCustomer.user?.fullName}?`
      },
      deactivate: {
        title: 'Xác nhận vô hiệu hóa tài khoản',
        content: `Bạn có chắc chắn muốn vô hiệu hóa tài khoản của khách hàng ${selectedCustomer.user?.fullName}?`
      }
    };

    return contents[actionType] || {};
  };

  const filteredCustomers = customers.filter(customer => {
    const user = customer.user || {};
    return (
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm)
    );
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const isMembershipExpired = (endDate) => {
    return new Date(endDate) < new Date();
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
            Danh sách khách hàng
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            component={Link}
            to="/customers/add"
          >
            Thêm khách hàng
          </Button>
        </Box>

        <TextField
          fullWidth
          margin="normal"
          placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
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

        {filteredCustomers.length === 0 ? (
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Không có khách hàng nào
          </Typography>
        ) : (
          <TableContainer sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ảnh đại diện</TableCell>
                  <TableCell>Họ và tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell>Gói thành viên</TableCell>
                  <TableCell>Ngày hết hạn</TableCell>
                  <TableCell>Huấn luyện viên</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const isExpired = isMembershipExpired(customer.membershipEndDate);
                  return (
                    <TableRow key={customer._id}>
                      <TableCell>
                        <Avatar 
                          src={customer.user?.profileImage ? `http://localhost:5000${customer.user.profileImage}` : ''} 
                          alt={customer.user?.fullName}
                          sx={{ width: 50, height: 50 }}
                        />
                      </TableCell>
                      <TableCell>{customer.user?.fullName}</TableCell>
                      <TableCell>{customer.user?.email}</TableCell>
                      <TableCell>{customer.user?.phoneNumber}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            customer.membershipType === 'basic'
                              ? 'Cơ bản'
                              : customer.membershipType === 'standard'
                              ? 'Tiêu chuẩn'
                              : 'Cao cấp'
                          }
                          color={
                            customer.membershipType === 'basic'
                              ? 'default'
                              : customer.membershipType === 'standard'
                              ? 'primary'
                              : 'secondary'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatDate(customer.membershipEndDate)}
                          color={isExpired ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {customer.assignedTrainer
                          ? customer.assignedTrainer.user?.fullName
                          : 'Chưa có'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={customer.user?.active ? 'Đang hoạt động' : 'Đã vô hiệu'}
                          color={customer.user?.active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {canManageCustomers && (
                          <>
                            {/* Các thao tác khác */}
                            {/* <Button
                              variant="outlined"
                              size="small"
                              color="primary"
                              component={Link}
                              to={`/customers/${customer._id}/services`}
                              sx={{ fontSize: '0.7rem', py: 0.5, mr: 1 }}
                              startIcon={<FitnessCenter />}
                            >
                              Quản lý dịch vụ
                            </Button> */}
                            {/* Các IconButton hiện tại */}
                            <IconButton
                              color="primary"
                              component={Link}
                              to={`/customers/edit/${customer._id}`}
                            >
                              <Edit />
                            </IconButton>
                            <Tooltip title="Đặt lại mật khẩu">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenResetPasswordDialog(customer)}
                              >
                                <LockReset />
                              </IconButton>
                            </Tooltip>
                            {customer.user?.active ? (
                              <Tooltip title="Vô hiệu hóa">
                                <IconButton
                                  color="error"
                                  onClick={() => handleOpenDialog(customer, 'deactivate')}
                                >
                                  <Block />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title={isExpired ? 'Không thể kích hoạt tài khoản đã hết hạn' : 'Kích hoạt'}>
                                <span>
                                  <IconButton
                                    color="success"
                                    onClick={() => handleOpenDialog(customer, 'activate')}
                                    disabled={isExpired}
                                  >
                                    <CheckCircle />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {getDialogContent().title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {getDialogContent().content}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            disabled={processingAction}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color="primary" 
            variant="contained"
            autoFocus
            disabled={processingAction}
          >
            {processingAction ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Xác nhận'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <ResetPasswordDialog
        open={resetPasswordDialog.open}
        onClose={handleCloseResetPasswordDialog}
        userId={resetPasswordDialog.customer?._id}
        userType="customer"
        userName={resetPasswordDialog.customer?.user?.fullName}
      />
    </Container>
  );
};

export default CustomerList;