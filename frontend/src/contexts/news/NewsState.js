import React, { useReducer, useCallback } from 'react';
import newsContext from './newsContext';
import newsReducer from './newsReducer';
import api from '../../utils/api';
import {
  GET_NEWS,
  GET_NEWS_DETAIL,
  ADD_NEWS,
  UPDATE_NEWS,
  DELETE_NEWS,
  TOGGLE_FEATURED,
  TOGGLE_ACTIVE,
  NEWS_ERROR,
  CLEAR_NEWS,
  SET_LOADING
} from './types';

const NewsState = props => {
  const initialState = {
    news: [],
    currentNews: null,
    loading: false,
    error: null
  };

  const [state, dispatch] = useReducer(newsReducer, initialState);

  // Set loading
  const setLoading = useCallback(() => {
    dispatch({ type: SET_LOADING });
  }, []);

  // Get all news with optional filters
  const getNews = useCallback(async (filters = {}) => {
    setLoading();
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters.featured !== undefined) {
        queryParams.append('featured', filters.featured);
      }
      
      if (filters.active !== undefined) {
        queryParams.append('active', filters.active);
      }
      
      if (filters.category) {
        queryParams.append('category', filters.category);
      }
      
      if (filters.limit) {
        queryParams.append('limit', filters.limit);
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/news?${queryString}` : '/news';
      
      const res = await api.get(url);
      
      dispatch({
        type: GET_NEWS,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: NEWS_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải danh sách tin tức'
      });
      throw err;
    }
  }, [setLoading]);

  // Get news by ID
  const getNewsById = useCallback(async (id) => {
    setLoading();
    
    try {
      const res = await api.get(`/news/${id}`);
      
      dispatch({
        type: GET_NEWS_DETAIL,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: NEWS_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải thông tin tin tức'
      });
      throw err;
    }
  }, [setLoading]);

  // Add news
  const addNews = useCallback(async (formData) => {
    setLoading();
    
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const res = await api.post('/news', formData, config);
      
      dispatch({
        type: ADD_NEWS,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: NEWS_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi thêm tin tức'
      });
      throw err;
    }
  }, [setLoading]);

  // Update news
  const updateNews = useCallback(async (id, formData) => {
    setLoading();
    
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const res = await api.put(`/news/${id}`, formData, config);
      
      dispatch({
        type: UPDATE_NEWS,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: NEWS_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi cập nhật tin tức'
      });
      throw err;
    }
  }, [setLoading]);

  // Delete news
  const deleteNews = useCallback(async (id) => {
    setLoading();
    
    try {
      await api.delete(`/news/${id}`);
      
      dispatch({
        type: DELETE_NEWS,
        payload: id
      });
    } catch (err) {
      dispatch({
        type: NEWS_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi xóa tin tức'
      });
      throw err;
    }
  }, [setLoading]);

  // Toggle featured status
  const toggleFeatured = useCallback(async (id) => {
    setLoading();
    
    try {
      const res = await api.put(`/news/${id}/featured`);
      
      dispatch({
        type: TOGGLE_FEATURED,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: NEWS_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi thay đổi trạng thái nổi bật'
      });
      throw err;
    }
  }, [setLoading]);

  // Toggle active status
  const toggleActive = useCallback(async (id) => {
    setLoading();
    
    try {
      const res = await api.put(`/news/${id}/active`);
      
      dispatch({
        type: TOGGLE_ACTIVE,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: NEWS_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi thay đổi trạng thái hoạt động'
      });
      throw err;
    }
  }, [setLoading]);

  // Clear current news
  const clearNews = useCallback(() => {
    dispatch({ type: CLEAR_NEWS });
  }, []);

  return (
    <newsContext.Provider
      value={{
        news: state.news,
        currentNews: state.currentNews,
        loading: state.loading,
        error: state.error,
        getNews,
        getNewsById,
        addNews,
        updateNews,
        deleteNews,
        toggleFeatured,
        toggleActive,
        clearNews
      }}
    >
      {props.children}
    </newsContext.Provider>
  );
};

export default NewsState;