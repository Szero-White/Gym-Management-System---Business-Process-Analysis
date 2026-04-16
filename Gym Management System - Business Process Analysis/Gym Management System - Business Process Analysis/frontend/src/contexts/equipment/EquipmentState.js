import React, { useReducer } from 'react';
import equipmentContext from './equipmentContext';
import equipmentReducer from './equipmentReducer';
import api from '../../utils/api';
import {
  GET_EQUIPMENT,
  GET_EQUIPMENT_DETAIL,
  ADD_EQUIPMENT,
  UPDATE_EQUIPMENT,
  DELETE_EQUIPMENT,
  EQUIPMENT_ERROR,
  CLEAR_EQUIPMENT,
  SET_LOADING,
  FILTER_EQUIPMENT,
  CLEAR_FILTER,
  GET_MAINTENANCE,
  GET_MAINTENANCE_DETAIL,
  GET_EQUIPMENT_MAINTENANCE,
  ADD_MAINTENANCE,
  UPDATE_MAINTENANCE,
  DELETE_MAINTENANCE,
  MAINTENANCE_ERROR,
  CLEAR_MAINTENANCE,
  GET_UPCOMING_MAINTENANCE,
  GET_OVERDUE_MAINTENANCE
} from './types';

const EquipmentState = props => {
  const initialState = {
    equipment: [],
    currentEquipment: null,
    filtered: null,
    maintenance: [],
    currentMaintenance: null,
    equipmentMaintenance: [],
    upcomingMaintenance: [],
    overdueMaintenance: [],
    loading: false,
    error: null
  };

  const [state, dispatch] = useReducer(equipmentReducer, initialState);

  // Set loading
  const setLoading = () => {
    dispatch({ type: SET_LOADING });
  };

  // Get all equipment
  const getEquipment = async () => {
    setLoading();
    
    try {
      const res = await api.get('/equipment');
      
      dispatch({
        type: GET_EQUIPMENT,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: EQUIPMENT_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải danh sách thiết bị'
      });
    }
  };

  // Get equipment by ID
  const getEquipmentById = async (id) => {
    setLoading();
    
    try {
      const res = await api.get(`/equipment/${id}`);
      
      dispatch({
        type: GET_EQUIPMENT_DETAIL,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: EQUIPMENT_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải thông tin thiết bị'
      });
    }
  };

  // Add equipment
  const addEquipment = async (equipmentData) => {
    setLoading();
    
    try {
      const res = await api.post('/equipment', equipmentData);
      
      dispatch({
        type: ADD_EQUIPMENT,
        payload: res.data
      });

      // If there's an image to upload, handle it separately
      if (equipmentData.image) {
        const formData = new FormData();
        formData.append('equipmentImage', equipmentData.image);
        
        await api.put(`/equipment/${res.data._id}/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      return res.data;
    } catch (err) {
      dispatch({
        type: EQUIPMENT_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi thêm thiết bị'
      });
      throw err;
    }
  };

  // Update equipment
  const updateEquipment = async (id, equipmentData) => {
    setLoading();
    
    try {
      const res = await api.put(`/equipment/${id}`, equipmentData);
      
      dispatch({
        type: UPDATE_EQUIPMENT,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: EQUIPMENT_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi cập nhật thiết bị'
      });
      throw err;
    }
  };

  // Update equipment status
  const updateEquipmentStatus = async (id, status) => {
    setLoading();
    
    try {
      const res = await api.patch(`/equipment/${id}/status`, { status });
      
      dispatch({
        type: UPDATE_EQUIPMENT,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: EQUIPMENT_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi cập nhật trạng thái thiết bị'
      });
      throw err;
    }
  };

  // Đã loại bỏ hàm deleteEquipment ở đây

  // Upload equipment image
  const uploadEquipmentImage = async (id, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('equipmentImage', imageFile);
      
      const res = await api.put(`/equipment/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refresh equipment data to get updated image
      getEquipmentById(id);
      
      return res.data;
    } catch (err) {
      dispatch({
        type: EQUIPMENT_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải lên ảnh thiết bị'
      });
      throw err;
    }
  };

  // Clear current equipment
  const clearEquipment = () => {
    dispatch({ type: CLEAR_EQUIPMENT });
  };

  // Filter equipment
  const filterEquipment = (text) => {
    dispatch({ type: FILTER_EQUIPMENT, payload: text });
  };

  // Clear filter
  const clearFilter = () => {
    dispatch({ type: CLEAR_FILTER });
  };

  // Get equipment needing maintenance
  const getEquipmentNeedingMaintenance = async () => {
    setLoading();
    
    try {
      const res = await api.get('/equipment/maintenance-required');
      
      dispatch({
        type: GET_EQUIPMENT,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: EQUIPMENT_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải danh sách thiết bị cần bảo trì'
      });
    }
  };

  // Get all maintenance records
  const getMaintenance = async () => {
    setLoading();
    
    try {
      const res = await api.get('/maintenance');
      
      dispatch({
        type: GET_MAINTENANCE,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: MAINTENANCE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải danh sách bảo trì'
      });
    }
  };

  // Get maintenance by ID
  const getMaintenanceById = async (id) => {
    setLoading();
    
    try {
      const res = await api.get(`/maintenance/${id}`);
      
      dispatch({
        type: GET_MAINTENANCE_DETAIL,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: MAINTENANCE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải thông tin bảo trì'
      });
    }
  };

  // Get maintenance records for specific equipment
  const getEquipmentMaintenance = async (equipmentId) => {
    setLoading();
    
    try {
      const res = await api.get(`/maintenance/equipment/${equipmentId}`);
      
      dispatch({
        type: GET_EQUIPMENT_MAINTENANCE,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: MAINTENANCE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải lịch sử bảo trì thiết bị'
      });
    }
  };

  // Add maintenance record
  const addMaintenance = async (maintenanceData) => {
    setLoading();
    
    try {
      const res = await api.post('/maintenance', maintenanceData);
      
      dispatch({
        type: ADD_MAINTENANCE,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: MAINTENANCE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi thêm bản ghi bảo trì'
      });
      throw err;
    }
  };

  // Update maintenance record
  const updateMaintenance = async (id, maintenanceData) => {
    setLoading();
    
    try {
      const res = await api.put(`/maintenance/${id}`, maintenanceData);
      
      dispatch({
        type: UPDATE_MAINTENANCE,
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: MAINTENANCE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi cập nhật bản ghi bảo trì'
      });
      throw err;
    }
  };

  // Đã loại bỏ hàm deleteMaintenance ở đây

  // Get upcoming maintenance
  const getUpcomingMaintenance = async () => {
    setLoading();
    
    try {
      const res = await api.get('/maintenance/upcoming');
      
      dispatch({
        type: GET_UPCOMING_MAINTENANCE,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: MAINTENANCE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải lịch bảo trì sắp tới'
      });
    }
  };
  // Get equipment for customers
const getCustomerEquipment = async () => {
  setLoading();
  
  try {
    const res = await api.get('/equipment/customer');
    
    dispatch({
      type: GET_EQUIPMENT,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: EQUIPMENT_ERROR,
      payload: err.response?.data?.message || 'Lỗi khi tải danh sách thiết bị'
    });
  }
};

  // Get overdue maintenance
  const getOverdueMaintenance = async () => {
    setLoading();
    
    try {
      const res = await api.get('/maintenance/overdue');
      
      dispatch({
        type: GET_OVERDUE_MAINTENANCE,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: MAINTENANCE_ERROR,
        payload: err.response?.data?.message || 'Lỗi khi tải lịch bảo trì quá hạn'
      });
    }
  };

  // Clear current maintenance
  const clearMaintenance = () => {
    dispatch({ type: CLEAR_MAINTENANCE });
  };

  return (
    <equipmentContext.Provider
      value={{
        equipment: state.equipment,
        currentEquipment: state.currentEquipment,
        filtered: state.filtered,
        maintenance: state.maintenance,
        currentMaintenance: state.currentMaintenance,
        equipmentMaintenance: state.equipmentMaintenance,
        upcomingMaintenance: state.upcomingMaintenance,
        overdueMaintenance: state.overdueMaintenance,
        loading: state.loading,
        error: state.error,
        getEquipment,
        getEquipmentById,
        addEquipment,
        updateEquipment,
        updateEquipmentStatus,
        uploadEquipmentImage,
        clearEquipment,
        filterEquipment,
        clearFilter,
        getEquipmentNeedingMaintenance,
        getMaintenance,
        getMaintenanceById,
        getEquipmentMaintenance,
        addMaintenance,
        updateMaintenance,
        getCustomerEquipment, 
        getUpcomingMaintenance,
        getOverdueMaintenance,
        clearMaintenance
      }}
    >
      {props.children}
    </equipmentContext.Provider>
  );
};

export default EquipmentState;