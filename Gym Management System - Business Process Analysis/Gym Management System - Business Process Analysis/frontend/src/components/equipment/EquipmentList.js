import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import EquipmentContext from '../../contexts/equipment/equipmentContext';
import AlertContext from '../../contexts/alert/alertContext';
import AuthContext from '../../contexts/auth/authContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Menu
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Edit,
  Build,
  CheckCircle,
  Warning,
  ArrowDropDown,
  Clear
} from '@mui/icons-material';

const EquipmentList = () => {
  const equipmentContext = useContext(EquipmentContext);
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);

  const { 
    equipment, 
    filtered, 
    loading, 
    getEquipment, 
    filterEquipment, 
    clearFilter, 
    updateEquipmentStatus
  } = equipmentContext;
  
  const { setAlert } = alertContext;
  const { user } = authContext;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState({
    open: false,
    id: null,
    currentStatus: '',
    newStatus: ''
  });

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    getEquipment();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (searchTerm !== '') {
      filterEquipment(searchTerm);
    } else {
      clearFilter();
    }
    // eslint-disable-next-line
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    handleFilterMenuClose();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openStatusUpdateDialog = (id, currentStatus) => {
    setStatusUpdateDialog({
      open: true,
      id,
      currentStatus,
      newStatus: currentStatus
    });
  };

  const closeStatusUpdateDialog = () => {
    setStatusUpdateDialog({
      open: false,
      id: null,
      currentStatus: '',
      newStatus: ''
    });
  };

  const confirmStatusUpdate = async () => {
    try {
      await updateEquipmentStatus(statusUpdateDialog.id, statusUpdateDialog.newStatus);
      setAlert('Trạng thái thiết bị đã được cập nhật', 'success');
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
        size="small" 
        onClick={isAdmin ? () => openStatusUpdateDialog(status) : undefined}
        clickable={isAdmin}
      />
    );
  };

  // Apply filters to equipment list
  const filteredEquipment = () => {
    const equipmentList = filtered || equipment;

    return equipmentList.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      return true;
    });
  };

  // Get unique equipment types for filter
  const equipmentTypes = equipment.length > 0 
    ? ['all', ...new Set(equipment.map(item => item.type))]
    : ['all'];

  const formattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Get paginated data
  const filteredData = filteredEquipment();
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h2">
            Quản lý cơ sở vật chất
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              component={Link}
              to="/equipment/add"
            >
              Thêm thiết bị mới
            </Button>
          )}
        </Box>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên, loại, số serial, vị trí..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} textAlign="right">
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              endIcon={<ArrowDropDown />}
              onClick={handleFilterMenuOpen}
            >
              Lọc
            </Button>
            <Menu
              anchorEl={filterMenuAnchor}
              open={Boolean(filterMenuAnchor)}
              onClose={handleFilterMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ p: 2, width: 300 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Lọc theo trạng thái
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Trạng thái"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="new">Mới</MenuItem>
                    <MenuItem value="in-use">Đang sử dụng</MenuItem>
                    <MenuItem value="damaged">Hỏng</MenuItem>
                    <MenuItem value="maintenance">Bảo trì</MenuItem>
                    <MenuItem value="retired">Đã ngừng sử dụng</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="subtitle2" gutterBottom>
                  Lọc theo loại thiết bị
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Loại thiết bị</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Loại thiết bị"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    {equipmentTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type === 'all' ? 'Tất cả' : type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box display="flex" justifyContent="flex-end">
                  <Button onClick={resetFilters}>
                    Đặt lại bộ lọc
                  </Button>
                </Box>
              </Box>
            </Menu>
          </Grid>
        </Grid>

        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Tên thiết bị</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Số Serial</TableCell>
                <TableCell>Vị trí</TableCell>
                <TableCell>Ngày mua</TableCell>
                <TableCell>Bảo trì gần nhất</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Link to={`/equipment/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Typography 
                          variant="body1" 
                          color="primary" 
                          sx={{ fontWeight: 'medium', '&:hover': { textDecoration: 'underline' } }}
                        >
                          {item.name}
                        </Typography>
                      </Link>
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.serialNumber || 'N/A'}</TableCell>
                    <TableCell>{item.location || 'N/A'}</TableCell>
                    <TableCell>{formattedDate(item.purchaseDate)}</TableCell>
                    <TableCell>{formattedDate(item.lastMaintenanceDate)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={renderStatus(item.status).props.label} 
                        color={renderStatus(item.status).props.color} 
                        size="small"
                        onClick={isAdmin ? () => openStatusUpdateDialog(item._id, item.status) : undefined}
                        clickable={isAdmin}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <IconButton 
                          component={Link} 
                          to={`/equipment/${item._id}`} 
                          color="primary" 
                          size="small"
                          title="Xem chi tiết"
                        >
                          <Edit />
                        </IconButton>
                        {/* Đã loại bỏ nút Delete ở đây */}
                        {isAdmin && (
                          <IconButton 
                            component={Link} 
                            to={`/maintenance/add/${item._id}`}
                            color="warning" 
                            size="small"
                            title="Lên lịch bảo trì"
                          >
                            <Build />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1">
                      {filtered ? 'Không tìm thấy thiết bị phù hợp' : 'Chưa có thiết bị nào'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Hiển thị mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
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
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusUpdateDialog.newStatus}
              label="Trạng thái"
              onChange={(e) => setStatusUpdateDialog({
                ...statusUpdateDialog,
                newStatus: e.target.value
              })}
            >
              <MenuItem value="new">Mới</MenuItem>
              <MenuItem value="in-use">Đang sử dụng</MenuItem>
              <MenuItem value="damaged">Hỏng</MenuItem>
              <MenuItem value="maintenance">Bảo trì</MenuItem>
              <MenuItem value="retired">Đã ngừng sử dụng</MenuItem>
            </Select>
          </FormControl>
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

export default EquipmentList;