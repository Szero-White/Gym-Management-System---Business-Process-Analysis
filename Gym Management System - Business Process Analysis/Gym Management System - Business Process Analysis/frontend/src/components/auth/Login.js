import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../contexts/auth/authContext';
import AlertContext from '../../contexts/alert/alertContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

const Login = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  const location = useLocation();

  const { login, error, clearErrors, isAuthenticated } = authContext;
  const { setAlert } = alertContext;

  const navigate = useNavigate();
  
  // Get the intended destination from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const { username, password } = formData;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from);
    }

    if (error) {
      setAlert(error, 'error');
      clearErrors();
    }
  }, [error, isAuthenticated, setAlert, clearErrors, navigate, from]);

  // Thêm useEffect để ngăn cuộn trang
  useEffect(() => {
    // Lưu trữ style ban đầu
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // Ngăn cuộn
    document.body.style.overflow = 'hidden';
    
    // Khôi phục khi component unmount
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const onChange = e => 
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    if (username === '' || password === '') {
      setAlert('Vui lòng nhập đầy đủ thông tin', 'error');
    } else {
      login({ username, password });
    }
  };

  // Một style riêng cho hình nền
  const backgroundImageStyle = {
    width: '100%',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundImage: 'url(https://i.pinimg.com/736x/9a/3b/01/9a3b01a2f7adace6aea22e64398324cb.jpg)',
    backgroundSize: '100% 100%', // Đảm bảo ảnh được hiển thị đúng kích thước của trang
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',
    zIndex: -1 // Để đảm bảo ảnh nằm phía sau form
  };

  // Style cho container chính
  const mainContainerStyle = {
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    overflow: 'hidden',
    position: 'relative'
  };

  return (
    <Box component="div" sx={mainContainerStyle}>
      {/* Container riêng cho hình nền */}
      <Box component="div" sx={backgroundImageStyle} />
      
      <Container component="main" maxWidth="xs" sx={{ m: 0, zIndex: 1 }}>
        <Paper
          elevation={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
            Đăng nhập
          </Typography>
          <Box component="form" onSubmit={onSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Tên đăng nhập"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={onChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={onChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: 1.5
              }}
            >
              Đăng nhập
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;