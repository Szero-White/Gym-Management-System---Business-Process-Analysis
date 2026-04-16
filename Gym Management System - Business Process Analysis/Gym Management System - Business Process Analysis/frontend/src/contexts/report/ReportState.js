// frontend/src/contexts/report/ReportState.js
import React, { useReducer, useCallback } from 'react';
import reportContext from './reportContext';
import reportReducer from './reportReducer';
import api from '../../utils/api';
import {
  GET_CUSTOMER_REGISTRATION_STATS,
  GET_SERVICE_REGISTRATION_STATS,
  REPORT_ERROR,
  CLEAR_REPORT,
  SET_LOADING
} from './types';

const ReportState = props => {
  const initialState = {
    customerStats: [],
    serviceStats: [],
    trainerStats: [],
    loading: false,
    error: null
  };

  const [state, dispatch] = useReducer(reportReducer, initialState);

  // Set loading
  const setLoading = useCallback(() => {
    dispatch({ type: SET_LOADING });
  }, []);

  // Lấy thống kê khách hàng đăng ký
  const getCustomerRegistrationStats = useCallback(async (params = {}) => {
    setLoading();
    
    try {
      const queryParams = new URLSearchParams(params);
      const res = await api.get(`/reports/customer-registrations?${queryParams}`);
      
      dispatch({
        type: GET_CUSTOMER_REGISTRATION_STATS,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: REPORT_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải thống kê đăng ký khách hàng'
      });
      throw err;
    }
  }, [setLoading]);

  // Lấy thống kê dịch vụ đăng ký
  const getServiceRegistrationStats = useCallback(async (params = {}) => {
    setLoading();
    
    try {
      const queryParams = new URLSearchParams(params);
      const res = await api.get(`/reports/service-registrations?${queryParams}`);
      
      dispatch({
        type: GET_SERVICE_REGISTRATION_STATS,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: REPORT_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải thống kê dịch vụ'
      });
      throw err;
    }
  }, [setLoading]);

  // Clear report data
  const clearReport = useCallback(() => {
    dispatch({ type: CLEAR_REPORT });
  }, []);

  return (
    <reportContext.Provider
      value={{
        customerStats: state.customerStats,
        serviceStats: state.serviceStats,
        trainerStats: state.trainerStats,
        loading: state.loading,
        error: state.error,
        getCustomerRegistrationStats,
        getServiceRegistrationStats,
        clearReport
      }}
    >
      {props.children}
    </reportContext.Provider>
  );
};

export default ReportState;