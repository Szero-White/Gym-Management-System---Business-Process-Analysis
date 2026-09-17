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
  
  const equipmentReducer = (state, action) => {
    switch (action.type) {
      case GET_EQUIPMENT:
        return {
          ...state,
          equipment: action.payload,
          loading: false,
          error: null
        };
      case GET_EQUIPMENT_DETAIL:
        return {
          ...state,
          currentEquipment: action.payload,
          loading: false,
          error: null
        };
      case ADD_EQUIPMENT:
        return {
          ...state,
          equipment: [action.payload, ...state.equipment],
          loading: false,
          error: null
        };
      case UPDATE_EQUIPMENT:
        return {
          ...state,
          equipment: state.equipment.map(equip => 
            equip._id === action.payload._id ? action.payload : equip
          ),
          currentEquipment: action.payload,
          loading: false,
          error: null
        };
      case DELETE_EQUIPMENT:
        return {
          ...state,
          equipment: state.equipment.filter(
            equip => equip._id !== action.payload
          ),
          loading: false,
          error: null
        };
      case EQUIPMENT_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false
        };
      case CLEAR_EQUIPMENT:
        return {
          ...state,
          currentEquipment: null,
          error: null
        };
      case FILTER_EQUIPMENT:
        return {
          ...state,
          filtered: state.equipment.filter(equip => {
            const regex = new RegExp(`${action.payload}`, 'gi');
            return (
              equip.name.match(regex) || 
              equip.type.match(regex) || 
              (equip.serialNumber && equip.serialNumber.match(regex)) ||
              (equip.location && equip.location.match(regex))
            );
          })
        };
      case CLEAR_FILTER:
        return {
          ...state,
          filtered: null
        };
      case GET_MAINTENANCE:
        return {
          ...state,
          maintenance: action.payload,
          loading: false,
          error: null
        };
      case GET_MAINTENANCE_DETAIL:
        return {
          ...state,
          currentMaintenance: action.payload,
          loading: false,
          error: null
        };
      case GET_EQUIPMENT_MAINTENANCE:
        return {
          ...state,
          equipmentMaintenance: action.payload,
          loading: false,
          error: null
        };
      case ADD_MAINTENANCE:
        return {
          ...state,
          maintenance: [action.payload, ...state.maintenance],
          loading: false,
          error: null
        };
      case UPDATE_MAINTENANCE:
        return {
          ...state,
          maintenance: state.maintenance.map(maint => 
            maint._id === action.payload._id ? action.payload : maint
          ),
          currentMaintenance: action.payload,
          loading: false,
          error: null
        };
      case DELETE_MAINTENANCE:
        return {
          ...state,
          maintenance: state.maintenance.filter(
            maint => maint._id !== action.payload
          ),
          loading: false,
          error: null
        };
      case GET_UPCOMING_MAINTENANCE:
        return {
          ...state,
          upcomingMaintenance: action.payload,
          loading: false,
          error: null
        };
      case GET_OVERDUE_MAINTENANCE:
        return {
          ...state,
          overdueMaintenance: action.payload,
          loading: false,
          error: null
        };
      case MAINTENANCE_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false
        };
      case CLEAR_MAINTENANCE:
        return {
          ...state,
          currentMaintenance: null,
          error: null
        };
      case SET_LOADING:
        return {
          ...state,
          loading: true
        };
      default:
        return state;
    }
  };
  
  export default equipmentReducer;