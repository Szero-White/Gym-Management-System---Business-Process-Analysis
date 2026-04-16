import React, { useReducer, useCallback } from 'react';
import customerServiceContext from './customerServiceContext';
import customerServiceReducer from './customerServiceReducer';
import api from '../../utils/api';
import {
  GET_CUSTOMER_SERVICES,
  GET_SERVICE_SUMMARY,
  ADD_CUSTOMER_SERVICE,
  UPDATE_CUSTOMER_SERVICE,
  DELETE_CUSTOMER_SERVICE,
  CUSTOMER_SERVICE_ERROR,
  CLEAR_CUSTOMER_SERVICE,
  SET_LOADING
} from './types';

const CustomerServiceState = props => {
  const initialState = {
    customerServices: [],
    serviceSummary: null,
    loading: false,
    error: null
  };

  const [state, dispatch] = useReducer(customerServiceReducer, initialState);

  // Set loading
  const setLoading = useCallback(() => {
    dispatch({ type: SET_LOADING });
  }, []);

  // Get customer's services
  const getCustomerServices = useCallback(async (customerId) => {
    setLoading();
    
    try {
      const res = await api.get(`/customer-services/${customerId}`);
      
      dispatch({
        type: GET_CUSTOMER_SERVICES,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: CUSTOMER_SERVICE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải danh sách dịch vụ của khách hàng'
      });
      throw err;
    }
  }, [setLoading]);

  // Get service summary
  const getServiceSummary = useCallback(async (customerId) => {
    setLoading();
    
    try {
      const res = await api.get(`/customer-services/${customerId}/summary`);
      
      dispatch({
        type: GET_SERVICE_SUMMARY,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: CUSTOMER_SERVICE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải tổng quan dịch vụ'
      });
      throw err;
    }
  }, [setLoading]);

  // Trong file contexts/customerService/CustomerServiceState.js
// Trong file contexts/customerService/CustomerServiceState.js
const addCustomerService = useCallback(async (customerId, serviceData) => {
  setLoading();
  
  try {
    // Đảm bảo số buổi (numberOfSessions) là số nguyên
    const dataToSend = {
      ...serviceData,
      numberOfSessions: parseInt(serviceData.numberOfSessions)
    };
    
    // Chuyển đổi ngày thành chuỗi ISO nếu là đối tượng Date
    if (dataToSend.startDate instanceof Date) {
      dataToSend.startDate = dataToSend.startDate.toISOString();
    }
    
    console.log('Sending data:', dataToSend); // Log dữ liệu gửi đi để debug
    
    const res = await api.post(`/customer-services/${customerId}`, dataToSend);
    
    dispatch({
      type: ADD_CUSTOMER_SERVICE,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    console.error('Error details:', err.response?.data || err.message);
    
    dispatch({
      type: CUSTOMER_SERVICE_ERROR,
      payload: err.response?.data?.message || 'Lỗi khi thêm dịch vụ cho khách hàng'
    });
    throw err;
  }
}, [setLoading]);

  // Update customer service
  const updateCustomerService = useCallback(async (registrationId, updateData) => {
    setLoading();
    
    try {
      const res = await api.put(`/customer-services/${registrationId}`, updateData);
      
      dispatch({
        type: UPDATE_CUSTOMER_SERVICE,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: CUSTOMER_SERVICE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi cập nhật dịch vụ'
      });
      throw err;
    }
  }, [setLoading]);

  // Delete customer service
  const deleteCustomerService = useCallback(async (registrationId) => {
    setLoading();
    
    try {
      await api.delete(`/customer-services/${registrationId}`);
      
      dispatch({
        type: DELETE_CUSTOMER_SERVICE,
        payload: registrationId
      });
    } catch (err) {
      dispatch({
        type: CUSTOMER_SERVICE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi xóa dịch vụ'
      });
      throw err;
    }
  }, [setLoading]);

  // Clear customer service state
  const clearCustomerService = useCallback(() => {
    dispatch({ type: CLEAR_CUSTOMER_SERVICE });
  }, []);

  return (
    <customerServiceContext.Provider
      value={{
        customerServices: state.customerServices,
        serviceSummary: state.serviceSummary,
        loading: state.loading,
        error: state.error,
        getCustomerServices,
        getServiceSummary,
        addCustomerService,
        updateCustomerService,
        deleteCustomerService,
        clearCustomerService
      }}
    >
      {props.children}
    </customerServiceContext.Provider>
  );
};

export default CustomerServiceState;