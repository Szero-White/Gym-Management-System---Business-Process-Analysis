import React, { useEffect, useContext, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import EquipmentContext from '../../contexts/equipment/equipmentContext';
import AlertContext from '../../contexts/alert/alertContext';
import AuthContext from '../../contexts/auth/authContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Build,
  CheckCircle,
  Warning,
  ScheduleOutlined
} from '@mui/icons-material';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`equipment-tabpanel-${index}`}
      aria-labelledby={`equipment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const EquipmentDetail = () => {
  const equipmentContext = useContext(EquipmentContext);
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);
  
  const {
    currentEquipment,
    equipmentMaintenance,
    loading,
    error,
    getEquipmentById,
    updateEquipmentStatus,
    getEquipmentMaintenance,
    clearEquipment
  } = equipmentContext;
  
  const { setAlert } = alertContext;
  const { user } = authContext;
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState({
    open: false,
    currentStatus: '',
    newStatus: ''
  });

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';
  
  useEffect(() => {
    const fetchData = async () => {
      await getEquipmentById(id);
      await getEquipmentMaintenance(id);
    };
    
    fetchData();
    
    return () => {
      clearEquipment();
    };
    // eslint-disable-next-line
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openStatusUpdateDialog = () => {
    if (!currentEquipment) return;
    
    setStatusUpdateDialog({
      open: true,
      currentStatus: currentEquipment.status,
      newStatus: currentEquipment.status
    });
  };

  const closeStatusUpdateDialog = () => {
    setStatusUpdateDialog({
      ...statusUpdateDialog,
      open: false
    });
  };

  const confirmStatusUpdate = async () => {
    try {
      await updateEquipmentStatus(id, statusUpdateDialog.newStatus);
      setAlert('Trạng thái thiết bị đã được cập nhật', 'success');
      getEquipmentById(id); // Refresh data
    } catch (err) {
      setAlert('Lỗi khi cập nhật trạng thái thiết bị', 'error');
    }
    closeStatusUpdateDialog();
  };

  // Status display helper
  const renderStatus = (status) => {
    const statusMap = {
      'new': { label: 'Mới', color: 'success', icon: <CheckCircle fontSize="small" /> },
      'in-use': { label: 'Đang sử dụng', color: 'primary', icon: null },
      'damaged': { label: 'Hỏng', color: 'error', icon: <Warning fontSize="small" /> },
      'maintenance': { label: 'Bảo trì', color: 'warning', icon: <Build fontSize="small" /> },
      'retired': { label: 'Đã ngừng sử dụng', color: 'default', icon: null }
    };

    const { label, color, icon } = statusMap[status] || { label: status, color: 'default', icon: null };

    return (
      <Chip 
        icon={icon} 
        label={label} 
        color={color} 
        size="medium"
        onClick={isAdmin ? openStatusUpdateDialog : undefined}
        clickable={isAdmin}
      />
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format maintenance type
  const formatMaintenanceType = (type) => {
    const typeMap = {
      'routine': 'Định kỳ',
      'repair': 'Sửa chữa',
      'inspection': 'Kiểm tra',
      'cleaning': 'Vệ sinh',
      'other': 'Khác'
    };
    return typeMap[type] || type;
  };

  // Format maintenance status
  const formatMaintenanceStatus = (status) => {
    const statusMap = {
      'scheduled': { label: 'Đã lên lịch', color: 'primary' },
      'in-progress': { label: 'Đang thực hiện', color: 'warning' },
      'completed': { label: 'Hoàn thành', color: 'success' },
      'canceled': { label: 'Đã hủy', color: 'error' }
    };
    
    const { label, color } = statusMap[status] || { label: status, color: 'default' };
    
    return <Chip label={label} color={color} size="small" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/equipment')}
            sx={{ mt: 2 }}
          >
            Quay lại danh sách thiết bị
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!currentEquipment) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Không tìm thấy thông tin thiết bị</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/equipment')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h2" sx={{ flexGrow: 1 }}>
            {currentEquipment.name}
          </Typography>
          <Box>
            {isAdmin && (
              <>
                <Button
                  component={Link}
                  to={`/equipment/edit/${id}`}
                  variant="outlined"
                  color="primary"
                  startIcon={<Edit />}
                  sx={{ mr: 1 }}
                >
                  Chỉnh sửa
                </Button>
                {/* Đã loại bỏ nút Delete ở đây */}
              </>
            )}
            {isAdmin && (
              <Button
                component={Link}
                to={`/maintenance/add/${id}`}
                variant="contained"
                color="primary"
                startIcon={<ScheduleOutlined />}
              >
                Lên lịch bảo trì
              </Button>
            )}
          </Box>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Thông tin thiết bị" />
          <Tab label="Lịch sử bảo trì" />
        </Tabs>

        {/* Equipment Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            {/* Left Column - Image and Basic Info */}
            <Grid item xs={12} md={4}>
              <Box 
                sx={{ 
                  width: '100%', 
                  height: 300, 
                  bgcolor: 'background.default',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 1,
                  overflow: 'hidden',
                  mb: 3
                }}
              >
                {currentEquipment.image ? (
                  <img 
                    src={`http://localhost:5000${currentEquipment.image}`} 
                    alt={currentEquipment.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: '#f5f5f5'
                    }}
                  >
                    <Typography color="textSecondary">
                      Không có hình ảnh
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Trạng thái hiện tại
                </Typography>
                <Box display="flex" justifyContent="center" p={2} bgcolor="#f9f9f9" borderRadius={1}>
                  {renderStatus(currentEquipment.status)}
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Thông tin cơ bản
              </Typography>
              <Box 
                sx={{
                  bgcolor: '#f9f9f9',
                  p: 2,
                  borderRadius: 1
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Loại thiết bị
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="medium">
                      {currentEquipment.type}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Số Serial
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="medium">
                      {currentEquipment.serialNumber || 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Vị trí
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="medium">
                      {currentEquipment.location || 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Chi phí
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(currentEquipment.cost)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Right Column - Detailed Info */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                  Mô tả
                </Typography>
                <Typography variant="body1" paragraph>
                  {currentEquipment.description || 'Không có mô tả'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Thông tin thời gian
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Ngày mua
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(currentEquipment.purchaseDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Ngày hết hạn bảo hành
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(currentEquipment.warrantyEndDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Bảo trì gần nhất
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(currentEquipment.lastMaintenanceDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Bảo trì tiếp theo
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(currentEquipment.nextMaintenanceDate)}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Ghi chú
                </Typography>
                <Typography variant="body1">
                  {currentEquipment.notes || 'Không có ghi chú'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Maintenance History Tab */}
        <TabPanel value={tabValue} index={1}>
          {equipmentMaintenance.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Loại bảo trì</TableCell>
                    <TableCell>Ngày lên lịch</TableCell>
                    <TableCell>Ngày hoàn thành</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Chi phí</TableCell>
                    <TableCell>Kỹ thuật viên</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipmentMaintenance.map((maintenance) => (
                    <TableRow key={maintenance._id}>
                      <TableCell>{formatMaintenanceType(maintenance.maintenanceType)}</TableCell>
                      <TableCell>{formatDate(maintenance.scheduledDate)}</TableCell>
                      <TableCell>{formatDate(maintenance.completedDate)}</TableCell>
                      <TableCell>{formatMaintenanceStatus(maintenance.status)}</TableCell>
                      <TableCell>{formatCurrency(maintenance.cost)}</TableCell>
                      <TableCell>{maintenance.technician?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <IconButton 
                          component={Link} 
                          to={`/maintenance/${maintenance._id}`} 
                          color="primary"
                          size="small"
                          title="Xem chi tiết"
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                Chưa có bản ghi bảo trì nào
              </Typography>
              {isAdmin && (
                <Button
                  component={Link}
                  to={`/maintenance/add/${id}`}
                  variant="contained"
                  color="primary"
                  startIcon={<ScheduleOutlined />}
                  sx={{ mt: 2 }}
                >
                  Lên lịch bảo trì ngay
                </Button>
              )}
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Status Update Dialog */}
      <Dialog
        open={statusUpdateDialog.open}
        onClose={closeStatusUpdateDialog}
      >
        <DialogTitle>Cập nhật trạng thái thiết bị</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Chọn trạng thái mới cho thiết bị:
          </DialogContentText>
          <Grid container spacing={2}>
            {['new', 'in-use', 'damaged', 'maintenance', 'retired'].map((status) => (
              <Grid item key={status}>
                <Chip
                  label={renderStatus(status).props.label}
                  color={renderStatus(status).props.color}
                  onClick={() => setStatusUpdateDialog({
                    ...statusUpdateDialog,
                    newStatus: status
                  })}
                  variant={statusUpdateDialog.newStatus === status ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusUpdateDialog}>
            Hủy
          </Button>
          <Button 
            onClick={confirmStatusUpdate} 
            color="primary" 
            variant="contained"
            disabled={statusUpdateDialog.currentStatus === statusUpdateDialog.newStatus}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EquipmentDetail;