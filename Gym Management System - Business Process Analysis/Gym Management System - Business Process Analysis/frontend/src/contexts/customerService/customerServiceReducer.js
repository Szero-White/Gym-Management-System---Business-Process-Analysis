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
  
  const customerServiceReducer = (state, action) => {
    switch (action.type) {
      case GET_CUSTOMER_SERVICES:
        return {
          ...state,
          customerServices: action.payload,
          loading: false,
          error: null
        };
      case GET_SERVICE_SUMMARY:
        return {
          ...state,
          serviceSummary: action.payload,
          loading: false,
          error: null
        };
      case ADD_CUSTOMER_SERVICE:
        return {
          ...state,
          customerServices: [action.payload, ...state.customerServices],
          loading: false,
          error: null
        };
      case UPDATE_CUSTOMER_SERVICE:
        return {
          ...state,
          customerServices: state.customerServices.map(service => 
            service._id === action.payload._id ? action.payload : service
          ),
          loading: false,
          error: null
        };
      case DELETE_CUSTOMER_SERVICE:
        return {
          ...state,
          customerServices: state.customerServices.filter(
            service => service._id !== action.payload
          ),
          loading: false,
          error: null
        };
      case CUSTOMER_SERVICE_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false
        };
      case CLEAR_CUSTOMER_SERVICE:
        return {
          ...state,
          customerServices: [],
          serviceSummary: null,
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
  
  export default customerServiceReducer;