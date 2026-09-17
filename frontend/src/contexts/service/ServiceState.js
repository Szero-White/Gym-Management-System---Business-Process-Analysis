import React, { useReducer, useCallback } from 'react';
import serviceContext from './serviceContext';
import serviceReducer from './serviceReducer';
import api from '../../utils/api';
import {
  GET_SERVICES,
  GET_SERVICE,
  ADD_SERVICE,
  UPDATE_SERVICE,
  DELETE_SERVICE,
  SERVICE_ERROR,
  CLEAR_SERVICE,
  GET_REGISTRATIONS,
  GET_MY_REGISTRATIONS,
  GET_TRAINER_REGISTRATIONS,
  GET_REGISTRATION,
  CREATE_REGISTRATION,
  UPDATE_REGISTRATION_STATUS,
  UPDATE_COMPLETED_SESSIONS,
  CANCEL_REGISTRATION,
  REGISTRATION_ERROR,
  CLEAR_REGISTRATION,
  SET_LOADING
} from './types';

const ServiceState = props => {
  const initialState = {
    services: [],
    currentService: null,
    registrations: [],
    myRegistrations: [],
    trainerRegistrations: [],
    currentRegistration: null,
    loading: false,
    error: null
  };

  const [state, dispatch] = useReducer(serviceReducer, initialState);

  // Set loading
  const setLoading = useCallback(() => {
    dispatch({ type: SET_LOADING });
  }, []);

  // Get all services with optional filters
  const getServices = useCallback(async (filters = {}) => {
    setLoading();
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters.trainerId) {
        queryParams.append('trainerId', filters.trainerId);
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/services?${queryString}` : '/services';
      
      console.log("ServiceState: Fetching services from URL:", url);
      const res = await api.get(url);
      console.log("ServiceState: Got services:", res.data);
      
      dispatch({
        type: GET_SERVICES,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error("ServiceState: Error fetching services:", err);
      dispatch({
        type: SERVICE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải danh sách dịch vụ'
      });
      throw err;
    }
  }, [setLoading]);

  // Get service by ID
  const getService = useCallback(async (id) => {
    setLoading();
    
    try {
      const res = await api.get(`/services/${id}`);
      
      dispatch({
        type: GET_SERVICE,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: SERVICE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải thông tin dịch vụ'
      });
      throw err;
    }
  }, [setLoading]);

  // Get trainer services
  const getTrainerServices = useCallback(async (trainerId) => {
    setLoading();
    
    try {
      const res = await api.get(`/services/trainer/${trainerId}`);
      
      dispatch({
        type: GET_SERVICES,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: SERVICE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải dịch vụ của huấn luyện viên'
      });
      throw err;
    }
  }, [setLoading]);

  // Add service (admin or trainer)
  const addService = useCallback(async (serviceData) => {
    setLoading();
    
    try {
      console.log("ServiceState: Adding service with data:", serviceData);
      const res = await api.post('/services', serviceData);
      console.log("ServiceState: Service added successfully, response:", res.data);
      
      // Update state with new service
      dispatch({
        type: ADD_SERVICE,
        payload: res.data
      });
      
      // Return the newly created service
      return res.data;
    } catch (err) {
      console.error("ServiceState: Error adding service:", err);
      dispatch({
        type: SERVICE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi thêm dịch vụ'
      });
      throw err;
    }
  }, [setLoading]);

  // Update service (admin or trainer)
  const updateService = useCallback(async (id, serviceData) => {
    setLoading();
    
    try {
      const res = await api.put(`/services/${id}`, serviceData);
      
      dispatch({
        type: UPDATE_SERVICE,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: SERVICE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi cập nhật dịch vụ'
      });
      throw err;
    }
  }, [setLoading]);

  // Delete service (admin or trainer)
  const deleteService = useCallback(async (id) => {
    setLoading();
    
    try {
      await api.delete(`/services/${id}`);
      
      dispatch({
        type: DELETE_SERVICE,
        payload: id
      });
    } catch (err) {
      dispatch({
        type: SERVICE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi xóa dịch vụ'
      });
      throw err;
    }
  }, [setLoading]);

  // Clear current service
  const clearService = useCallback(() => {
    dispatch({ type: CLEAR_SERVICE });
  }, []);

  // Get all registrations (admin, receptionist)
  const getRegistrations = useCallback(async () => {
    setLoading();
    
    try {
      const res = await api.get('/service-registrations');
      
      dispatch({
        type: GET_REGISTRATIONS,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: REGISTRATION_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải danh sách đăng ký dịch vụ'
      });
    }
  }, [setLoading]);

  // Get my registrations (customer)
  const getMyRegistrations = useCallback(async () => {
    setLoading();
    
    try {
      const res = await api.get('/service-registrations/my-registrations');
      
      dispatch({
        type: GET_MY_REGISTRATIONS,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: REGISTRATION_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải danh sách đăng ký dịch vụ của bạn'
      });
    }
  }, [setLoading]);

  // Get trainer registrations (trainer)
  const getTrainerRegistrations = useCallback(async () => {
    setLoading();
    
    try {
      const res = await api.get('/service-registrations/my-customers');
      
      dispatch({
        type: GET_TRAINER_REGISTRATIONS,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: REGISTRATION_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải danh sách khách hàng của bạn'
      });
    }
  }, [setLoading]);

  // Get registration by ID
  const getRegistration = useCallback(async (id) => {
    setLoading();
    
    try {
      const res = await api.get(`/service-registrations/${id}`);
      
      dispatch({
        type: GET_REGISTRATION,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: REGISTRATION_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải thông tin đăng ký dịch vụ'
      });
    }
  }, [setLoading]);

  // Create registration (customer, admin, receptionist)
  const createRegistration = useCallback(async (registrationData) => {
    setLoading();
    
    try {
      const res = await api.post('/service-registrations', registrationData);
      
      dispatch({
        type: CREATE_REGISTRATION,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: REGISTRATION_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi đăng ký dịch vụ'
      });
      throw err;
    }
  }, [setLoading]);

  // Update registration status (trainer, admin, receptionist)
  const updateRegistrationStatus = useCallback(async (id, statusData) => {
    setLoading();
    
    try {
      const res = await api.put(`/service-registrations/${id}/status`, statusData);
      
      dispatch({
        type: UPDATE_REGISTRATION_STATUS,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: REGISTRATION_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi cập nhật trạng thái đăng ký'
      });
      throw err;
    }
  }, [setLoading]);

  // Update completed sessions (trainer, admin, receptionist)
  const updateCompletedSessions = useCallback(async (id, sessionsData) => {
    setLoading();
    
    try {
      const res = await api.put(`/service-registrations/${id}/sessions`, sessionsData);
      
      dispatch({
        type: UPDATE_COMPLETED_SESSIONS,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: REGISTRATION_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi cập nhật số buổi hoàn thành'
      });
      throw err;
    }
  }, [setLoading]);

  // Cancel registration (customer, admin, receptionist)
  const cancelRegistration = useCallback(async (id) => {
    setLoading();
    
    try {
      const res = await api.put(`/service-registrations/${id}/cancel`);
      
      dispatch({
        type: CANCEL_REGISTRATION,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: REGISTRATION_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi hủy đăng ký dịch vụ'
      });
      throw err;
    }
  }, [setLoading]);

  // Clear registrations
  const clearRegistration = useCallback(() => {
    dispatch({ type: CLEAR_REGISTRATION });
  }, []);

  return (
    <serviceContext.Provider
      value={{
        services: state.services,
        currentService: state.currentService,
        registrations: state.registrations,
        myRegistrations: state.myRegistrations,
        trainerRegistrations: state.trainerRegistrations,
        currentRegistration: state.currentRegistration,
        loading: state.loading,
        error: state.error,
        getServices,
        getService,
        getTrainerServices,
        addService,
        updateService,
        deleteService,
        clearService,
        getRegistrations,
        getMyRegistrations,
        getTrainerRegistrations,
        getRegistration,
        createRegistration,
        updateRegistrationStatus,
        updateCompletedSessions,
        cancelRegistration,
        clearRegistration
      }}
    >
      {props.children}
    </serviceContext.Provider>
  );
};

export default ServiceState;