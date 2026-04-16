// frontend/src/components/reports/ServiceStatisticsReport.js
import React, { useState, useEffect, useContext } from 'react';
import reportContext from '../../contexts/report/reportContext';
import AlertContext from '../../contexts/alert/alertContext';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import viLocale from 'date-fns/locale/vi';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#8dd1e1', '#82ca9d', '#a4de6c'];

const ServiceStatisticsReport = () => {
  const reportCtx = useContext(reportContext);
  const alertCtx = useContext(AlertContext);

  const { serviceStats, trainerStats, loading, getServiceRegistrationStats } = reportCtx;
  const { setAlert } = alertCtx;

  const [startDate, setStartDate] = useState(startOfMonth(subMonths(new Date(), 5)));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [serviceChartData, setServiceChartData] = useState([]);
  const [trainerChartData, setTrainerChartData] = useState([]);

  // Load data initially
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Transform data for charts when data changes
  useEffect(() => {
    prepareChartData();
    // frontend/src/components/reports/ServiceStatisticsReport.js (tiếp theo)
 }, [serviceStats, trainerStats]);

 const fetchData = async () => {
   try {
     await getServiceRegistrationStats({
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
   if (!serviceStats || serviceStats.length === 0) {
     setServiceChartData([]);
   } else {
     // Lấy tối đa 10 dịch vụ hàng đầu
     const topServices = serviceStats.slice(0, 10).map(stat => ({
       name: stat.serviceName,
       value: stat.count,
       sessions: stat.totalSessions,
       revenue: stat.revenue,
       trainer: stat.trainerName || 'Không có huấn luyện viên'
     }));
     setServiceChartData(topServices);
   }

   if (!trainerStats || trainerStats.length === 0) {
     setTrainerChartData([]);
   } else {
     // Lấy tối đa 10 huấn luyện viên hàng đầu
     const topTrainers = trainerStats.slice(0, 10).map(stat => ({
       name: stat.trainerName,
       value: stat.count,
       sessions: stat.totalSessions,
       revenue: stat.revenue
     }));
     setTrainerChartData(topTrainers);
   }
 };

 // Format currency
 const formatCurrency = (value) => {
   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
 };

 // Tính tổng doanh thu
 const totalRevenue = trainerStats?.reduce((total, stat) => total + stat.revenue, 0) || 0;
 const totalRegistrations = trainerStats?.reduce((total, stat) => total + stat.count, 0) || 0;

 return (
   <div>
     <Typography variant="h5" gutterBottom>
       Thống kê dịch vụ
     </Typography>

     <Card variant="outlined" sx={{ mb: 4 }}>
       <CardContent>
         <form onSubmit={handleSubmit}>
           <Grid container spacing={3} alignItems="center">
             <Grid item xs={12} md={4}>
               <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                 <DatePicker
                   label="Từ ngày"
                   value={startDate}
                   onChange={(date) => setStartDate(date)}
                   renderInput={(params) => <TextField {...params} fullWidth />}
                 />
               </LocalizationProvider>
             </Grid>
             
             <Grid item xs={12} md={4}>
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
             
             <Grid item xs={12} md={4}>
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
                   Tổng số đăng ký
                 </Typography>
                 <Typography variant="h3">
                   {totalRegistrations}
                 </Typography>
               </CardContent>
             </Card>
           </Grid>
           
           <Grid item xs={12} md={4}>
             <Card sx={{ backgroundColor: 'success.main', color: 'white' }}>
               <CardContent>
                 <Typography variant="h6" gutterBottom>
                   Tổng doanh thu
                 </Typography>
                 <Typography variant="h3">
                   {formatCurrency(totalRevenue)}
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

         <Typography variant="h6" gutterBottom>
           Dịch vụ được đăng ký nhiều nhất
         </Typography>

         {serviceChartData.length > 0 ? (
           <>
             <Grid container spacing={3}>
               <Grid item xs={12} md={6}>
                 <Box sx={{ height: 400, mb: 4 }}>
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={serviceChartData}
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                         label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                         outerRadius={120}
                         fill="#8884d8"
                         dataKey="value"
                       >
                         {serviceChartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip formatter={(value, name, props) => [`${value} đăng ký`, props.payload.name]} />
                       <Legend />
                     </PieChart>
                   </ResponsiveContainer>
                 </Box>
               </Grid>
               
               <Grid item xs={12} md={6}>
                 <Box sx={{ height: 400, mb: 4 }}>
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart
                       data={serviceChartData}
                       layout="vertical"
                       margin={{
                         top: 5,
                         right: 30,
                         left: 100,
                         bottom: 5,
                       }}
                     >
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis type="number" />
                       <YAxis dataKey="name" type="category" width={100} />
                       <Tooltip formatter={(value, name) => [value, name === 'value' ? 'Đăng ký' : 'Buổi tập']} />
                       <Legend />
                       <Bar dataKey="value" name="Đăng ký" fill="#8884d8" />
                       <Bar dataKey="sessions" name="Buổi tập" fill="#82ca9d" />
                     </BarChart>
                   </ResponsiveContainer>
                 </Box>
               </Grid>
             </Grid>

             <TableContainer component={Paper} sx={{ mb: 4 }}>
               <Table aria-label="services statistics table">
                 <TableHead>
                   <TableRow>
                     <TableCell>Tên dịch vụ</TableCell>
                     <TableCell>Loại dịch vụ</TableCell>
                     <TableCell>Huấn luyện viên</TableCell>
                     <TableCell align="right">Số đăng ký</TableCell>
                     <TableCell align="right">Số buổi tập</TableCell>
                     <TableCell align="right">Doanh thu</TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   {serviceStats.map((stat) => (
                     <TableRow key={stat._id}>
                       <TableCell component="th" scope="row">
                         {stat.serviceName}
                       </TableCell>
                       <TableCell>
                         <Chip
                           label={
                             stat.serviceCategory === 'personal' ? 'Cá nhân' :
                             stat.serviceCategory === 'group' ? 'Nhóm' : 'Đặc biệt'
                           }
                           color={
                             stat.serviceCategory === 'personal' ? 'primary' :
                             stat.serviceCategory === 'group' ? 'success' : 'secondary'
                           }
                           size="small"
                         />
                       </TableCell>
                       <TableCell>{stat.trainerName || 'Không có'}</TableCell>
                       <TableCell align="right">{stat.count}</TableCell>
                       <TableCell align="right">{stat.totalSessions}</TableCell>
                       <TableCell align="right">{formatCurrency(stat.revenue)}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </TableContainer>
           </>
         ) : (
           <Box sx={{ py: 4, textAlign: 'center' }}>
             <Typography variant="body1">
               Không có dữ liệu dịch vụ trong khoảng thời gian đã chọn
             </Typography>
           </Box>
         )}

         <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
           Huấn luyện viên có nhiều đăng ký nhất
         </Typography>

         {trainerChartData.length > 0 ? (
           <>
             <Grid container spacing={3}>
               <Grid item xs={12} md={6}>
                 <Box sx={{ height: 400, mb: 4 }}>
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={trainerChartData}
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                         label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                         outerRadius={120}
                         fill="#8884d8"
                         dataKey="value"
                       >
                         {trainerChartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip formatter={(value, name, props) => [`${value} đăng ký`, props.payload.name]} />
                       <Legend />
                     </PieChart>
                   </ResponsiveContainer>
                 </Box>
               </Grid>
               
               <Grid item xs={12} md={6}>
                 <Box sx={{ height: 400, mb: 4 }}>
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart
                       data={trainerChartData}
                       layout="vertical"
                       margin={{
                         top: 5,
                         right: 30,
                         left: 100,
                         bottom: 5,
                       }}
                     >
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis type="number" />
                       <YAxis dataKey="name" type="category" width={100} />
                       <Tooltip formatter={(value, name) => [
                         name === 'value' ? `${value} đăng ký` : 
                         name === 'sessions' ? `${value} buổi tập` : 
                         formatCurrency(value),
                         name === 'value' ? 'Đăng ký' : 
                         name === 'sessions' ? 'Buổi tập' : 
                         'Doanh thu'
                       ]} />
                       <Legend />
                       <Bar dataKey="value" name="Đăng ký" fill="#8884d8" />
                       <Bar dataKey="sessions" name="Buổi tập" fill="#82ca9d" />
                     </BarChart>
                   </ResponsiveContainer>
                 </Box>
               </Grid>
             </Grid>

             <TableContainer component={Paper}>
               <Table aria-label="trainers statistics table">
                 <TableHead>
                   <TableRow>
                     <TableCell>Huấn luyện viên</TableCell>
                     <TableCell align="right">Số đăng ký</TableCell>
                     <TableCell align="right">Số buổi tập</TableCell>
                     <TableCell align="right">Doanh thu</TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   {trainerStats.map((stat) => (
                     <TableRow key={stat._id}>
                       <TableCell component="th" scope="row">
                         {stat.trainerName}
                       </TableCell>
                       <TableCell align="right">{stat.count}</TableCell>
                       <TableCell align="right">{stat.totalSessions}</TableCell>
                       <TableCell align="right">{formatCurrency(stat.revenue)}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </TableContainer>
           </>
         ) : (
           <Box sx={{ py: 4, textAlign: 'center' }}>
             <Typography variant="body1">
               Không có dữ liệu huấn luyện viên trong khoảng thời gian đã chọn
             </Typography>
           </Box>
         )}
       </>
     )}
   </div>
 );
};

export default ServiceStatisticsReport;