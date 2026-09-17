import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';
import Navbar from './components/layout/Navbar';
import Alert from './components/common/Alert';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import CustomerList from './components/customers/CustomerList';
import CustomerForm from './components/customers/CustomerForm';
import TrainerList from './components/trainers/TrainerList';
import TrainerForm from './components/trainers/TrainerForm';
import StaffList from './components/staff/StaffList';
import StaffForm from './components/staff/StaffForm';
import EquipmentList from './components/equipment/EquipmentList';
import EquipmentForm from './components/equipment/EquipmentForm';
import EquipmentDetail from './components/equipment/EquipmentDetail';
import MaintenanceList from './components/maintenance/MaintenanceList';
import MaintenanceForm from './components/maintenance/MaintenanceForm';
import ScheduleList from './components/schedule/ScheduleList';
import ScheduleCalendar from './components/schedule/ScheduleCalendar';
import PrivateRoute from './components/common/PrivateRoute';
import AuthContext from './contexts/auth/authContext';
import TrainerScheduleView from './components/trainers/TrainerScheduleView';
import TrainerDetail from './components/trainers/TrainerDetail';
import TrainerServiceRegistration from './components/trainers/TrainerServiceRegistration';
import ServiceRegistrationForm from './components/services/ServiceRegistrationForm';
import MyRegistrations from './components/services/MyRegistrations';
import TrainerRegistrations from './components/services/TrainerRegistrations';
import ServiceList from './components/services/ServiceList';
import ServiceForm from './components/services/ServiceForm';
import ServiceManagement from './components/services/ServiceManagement';
import AuthState from './contexts/auth/AuthState';
import AlertState from './contexts/alert/AlertState';
import EquipmentState from './contexts/equipment/EquipmentState';
import ScheduleState from './contexts/schedule/ScheduleState';
import ServiceState from './contexts/service/ServiceState';
import FeedbackState from './contexts/feedback/FeedbackState';
import FeedbackList from './components/feedback/FeedbackList';
import MyFeedback from './components/feedback/MyFeedback';
import CustomerServiceList from './components/customers/CustomerServiceList';
import AddCustomerService from './components/customers/AddCustomerService';
import CustomerServiceState from './contexts/customerService/CustomerServiceState';
import CustomerServicesManagement from './components/customers/CustomerServicesManagement';
import ReportState from './contexts/report/ReportState';
import ReportDashboard from './components/reports/ReportDashboard';
import CustomerEquipmentList from './components/equipment/CustomerEquipmentList';
import NewsState from './contexts/news/NewsState';
import NewsList from './components/news/NewsList';
import NewsForm from './components/news/NewsForm';
import NewsDetail from './components/news/NewsDetail';

