// frontend/src/components/reports/ReportDashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import CustomerRegistrationReport from './CustomerRegistrationReport';
import ServiceStatisticsReport from './ServiceStatisticsReport';

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ReportDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h2">
            Báo cáo thống kê
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
            <Tab label="Thống kê khách hàng đăng ký" />
            <Tab label="Thống kê dịch vụ" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <CustomerRegistrationReport />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ServiceStatisticsReport />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ReportDashboard;