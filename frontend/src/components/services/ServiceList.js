import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AlertContext from '../../contexts/alert/alertContext';
import AuthContext from '../../contexts/auth/authContext';
import ServiceContext from '../../contexts/service/serviceContext';
import api from '../../utils/api';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar
} from '@mui/material';
import { Search, Add, FitnessCenter, PersonSearch, ArrowBack } from '@mui/icons-material';

const ServiceList = () => {
  const { trainerId } = useParams();
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);
  const serviceContext = useContext(ServiceContext);
  const navigate = useNavigate();

  const { setAlert } = alertContext;
  const { user } = authContext;
  const { getServices, services, loading } = serviceContext;

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [trainer, setTrainer] = useState(null);
  const [loadingTrainer, setLoadingTrainer] = useState(false);

  const isAdmin = user && user.role === 'admin';
  const isTrainer = user && user.role === 'trainer';
  const isCustomer = user && user.role === 'customer';

  useEffect(() => {
    const loadData = async () => {
      try {
        // If trainerId is provided, get services for that trainer and fetch trainer details
        if (trainerId) {
          setLoadingTrainer(true);
          
          // Get trainer details
          const trainerRes = await api.get(`/users/trainers/${trainerId}`);
          setTrainer(trainerRes.data);
          
          // Get services for this trainer
          await getServices({ trainerId });
          
          setLoadingTrainer(false);
        } else {
          // Otherwise, get all services
          await getServices();
        }
      } catch (err) {
        setAlert('Không thể tải danh sách dịch vụ', 'error');
        if (trainerId) {
          setLoadingTrainer(false);
        }
      }
    };

    loadData();
    // eslint-disable-next-line
  }, [trainerId]);

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDuration = (weeks) => {
    // Chuyển từ phút sang tuần
    return `${weeks} tuần`;
  };

  const getCategoryLabel = (category) => {
    const categoryMap = {
      'personal': 'Cá nhân',
      'group': 'Nhóm',
      'special': 'Đặc biệt'
    };
    return categoryMap[category] || category;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'personal': 'primary',
      'group': 'success',
      'special': 'secondary'
    };
    return colorMap[category] || 'default';
  };

  const filteredServices = services.filter(service => {
    // Filter by search term
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  if (loading || loadingTrainer) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(trainerId ? '/trainers' : '/dashboard')}
              sx={{ mr: 2 }}
            >
              Quay lại
            </Button>
            <Typography variant="h4" component="h2">
              {trainerId 
                ? `Dịch vụ của ${trainer?.user?.fullName || 'huấn luyện viên'}` 
                : 'Danh sách dịch vụ'}
            </Typography>
          </Box>
          
          {/* Show different buttons based on user role */}
          <Box>
            {isAdmin && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                component={Link}
                to="/services/add"
              >
                Thêm dịch vụ mới
              </Button>
            )}
            
            {isTrainer && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                component={Link}
                to="/services/manage"
              >
                Quản lý dịch vụ
              </Button>
            )}
            
            {isCustomer && !trainerId && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonSearch />}
                component={Link}
                to="/trainers"
              >
                Tìm huấn luyện viên
              </Button>
            )}
          </Box>
        </Box>

        {/* Display trainer info if viewing trainer-specific services */}
        {trainerId && trainer && (
          <Box mb={4}>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={2}>
                    <Avatar
                      src={trainer?.user?.profileImage ? `http://localhost:5000${trainer.user.profileImage}` : ''}
                      alt={trainer?.user?.fullName}
                      sx={{ width: 100, height: 100, mx: 'auto' }}
                    />
                  </Grid>
                  <Grid item xs={12} md={10}>
                    <Typography variant="h5" gutterBottom>
                      {trainer?.user?.fullName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {trainer?.experience} năm kinh nghiệm
                    </Typography>
                    <Box>
                      {trainer?.specializations?.map((spec, index) => (
                        <Chip
                          key={index}
                          label={spec}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="category-filter-label">Danh mục</InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                label="Danh mục"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="personal">Cá nhân</MenuItem>
                <MenuItem value="group">Nhóm</MenuItem>
                <MenuItem value="special">Đặc biệt</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {filteredServices.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            {trainerId 
              ? 'Huấn luyện viên này chưa có dịch vụ nào.'
              : 'Không tìm thấy dịch vụ nào phù hợp với tìm kiếm của bạn.'}
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredServices.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {service.name}
                      </Typography>
                      <Chip 
                        label={getCategoryLabel(service.category)} 
                        color={getCategoryColor(service.category)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {service.description}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FitnessCenter fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2">
                          {formatDuration(service.duration)}
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="primary.main">
                        {formatCurrency(service.price)}
                      </Typography>
                    </Box>
                    
                    {/* Display trainer info if available and not on trainer page */}
                    {service.trainerId && !trainerId && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={service.trainerId.user?.profileImage 
                            ? `http://localhost:5000${service.trainerId.user.profileImage}` 
                            : ''}
                          alt="trainer"
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {service.trainerId.user?.fullName || 'Huấn luyện viên'}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {isCustomer && (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth
                        component={Link}
                        to={`/service-registration/${service._id}`}
                      >
                        Đăng ký
                      </Button>
                    )}
                    {(isAdmin || (isTrainer && service.trainerId && 
                        user.id === service.trainerId.user?._id)) && (
                      <Button 
                        variant="outlined"
                        color="primary"
                        component={Link}
                        to={`/services/edit/${service._id}`}
                      >
                        Chỉnh sửa
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default ServiceList;