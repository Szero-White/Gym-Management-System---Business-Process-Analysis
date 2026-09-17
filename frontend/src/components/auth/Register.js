import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/auth/authContext';
import AlertContext from '../../contexts/alert/alertContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { PersonAddOutlined, ArrowBack } from '@mui/icons-material';

const Register = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { register, error, clearErrors, user } = authContext;
  const { setAlert } = alertContext;

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password2: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    role: 'customer'
  });

  const { username, password, password2, email, fullName, phoneNumber, role } = formData;

  useEffect(() => {
    if (error) {
      setAlert(error, 'error');
      clearErrors();
      setIsSubmitting(false);
    }
  }, [error, setAlert, clearErrors]);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    if (password !== password2) {
      setAlert('Mật khẩu không khớp', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      await register({
        username,
        password,
        email,
        fullName,
        phoneNumber,
        role
      });
      setAlert('Đăng ký tài khoản thành công', 'success');
      navigate('/dashboard');
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  // Chỉ admin có thể thêm admin và lễ tân
  const canAddAdminReceptionist = user && user.role === 'admin';

  return (
    <Container component="main" maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4
        }}
      >
        <Box display="flex" width="100%" alignItems="center" mb={3}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h5" component="h1">
            Đăng ký tài khoản mới
          </Typography>
        </Box>

        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <PersonAddOutlined />
        </Avatar>

        <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="fullName"
                required
                fullWidth
                id="fullName"
                label="Họ và tên"
                autoFocus
                value={fullName}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="phoneNumber"
                label="Số điện thoại"
                name="phoneNumber"
                value={phoneNumber}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="Tên đăng nhập"
                name="username"
                value={username}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="password"
                label="Mật khẩu"
                type="password"
                id="password"
                value={password}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="password2"
                label="Xác nhận mật khẩu"
                type="password"
                id="password2"
                value={password2}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Vai trò</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={role}
                  label="Vai trò"
                  onChange={onChange}
                >
                  <MenuItem value="customer">Khách hàng</MenuItem>
                  <MenuItem value="trainer">Huấn luyện viên</MenuItem>
                  {canAddAdminReceptionist && (
                    <MenuItem value="receptionist">Lễ tân</MenuItem>
                  )}
                  {canAddAdminReceptionist && (
                    <MenuItem value="admin">Quản trị viên</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : (
              'Đăng ký'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;