const AppContent = () => {
  const authContext = useContext(AuthContext);
  const { loadUser } = authContext;

  useEffect(() => {
    // Kiểm tra token và load user data khi ứng dụng khởi động
    if (localStorage.getItem('token')) {
      loadUser();
    }
  }, [loadUser]);

  return (
    <>
      <Navbar />
      <Box sx={{ mt: '64px' }}>
        <Alert />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Private Routes */}
          <Route
            path="/register"
            element={
              <PrivateRoute
                component={Register}
                roles={['admin', 'receptionist']}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute
                component={Dashboard}
                roles={['admin', 'receptionist', 'trainer', 'customer']}
              />
            }
          />
          <Route
            path="/customers"
            element={
              <PrivateRoute
                component={CustomerList}
                roles={['admin', 'receptionist']}
              />
            }
          />
          <Route
            path="/customers/add"
            element={
              <PrivateRoute
                component={CustomerForm}
                roles={['admin', 'receptionist']}
              />
            }
          />
          <Route
            path="/customers/edit/:id"
            element={
              <PrivateRoute
                component={CustomerForm}
                roles={['admin', 'receptionist']}
              />
            }
          />
          <Route
            path="/trainers"
            element={
              <PrivateRoute
                component={TrainerList}
                roles={['admin', 'receptionist', 'customer']}
              />
            }
          />
          <Route
            path="/trainers/add"
            element={
              <PrivateRoute
                component={TrainerForm}
                roles={['admin', 'receptionist']}
              />
            }
          />
          <Route
            path="/trainers/edit/:id"
            element={
              <PrivateRoute
                component={TrainerForm}
                roles={['admin', 'receptionist']}
              />
            }
          />
          
          {/* Staff Management Routes */}
          <Route
            path="/staff"
            element={
              <PrivateRoute
                component={StaffList}
                roles={['admin']}
              />
            }
          />
          <Route
            path="/staff/add"
            element={
              <PrivateRoute
                component={StaffForm}
                roles={['admin']}
              />
            }
          />
          <Route
            path="/staff/edit/:id"
            element={
              <PrivateRoute
                component={StaffForm}
                roles={['admin']}
              />
            }
          />
          <Route
    path="/feedback"
    element={
      <PrivateRoute
        component={MyFeedback}
        roles={['customer']}
      />
    }
  />
  
  <Route
    path="/admin/feedback"
    element={
      <PrivateRoute
        component={FeedbackList}
        roles={['admin', 'receptionist']}
      />
    }
  />
          
          {/* Equipment Management Routes */}
          <Route
            path="/equipment"
            element={
              <PrivateRoute
                component={EquipmentList}
                roles={['admin', 'receptionist']}
              />
            }
          />
          <Route
            path="/equipment/add"
            element={
              <PrivateRoute
                component={EquipmentForm}
                roles={['admin']}
              />
            }
          />
          <Route
            path="/equipment/edit/:id"
            element={
              <PrivateRoute
                component={EquipmentForm}
                roles={['admin']}
              />
            }
          />
          <Route
            path="/equipment/:id"
            element={
              <PrivateRoute
                component={EquipmentDetail}
                roles={['admin', 'receptionist']}
              />
            }
          />

<Route
  path="/customer-services-management"
  element={
    <PrivateRoute
      component={CustomerServicesManagement}
      roles={['admin', 'receptionist']}
    />
  }
/>
          
            {/* Customer Service Management Routes */}
<Route
  path="/customers/:customerId/services"
  element={
    <PrivateRoute
      component={CustomerServiceList}
      roles={['admin', 'receptionist']}
    />
  }
/>

<Route
  path="/customer-equipment"
  element={
    <PrivateRoute
      component={CustomerEquipmentList}
      roles={['customer']}
    />
  }
/>

<Route
  path="/customers/:customerId/services/add"
  element={
    <PrivateRoute
      component={AddCustomerService}
      roles={['admin', 'receptionist']}
    />
  }
/>

          {/* Maintenance Management Routes */}
          <Route
            path="/maintenance"
            element={
              <PrivateRoute
                component={MaintenanceList}
                roles={['admin', 'receptionist']}
              />
            }
          />
          <Route
            path="/maintenance/add"
            element={
              <PrivateRoute
                component={MaintenanceForm}
                roles={['admin']}
              />
            }
          />
          <Route
            path="/maintenance/add/:id"
            element={
              <PrivateRoute
                component={MaintenanceForm}
                roles={['admin']}
              />
            }
          />
          <Route
            path="/maintenance/:maintenanceId"
            element={
              <PrivateRoute
                component={MaintenanceForm}
                roles={['admin', 'receptionist']}
              />
            }
          />
          
          {/* Schedule Management Routes */}
          <Route
            path="/schedule"
            element={
              <PrivateRoute
                component={ScheduleList}
                roles={['admin', 'trainer']}
              />
            }
          />
          <Route
            path="/schedule/:id"
            element={
              <PrivateRoute
                component={ScheduleList}
                roles={['admin', 'receptionist', 'trainer']}
              />
            }
          />
          <Route
            path="/my-schedule"
            element={
              <PrivateRoute
                component={ScheduleCalendar}
                roles={['trainer']}
              />
            }
          />

          <Route
            path="/trainers/:id"
            element={
              <PrivateRoute
                component={TrainerDetail}
                roles={['admin', 'receptionist', 'customer']}
              />
            }
          />
          <Route
            path="/trainers/:id/schedule"
            element={
              <PrivateRoute
                component={TrainerScheduleView}
                roles={['admin', 'receptionist', 'customer', 'trainer']}
              />
            }
          />
          
          {/* Service Routes - NEW */}
          <Route
            path="/services"
            element={
              <PrivateRoute
                component={ServiceList}
                roles={['admin', 'receptionist', 'trainer', 'customer']}
              />
            }
          />
          <Route
            path="/services/manage"
            element={
              <PrivateRoute
                component={ServiceManagement}
                roles={['admin', 'trainer']}
              />
            }
          />
          <Route
            path="/services/trainer/:trainerId"
            element={
              <PrivateRoute
                component={ServiceList}
                roles={['admin', 'receptionist', 'trainer', 'customer']}
              />
            }
          />
          <Route
            path="/services/add"
            element={
              <PrivateRoute
                component={ServiceForm}
                roles={['admin', 'trainer']}
              />
            }
          />

<Route
  path="/reports"
  element={
    <PrivateRoute
      component={ReportDashboard}
      roles={['admin']}
    />
  }
/>
          <Route
            path="/services/edit/:id"
            element={
              <PrivateRoute
                component={ServiceForm}
                roles={['admin', 'trainer']}
              />
            }
          />
          
          {/* Service Registration Routes */}
          <Route
            path="/service-registration/trainer/:trainerId"
            element={
              <PrivateRoute
                component={TrainerServiceRegistration}
                roles={['customer']}
              />
            }
          />
          <Route
            path="/service-registration/:serviceId"
            element={
              <PrivateRoute
                component={ServiceRegistrationForm}
                roles={['customer', 'admin', 'receptionist']}
              />
            }
          />
          <Route
            path="/my-registrations"
            element={
              <PrivateRoute
                component={MyRegistrations}
                roles={['customer']}
              />
            }
          />
          <Route
            path="/trainer-registrations"
            element={
              <PrivateRoute
                component={TrainerRegistrations}
                roles={['trainer']}
              />
            }
          />

          {/* News Management Routes */}
<Route
  path="/news"
  element={
    <PrivateRoute
      component={NewsList}
      roles={['admin', 'receptionist', 'trainer', 'customer']}
    />
  }
/>
<Route
  path="/news/add"
  element={
    <PrivateRoute
      component={NewsForm}
      roles={['admin', 'receptionist']}
    />
  }
/>
<Route
  path="/news/edit/:id"
  element={
    <PrivateRoute
      component={NewsForm}
      roles={['admin', 'receptionist']}
    />
  }
/>
<Route
  path="/news/:id"
  element={
    <PrivateRoute
      component={NewsDetail}
      roles={['admin', 'receptionist', 'trainer', 'customer']}
    />
  }
/>
          
          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Box>
    </>
  );
};

const App = () => {
  // Tạo theme
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
      default: 'transparent', // Thay đổi ở đây
    },
    },
  });

  return (
    <AuthState>
  <AlertState>
    <EquipmentState>
      <ScheduleState>
        <ServiceState>
          <FeedbackState>
            <CustomerServiceState>
              <ReportState>
                <NewsState>
                  <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Router>
                      <AppContent />
                    </Router>
                  </ThemeProvider>
                </NewsState>
              </ReportState>
            </CustomerServiceState>
          </FeedbackState>
        </ServiceState>
      </ScheduleState>
    </EquipmentState>
  </AlertState>
</AuthState>
  );
};

export default App;