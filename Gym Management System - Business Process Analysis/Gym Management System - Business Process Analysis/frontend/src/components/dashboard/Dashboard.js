import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../contexts/auth/authContext';
import api from '../../utils/api';
import NewsWidget from '../news/NewsWidget';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Chip,
  Badge
} from '@mui/material';
import {
  Person,
  FitnessCenter,
  AdminPanelSettings,
  Dashboard as DashboardIcon,
  People,
  PersonAdd,
  List as ListIcon,
  Build,
  Schedule,
  Schedule as ScheduleIcon,
  Handyman,
  Assignment,
  ListAlt,
  Notifications,
  RateReview,
  Assessment,
  Add,
  Newspaper
} from '@mui/icons-material';

const SIDEBAR_WIDTH = 280;
const BACKGROUND_IMAGE = 'https://virtualbackgrounds.site/wp-content/uploads/2020/09/modern-home-gym.jpg';
const Dashboard = () => {
  const theme = useTheme();
  const authContext = useContext(AuthContext);
  const { user } = authContext;
  const location = useLocation();
  
  // State for pending registrations (for trainer dashboard)
  const [pendingRegistrations, setPendingRegistrations] = useState(0);

  // Check if the user is admin or receptionist
  const showSidebar = user && (user.role === 'admin' || user.role === 'receptionist');
  const isAdmin = user && user.role === 'admin';
  const isCustomer = user && user.role === 'customer';
  const isTrainer = user && user.role === 'trainer';
  
  // Fetch pending registrations for trainers
  useEffect(() => {
    const fetchPendingRegistrations = async () => {
      if (isTrainer) {
        try {
          const res = await api.get('/service-registrations/my-customers');
          const pendingCount = res.data.filter(reg => reg.status === 'pending').length;
          setPendingRegistrations(pendingCount);
        } catch (err) {
          console.error('Lỗi khi tải đăng ký chờ xác nhận:', err);
        }
      }
    };
    
    fetchPendingRegistrations();
  }, [isTrainer]);

  const backgroundStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  width: '100%',
  backgroundImage: `url(${BACKGROUND_IMAGE})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  opacity: 0.4, // Độ mờ để đọc được nội dung bên trên
  zIndex: -1,
};
  const Sidebar = () => {
    // Function to determine if a path is active
    const isActive = (path) => {
      if (path === '/dashboard' && location.pathname === '/dashboard') {
        return true;
      }
      if (path !== '/dashboard' && location.pathname.startsWith(path)) {
        return true;
      }
      return false;
    };

    // Base styles for sidebar items
    const linkStyles = {
      textDecoration: 'none',
      color: 'inherit',
      display: 'block',
      width: '100%'
    };

    // Active item styles
    const activeItemStyles = {
      backgroundColor: theme.palette.action.selected,
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      paddingLeft: '12px'
    };

    // Normal item styles
    const normalItemStyles = {
      borderLeft: '4px solid transparent',
      paddingLeft: '16px'
    };

    return (
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          borderRight: `1px solid ${theme.palette.divider}`,
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 64, // Height of AppBar
          backgroundColor: theme.palette.background.paper,
          overflowY: 'auto',
          transition: theme.transitions.create(['width', 'left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        <List component="nav">
          <Link to="/dashboard" style={linkStyles}>
            <ListItemButton 
              sx={{
                ...isActive('/dashboard') ? activeItemStyles : normalItemStyles,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon>
                <DashboardIcon color={isActive('/dashboard') ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </Link>

          <Box sx={{ p: 2, pt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
              QUẢN LÝ KHÁCH HÀNG
            </Typography>
          </Box>
          
          <Link to="/customers" style={linkStyles}>
            <ListItemButton 
              sx={{
                ...isActive('/customers') && !location.pathname.includes('/customers/add') ? activeItemStyles : normalItemStyles,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon>
                <ListIcon color={isActive('/customers') && !location.pathname.includes('/customers/add') ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary="Danh sách khách hàng" />
            </ListItemButton>
          </Link>
          <Link to="/customers/add" style={linkStyles}>
            <ListItemButton 
              sx={{
                ...isActive('/customers/add') ? activeItemStyles : normalItemStyles,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon>
                <PersonAdd color={isActive('/customers/add') ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary="Thêm khách hàng mới" />
            </ListItemButton>
          </Link>

          <Box sx={{ p: 2, pt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
              QUẢN LÝ HUẤN LUYỆN VIÊN
            </Typography>
          </Box>
          
          <Link to="/trainers" style={linkStyles}>
            <ListItemButton 
              sx={{
                ...isActive('/trainers') && !location.pathname.includes('/trainers/add') ? activeItemStyles : normalItemStyles,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon>
                <ListIcon color={isActive('/trainers') && !location.pathname.includes('/trainers/add') ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary="Danh sách huấn luyện viên" />
            </ListItemButton>
          </Link>
          <Link to="/trainers/add" style={linkStyles}>
            <ListItemButton 
              sx={{
                ...isActive('/trainers/add') ? activeItemStyles : normalItemStyles,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon>
                <PersonAdd color={isActive('/trainers/add') ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary="Thêm huấn luyện viên mới" />
            </ListItemButton>
          </Link>

          {(isAdmin || user?.role === 'receptionist') && (
  <>
    <Box sx={{ p: 2, pt: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
        QUẢN LÝ TIN TỨC
      </Typography>
    </Box>
    
    <Link to="/news" style={linkStyles}>
      <ListItemButton 
        sx={{
          ...isActive('/news') && !location.pathname.includes('/news/add') ? activeItemStyles : normalItemStyles,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <ListItemIcon>
          <ListIcon color={isActive('/news') && !location.pathname.includes('/news/add') ? "primary" : "inherit"} />
        </ListItemIcon>
        <ListItemText primary="Danh sách tin tức" />
      </ListItemButton>
    </Link>
    
    <Link to="/news/add" style={linkStyles}>
      <ListItemButton 
        sx={{
          ...isActive('/news/add') ? activeItemStyles : normalItemStyles,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <ListItemIcon>
          <Add color={isActive('/news/add') ? "primary" : "inherit"} />
        </ListItemIcon>
        <ListItemText primary="Thêm tin tức mới" />
      </ListItemButton>
    </Link>
  </>
)}

          {(isAdmin || user?.role === 'receptionist') && (
            <>
              <Box sx={{ p: 2, pt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                  QUẢN LÝ CƠ SỞ VẬT CHẤT
                </Typography>
              </Box>
              
              <Link to="/equipment" style={linkStyles}>
                <ListItemButton 
                  sx={{
                    ...isActive('/equipment') && !location.pathname.includes('/equipment/add') ? activeItemStyles : normalItemStyles,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon>
                    <Handyman color={isActive('/equipment') && !location.pathname.includes('/equipment/add') ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Danh sách thiết bị" />
                </ListItemButton>
              </Link>
              
              {isAdmin && (
                <Link to="/equipment/add" style={linkStyles}>
                  <ListItemButton 
                    sx={{
                      ...isActive('/equipment/add') ? activeItemStyles : normalItemStyles,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemIcon>
                      <Build color={isActive('/equipment/add') ? "primary" : "inherit"} />
                    </ListItemIcon>
                    <ListItemText primary="Thêm thiết bị mới" />
                  </ListItemButton>
                </Link>
              )}
              
              <Link to="/maintenance" style={linkStyles}>
                <ListItemButton 
                  sx={{
                    ...isActive('/maintenance') ? activeItemStyles : normalItemStyles,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon>
                    <Schedule color={isActive('/maintenance') ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Lịch bảo trì" />
                </ListItemButton>
              </Link>
            </>
          )}

          {/* Quản lý lịch làm việc - dành cho huấn luyện viên */}
          {isTrainer && (
            <>
              <Box sx={{ p: 2, pt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                  QUẢN LÝ LỊCH LÀM VIỆC
                </Typography>
              </Box>
              
              <Link to="/my-schedule" style={linkStyles}>
                <ListItemButton 
                  sx={{
                    ...isActive('/my-schedule') ? activeItemStyles : normalItemStyles,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon>
                    <Schedule color={isActive('/my-schedule') ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Xem lịch làm việc" />
                </ListItemButton>
              </Link>
              
              <Link to="/schedule" style={linkStyles}>
                <ListItemButton 
                  sx={{
                    ...isActive('/schedule') && location.pathname === '/schedule' ? activeItemStyles : normalItemStyles,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon>
                    <ScheduleIcon color={isActive('/schedule') && location.pathname === '/schedule' ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Quản lý lịch làm việc" />
                </ListItemButton>
              </Link>

              <Link to="/trainer-registrations" style={linkStyles}>
                <ListItemButton 
                  sx={{
                    ...isActive('/trainer-registrations') ? activeItemStyles : normalItemStyles,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon>
                    <Badge
                      badgeContent={pendingRegistrations}
                      color="error"
                      invisible={pendingRegistrations === 0}
                    >
                      <Assignment color={isActive('/trainer-registrations') ? "primary" : "inherit"} />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText primary="Đăng ký của khách hàng" />
                </ListItemButton>
              </Link>
              
              <Box sx={{ p: 2, pt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                  QUẢN LÝ DỊCH VỤ
                </Typography>
              </Box>
              
              <Link to="/services/manage" style={linkStyles}>
                <ListItemButton 
                  sx={{
                    ...isActive('/services/manage') ? activeItemStyles : normalItemStyles,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon>
                    <FitnessCenter color={isActive('/services/manage') ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Quản lý dịch vụ" />
                </ListItemButton>
              </Link>
            </>
          )}

          {/* Khách hàng */}
          {isCustomer && (
            <>
              <Box sx={{ p: 2, pt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                  DỊCH VỤ
                </Typography>
              </Box>
              
              <Link to="/trainers" style={linkStyles}>
                <ListItemButton 
                  sx={{
                    ...isActive('/trainers') && !location.pathname.includes('/trainers/add') ? activeItemStyles : normalItemStyles,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon>
                    <FitnessCenter color={isActive('/trainers') && !location.pathname.includes('/trainers/add') ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Đăng ký huấn luyện viên" />
                </ListItemButton>
              </Link>
              
              <Link to="/my-registrations" style={linkStyles}>
                <ListItemButton 
                  sx={{
                    ...isActive('/my-registrations') ? activeItemStyles : normalItemStyles,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon>
                    <ListAlt color={isActive('/my-registrations') ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Đăng ký của tôi" />
                </ListItemButton>
              </Link>

              <Link to="/customer-equipment" style={linkStyles}>
                <ListItemButton 
                  sx={{
                    ...isActive('/customer-equipment') ? activeItemStyles : normalItemStyles,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon>
                    <FitnessCenter color={isActive('/customer-equipment') ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Thiết bị phòng tập" />
                </ListItemButton>
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Box sx={{ p: 2, pt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                  QUẢN LÝ NỘI BỘ
                </Typography>
              </Box>
              
              <Link to="/staff" style={linkStyles}>
                <ListItemButton 
                  sx={{
                    ...isActive('/staff') && !location.pathname.includes('/staff/add') ? activeItemStyles : normalItemStyles,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon>
                    <ListIcon color={isActive('/staff') && !location.pathname.includes('/staff/add') ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Danh sách nhân viên" />
                </ListItemButton>
              </Link>
              <Link to="/staff/add" style={linkStyles}>
                <ListItemButton 
                  sx={{
                    ...isActive('/staff/add') ? activeItemStyles : normalItemStyles,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon>
                    <PersonAdd color={isActive('/staff/add') ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Thêm nhân viên mới" />
                </ListItemButton>
              </Link>
            </>
          )}
        </List>
      </Box>
    );
  };

  const renderAdminDashboard = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
            color: 'white'
          }}
        >
          <People sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Khách hàng
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Quản lý thông tin và tài khoản của khách hàng
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/customers"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Xem danh sách
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #5E35B1 0%, #9575CD 100%)',
            color: 'white'
          }}
        >
          <Assessment sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Báo cáo thống kê
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Xem báo cáo và thống kê về hoạt động kinh doanh
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/reports"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Xem báo cáo
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
            color: 'white'
          }}
        >
          <FitnessCenter sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Dịch vụ khách hàng
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Quản lý các dịch vụ và tiến độ của khách hàng
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/customer-services-management"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Xem dịch vụ
          </Button>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #43a047 0%, #81c784 100%)',
            color: 'white'
          }}
        >
          <FitnessCenter sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Huấn luyện viên
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Quản lý thông tin và tài khoản của huấn luyện viên
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/trainers"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Xem danh sách
          </Button>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
            color: 'white'
          }}
        >
          <AdminPanelSettings sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Nhân viên
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Quản lý tài khoản của lễ tân và quản trị viên
          </Typography>
          {user && user.role === 'admin' && (
            <Button
              variant="contained"
              component={Link}
              to="/staff"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              Xem danh sách
            </Button>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)',
            color: 'white'
          }}
        >
          <Build sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Cơ sở vật chất
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Quản lý và theo dõi tình trạng cơ sở vật chất
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/equipment"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Xem danh sách
          </Button>
        </Paper>
      </Grid>

<Grid item xs={12} sm={6} md={4} lg={2.4}>
  <Paper
    sx={{
      p: 3,
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
      color: 'white'
    }}
  >
    <Newspaper sx={{ fontSize: 50, mb: 2 }} />
    <Typography variant="h5" component="h3" gutterBottom>
      Tin tức
    </Typography>
    <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
      Quản lý tin tức và thông báo cho thành viên
    </Typography>
    <Button
      variant="contained"
      component={Link}
      to="/news"
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)'
        }
      }}
    >
      Xem tin tức
    </Button>
  </Paper>
</Grid>



      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0288d1 0%, #4fc3f7 100%)',
            color: 'white'
          }}
        >
          <Schedule sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Quản lý bảo trì
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Theo dõi lịch bảo trì và sửa chữa các thiết bị
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/maintenance"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Xem lịch bảo trì
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderReceptionistDashboard = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
            color: 'white'
          }}
        >
          <People sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Khách hàng
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Quản lý thông tin và tài khoản của khách hàng
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/customers"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Xem danh sách
          </Button>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #43a047 0%, #81c784 100%)',
            color: 'white'
          }}
        >
          <FitnessCenter sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Huấn luyện viên
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Quản lý thông tin và tài khoản của huấn luyện viên
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/trainers"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Xem danh sách
          </Button>
        </Paper>
      </Grid>
        
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)',
            color: 'white'
          }}
        >
          <Build sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Cơ sở vật chất
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Theo dõi tình trạng cơ sở vật chất
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/equipment"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Xem danh sách
          </Button>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0288d1 0%, #4fc3f7 100%)',
            color: 'white'
          }}
        >
          <Schedule sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Quản lý bảo trì
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Theo dõi lịch bảo trì và sửa chữa các thiết bị
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/maintenance"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Xem lịch bảo trì
          </Button>
        </Paper>
      </Grid>

<Grid item xs={12} sm={6} md={4} lg={2.4}>
  <Paper
    sx={{
      p: 3,
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
      color: 'white'
    }}
  >
    <Newspaper sx={{ fontSize: 50, mb: 2 }} />
    <Typography variant="h5" component="h3" gutterBottom>
      Tin tức
    </Typography>
    <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
      Quản lý tin tức và thông báo cho thành viên
    </Typography>
    <Button
      variant="contained"
      component={Link}
      to="/news"
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)'
        }
      }}
    >
      Xem tin tức
    </Button>
  </Paper>
</Grid>
    </Grid>
  );

  const renderCustomerDashboard = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #43a047 0%, #81c784 100%)',
            color: 'white'
          }}
        >
          <FitnessCenter sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Đăng ký dịch vụ
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Xem danh sách huấn luyện viên và đăng ký dịch vụ
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/trainers"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Đăng ký ngay
          </Button>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
            color: 'white'
          }}
        >
          <Person sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Đăng ký của tôi
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Quản lý các đăng ký dịch vụ của bạn
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/my-registrations"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Xem đăng ký
          </Button>
        </Paper>
      </Grid>
      
      {/* Thiết bị phòng tập */}
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
            color: 'white'
          }}
        >
          <FitnessCenter sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Thiết bị phòng tập
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Xem danh sách thiết bị trong phòng tập
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/customer-equipment"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Xem thiết bị
          </Button>
        </Paper>
      </Grid>


<Grid item xs={12} sm={6} md={4} lg={2.4}>
  <Paper
    sx={{
      p: 3,
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f44336 0%, #ff7961 100%)',
      color: 'white'
    }}
  >
    <Newspaper sx={{ fontSize: 50, mb: 2 }} />
    <Typography variant="h5" component="h3" gutterBottom>
      Tin tức
    </Typography>
    <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
      Cập nhật thông tin mới nhất từ phòng tập
    </Typography>
    <Button
      variant="contained"
      component={Link}
      to="/news"
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)'
        }
      }}
    >
      Xem tin tức
    </Button>
  </Paper>
</Grid>
      
      {/* Phần phản hồi */}
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
            color: 'white'
          }}
        >
          <RateReview sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Đóng góp ý kiến
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Chia sẻ ý kiến của bạn để chúng tôi phục vụ bạn tốt hơn
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/feedback"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Gửi phản hồi
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderTrainerDashboard = () => {
    return (
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
              color: 'white',
              position: 'relative'
            }}
          >
            <People sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Khách hàng đăng ký dịch vụ
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
              Xem và quản lý đăng ký dịch vụ từ khách hàng
            </Typography>
            
            {/* Hiển thị số lượng đăng ký chờ xác nhận */}
            {pendingRegistrations > 0 && (
              <Chip
                label={`${pendingRegistrations} đăng ký mới`}
                color="error"
                sx={{ 
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  fontWeight: 'bold',
                  animation: 'pulse 1.5s infinite'
                }}
              />
            )}
            
            <Button
              variant="contained"
              component={Link}
              to="/trainer-registrations"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              Xem đăng ký
            </Button>
          </Paper>
        </Grid>
        
<Grid item xs={12} sm={6} md={4} lg={2.4}>
  <Paper
    sx={{
      p: 3,
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
      color: 'white'
    }}
  >
    <Newspaper sx={{ fontSize: 50, mb: 2 }} />
    <Typography variant="h5" component="h3" gutterBottom>
      Tin tức
    </Typography>
    <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
      Cập nhật thông tin mới nhất từ phòng tập
    </Typography>
    <Button
      variant="contained"
      component={Link}
      to="/news"
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)'
        }
      }}
    >
      Xem tin tức
    </Button>
  </Paper>
</Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)',
              color: 'white'
            }}
          >
            <Schedule sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Lịch làm việc
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
              Quản lý lịch làm việc và giờ dạy của bạn
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/my-schedule"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              Xem lịch làm việc
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #43a047 0%, #81c784 100%)',
              color: 'white'
            }}
          >
            <FitnessCenter sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Quản lý dịch vụ
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
              Quản lý và cá nhân hóa các dịch vụ bạn cung cấp
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/services/manage"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              Quản lý dịch vụ
            </Button>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // Render appropriate dashboard based on user role
  const renderDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return renderAdminDashboard();
      case 'receptionist':
        return renderReceptionistDashboard();
      case 'customer':
        return renderCustomerDashboard();
      case 'trainer':
        return renderTrainerDashboard();
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Box sx={backgroundStyle} />
      {/* Only show sidebar for admin and receptionist */}
      {showSidebar && <Sidebar />}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          ml: showSidebar ? `${SIDEBAR_WIDTH}px` : 0,
          mt: '64px', // Height of AppBar
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          position: 'relative', // Để hiển thị đúng thứ tự các lớp
          zIndex: 1 // Hiển thị trên nền
        }}
      >
        {renderDashboardContent()}
      </Box>
    </Box>
  );
};

export default Dashboard;