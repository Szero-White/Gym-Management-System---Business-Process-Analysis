// frontend/src/contexts/feedback/FeedbackState.js
import React, { useReducer, useCallback } from 'react';
import feedbackContext from './feedbackContext';
import feedbackReducer from './feedbackReducer';
import api from '../../utils/api';
import {
  GET_FEEDBACK,
  GET_MY_FEEDBACK,
  GET_FEEDBACK_DETAIL,
  ADD_FEEDBACK,
  DELETE_FEEDBACK,
  MARK_FEEDBACK_READ,
  FEEDBACK_ERROR,
  CLEAR_FEEDBACK,
  GET_UNREAD_COUNT,
  SET_LOADING
} from './types';

const FeedbackState = props => {
  const initialState = {
    feedback: [],
    myFeedback: [],
    currentFeedback: null,
    unreadCount: 0,
    loading: false,
    error: null
  };

  const [state, dispatch] = useReducer(feedbackReducer, initialState);

  // Set loading
  const setLoading = useCallback(() => {
    dispatch({ type: SET_LOADING });
  }, []);

  // Get all feedback (admin, receptionist)
  const getAllFeedback = useCallback(async () => {
    setLoading();
    
    try {
      const res = await api.get('/feedback');
      
      dispatch({
        type: GET_FEEDBACK,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: FEEDBACK_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải danh sách phản hồi'
      });
    }
  }, [setLoading]);

  // Get my feedback (customer)
  const getMyFeedback = useCallback(async () => {
    setLoading();
    
    try {
      const res = await api.get('/feedback/my-feedback');
      
      dispatch({
        type: GET_MY_FEEDBACK,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: FEEDBACK_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải phản hồi của bạn'
      });
    }
  }, [setLoading]);

  // Get feedback by id
  const getFeedbackById = useCallback(async (id) => {
    setLoading();
    
    try {
      const res = await api.get(`/feedback/${id}`);
      
      dispatch({
        type: GET_FEEDBACK_DETAIL,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: FEEDBACK_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải thông tin phản hồi'
      });
    }
  }, [setLoading]);

  // Add feedback
  const addFeedback = useCallback(async (feedbackData) => {
    setLoading();
    
    try {
      const res = await api.post('/feedback', feedbackData);
      
      dispatch({
        type: ADD_FEEDBACK,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: FEEDBACK_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi gửi phản hồi'
      });
      throw err;
    }
  }, [setLoading]);

  // Delete feedback
  const deleteFeedback = useCallback(async (id) => {
    setLoading();
    
    try {
      await api.delete(`/feedback/${id}`);
      
      dispatch({
        type: DELETE_FEEDBACK,
        payload: id
      });
    } catch (err) {
      dispatch({
        type: FEEDBACK_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi xóa phản hồi'
      });
    }
  }, [setLoading]);

  // Mark feedback as read
  const markFeedbackAsRead = useCallback(async (id) => {
    try {
      const res = await api.put(`/feedback/${id}/mark-read`);
      
      dispatch({
        type: MARK_FEEDBACK_READ,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: FEEDBACK_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi đánh dấu đã đọc'
      });
    }
  }, []);

  // Get unread feedback count
  const getUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/feedback/unread-count');
      
      dispatch({
        type: GET_UNREAD_COUNT,
        payload: res.data.count
      });
    } catch (err) {
      dispatch({
        type: FEEDBACK_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải số lượng phản hồi chưa đọc'
      });
    }
  }, []);

  // Clear current feedback
  const clearFeedback = useCallback(() => {
    dispatch({ type: CLEAR_FEEDBACK });
  }, []);

  return (
    <feedbackContext.Provider
      value={{
        feedback: state.feedback,
        myFeedback: state.myFeedback,
        currentFeedback: state.currentFeedback,
        unreadCount: state.unreadCount,
        loading: state.loading,
        error: state.error,
        getAllFeedback,
        getMyFeedback,
        getFeedbackById,
        addFeedback,
        deleteFeedback,
        markFeedbackAsRead,
        getUnreadCount,
        clearFeedback
      }}
    >
      {props.children}
    </feedbackContext.Provider>
  );
};

export default FeedbackState;