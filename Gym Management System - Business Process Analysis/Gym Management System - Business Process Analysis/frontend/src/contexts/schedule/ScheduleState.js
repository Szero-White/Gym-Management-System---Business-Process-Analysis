import React, { useReducer, useCallback, useRef } from 'react';
import scheduleContext from './scheduleContext';
import scheduleReducer from './scheduleReducer';
import api from '../../utils/api';
import {
  GET_SCHEDULE,
  UPDATE_SCHEDULE,
  ADD_SCHEDULE_ITEM,
  DELETE_SCHEDULE_ITEM,
  SCHEDULE_ERROR,
  CLEAR_SCHEDULE,
  SET_LOADING,
  CLEAR_ERRORS
} from './types';

const ScheduleState = props => {
  const initialState = {
    schedule: [],
    trainerId: null,
    loading: false,
    error: null
  };

  const [state, dispatch] = useReducer(scheduleReducer, initialState);
  
  // Track if we're already loading data to prevent duplicate requests
  const isLoadingRef = useRef(false);

  // Set loading - memoized to prevent recreation on each render
  const setLoading = useCallback(() => {
    dispatch({ type: SET_LOADING });
  }, []);

  // Get trainer's work schedule
  const getSchedule = useCallback(async (trainerId) => {
    // Prevent duplicate loading
    if (isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      setLoading();
      
      console.log(`Getting schedule for trainer ID: ${trainerId}`);
      const res = await api.get(`/schedule/${trainerId}`);
      
      dispatch({
        type: GET_SCHEDULE,
        payload: { 
          schedule: res.data.schedule || [], 
          trainerId: res.data.trainerId || trainerId 
        }
      });
      
      isLoadingRef.current = false;
      return res.data.schedule;
    } catch (err) {
      console.error('Error in getSchedule:', err);
      dispatch({
        type: SCHEDULE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải lịch làm việc'
      });
      isLoadingRef.current = false;
      throw err;
    }
  }, [setLoading]);

  // Get logged-in trainer's schedule
  const getMySchedule = useCallback(async () => {
    // Prevent duplicate loading
    if (isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      setLoading();
      
      console.log('Getting my schedule');
      const res = await api.get('/schedule/me');
      
      // Store the actual trainerId from response
      const actualTrainerId = res.data.trainerId || null;
      
      console.log('Received my schedule with trainerId:', actualTrainerId);
      
      dispatch({
        type: GET_SCHEDULE,
        payload: { 
          schedule: res.data.schedule || [], 
          trainerId: actualTrainerId
        }
      });
      
      isLoadingRef.current = false;
      return res.data.schedule;
    } catch (err) {
      console.error('Error in getMySchedule:', err);
      dispatch({
        type: SCHEDULE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải lịch làm việc'
      });
      isLoadingRef.current = false;
      throw err;
    }
  }, [setLoading]);

  // Update entire schedule
  const updateSchedule = useCallback(async (trainerId, schedule) => {
    setLoading();
    
    try {
      console.log(`Updating schedule for trainer ID: ${trainerId}`);
      const res = await api.put(`/schedule/${trainerId}`, { schedule });
      
      dispatch({
        type: UPDATE_SCHEDULE,
        payload: { schedule: res.data.schedule || [] }
      });

      return res.data.schedule;
    } catch (err) {
      console.error('Error in updateSchedule:', err);
      dispatch({
        type: SCHEDULE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi cập nhật lịch làm việc'
      });
      throw err;
    }
  }, [setLoading]);

  // Add schedule item
  const addScheduleItem = async (trainerId, scheduleItem) => {
    setLoading();
    
    try {
      console.log(`Adding schedule for trainer ID: ${trainerId}`, scheduleItem);
      
      if (!trainerId || trainerId === 'me') {
        throw new Error('Invalid trainer ID for adding schedule');
      }
      
      const res = await api.post(`/schedule/${trainerId}`, scheduleItem);
      
      // If successful, update our local state
      if (res.data && res.data.scheduleItem) {
        dispatch({
          type: ADD_SCHEDULE_ITEM,
          payload: { scheduleItem: res.data.scheduleItem }
        });
      }

      // Return the API response for the component to use
      return res.data;
    } catch (err) {
      console.error('Error in addScheduleItem:', err);
      
      dispatch({
        type: SCHEDULE_ERROR,
        payload: err.response?.data?.message || err.message || 'Lỗi khi thêm lịch làm việc'
      });
      throw err;
    }
  };

  // Delete schedule item
  const deleteScheduleItem = async (trainerId, scheduleId) => {
    setLoading();
    
    try {
      // Add logging to help debug
      console.log(`Deleting schedule - trainerId: ${trainerId}, scheduleId: ${scheduleId}`);
      
      // Check if trainerId is valid
      if (!trainerId || trainerId === 'me') {
        throw new Error('Invalid trainerId. Make sure you have a valid ID.');
      }
      
      // Proceed with delete request
      const res = await api.delete(`/schedule/${trainerId}/${scheduleId}`);
      
      // Update our local state
      dispatch({
        type: DELETE_SCHEDULE_ITEM,
        payload: { scheduleId }
      });
      
      return res.data;
    } catch (err) {
      console.error('Delete schedule error details:', err);
      
      dispatch({
        type: SCHEDULE_ERROR,
        payload: err.response?.data?.message || err.message || 'Lỗi khi xóa lịch làm việc'
      });
      throw err;
    }
  };

  // Clear current schedule
  const clearSchedule = useCallback(() => {
    isLoadingRef.current = false;
    dispatch({ type: CLEAR_SCHEDULE });
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    dispatch({ type: CLEAR_ERRORS });
  }, []);

  return (
    <scheduleContext.Provider
      value={{
        schedule: state.schedule,
        trainerId: state.trainerId,
        loading: state.loading,
        error: state.error,
        getSchedule,
        getMySchedule,
        updateSchedule,
        addScheduleItem,
        deleteScheduleItem,
        clearSchedule,
        clearErrors
      }}
    >
      {props.children}
    </scheduleContext.Provider>
  );
};

export default ScheduleState;