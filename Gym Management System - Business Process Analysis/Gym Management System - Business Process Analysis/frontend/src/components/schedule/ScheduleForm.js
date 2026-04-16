import React, { useState, useContext, useCallback } from 'react';
import ScheduleContext from '../../contexts/schedule/scheduleContext';
import AlertContext from '../../contexts/alert/alertContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  CircularProgress
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import viLocale from 'date-fns/locale/vi';

const ScheduleForm = ({ open, handleClose, trainerId, isMySchedule, onSuccess }) => {
  const scheduleContext = useContext(ScheduleContext);
  const alertContext = useContext(AlertContext);
  
  const { addScheduleItem, getMySchedule } = scheduleContext;
  const { setAlert } = alertContext;
  
  const [formData, setFormData] = useState({
    day: '',
    startTime: null,
    endTime: null
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { day, startTime, endTime } = formData;
  
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Xóa lỗi cho trường này
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: null
    }));
  }, []);
  
  const handleTimeChange = useCallback((name, time) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: time
    }));
    
    // Xóa lỗi cho trường này
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: null
    }));
  }, []);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!day) {
      newErrors.day = 'Vui lòng chọn ngày trong tuần';
    }
    
    if (!startTime) {
      newErrors.startTime = 'Vui lòng chọn thời gian bắt đầu';
    }
    
    if (!endTime) {
      newErrors.endTime = 'Vui lòng chọn thời gian kết thúc';
    }
    
    if (startTime && endTime) {
      // So sánh thời gian bắt đầu và kết thúc
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (start >= end) {
        newErrors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Check if we have a valid trainerId
      if (!trainerId || trainerId === 'me') {
        setAlert('Không thể xác định huấn luyện viên. Vui lòng thử lại sau.', 'error');
        setSubmitting(false);
        return;
      }
      
      console.log('Using trainerId for adding schedule:', trainerId);
      
      // Format thời gian thành chuỗi HH:mm
      const formattedStartTime = format(new Date(startTime), 'HH:mm');
      const formattedEndTime = format(new Date(endTime), 'HH:mm');
      
      const scheduleData = {
        day,
        startTime: formattedStartTime,
        endTime: formattedEndTime
      };
      
      // Add the schedule item
      await addScheduleItem(trainerId, scheduleData);
      
      // After successful addition, refresh the schedule data
      // This is important to keep both views in sync
      try {
        await getMySchedule();
      } catch (refreshErr) {
        console.error('Error refreshing schedule data:', refreshErr);
        // Continue with success flow even if the refresh fails
      }
      
      // Show success message
      setAlert('Thêm lịch làm việc thành công', 'success');
      
      // Reset form
      resetForm();
      
      // Close the dialog
      handleClose();
      
      // Call the success callback to notify parent component
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      console.error('Error adding schedule:', err);
      setAlert(err.response?.data?.message || 'Lỗi khi thêm lịch làm việc', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      day: '',
      startTime: null,
      endTime: null
    });
    setErrors({});
  };
  
  const handleDialogClose = () => {
    resetForm();
    handleClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleDialogClose} 
      maxWidth="md"
      disableScrollLock
    >
      <DialogTitle>
        Thêm lịch làm việc mới
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth error={Boolean(errors.day)}>
              <InputLabel id="day-select-label">Ngày trong tuần</InputLabel>
              <Select
                labelId="day-select-label"
                name="day"
                value={day}
                label="Ngày trong tuần"
                onChange={handleInputChange}
              >
                <MenuItem value="Monday">Thứ Hai</MenuItem>
                <MenuItem value="Tuesday">Thứ Ba</MenuItem>
                <MenuItem value="Wednesday">Thứ Tư</MenuItem>
                <MenuItem value="Thursday">Thứ Năm</MenuItem>
                <MenuItem value="Friday">Thứ Sáu</MenuItem>
                <MenuItem value="Saturday">Thứ Bảy</MenuItem>
                <MenuItem value="Sunday">Chủ Nhật</MenuItem>
              </Select>
              {errors.day && (
                <Typography color="error" variant="caption">
                  {errors.day}
                </Typography>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
              <TimePicker
                label="Thời gian bắt đầu"
                value={startTime}
                onChange={(newTime) => handleTimeChange('startTime', newTime)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={Boolean(errors.startTime)}
                    helperText={errors.startTime}
                  />
                )}
                ampm={false}
                minutesStep={5}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
              <TimePicker
                label="Thời gian kết thúc"
                value={endTime}
                onChange={(newTime) => handleTimeChange('endTime', newTime)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={Boolean(errors.endTime)}
                    helperText={errors.endTime}
                  />
                )}
                ampm={false}
                minutesStep={5}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} disabled={submitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={24} /> : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(ScheduleForm);