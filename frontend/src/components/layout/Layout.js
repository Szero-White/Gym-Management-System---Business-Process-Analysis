import React, { useContext } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography, Divider } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person,
  FitnessCenter,
  Group,
  AdminPanelSettings,
  PersonAdd
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../../contexts/auth/authContext';

// Chiều rộng của sidebar
const DRAWER_WIDTH = 250;

const Layout = ({ children }) => {
  const location = useLocation();
  const authContext = useContext(AuthContext);
  const { user } = authContext;

  // Xác định quyền người dùng
  const isAdmin = user && user.role === 'admin';
  const isReceptionist = user && user.role === 'receptionist';
  const isTrainer = user && user.role === 'trainer';
  const isCustomer = user && user.role === 'customer';

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 64, // Chiều cao của Navbar
          overflowY: 'auto',
          zIndex: 1000
        }}
      >
        <List component="nav">
          <ListItemButton 
            component={Link} 
            to="/dashboard"
            selected={location.pathname === '/dashboard'}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'action.selected',
              }
            }}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          <Divider sx={{ my: 1 }} />

          {/* Mục Quản lý khách hàng - hiển thị cho admin và lễ tân */}
          {(isAdmin || isReceptionist) && (
            <>
              <ListItem>
                <Typography variant="subtitle2" color="text.secondary" sx={{ pl: 2 }}>
                  Quản lý khách hàng
                </Typography>
              </ListItem>
              <ListItemButton 
                component={Link} 
                to="/customers"
                selected={location.pathname === '/customers'}
              >
                <ListItemIcon>
                  <Group />
                </ListItemIcon>
                <ListItemText primary="Danh sách khách hàng" />
              </ListItemButton>
              <ListItemButton 
                component={Link} 
                to="/customers/add"
                selected={location.pathname === '/customers/add'}
              >
                <ListItemIcon>
                  <PersonAdd />
                </ListItemIcon>
                <ListItemText primary="Thêm khách hàng" />
              </ListItemButton>
            </>
          )}

          <Divider sx={{ my: 1 }} />

          {/* Mục Quản lý huấn luyện viên - hiển thị cho admin, lễ tân và khách hàng */}
          {(isAdmin || isReceptionist || isCustomer) && (
            <>
              <ListItem>
                <Typography variant="subtitle2" color="text.secondary" sx={{ pl: 2 }}>
                  Quản lý huấn luyện viên
                </Typography>
              </ListItem>
              <ListItemButton 
                component={Link} 
                to="/trainers"
                selected={location.pathname === '/trainers'}
              >
                <ListItemIcon>
                  <FitnessCenter />
                </ListItemIcon>
                <ListItemText primary="Danh sách huấn luyện viên" />
              </ListItemButton>
              {(isAdmin || isReceptionist) && (
                <ListItemButton 
                  component={Link} 
                  to="/trainers/add"
                  selected={location.pathname === '/trainers/add'}
                >
                  <ListItemIcon>
                    <PersonAdd />
                  </ListItemIcon>
                  <ListItemText primary="Thêm huấn luyện viên" />
                </ListItemButton>
              )}
            </>
          )}

          <Divider sx={{ my: 1 }} />

          {/* Mục Quản lý nội bộ - chỉ hiển thị cho admin */}
          {isAdmin && (
            <>
              <ListItem>
                <Typography variant="subtitle2" color="text.secondary" sx={{ pl: 2 }}>
                  Nhân viên
                </Typography>
              </ListItem>
              <ListItemButton 
                component={Link} 
                to="/staff"
                selected={location.pathname === '/staff'}
              >
                <ListItemIcon>
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText primary="Danh sách nhân viên" />
              </ListItemButton>
              <ListItemButton 
                component={Link} 
                to="/staff/add"
                selected={location.pathname === '/staff/add'}
              >
                <ListItemIcon>
                  <PersonAdd />
                </ListItemIcon>
                <ListItemText primary="Thêm nhân viên" />
              </ListItemButton>
            </>
          )}
        </List>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: `${DRAWER_WIDTH}px` // Margin left bằng với chiều rộng của sidebar
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;