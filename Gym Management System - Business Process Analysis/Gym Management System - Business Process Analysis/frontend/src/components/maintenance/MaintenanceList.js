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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Menu,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Edit,
  CheckCircle,
  Warning,
  ArrowDropDown,
  Schedule,
  Build,
  Clear
} from '@mui/icons-material';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`maintenance-tabpanel-${index}`}
      aria-labelledby={`maintenance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const MaintenanceList = () => {
  const equipmentContext = useContext(EquipmentContext);
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);

  const { 
    maintenance, 
    upcomingMaintenance,
    overdueMaintenance,
    loading, 
    getMaintenance,
    getUpcomingMaintenance,
    getOverdueMaintenance,
    updateMaintenance
  } = equipmentContext;
  
  const { setAlert } = alertContext;
  const { user } = authContext;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';
  const isReceptionist = user && user.role === 'receptionist';
  const canManageMaintenance = isAdmin || isReceptionist;

  useEffect(() => {
    getMaintenance();
    getUpcomingMaintenance();
    getOverdueMaintenance();
    // eslint-disable-next-line
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset pagination when changing tabs
    setPage(0);
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

  // Helper function to mark maintenance as completed
  const markAsCompleted = async (id) => {
    try {
      const today = new Date();
      await updateMaintenance(id, {
        status: 'completed',
        completedDate: today
      });
      setAlert('Đã đánh dấu hoàn thành bảo trì', 'success');
      
      // Refresh all maintenance lists
      getMaintenance();
      getUpcomingMaintenance();
      getOverdueMaintenance();
    } catch (err) {
      setAlert('Lỗi khi cập nhật trạng thái', 'error');
    }
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
  const renderStatus = (status) => {
    const statusMap = {
      'scheduled': { label: 'Đã lên lịch', color: 'primary', icon: <Schedule fontSize="small" /> },
      'in-progress': { label: 'Đang thực hiện', color: 'warning', icon: <Build fontSize="small" /> },
      'completed': { label: 'Hoàn thành', color: 'success', icon: <CheckCircle fontSize="small" /> },
      'canceled': { label: 'Đã hủy', color: 'default', icon: null }
    };

    const { label, color, icon } = statusMap[status] || { label: status, color: 'default', icon: null };

    return (
      <Chip 
        icon={icon} 
        label={label} 
        color={color} 
        size="small"
      />
    );
  };

  // Filter the maintenance data
  const getFilteredData = (maintenanceData) => {
    if (!maintenanceData) return [];

    return maintenanceData.filter(item => {
      // Apply search filter
      const matchesSearch = searchTerm === '' || 
        (item.equipment?.name && item.equipment.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.technician?.name && item.technician.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Apply status filter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      // Apply type filter
      const matchesType = typeFilter === 'all' || item.maintenanceType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  // Get unique maintenance types for filter
  const maintenanceTypes = maintenance.length > 0 
    ? ['all', ...new Set(maintenance.map(item => item.maintenanceType))]
    : ['all'];

  // Get data based on current tab
  const getCurrentData = () => {
    switch (tabValue) {
      case 0: // All
        return getFilteredData(maintenance);
      case 1: // Upcoming
        return getFilteredData(upcomingMaintenance);
      case 2: // Overdue
        return getFilteredData(overdueMaintenance);
      default:
        return [];
    }
  };

  // Get paginated data
  const filteredData = getCurrentData();
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
            Quản lý lịch bảo trì
          </Typography>
          {canManageMaintenance && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              component={Link}
              to="/maintenance/add"
            >
              Thêm lịch bảo trì mới
            </Button>
          )}
        </Box>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên thiết bị, mô tả, kỹ thuật viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                    <MenuItem value="scheduled">Đã lên lịch</MenuItem>
                    <MenuItem value="in-progress">Đang thực hiện</MenuItem>
                    <MenuItem value="completed">Hoàn thành</MenuItem>
                    <MenuItem value="canceled">Đã hủy</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="subtitle2" gutterBottom>
                  Lọc theo loại bảo trì
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Loại bảo trì</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Loại bảo trì"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    {maintenanceTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type === 'all' ? 'Tất cả' : formatMaintenanceType(type)}
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

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Tất cả" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Sắp tới
                {upcomingMaintenance.length > 0 && (
                  <Chip 
                    label={upcomingMaintenance.length} 
                    color="primary" 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                )}
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Quá hạn
                {overdueMaintenance.length > 0 && (
                  <Chip 
                    label={overdueMaintenance.length} 
                    color="error" 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                )}
              </Box>
            } 
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <MaintenanceTable 
            data={paginatedData}
            isAdmin={isAdmin}
            markAsCompleted={markAsCompleted}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            formatMaintenanceType={formatMaintenanceType}
            renderStatus={renderStatus}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <MaintenanceTable 
            data={paginatedData}
            isAdmin={isAdmin}
            markAsCompleted={markAsCompleted}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            formatMaintenanceType={formatMaintenanceType}
            renderStatus={renderStatus}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <MaintenanceTable 
            data={paginatedData}
            isAdmin={isAdmin}
            markAsCompleted={markAsCompleted}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            formatMaintenanceType={formatMaintenanceType}
            renderStatus={renderStatus}
          />
        </TabPanel>

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
    </Container>
  );
};

// Separate Component for the Maintenance Table
const MaintenanceTable = ({ 
  data, 
  isAdmin, 
  markAsCompleted, 
  formatDate, 
  formatCurrency, 
  formatMaintenanceType, 
  renderStatus 
}) => {
  return (
    <TableContainer>
      <Table size="medium">
        <TableHead>
          <TableRow>
            <TableCell>Thiết bị</TableCell>
            <TableCell>Loại bảo trì</TableCell>
            <TableCell>Ngày lên lịch</TableCell>
            <TableCell>Ngày hoàn thành</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Kỹ thuật viên</TableCell>
            <TableCell>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <Link to={`/equipment/${item.equipment?._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography 
                      variant="body1" 
                      color="primary" 
                      sx={{ fontWeight: 'medium', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {item.equipment?.name || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {item.equipment?.type || ''} {item.equipment?.serialNumber ? `(${item.equipment.serialNumber})` : ''}
                    </Typography>
                  </Link>
                </TableCell>
                <TableCell>{formatMaintenanceType(item.maintenanceType)}</TableCell>
                <TableCell>{formatDate(item.scheduledDate)}</TableCell>
                <TableCell>{formatDate(item.completedDate)}</TableCell>
                <TableCell>{renderStatus(item.status)}</TableCell>
                <TableCell>
                  {item.technician?.name || 'N/A'}
                  {item.technician?.contact && (
                    <Typography variant="caption" display="block" color="textSecondary">
                      {item.technician.contact}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box>
                    <IconButton 
                      component={Link} 
                      to={`/maintenance/${item._id}`} 
                      color="primary" 
                      size="small"
                      title="Xem chi tiết"
                    >
                      <Edit />
                    </IconButton>
                    
                    {/* Đã loại bỏ nút Delete ở đây */}
                    
                    {isAdmin && ['scheduled', 'in-progress'].includes(item.status) && (
                      <IconButton 
                        color="success" 
                        size="small" 
                        onClick={() => markAsCompleted(item._id)}
                        title="Đánh dấu hoàn thành"
                      >
                        <CheckCircle />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography variant="body1">
                  Không có bản ghi bảo trì nào
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MaintenanceList;