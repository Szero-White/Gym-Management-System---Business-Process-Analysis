import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EquipmentContext from '../../contexts/equipment/equipmentContext';
import AlertContext from '../../contexts/alert/alertContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  IconButton,
  Chip,
  InputAdornment
} from '@mui/material';
import { Save, ArrowBack, DateRange, Add, Delete } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import viLocale from 'date-fns/locale/vi';

const MaintenanceForm = () => {
  const equipmentContext = useContext(EquipmentContext);
  const alertContext = useContext(AlertContext);

  const { 
    currentEquipment, 
    currentMaintenance, 
    equipment, 
    getEquipmentById, 
    getEquipment,
    getMaintenanceById,
    addMaintenance, 
    updateMaintenance,
    clearEquipment,
    clearMaintenance
  } = equipmentContext;
  
  const { setAlert } = alertContext;
  
  const navigate = useNavigate();
  const { id, maintenanceId } = useParams();
  
  const isEditMode = Boolean(maintenanceId);
  const isEquipmentSpecified = Boolean(id);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    equipment: '',
    maintenanceType: 'routine',
    scheduledDate: new Date(),
    completedDate: null,
    status: 'scheduled',
    technician: {
      name: '',
      contact: ''
    },
    cost: '',
    description: '',
    notes: '',
    partsReplaced: []
  });
  
  const [newPart, setNewPart] = useState({
    partName: '',
    partCost: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      if (isEquipmentSpecified) {
        await getEquipmentById(id);
      } else {
        await getEquipment();
      }
      
      if (isEditMode) {
        await getMaintenanceById(maintenanceId);
      }
      
      setLoading(false);
    };
    
    fetchData();
    
    return () => {
      clearEquipment();
      clearMaintenance();
    };
    // eslint-disable-next-line
  }, [id, maintenanceId, isEditMode, isEquipmentSpecified]);
  
  useEffect(() => {
    if (currentEquipment && isEquipmentSpecified && !isEditMode) {
      setFormData({
        ...formData,
        equipment: currentEquipment._id
      });
    }
    // eslint-disable-next-line
  }, [currentEquipment, isEquipmentSpecified]);
  
  useEffect(() => {
    if (currentMaintenance && isEditMode) {
      setFormData({
        equipment: currentMaintenance.equipment._id || '',
        maintenanceType: currentMaintenance.maintenanceType || 'routine',
        scheduledDate: currentMaintenance.scheduledDate ? new Date(currentMaintenance.scheduledDate) : new Date(),
        completedDate: currentMaintenance.completedDate ? new Date(currentMaintenance.completedDate) : null,
        status: currentMaintenance.status || 'scheduled',
        technician: {
          name: currentMaintenance.technician?.name || '',
          contact: currentMaintenance.technician?.contact || ''
        },
        cost: currentMaintenance.cost || '',
        description: currentMaintenance.description || '',
        notes: currentMaintenance.notes || '',
        partsReplaced: currentMaintenance.partsReplaced || []
      });
    }
  }, [currentMaintenance, isEditMode]);
  
  const handleChange = e => {
    const { name, value } = e.target;
    
    if (name.startsWith('technician.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        technician: {
          ...formData.technician,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleDateChange = (field, date) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };
  
  const handleNewPartChange = (field, value) => {
    setNewPart({
      ...newPart,
      [field]: value
    });
  };
  
  const addPart = () => {
    if (!newPart.partName || !newPart.partCost) {
      setAlert('Vui lòng nhập đầy đủ thông tin phụ tùng', 'warning');
      return;
    }
    
    setFormData({
      ...formData,
      partsReplaced: [
        ...formData.partsReplaced,
        {
          partName: newPart.partName,
          partCost: parseFloat(newPart.partCost)
        }
      ]
    });
    
    setNewPart({
      partName: '',
      partCost: ''
    });
  };
  
  const removePart = (index) => {
    const updatedParts = [...formData.partsReplaced];
    updatedParts.splice(index, 1);
    
    setFormData({
      ...formData,
      partsReplaced: updatedParts
    });
  };
  
  const validateForm = () => {
    if (!formData.equipment) {
      setAlert('Vui lòng chọn thiết bị', 'error');
      return false;
    }
    
    if (!formData.scheduledDate) {
      setAlert('Vui lòng chọn ngày lên lịch', 'error');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      if (isEditMode) {
        await updateMaintenance(maintenanceId, formData);
        setAlert('Cập nhật bản ghi bảo trì thành công', 'success');
      } else {
        await addMaintenance(formData);
        setAlert('Thêm bản ghi bảo trì thành công', 'success');
      }
      
      navigate(isEquipmentSpecified ? `/equipment/${id}` : '/maintenance');
    } catch (err) {
      setAlert(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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
          <IconButton
            onClick={() => navigate(isEquipmentSpecified ? `/equipment/${id}` : '/maintenance')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h2">
            {isEditMode ? 'Cập nhật bản ghi bảo trì' : 'Lên lịch bảo trì mới'}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Equipment Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Thông tin thiết bị
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={12}>
              <FormControl fullWidth disabled={isEquipmentSpecified || isEditMode}>
                <InputLabel>Thiết bị</InputLabel>
                <Select
                  name="equipment"
                  value={formData.equipment}
                  label="Thiết bị"
                  onChange={handleChange}
                  required
                >
                  {equipment.map((item) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item.name} - {item.type} {item.serialNumber ? `(${item.serialNumber})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Maintenance Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Chi tiết bảo trì
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Loại bảo trì</InputLabel>
                <Select
                  name="maintenanceType"
                  value={formData.maintenanceType}
                  label="Loại bảo trì"
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="routine">Định kỳ</MenuItem>
                  <MenuItem value="repair">Sửa chữa</MenuItem>
                  <MenuItem value="inspection">Kiểm tra</MenuItem>
                  <MenuItem value="cleaning">Vệ sinh</MenuItem>
                  <MenuItem value="other">Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Trạng thái"
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="scheduled">Đã lên lịch</MenuItem>
                  <MenuItem value="in-progress">Đang thực hiện</MenuItem>
                  <MenuItem value="completed">Hoàn thành</MenuItem>
                  <MenuItem value="canceled">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                <DatePicker
                  label="Ngày lên lịch"
                  value={formData.scheduledDate}
                  onChange={(date) => handleDateChange('scheduledDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  components={{
                    OpenPickerIcon: DateRange
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                <DatePicker
                  label="Ngày hoàn thành"
                  value={formData.completedDate}
                  onChange={(date) => handleDateChange('completedDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  components={{
                    OpenPickerIcon: DateRange
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả công việc"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            {/* Technician Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Thông tin kỹ thuật viên
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên kỹ thuật viên"
                name="technician.name"
                value={formData.technician.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thông tin liên hệ"
                name="technician.contact"
                value={formData.technician.contact}
                onChange={handleChange}
              />
            </Grid>

            {/* Cost and Parts */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Chi phí và phụ tùng
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tổng chi phí (VNĐ)"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                type="number"
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Phụ tùng thay thế
                </Typography>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Tên phụ tùng"
                      value={newPart.partName}
                      onChange={(e) => handleNewPartChange('partName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Chi phí"
                      value={newPart.partCost}
                      onChange={(e) => handleNewPartChange('partCost', e.target.value)}
                      type="number"
                      InputProps={{
                        inputProps: { min: 0 },
                        startAdornment: <InputAdornment position="start">VNĐ</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<Add />}
                      onClick={addPart}
                      sx={{ height: '100%' }}
                    >
                      Thêm
                    </Button>
                  </Grid>
                </Grid>

                {formData.partsReplaced.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Danh sách phụ tùng đã thêm:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.partsReplaced.map((part, index) => (
                        <Chip
                          key={index}
                          label={`${part.partName} - ${formatCurrency(part.partCost)}`}
                          onDelete={() => removePart(index)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Chưa có phụ tùng nào được thêm
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú bổ sung"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(isEquipmentSpecified ? `/equipment/${id}` : '/maintenance')}
                  sx={{ mr: 2 }}
                  disabled={submitting}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress size={24} />
                  ) : (
                    isEditMode ? 'Cập nhật' : 'Lưu'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default MaintenanceForm;