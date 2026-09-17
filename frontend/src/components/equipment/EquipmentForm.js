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
  Avatar,
  FormHelperText,
  CircularProgress,
  IconButton
} from '@mui/material';
import { 
  Save, 
  ArrowBack, 
  PhotoCamera,
  DateRange 
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import viLocale from 'date-fns/locale/vi';

const EquipmentForm = () => {
  const equipmentContext = useContext(EquipmentContext);
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  const { 
    currentEquipment, 
    getEquipmentById, 
    addEquipment, 
    updateEquipment, 
    uploadEquipmentImage,
    clearEquipment 
  } = equipmentContext;

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    serialNumber: '',
    status: 'new',
    description: '',
    purchaseDate: new Date(),
    warrantyEndDate: null,
    cost: '',
    location: '',
    notes: ''
  });

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchEquipment = async () => {
        await getEquipmentById(id);
      };
      fetchEquipment();
    } else {
      clearEquipment();
    }

    return () => {
      clearEquipment();
    };
    // eslint-disable-next-line
  }, [id, isEditMode]);

  useEffect(() => {
    if (currentEquipment && isEditMode) {
      setFormData({
        name: currentEquipment.name || '',
        type: currentEquipment.type || '',
        serialNumber: currentEquipment.serialNumber || '',
        status: currentEquipment.status || 'new',
        description: currentEquipment.description || '',
        purchaseDate: currentEquipment.purchaseDate ? new Date(currentEquipment.purchaseDate) : new Date(),
        warrantyEndDate: currentEquipment.warrantyEndDate ? new Date(currentEquipment.warrantyEndDate) : null,
        cost: currentEquipment.cost || '',
        location: currentEquipment.location || '',
        notes: currentEquipment.notes || ''
      });
      
      if (currentEquipment.image) {
        setExistingImage(`http://localhost:5000${currentEquipment.image}`);
      }
      
      setLoading(false);
    }
  }, [currentEquipment, isEditMode]);

  const {
    name,
    type,
    serialNumber,
    status,
    description,
    purchaseDate,
    warrantyEndDate,
    cost,
    location,
    notes
  } = formData;

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setAlert('Vui lòng chọn file hình ảnh (JPEG, PNG, GIF, WebP)', 'error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAlert('Kích thước file không được vượt quá 5MB', 'error');
        return;
      }
      
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Tên thiết bị là bắt buộc';
    if (!type.trim()) newErrors.type = 'Loại thiết bị là bắt buộc';
    if (cost && isNaN(parseFloat(cost))) newErrors.cost = 'Chi phí phải là một số';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlert('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const equipmentData = {
        ...formData,
        cost: cost ? parseFloat(cost) : undefined
      };
      
      let result;
      if (isEditMode) {
        result = await updateEquipment(id, equipmentData);
        setAlert('Cập nhật thiết bị thành công', 'success');
        
        // Upload image if a new one is selected
        if (imageFile) {
          await uploadEquipmentImage(result._id, imageFile);
        }
      } else {
        if (imageFile) {
          equipmentData.image = imageFile;
        }
        
        result = await addEquipment(equipmentData);
        setAlert('Thêm thiết bị mới thành công', 'success');
      }
      
      navigate('/equipment');
    } catch (err) {
      setAlert(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setSubmitting(false);
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
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton
            onClick={() => navigate('/equipment')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h2">
            {isEditMode ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Image Section */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Hình ảnh thiết bị
                </Typography>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center">
                  <Avatar
                    src={imagePreview || existingImage}
                    alt={name}
                    variant="rounded"
                    sx={{ 
                      width: 200, 
                      height: 200, 
                      mr: { xs: 0, sm: 3 },
                      mb: { xs: 2, sm: 0 }
                    }}
                  />
                  <Box>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<PhotoCamera />}
                      sx={{ mb: 1 }}
                    >
                      {existingImage ? 'Thay đổi ảnh' : 'Tải lên ảnh'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </Button>
                    {imageFile && (
                      <Typography variant="body2" color="textSecondary">
                        Đã chọn: {imageFile.name}
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Chấp nhận định dạng JPG, PNG, GIF hoặc WebP (tối đa 5MB)
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Thông tin cơ bản
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên thiết bị"
                name="name"
                value={name}
                onChange={handleChange}
                required
                error={Boolean(errors.name)}
                helperText={errors.name}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Loại thiết bị"
                name="type"
                value={type}
                onChange={handleChange}
                required
                error={Boolean(errors.type)}
                helperText={errors.type}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số serial"
                name="serialNumber"
                value={serialNumber}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  name="status"
                  value={status}
                  label="Trạng thái"
                  onChange={handleChange}
                >
                  <MenuItem value="new">Mới</MenuItem>
                  <MenuItem value="in-use">Đang sử dụng</MenuItem>
                  <MenuItem value="damaged">Hỏng</MenuItem>
                  <MenuItem value="maintenance">Bảo trì</MenuItem>
                  <MenuItem value="retired">Đã ngừng sử dụng</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                <DatePicker
                  label="Ngày mua"
                  value={purchaseDate}
                  onChange={(date) => handleDateChange('purchaseDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  components={{
                    OpenPickerIcon: DateRange
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                <DatePicker
                  label="Ngày hết hạn bảo hành"
                  value={warrantyEndDate}
                  onChange={(date) => handleDateChange('warrantyEndDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  components={{
                    OpenPickerIcon: DateRange
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chi phí (VNĐ)"
                name="cost"
                value={cost}
                onChange={handleChange}
                type="number"
                error={Boolean(errors.cost)}
                helperText={errors.cost}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vị trí"
                name="location"
                value={location}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                name="notes"
                value={notes}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/equipment')}
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

export default EquipmentForm;