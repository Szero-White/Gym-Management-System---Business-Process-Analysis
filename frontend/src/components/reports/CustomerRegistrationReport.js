// frontend/src/components/reports/CustomerRegistrationReport.js
import React, { useState, useEffect, useContext } from 'react';
import reportContext from '../../contexts/report/reportContext';
import AlertContext from '../../contexts/alert/alertContext';
import {
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import viLocale from 'date-fns/locale/vi';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Import chart components
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const CustomerRegistrationReport = () => {
  const reportCtx = useContext(reportContext);
  const alertCtx = useContext(AlertContext);

  const { customerStats, loading, getCustomerRegistrationStats } = reportCtx;
  const { setAlert } = alertCtx;

  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState(startOfMonth(subMonths(new Date(), 5)));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [chartData, setChartData] = useState([]);

  // Load data initially
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Transform data for charts when data changes
  useEffect(() => {
    prepareChartData();
  }, [customerStats, period]);

  const fetchData = async () => {
    try {
      await getCustomerRegistrationStats({
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    } catch (err) {
      setAlert('Không thể tải dữ liệu thống kê', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const prepareChartData = () => {
    if (!customerStats || customerStats.length === 0) {
      setChartData([]);
      return;
    }

    const formattedData = customerStats.map(stat => {
      let label = stat._id;
      
      // Format label based on period
      if (period === 'month' && stat._id.length === 7) {
        // Format YYYY-MM to MM/YYYY
        const [year, month] = stat._id.split('-');
        label = `${month}/${year}`;
      } else if (period === 'day' && stat._id.length === 10) {
        // Format YYYY-MM-DD to DD/MM
        const [year, month, day] = stat._id.split('-');
        label = `${day}/${month}`;
      } else if (period === 'week') {
        // Format week number to "Tuần X"
        label = `Tuần ${stat._id}`;
      }
      
      return {
        name: label,
        count: stat.count
      };
    });

    setChartData(formattedData);
  };

  // Calculate total customers
  const totalCustomers = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Thống kê khách hàng đăng ký
      </Typography>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="period-label">Thời gian</InputLabel>
                  <Select
                    labelId="period-label"
                    value={period}
                    label="Thời gian"
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <MenuItem value="day">Ngày</MenuItem>
                    <MenuItem value="week">Tuần</MenuItem>
                    <MenuItem value="month">Tháng</MenuItem>
                    <MenuItem value="year">Năm</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                  <DatePicker
                    label="Từ ngày"
                    value={startDate}
                    onChange={(date) => setStartDate(date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                  <DatePicker
                    label="Đến ngày"
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    minDate={startDate}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  Áp dụng
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tổng số khách hàng đăng ký
                  </Typography>
                  <Typography variant="h3">
                    {totalCustomers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: 'success.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Trung bình theo {period === 'day' ? 'ngày' : 
                                   period === 'week' ? 'tuần' : 
                                   period === 'month' ? 'tháng' : 'năm'}
                  </Typography>
                  <Typography variant="h3">
                    {chartData.length > 0 ? (totalCustomers / chartData.length).toFixed(1) : 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: 'info.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thời gian
                  </Typography>
                  <Typography variant="h6">
                    {format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {chartData.length > 0 ? (
            <Box sx={{ height: 400, mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Biểu đồ khách hàng đăng ký theo {period === 'day' ? 'ngày' : 
                                          period === 'week' ? 'tuần' : 
                                          period === 'month' ? 'tháng' : 'năm'}
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Số lượng khách hàng" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1">
                Không có dữ liệu trong khoảng thời gian đã chọn
              </Typography>
            </Box>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerRegistrationReport;