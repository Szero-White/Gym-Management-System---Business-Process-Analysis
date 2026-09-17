// Cập nhật component Navbar
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Tooltip,
  Badge
} from '@mui/material';
import { AccountCircle, Notifications, ExitToApp, RateReview } from '@mui/icons-material';
import AuthContext from '../../contexts/auth/authContext';
import FeedbackContext from '../../contexts/feedback/feedbackContext';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const feedbackContext = useContext(FeedbackContext);
  const { isAuthenticated, logout, user } = authContext;
  const { unreadCount, getUnreadCount } = feedbackContext;
  
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Lấy số lượng phản hồi chưa đọc khi component mount
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'receptionist')) {
      getUnreadCount();
    }
  }, [isAuthenticated, user, getUnreadCount]);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout(() => {
      navigate('/login');
    });
  };
  
  // Thêm nút xem phản hồi dành cho admin
  const renderFeedbackButton = () => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'receptionist')) {
      return (
        <Tooltip title="Phản hồi từ khách hàng">
          <IconButton
            color="inherit"
            component={Link}
            to="/admin/feedback"
          >
            <Badge badgeContent={unreadCount} color="error">
              <RateReview />
            </Badge>
          </IconButton>
        </Tooltip>
      );
    }
    return null;
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Family Gym
          </Link>
        </Typography>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderFeedbackButton()}
            
            <Tooltip title="Tài khoản">
              <IconButton
                size="large"
                aria-label="account"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {user && user.profileImage ? (
                  <Avatar 
                    src={`http://localhost:5000${user.profileImage}`} 
                    alt={user.fullName}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Tooltip>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  {user && user.fullName} ({user && user.role})
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp fontSize="small" sx={{ mr: 1 }} />
                Đăng xuất
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            Đăng nhập
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;