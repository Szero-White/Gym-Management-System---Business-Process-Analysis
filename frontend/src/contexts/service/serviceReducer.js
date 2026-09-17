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

const serviceReducer = (state, action) => {
  switch (action.type) {
    case GET_SERVICES:
      return {
        ...state,
        services: action.payload,
        loading: false,
        error: null
      };
    case GET_SERVICE:
      return {
        ...state,
        currentService: action.payload,
        loading: false,
        error: null
      };
      case ADD_SERVICE:
        console.log("serviceReducer: Adding service to state:", action.payload);
        // Make sure we add the new service to the beginning of the array
        // and properly handle when services is undefined or empty
        const newService = action.payload;
        
        // Ensure the service isn't already in the array
        const existingServices = state.services || [];
        const existingServiceIndex = existingServices.findIndex(s => s && s._id === newService._id);
        
        // Create a new services array with the new service
        let updatedServices;
        if (existingServiceIndex >= 0) {
          // Replace the existing service
          updatedServices = [...existingServices];
          updatedServices[existingServiceIndex] = newService;
        } else {
          // Add the new service at the beginning
          updatedServices = [newService, ...existingServices];
        }
        
        console.log("serviceReducer: Updated services array:", updatedServices);
        
        return {
          ...state,
          services: updatedServices,
          loading: false,
          error: null,
          // Also set currentService to ensure it's immediately available for editing
          currentService: newService
        };
    case UPDATE_SERVICE:
      return {
        ...state,
        // Make sure we handle potential edge cases with services array
        services: state.services ? 
          state.services.map(service => 
            service._id === action.payload._id ? action.payload : service
          ) : 
          [action.payload],
        currentService: action.payload,
        loading: false,
        error: null
      };
    case DELETE_SERVICE:
      return {
        ...state,
        // Ensure services exists before filtering
        services: state.services ? 
          state.services.filter(service => service._id !== action.payload) : 
          [],
        // Reset currentService if it was the deleted one
        currentService: state.currentService && state.currentService._id === action.payload ?
          null : state.currentService,
        loading: false,
        error: null
      };
    case SERVICE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case CLEAR_SERVICE:
      return {
        ...state,
        currentService: null,
        error: null
      };
    case GET_REGISTRATIONS:
      return {
        ...state,
        registrations: action.payload,
        loading: false,
        error: null
      };
    case GET_MY_REGISTRATIONS:
      return {
        ...state,
        myRegistrations: action.payload,
        loading: false,
        error: null
      };
    case GET_TRAINER_REGISTRATIONS:
      return {
        ...state,
        trainerRegistrations: action.payload,
        loading: false,
        error: null
      };
    case GET_REGISTRATION:
      return {
        ...state,
        currentRegistration: action.payload,
        loading: false,
        error: null
      };
    case CREATE_REGISTRATION:
      return {
        ...state,
        myRegistrations: state.myRegistrations ? 
          [action.payload, ...state.myRegistrations] : 
          [action.payload],
        loading: false,
        error: null
      };
    case UPDATE_REGISTRATION_STATUS:
      return {
        ...state,
        trainerRegistrations: state.trainerRegistrations ? 
          state.trainerRegistrations.map(reg => 
            reg._id === action.payload._id ? action.payload : reg
          ) : 
          state.trainerRegistrations,
        registrations: state.registrations ? 
          state.registrations.map(reg => 
            reg._id === action.payload._id ? action.payload : reg
          ) : 
          state.registrations,
        currentRegistration: action.payload,
        loading: false,
        error: null
      };
    case UPDATE_COMPLETED_SESSIONS:
      return {
        ...state,
        trainerRegistrations: state.trainerRegistrations ? 
          state.trainerRegistrations.map(reg => 
            reg._id === action.payload._id ? action.payload : reg
          ) : 
          state.trainerRegistrations,
        registrations: state.registrations ? 
          state.registrations.map(reg => 
            reg._id === action.payload._id ? action.payload : reg
          ) : 
          state.registrations,
        currentRegistration: action.payload,
        loading: false,
        error: null
      };
    case CANCEL_REGISTRATION:
      return {
        ...state,
        myRegistrations: state.myRegistrations ? 
          state.myRegistrations.map(reg => 
            reg._id === action.payload._id ? action.payload : reg
          ) : 
          state.myRegistrations,
        registrations: state.registrations ? 
          state.registrations.map(reg => 
            reg._id === action.payload._id ? action.payload : reg
          ) : 
          state.registrations,
        currentRegistration: action.payload,
        loading: false,
        error: null
      };
    case REGISTRATION_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case CLEAR_REGISTRATION:
      return {
        ...state,
        currentRegistration: null,
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

export default serviceReducer;