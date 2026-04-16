// frontend/src/contexts/report/reportReducer.js
import {
    GET_CUSTOMER_REGISTRATION_STATS,
    GET_SERVICE_REGISTRATION_STATS,
    REPORT_ERROR,
    CLEAR_REPORT,
    SET_LOADING
  } from './types';
  
  const reportReducer = (state, action) => {
    switch (action.type) {
      case GET_CUSTOMER_REGISTRATION_STATS:
        return {
          ...state,
          customerStats: action.payload,
          loading: false,
          error: null
        };
      case GET_SERVICE_REGISTRATION_STATS:
        return {
          ...state,
          serviceStats: action.payload.serviceStats,
          trainerStats: action.payload.trainerStats,
          loading: false,
          error: null
        };
      case REPORT_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false
        };
      case CLEAR_REPORT:
        return {
          ...state,
          customerStats: [],
          serviceStats: [],
          trainerStats: [],
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
  
  export default reportReducer;