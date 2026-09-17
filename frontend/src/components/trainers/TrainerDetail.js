import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AlertContext from '../../contexts/alert/alertContext';
import api from '../../utils/api';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Grid,
  Chip,
  Avatar,
  Card,
  CardContent,
  CircularProgress,
  Rating
} from '@mui/material';
import {
  ArrowBack,
  Schedule,
  FitnessCenter,
  School,
  Star
} from '@mui/icons-material';

const TrainerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const res = await api.get(`/users/trainers/${id}`);
        setTrainer(res.data);
        setLoading(false);
      } catch (err) {
        setAlert('Không thể tải thông tin huấn luyện viên', 'error');
        navigate('/trainers');
      }
    };

    fetchTrainer();
    // eslint-disable-next-line
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!trainer) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">Không tìm thấy thông tin huấn luyện viên</Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/trainers')}
          sx={{ mt: 2 }}
        >
          Trở về danh sách huấn luyện viên
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/trainers')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h2" sx={{ flexGrow: 1 }}>
            Thông tin huấn luyện viên
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Schedule />}
            component={Link}
            to={`/trainers/${trainer._id}/schedule`}
          >
            Xem lịch làm việc
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Profile Section */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={trainer.user?.profileImage ? `http://localhost:5000${trainer.user.profileImage}` : ''}
                alt={trainer.user?.fullName}
                sx={{ width: 200, height: 200, mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                {trainer.user?.fullName}
              </Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <Rating
                  value={trainer.rating?.average || 0}
                  precision={0.5}
                  readOnly
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({trainer.rating?.count || 0} đánh giá)
                </Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                {trainer.experience} năm kinh nghiệm
              </Typography>
              <Box mt={2}>
                {trainer.specializations?.map((spec, index) => (
                  <Chip
                    key={index}
                    label={spec}
                    icon={<FitnessCenter />}
                    color="primary"
                    variant="outlined"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Thông tin liên hệ
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{trainer.user?.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Số điện thoại
                </Typography>
                <Typography variant="body1">{trainer.user?.phoneNumber}</Typography>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>
              Chứng chỉ
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {trainer.certifications?.length > 0 ? (
              <Grid container spacing={2}>
                {trainer.certifications.map((cert, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <School color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">{cert.name}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {cert.issuedBy} ({cert.year})
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">
                Không có thông tin chứng chỉ
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TrainerDetail;