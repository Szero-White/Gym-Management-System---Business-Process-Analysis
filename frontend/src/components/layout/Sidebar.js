import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../../contexts/auth/authContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box
} from '@mui/material';
import {
  Dashboard,
  Person,
  FitnessCenter,
  Settings,
  SupervisorAccount,
  Receipt
} from '@mui/icons-material';

const Sidebar = ({ open, onClose }) => {
  const authContext = useContext(AuthContext);
  const { user } = authContext;
  const location = useLocation();

  // Menu items dựa trên vai trò
  const getMenuItems = () => {
    const commonItems = [
      {
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/dashboard',
        roles: ['admin', 'receptionist', 'trainer', 'customer']
      }
    ];

    const adminItems = [
      {
        text: 'Quản lý Khách hàng',
        icon: <Person />,
        path: '/customers',
        roles: ['admin', 'receptionist']
      },
      {
        text: 'Quản lý Huấn luyện viên',
        icon: <FitnessCenter />,
        path: '/trainers',
        roles: ['admin', 'receptionist']
      },
      {
        text: 'Quản lý Nhân viên',
        icon: <SupervisorAccount />,
        path: '/staff',
        roles: ['admin']
      },
      {
        text: 'Quản lý Thiết bị',
        icon: <Settings />,
        path: '/equipment',
        roles: ['admin']
      }
    ];

    const customerItems = [
      {
        text: 'Huấn luyện viên',
        icon: <FitnessCenter />,
        path: '/trainers',
        roles: ['customer']
      },
      {
        text: 'Thành viên',
        icon: <Receipt />,
        path: '/membership',
        roles: ['customer']
      }
    ];

    const trainerItems = [
      {
        text: 'Khách hàng của tôi',
        icon: <Person />,
        path: '/my-customers',
        roles: ['trainer']
      }
    ];

    let menuItems = [...commonItems];

    if (user) {
      if (user.role === 'admin' || user.role === 'receptionist') {
        menuItems = [...menuItems, ...adminItems.filter(item => item.roles.includes(user.role))];
      }

      if (user.role === 'customer') {
        menuItems = [...menuItems, ...customerItems];
      }

      if (user.role === 'trainer') {
        menuItems = [...menuItems, ...trainerItems];
      }
    }

    return menuItems;
  };

  const drawerWidth = 240;

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
      onClose={onClose}
    >
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <FitnessCenter fontSize="large" />
        <Box sx={{ mt: 1, fontWeight: 'bold' }}>
          Family Gym
        </Box>
      </Box>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;