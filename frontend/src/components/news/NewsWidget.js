import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import NewsContext from '../../contexts/news/newsContext';
import {
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  Skeleton,
  Button
} from '@mui/material';
import { 
  Star, 
  CalendarToday,
  RemoveRedEye
} from '@mui/icons-material';

const NewsWidget = ({ maxItems = 3, showFeaturedOnly = false, title = "Tin tức mới nhất" }) => {
  const newsContext = useContext(NewsContext);
  const { getNews } = newsContext;
  
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const filters = {
          active: true,
          limit: maxItems
        };
        
        if (showFeaturedOnly) {
          filters.featured = true;
        }
        
        const results = await getNews(filters);
        setNews(results);
        setLoading(false);
      } catch (err) {
        console.error('Error loading news:', err);
        setLoading(false);
      }
    };
    
    fetchNews();
  }, [getNews, maxItems, showFeaturedOnly]);
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Translate category
  const translateCategory = (category) => {
    switch (category) {
      case 'announcement':
        return 'Thông báo';
      case 'promotion':
        return 'Khuyến mãi';
      case 'event':
        return 'Sự kiện';
      case 'other':
        return 'Khác';
      default:
        return category;
    }
  };
  
  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'announcement':
        return 'primary';
      case 'promotion':
        return 'secondary';
      case 'event':
        return 'success';
      case 'other':
        return 'default';
      default:
        return 'default';
    }
  };
  
  // Loading skeleton
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(maxItems)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={32} width="80%" />
              <Skeleton variant="text" height={20} width="40%" />
              <Skeleton variant="text" height={20} width="60%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
  
  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>{title}</Typography>
        <LoadingSkeleton />
      </Box>
    );
  }
  
  if (news.length === 0) {
    return null; // Don't show anything if no news
  }
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">{title}</Typography>
        <Button component={Link} to="/news" color="primary">
          Xem tất cả
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {news.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea component={Link} to={`/news/${item._id}`}>
                <CardMedia
                  component="img"
                  height="140"
                  image={item.image ? `http://localhost:5000${item.image}` : 'https://via.placeholder.com/300x200?text=Không+có+ảnh'}
                  alt={item.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Chip
                      size="small"
                      label={translateCategory(item.category)}
                      color={getCategoryColor(item.category)}
                    />
                    {item.featured && (
                      <Chip
                        size="small"
                        icon={<Star />}
                        label="Nổi bật"
                        color="warning"
                      />
                    )}
                  </Box>
                  
                  <Typography variant="h6" component="h3" gutterBottom>
                    {item.title.length > 60 
                      ? `${item.title.substring(0, 60)}...` 
                      : item.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.content.length > 80 
                      ? `${item.content.substring(0, 80)}...` 
                      : item.content}
                  </Typography>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      <CalendarToday fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      {formatDate(item.createdAt)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <RemoveRedEye fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      {item.viewCount}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NewsWidget;