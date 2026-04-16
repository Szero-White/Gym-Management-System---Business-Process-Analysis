// frontend/src/contexts/feedback/feedbackReducer.js
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
  
  const feedbackReducer = (state, action) => {
    switch (action.type) {
      case GET_FEEDBACK:
        return {
          ...state,
          feedback: action.payload,
          loading: false,
          error: null
        };
      case GET_MY_FEEDBACK:
        return {
          ...state,
          myFeedback: action.payload,
          loading: false,
          error: null
        };
      case GET_FEEDBACK_DETAIL:
        return {
          ...state,
          currentFeedback: action.payload,
          loading: false,
          error: null
        };
      case ADD_FEEDBACK:
        return {
          ...state,
          myFeedback: [action.payload, ...(state.myFeedback || [])],
          loading: false,
          error: null
        };
      case DELETE_FEEDBACK:
        return {
          ...state,
          feedback: state.feedback ? 
            state.feedback.filter(f => f._id !== action.payload) : 
            [],
          loading: false,
          error: null
        };
      case MARK_FEEDBACK_READ:
        return {
          ...state,
          feedback: state.feedback ? 
            state.feedback.map(f => 
              f._id === action.payload._id ? action.payload : f
            ) : 
            state.feedback,
          currentFeedback: action.payload,
          unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
          loading: false,
          error: null
        };
      case GET_UNREAD_COUNT:
        return {
          ...state,
          unreadCount: action.payload,
          loading: false,
          error: null
        };
      case FEEDBACK_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false
        };
      case CLEAR_FEEDBACK:
        return {
          ...state,
          currentFeedback: null,
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
  
  export default feedbackReducer;