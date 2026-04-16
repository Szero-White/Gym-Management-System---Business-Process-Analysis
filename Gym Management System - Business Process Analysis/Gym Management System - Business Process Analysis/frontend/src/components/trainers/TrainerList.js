import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Rating,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Avatar,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Tooltip
} from '@mui/material';
import {
  Edit,
  Search,
  Add,
  Block,
  CheckCircle,
  FitnessCenter,
  Schedule,
  Event,
  LockReset
} from '@mui/icons-material';
import ResetPasswordDialog from '../common/ResetPasswordDialog';

const TrainerList = () => {
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);
  const { setAlert } = alertContext;
  const { user } = authContext;
  const navigate = useNavigate();

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [actionType, setActionType] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [resetPasswordDialog, setResetPasswordDialog] = useState({ 
    open: false, 
    trainer: null 
  });

  // Check if user can manage trainers (admin or receptionist)
  const canManageTrainers = user && (user.role === 'admin' || user.role === 'receptionist');
  const isCustomer = user && user.role === 'customer';

  useEffect(() => {
    getTrainers();
  }, []);

  const getTrainers = async () => {
    try {
      const res = await api.get('/users/trainers');
      setTrainers(res.data);
      setLoading(false);
    } catch (err) {
      setAlert('Không thể tải danh sách huấn luyện viên', 'error');
      setLoading(false);
    }
  };

  const handleOpenDialog = (trainer, action) => {
    setSelectedTrainer(trainer);
    setActionType(action);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTrainer(null);
    setActionType('');
  };

  const handleOpenResetPasswordDialog = (trainer) => {
    setResetPasswordDialog({
      open: true,
      trainer
    });
  };

  const handleCloseResetPasswordDialog = (result) => {
    setResetPasswordDialog({
      open: false,
      trainer: null
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
        // Use the new endpoint
        await api.put(`/users/trainers/${selectedTrainer._id}/activate`);
        setAlert('Kích hoạt tài khoản thành công', 'success');
      } else if (actionType === 'deactivate') {
        // Use the new endpoint instead of delete
        await api.put(`/users/trainers/${selectedTrainer._id}/deactivate`);
        setAlert('Vô hiệu hóa tài khoản thành công', 'success');
      }
      
      handleCloseDialog();
      getTrainers(); // Refresh the list
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra';
      setAlert(errorMsg, 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleViewServices = (trainerId) => {
    navigate(`/services/trainer/${trainerId}`);
  };

  const handleViewSchedule = (trainerId) => {
    navigate(`/trainers/${trainerId}/schedule`);
  };

  const getDialogContent = () => {
    if (!selectedTrainer) return {};

    const contents = {
      activate: {
        title: 'Xác nhận kích hoạt tài khoản',
        content: `Bạn có chắc chắn muốn kích hoạt tài khoản của huấn luyện viên ${selectedTrainer.user?.fullName}?`
      },
      deactivate: {
        title: 'Xác nhận vô hiệu hóa tài khoản',
        content: `Bạn có chắc chắn muốn vô hiệu hóa tài khoản của huấn luyện viên ${selectedTrainer.user?.fullName}?`
      }
    };

    return contents[actionType] || {};
  };

  const filteredTrainers = trainers.filter(trainer => {
    const user = trainer.user || {};
    const specializations = trainer.specializations || [];
    
    return (
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm) ||
      specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const renderTableView = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ảnh đại diện</TableCell>
            <TableCell>Họ và tên</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Số điện thoại</TableCell>
            <TableCell>Chuyên môn</TableCell>
            <TableCell>Kinh nghiệm</TableCell>
            <TableCell>Đánh giá</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredTrainers.map((trainer) => (
            <TableRow key={trainer._id}>
              <TableCell>
                <Avatar 
                  src={trainer.user?.profileImage ? `http://localhost:5000${trainer.user.profileImage}` : ''} 
                  alt={trainer.user?.fullName}
                  sx={{ width: 50, height: 50 }}
                />
              </TableCell>
              <TableCell>{trainer.user?.fullName}</TableCell>
              <TableCell>{trainer.user?.email}</TableCell>
              <TableCell>{trainer.user?.phoneNumber}</TableCell>
              <TableCell>
                {trainer.specializations?.map((spec, index) => (
                  <Chip
                    key={index}
                    label={spec}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </TableCell>
              <TableCell>{trainer.experience} năm</TableCell>
              <TableCell>
                <Rating
                  value={trainer.rating?.average || 0}
                  precision={0.5}
                  readOnly
                  size="small"
                />
                <Typography variant="caption" display="block">
                  ({trainer.rating?.count || 0} đánh giá)
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={trainer.user?.active ? 'Đang hoạt động' : 'Đã vô hiệu'}
                  color={trainer.user?.active ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {canManageTrainers && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        color="primary"
                        component={Link}
                        to={`/trainers/edit/${trainer._id}`}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <Tooltip title="Đặt lại mật khẩu">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenResetPasswordDialog(trainer)}
                          size="small"
                        >
                          <LockReset />
                        </IconButton>
                      </Tooltip>
                      {trainer.user?.active ? (
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDialog(trainer, 'deactivate')}
                          size="small"
                        >
                          <Block />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="success"
                          onClick={() => handleOpenDialog(trainer, 'activate')}
                          size="small"
                        >
                          <CheckCircle />
                        </IconButton>
                      )}
                    </Box>
                  )}
                  
                  {trainer.user?.active && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => handleViewServices(trainer._id)}
                        sx={{ fontSize: '0.7rem', py: 0.5 }}
                        startIcon={<FitnessCenter />}
                      >
                        Dịch vụ
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        onClick={() => handleViewSchedule(trainer._id)}
                        sx={{ fontSize: '0.7rem', py: 0.5 }}
                        startIcon={<Schedule />}
                      >
                        Lịch
                      </Button>
                    </Box>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderGridView = () => (
    <Grid container spacing={3}>
      {filteredTrainers.map((trainer) => (
        <Grid item xs={12} sm={6} md={4} key={trainer._id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              ...(trainer.user?.active ? {} : { opacity: 0.7 })
            }}
          >
            <CardMedia
              component="div"
              sx={{ 
                pt: '100%', 
                position: 'relative', 
                backgroundColor: '#f5f5f5'
              }}
            >
              <Avatar 
                src={trainer.user?.profileImage ? `http://localhost:5000${trainer.user.profileImage}` : ''} 
                alt={trainer.user?.fullName}
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 0
                }}
              />
              {!trainer.user?.active && (
                <Chip
                  label="Không hoạt động"
                  color="error"
                  sx={{ 
                    position: 'absolute',
                    top: 10,
                    right: 10,
                  }}
                />
              )}
            </CardMedia>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                {trainer.user?.fullName}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating
                  value={trainer.rating?.average || 0}
                  precision={0.5}
                  readOnly
                  size="small"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({trainer.rating?.count || 0})
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Kinh nghiệm:</strong> {trainer.experience} năm
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {trainer.specializations?.slice(0, 3).map((spec, index) => (
                  <Chip
                    key={index}
                    label={spec}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
                {(trainer.specializations?.length || 0) > 3 && (
                  <Chip
                    label={`+${trainer.specializations.length - 3}`}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                )}
              </Box>
            </CardContent>
            
            <CardActions sx={{ p: 2 }}>
              {trainer.user?.active ? (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FitnessCenter />}
                    onClick={() => handleViewServices(trainer._id)}
                    sx={{ mr: 1, flexGrow: 1 }}
                  >
                    Dịch vụ
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Event />}
                    onClick={() => handleViewSchedule(trainer._id)}
                    sx={{ flexGrow: 1 }}
                  >
                    Lịch
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  disabled
                  fullWidth
                >
                  Không khả dụng
                </Button>
              )}
            </CardActions>
            
            {canManageTrainers && (
              <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
                <Button
                  variant="text"
                  size="small"
                  component={Link}
                  to={`/trainers/edit/${trainer._id}`}
                  sx={{ mr: 1, flexGrow: 1 }}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<LockReset />}
                  onClick={() => handleOpenResetPasswordDialog(trainer)}
                  sx={{ flexGrow: 1 }}
                >
                  Đặt lại mật khẩu
                </Button>
                {trainer.user?.active ? (
                  <Button
                    variant="text"
                    size="small"
                    color="error"
                    onClick={() => handleOpenDialog(trainer, 'deactivate')}
                    sx={{ flexGrow: 1 }}
                  >
                    Vô hiệu
                  </Button>
                ) : (
                  <Button
                    variant="text"
                    size="small"
                    color="success"
                    onClick={() => handleOpenDialog(trainer, 'activate')}
                    sx={{ flexGrow: 1 }}
                  >
                    Kích hoạt
                  </Button>
                )}
              </CardActions>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );

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
            Danh sách huấn luyện viên
          </Typography>
          
          <Box>
            {canManageTrainers && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                component={Link}
                to="/trainers/add"
                sx={{ mr: 2 }}
              >
                Thêm huấn luyện viên
              </Button>
            )}
            
            {/* Toggle view buttons */}
            <Button
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('grid')}
              sx={{ mr: 1 }}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
          </Box>
        </Box>

        <TextField
          fullWidth
          margin="normal"
          placeholder="Tìm kiếm theo tên, email, số điện thoại hoặc chuyên môn..."
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

        {filteredTrainers.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
            {searchTerm ? 'Không tìm thấy huấn luyện viên nào phù hợp' : 'Chưa có huấn luyện viên nào'}
          </Typography>
        ) : (
          viewMode === 'table' ? renderTableView() : renderGridView()
        )}
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {getDialogContent().title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getDialogContent().content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            disabled={processingAction}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color="primary" 
            variant="contained"
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
        userId={resetPasswordDialog.trainer?._id}
        userType="trainer"
        userName={resetPasswordDialog.trainer?.user?.fullName}
      />
    </Container>
  );
};

export default TrainerList;